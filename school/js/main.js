import { PROGRAMS, STEPS, listPrograms, lessonOf } from "./programs.js";
import { renderSheet, renderGuide, renderPrompts } from "./sheets.js";

const KEY = "muse-ai-school-v1";
const views = {
  hub: document.querySelector("#hub"),
  play: document.querySelector("#play"),
  sheet: document.querySelector("#sheet-view"),
  guide: document.querySelector("#guide-view"),
  prompts: document.querySelector("#prompt-view"),
};

let teacher = sessionStorage.getItem("muse-ai-school-teacher") === "1";
let cur = { pid: "elem", n: 1, step: "goal" };

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function bag() {
  const all = load();
  return all[cur.pid] || {};
}
function notesOf(step) {
  return bag()[cur.n]?.[step] || {};
}
function writeNotes(step, patch) {
  const all = load();
  all[cur.pid] ||= {};
  all[cur.pid][cur.n] ||= {};
  all[cur.pid][cur.n][step] = { ...(all[cur.pid][cur.n][step] || {}), ...patch };
  save(all);
}
function mergeObserve() {
  const b = bag();
  const out = {};
  for (const k of Object.keys(b)) Object.assign(out, b[k].observe || {});
  Object.assign(out, notesOf("observe"));
  return out;
}

function show(name) {
  Object.entries(views).forEach(([k, el]) => {
    if (el) el.hidden = k !== name;
  });
  document.body.dataset.view = name;
}

function renderHub() {
  document.querySelector("#cards").innerHTML = listPrograms()
    .map((p) => {
      const ls = p.lessons
        .map((l) => `<a href="#go/${p.id}/${l.n}">${l.n}차시 · ${l.title}</a>`)
        .join("");
      return `<article class="station">
        <span class="mode-tag">${p.grade} · ${p.minutes}분 × 4</span>
        <strong>${p.title}</strong>
        <em>${p.hall} · ${p.tool}</em>
        <p>${p.why}</p>
        <div class="lessons">${ls}</div>
        <div class="cta-row">
          <a href="#go/${p.id}/1">1차시부터</a>
          <a href="#sheet/${p.id}">학습지</a>
          <a href="#guide/${p.id}">지도안</a>
        </div>
      </article>`;
    })
    .join("");
}

function fieldHtml(step, f) {
  const saved = notesOf(step)[f.id] || "";
  if (f.type === "choice") {
    const opts = f.options
      .map(
        (o) =>
          `<label class="opt"><input type="radio" name="${step}-${f.id}" data-field="${f.id}" value="${o}" ${
            saved === o ? "checked" : ""
          }/> ${o}</label>`
      )
      .join("");
    return `<fieldset><legend>${f.label}</legend>${opts}</fieldset>`;
  }
  if (f.type === "number") {
    return `<label>${f.label}<input data-field="${f.id}" type="number" min="0" value="${saved}" /></label>`;
  }
  return `<label>${f.label}<textarea data-field="${f.id}" rows="3">${saved}</textarea></label>`;
}

function readFields(root, step) {
  const box = {};
  root.querySelectorAll("[data-field]").forEach((el) => {
    if (el.type === "radio") {
      if (el.checked) box[el.dataset.field] = el.value;
    } else box[el.dataset.field] = el.value;
  });
  writeNotes(step, box);
  return { ...notesOf(step), ...box };
}

function unlocked() {
  const b = bag()[cur.n] || {};
  const set = new Set(["goal"]);
  if (b.observe && Object.values(b.observe).some((v) => String(v).trim())) set.add("observe");
  const les = lessonOf(cur.pid, cur.n);
  if (les.ask?.skip) {
    if (set.has("observe")) set.add("ask");
  } else if (b.ask?.prompt) set.add("ask");
  if (b.verify && Object.values(b.verify).some((v) => String(v).trim())) set.add("verify");
  if (b.output?.gen) set.add("output");
  if (set.has("observe")) set.add("ask");
  return set;
}

