import { MODULES, STEP_IDS, STEP_LABEL } from "./lessons.js";

const KEY = "muse-ai-hs-lab";

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function emptyNotes() {
  return Object.fromEntries(STEP_IDS.map((id) => [id, {}]));
}

export function createLab({ root, stepsEl, meterEl, hintBtn }) {
  let moduleId = null;
  let step = "goal";
  let notes = emptyNotes();
  let unlocked = new Set(["goal"]);
  let teacher = sessionStorage.getItem("muse-ai-teacher") === "1";
  let session = null;
  let lastState = {};

  const store = loadStore();

  const persist = () => {
    if (!moduleId) return;
    store[moduleId] = { notes, step, unlocked: [...unlocked] };
    saveStore(store);
  };

  const fillRo = () => {
    root.querySelectorAll("[data-from]").forEach((el) => {
      const v = lastState[el.dataset.from];
      el.value = v == null ? "—" : String(v);
    });
  };

  const readFields = (stepId) => {
    const box = {};
    root.querySelectorAll("[data-field]").forEach((el) => {
      const id = el.dataset.field;
      if (el.type === "radio") {
        if (el.checked) box[id] = el.value;
      } else box[id] = el.value;
    });
    const prev = notes[stepId] || {};
    for (const [k, v] of Object.entries(box)) {
      if (v !== undefined && v !== "") prev[k] = v;
    }
    notes[stepId] = prev;
    return prev;
  };

  const canAdvance = () => {
    if (teacher) return true;
    if (step === "goal") return true;
    const spec = MODULES[moduleId][step];
    if (!spec?.gate) return true;
    readFields(step);
    return spec.gate(notes[step] || {}, lastState);
  };

  const renderMeter = () => {
    if (!meterEl || !moduleId) return;
    const s = lastState;
    if (s.notice && s.label) {
      meterEl.textContent = s.label;
      return;
    }
    if (moduleId === "fifteen") {
      meterEl.textContent = `역전 ${s.inversions ?? "—"} · 빈칸 아래서 ${s.blankRowFromBottom ?? "—"}행 · ${s.moves ?? 0}수`;
    } else if (moduleId === "rush") {
      meterEl.textContent = `움직임 가능 ${s.movableCars ?? "—"}대 · 수순 ${s.legalSlides ?? "—"} · ${s.moves ?? 0}수`;
    } else if (moduleId === "sudoku") {
      meterEl.textContent = `${s.cellLabel || "칸을 고르세요"} · 후보 {${s.candText || "—"}}`;
    } else if (moduleId === "solitaire") {
      meterEl.textContent = s.eq ? `등식 ${s.eq} · 가능 점프 ${s.legalJumpCount}` : "점프하세요";
    }
  };

  const fieldHtml = (stepId, field) => {
    const saved = notes[stepId]?.[field.id] || "";
    if (field.type === "ro") {
      return `<label>${field.label}<input data-field="${field.id}" data-from="${field.from}" value="${saved}" readonly /></label>`;
    }
    if (field.type === "number") {
      return `<label>${field.label}<input data-field="${field.id}" type="number" min="0" value="${saved}" /></label>`;
    }
    if (field.type === "choice") {
      const opts = field.options
        .map(
          (o) =>
            `<label class="opt"><input type="radio" name="${stepId}-${field.id}" data-field="${field.id}" value="${o}" ${
              saved === o ? "checked" : ""
            }/> ${o}</label>`
        )
        .join("");
      return `<fieldset><legend>${field.label}</legend>${opts}</fieldset>`;
    }
    return `<label>${field.label}<textarea data-field="${field.id}" rows="3" placeholder="${field.placeholder || ""}">${saved}</textarea></label>`;
  };

  const renderStep = () => {
    const mod = MODULES[moduleId];
    const spec = mod[step];
    stepsEl.querySelectorAll("[data-go]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.go === step);
      b.classList.toggle("is-open", unlocked.has(b.dataset.go) || teacher);
    });
    if (step === "goal") {
      root.innerHTML = `
        <p class="lab-kicker">${mod.subject} · ${mod.minutes}분 · ${mod.concept}</p>
        <h2>오늘 증명할 문장</h2>
        <p class="goal">${mod.goal}</p>
        <p class="why">${mod.why}</p>
        <p class="hint-mute">AI는 3단계가 끝날 때까지 열지 마세요. 보드는 1차 자료입니다.</p>
        <button type="button" class="next">관찰로</button>
      `;
    } else if (step === "observe") {
      root.innerHTML = `
        <h2>관찰 — 손을 먼저</h2>
        <p>${spec.do}</p>
        <form class="fields">${spec.fields.map((f) => fieldHtml("observe", f)).join("")}</form>
        <p class="fail" hidden></p>
        <button type="button" class="next">형식화로</button>
      `;
      session?.applyTask?.(spec.task);
    } else if (step === "formalize") {
      root.innerHTML = `
        <h2>형식화</h2>
        <p>${spec.lead}</p>
        <ul class="lines">${spec.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
        <form class="fields">${spec.fields.map((f) => fieldHtml("formalize", f)).join("")}</form>
        <button type="button" class="next">AI 질문으로</button>
      `;
    } else if (step === "ask") {
      const prompt = spec.build(notes.observe || {}, lastState);
      notes.ask.prompt = prompt;
      root.innerHTML = `
        <h2>AI에게 묻기</h2>
        <p>관찰한 숫자를 넣은 질문입니다. 그대로 복사하세요. 정답을 달라고 고치지 마세요.</p>
        <textarea class="prompt" readonly rows="8">${prompt}</textarea>
        <button type="button" class="copy">질문 복사</button>
        <button type="button" class="next">검증으로</button>
      `;
    } else if (step === "verify") {
      root.innerHTML = `
        <h2>검증 — 보드가 1차 자료</h2>
        <p>${spec.lead}</p>
        <form class="fields">${spec.fields.map((f) => fieldHtml("verify", f)).join("")}</form>
        <button type="button" class="next">산출로</button>
      `;
    } else if (step === "output") {
      root.innerHTML = `
        <h2>산출</h2>
        <p>${spec.lead}</p>
        <form class="fields">${spec.fields.map((f) => fieldHtml("output", f)).join("")}</form>
        <button type="button" class="export">기록 복사</button>
        <p class="copied" hidden>복사했습니다. 활동지에 붙여 넣으세요.</p>
      `;
    }
    fillRo();
    root.querySelector(".next")?.addEventListener("click", () => {
      if (!canAdvance()) {
        const fail = root.querySelector(".fail");
        if (fail) {
          fail.hidden = false;
          fail.textContent = MODULES[moduleId].observe.failHint || "이 단계의 칸을 채우세요.";
        } else {
          root.querySelector(".next").textContent = "칸을 채운 뒤 다시";
        }
        return;
      }
      const i = STEP_IDS.indexOf(step);
      const next = STEP_IDS[i + 1];
      if (!next) return;
      unlocked.add(next);
      step = next;
      persist();
      renderStep();
    });
    root.querySelector(".copy")?.addEventListener("click", async () => {
      const t = root.querySelector(".prompt")?.value || "";
      try {
        await navigator.clipboard.writeText(t);
        root.querySelector(".copy").textContent = "복사됨";
      } catch {
        root.querySelector(".prompt").select();
      }
    });
    root.querySelector(".export")?.addEventListener("click", async () => {
      const mod = MODULES[moduleId];
      const text = [
        `# ${mod.title} · ${mod.concept}`,
        `목표: ${mod.goal}`,
        "",
        "## 관찰",
        JSON.stringify(notes.observe, null, 2),
        "## 형식화",
        JSON.stringify(notes.formalize, null, 2),
        "## AI 질문",
        notes.ask.prompt || "",
        "## 검증",
        JSON.stringify(notes.verify, null, 2),
        "## 일반화",
        notes.output.gen || "",
      ].join("\n");
      try {
        await navigator.clipboard.writeText(text);
        root.querySelector(".copied").hidden = false;
      } catch {
        /* ignore */
      }
    });
    root.querySelectorAll("[data-field]").forEach((el) => {
      el.addEventListener("change", () => {
        readFields(step);
        persist();
      });
    });
  };

  const bindSteps = () => {
    stepsEl.innerHTML = STEP_IDS.map(
      (id) => `<button type="button" data-go="${id}">${STEP_LABEL[id]}</button>`
    ).join("");
    stepsEl.querySelectorAll("[data-go]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.go;
        if (!teacher && !unlocked.has(id)) return;
        readFields(step);
        step = id;
        persist();
        renderStep();
      });
    });
  };

  return {
    setTeacher(v) {
      teacher = v;
      sessionStorage.setItem("muse-ai-teacher", v ? "1" : "0");
      if (hintBtn) hintBtn.hidden = !v;
      if (moduleId) renderStep();
    },
    isTeacher: () => teacher,
    attach(id, gameSession) {
      moduleId = id;
      session = gameSession;
      const saved = store[id];
      notes = saved?.notes || emptyNotes();
      step = saved?.step || "goal";
      unlocked = new Set(saved?.unlocked || ["goal"]);
      lastState = gameSession.getState?.() || {};
      if (hintBtn) hintBtn.hidden = !teacher;
      bindSteps();
      renderStep();
      renderMeter();
    },
    onState(state) {
      lastState = state || {};
      fillRo();
      renderMeter();
    },
  };
}
