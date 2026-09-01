import { MODULES, STEP_IDS, STEP_LABEL, GUIDES, listModules } from "./lessons.js";

const KEY = "muse-ai-hs-lab";

function notesOf(id) {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")[id]?.notes || {};
  } catch {
    return {};
  }
}

function val(notes, step, field) {
  const v = notes?.[step]?.[field];
  return v == null || v === "" ? "" : String(v);
}

export function renderSheet(el, moduleId) {
  const m = MODULES[moduleId];
  const n = notesOf(moduleId);
  el.innerHTML = `
    <article class="a4" data-sheet="${moduleId}">
      <header class="a4-head">
        <p>MUSE-AI · 이매지너리 수학 실험실 · 고등 활동지</p>
        <h1>${m.title} — ${m.concept}</h1>
        <p class="meta">${m.subject} · ${m.minutes}분</p>
        <div class="who">
          <span>학교 ____________</span>
          <span>학급 ________</span>
          <span>이름 ____________________</span>
          <span>날짜 ________</span>
        </div>
      </header>
      <p class="goal-box"><strong>오늘 증명:</strong> ${m.goal}</p>
      <ol class="steps">
        <li><span>관찰</span><p>${m.observe.do}</p><div class="blank">${val(n, "observe", "tried") || val(n, "observe", "mine") || val(n, "observe", "before") || " "}</div></li>
        <li><span>형식화</span><p>${m.formalize.lead}</p><div class="blank">${val(n, "formalize", "evenodd") || val(n, "formalize", "stateDef") || val(n, "formalize", "naked") || val(n, "formalize", "need") || " "}</div></li>
        <li><span>AI 질문</span><p>관찰한 숫자를 넣은 질문을 복사해 붙이세요. 정답을 달라고 고치지 마세요.</p><div class="blank tall">${n.ask?.prompt || " "}</div></li>
        <li><span>검증</span><p>${m.verify.lead}</p><table><tr><th>AI가 말한 것</th><th>보드에서 본 것</th><th>판정</th></tr><tr><td>${val(n, "verify", "ai")}</td><td>${val(n, "verify", "board")}</td><td>${val(n, "verify", "diff")}</td></tr></table></li>
        <li><span>산출</span><p>${m.output.lead}</p><div class="blank">${val(n, "output", "gen") || " "}</div></li>
      </ol>
    </article>
  `;
}

export function renderGuide(el) {
  el.innerHTML = `
    <article class="a4 guide">
      <header class="a4-head">
        <p>MUSE-AI · 교사용 지도안</p>
        <h1>이매지너리 수학 실험실</h1>
        <p class="meta">고등 · 1차시 1모듈 · ${GUIDES.rule}</p>
      </header>
      <h2>준비</h2>
      <ul>${GUIDES.prep.map((x) => `<li>${x}</li>`).join("")}</ul>
      <h2>철칙</h2>
      <p>${GUIDES.rule}</p>
      ${listModules()
        .map((m) => {
          const g = GUIDES.modules[m.id];
          return `
          <h2>${m.rec ? "추천 · " : ""}${m.title} (${m.minutes}분)</h2>
          <p><strong>목표:</strong> ${m.goal}</p>
          <table>${g.beats.map((b) => `<tr><th>${b[0]}</th><td>${b[1]}</td></tr>`).join("")}</table>
          <p><strong>오개념:</strong> ${g.miss.join(" / ")}</p>
          <p><strong>달성:</strong> ${g.assess}</p>`;
        })
        .join("")}
    </article>
  `;
}