function paintSteps() {
  const open = unlocked();
  document.querySelector("#lab-steps").innerHTML = STEPS.map(
    ([id, label]) =>
      `<button type="button" data-go="${id}" class="${cur.step === id ? "is-on" : ""}" ${
        teacher || open.has(id) ? "" : "disabled"
      }>${label}</button>`
  ).join("");
  document.querySelector("#lab-steps").onclick = (e) => {
    const b = e.target.closest("[data-go]");
    if (!b || b.disabled) return;
    readCurrent();
    cur.step = b.dataset.go;
    paintLesson();
  };
}

function readCurrent() {
  const les = lessonOf(cur.pid, cur.n);
  const root = document.querySelector("#lab-body");
  if (cur.step === "observe") readFields(root, "observe");
  if (cur.step === "verify") readFields(root, "verify");
  if (cur.step === "output") readFields(root, "output");
  if (cur.step === "ask") {
    const ta = root.querySelector(".prompt");
    if (ta) writeNotes("ask", { prompt: ta.value });
  }
}

function canAdvance(les) {
  if (teacher) return true;
  if (cur.step === "goal") return true;
  if (cur.step === "observe") {
    const n = readFields(document.querySelector("#lab-body"), "observe");
    return les.observe.fields.every((f) => String(n[f.id] || "").trim());
  }
  if (cur.step === "ask") return true;
  if (cur.step === "verify") {
    const n = readFields(document.querySelector("#lab-body"), "verify");
    return les.verify.fields.every((f) => String(n[f.id] || "").trim());
  }
  return true;
}

function paintLesson() {
  const p = PROGRAMS[cur.pid];
  const les = lessonOf(cur.pid, cur.n);
  document.querySelector("#mode-tag").textContent = `${p.grade} · ${p.title} · ${les.n}차시 · ${les.minutes || p.minutes}분`;
  document.querySelector("#where").textContent = les.where || p.hall;
  document.querySelector("#side").innerHTML = `
    <h3>철칙</h3>
    <p>${p.rule}</p>
    <h3>오개념</h3>
    <p>${les.miss.join(" / ")}</p>
    <h3>달성</h3>
    <p>${les.assess}</p>
    <p><a href="#sheet/${p.id}">학습지</a> · <a href="#guide/${p.id}">지도안</a></p>
  `;
  paintSteps();
  const root = document.querySelector("#lab-body");
  const nextOf = { goal: "관찰로", observe: les.ask?.skip ? "검증으로" : "AI 질문으로", ask: "검증으로", verify: "산출로" };
  if (cur.step === "goal") {
    root.innerHTML = `
      <h2>오늘 증명할 문장</h2>
      <p class="goal">${les.goal}</p>
      <p>${p.why}</p>
      <p>AI는 관찰이 끝날 때까지 열지 마세요. 전시는 1차 자료입니다.</p>
      <button type="button" class="next">관찰로</button>
    `;
  } else if (cur.step === "observe") {
    root.innerHTML = `
      <h2>관찰 — 손을 먼저</h2>
      <p>${les.observe.do}</p>
      <form class="fields">${les.observe.fields.map((f) => fieldHtml("observe", f)).join("")}</form>
      <p class="fail" hidden></p>
      <button type="button" class="next">${nextOf.observe}</button>
    `;
  } else if (cur.step === "ask") {
    const prompt = les.ask.build(mergeObserve());
    writeNotes("ask", { prompt });
    if (les.ask.skip) {
      root.innerHTML = `
        <h2>오늘은 AI를 열지 않습니다</h2>
        <p>${les.ask.lead}</p>
        <textarea class="prompt" readonly>${prompt}</textarea>
        <button type="button" class="next">검증으로</button>
      `;
    } else {
      root.innerHTML = `
        <h2>AI에게 묻기</h2>
        <p>${les.ask.lead}</p>
        <textarea class="prompt" rows="10">${prompt}</textarea>
        <button type="button" class="copy">질문 복사</button>
        <button type="button" class="next">검증으로</button>
      `;
    }
  } else if (cur.step === "verify") {
    root.innerHTML = `
      <h2>검증 — 전시가 1차 자료</h2>
      <p>${les.verify.lead}</p>
      <form class="fields">${les.verify.fields.map((f) => fieldHtml("verify", f)).join("")}</form>
      <p class="fail" hidden></p>
      <button type="button" class="next">산출로</button>
    `;
  } else {
    root.innerHTML = `
      <h2>산출</h2>
      <p>${les.output.lead}</p>
      <form class="fields">${les.output.fields.map((f) => fieldHtml("output", f)).join("")}</form>
      <p>이 문장을 학습지에 옮기세요.</p>
    `;
  }
  root.querySelector(".copy")?.addEventListener("click", async () => {
    const t = root.querySelector(".prompt")?.value || "";
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      /* ignore */
    }
  });
  root.querySelector(".next")?.addEventListener("click", () => {
    if (!canAdvance(les)) {
      const fail = root.querySelector(".fail");
      if (fail) {
        fail.hidden = false;
        fail.textContent = "칸을 채운 뒤 다시. 빈칸이 있으면 다음 단계가 열리지 않습니다.";
      }
      return;
    }
    const order = STEPS.map((s) => s[0]);
    let i = order.indexOf(cur.step);
    if (les.ask?.skip && cur.step === "observe") i = order.indexOf("ask");
    cur.step = order[Math.min(order.length - 1, i + 1)];
    if (les.ask?.skip && cur.step === "ask") cur.step = "verify";
    paintLesson();
  });
}

function openLesson(pid, n) {
  cur = { pid, n: Number(n) || 1, step: "goal" };
  show("play");
  paintLesson();
}

function route() {
  const raw = location.hash.replace(/^#/, "");
  const [view, a, b] = raw.split("/");
  if (view === "go" && PROGRAMS[a]) return openLesson(a, b);
  if (view === "sheet") {
    show("sheet");
    const pid = PROGRAMS[a] ? a : "elem";
    const sel = document.querySelector("#sheet-sel");
    sel.innerHTML = listPrograms().map((p) => `<option value="${p.id}" ${p.id === pid ? "selected" : ""}>${p.grade} · ${p.title}</option>`).join("");
    renderSheet(document.querySelector("#sheet-root"), pid, bag());
    document.querySelector("#sheet-back").href = `#go/${pid}/1`;
    return;
  }
  if (view === "guide") {
    show("guide");
    const pid = PROGRAMS[a] ? a : "elem";
    const sel = document.querySelector("#guide-sel");
    sel.innerHTML = listPrograms().map((p) => `<option value="${p.id}" ${p.id === pid ? "selected" : ""}>${p.grade} · 지도안</option>`).join("");
    renderGuide(document.querySelector("#guide-root"), pid);
    return;
  }
  if (view === "prompts") {
    show("prompts");
    renderPrompts(document.querySelector("#prompt-root"));
    return;
  }
  show("hub");
  renderHub();
}

document.querySelector("#teacher")?.addEventListener("click", () => {
  teacher = !teacher;
  sessionStorage.setItem("muse-ai-school-teacher", teacher ? "1" : "0");
  document.querySelector("#teacher").classList.toggle("is-on", teacher);
  document.querySelector("#teacher").textContent = teacher ? "교사 잠금 해제됨" : "교사";
  if (document.body.dataset.view === "play") paintLesson();
});
document.querySelector("#sheet-sel")?.addEventListener("change", (e) => {
  location.hash = `sheet/${e.target.value}`;
});
document.querySelector("#guide-sel")?.addEventListener("change", (e) => {
  location.hash = `guide/${e.target.value}`;
});
document.querySelector("#sheet-print")?.addEventListener("click", () => window.print());
document.querySelector("#guide-print")?.addEventListener("click", () => window.print());
document.querySelector("#prompt-print")?.addEventListener("click", () => window.print());
document.querySelector("#to-hub")?.addEventListener("click", (e) => {
  e.preventDefault();
  location.hash = "hub";
});
window.addEventListener("hashchange", route);
document.querySelector("#teacher").classList.toggle("is-on", teacher);
if (teacher) document.querySelector("#teacher").textContent = "교사 잠금 해제됨";
route();
