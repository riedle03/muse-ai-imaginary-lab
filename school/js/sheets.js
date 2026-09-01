import { PROGRAMS, listPrograms, lessonOf } from "./programs.js";

function val(notes, step, id) {
  const v = notes?.[step]?.[id];
  return v == null || v === "" ? " " : String(v);
}

export function renderSheet(el, pid, bag) {
  const p = PROGRAMS[pid];
  el.innerHTML = p.lessons
    .map((les) => {
      const n = bag?.[les.n] || {};
      const obs = les.observe.fields
        .map((f) => `<p>${f.label}</p><div class="blank">${val(n, "observe", f.id)}</div>`)
        .join("");
      const ver = les.verify.fields
        .map((f) => `<p>${f.label}</p><div class="blank">${val(n, "verify", f.id)}</div>`)
        .join("");
      return `<article class="a4">
        <p class="meta">MUSE-AI · ${p.grade} 활동지 · ${p.hall}</p>
        <h1>${p.title} · ${les.n}차시 ${les.title}</h1>
        <p class="meta">${les.minutes || p.minutes}분 · 학교 ________ 학급 ________ 이름 ________</p>
        <p><strong>오늘 증명:</strong> ${les.goal}</p>
        <h2>1. 관찰</h2>
        <p>${les.observe.do}</p>
        ${obs}
        <h2>2. AI 질문</h2>
        <p>${les.ask.skip ? "오늘은 AI를 열지 않습니다." : "관찰한 숫자를 넣은 질문을 복사하세요. 정답을 달라고 고치지 마세요."}</p>
        <div class="blank" style="min-height:5em">${n.ask?.prompt || " "}</div>
        <h2>3. 검증</h2>
        <p>${les.verify.lead}</p>
        ${ver}
        <h2>4. 산출</h2>
        <p>${les.output.lead}</p>
        <div class="blank">${val(n, "output", "gen")}</div>
        <p class="meta">철칙: ${p.rule}</p>
      </article>`;
    })
    .join("");
}

export function renderGuide(el, pid) {
  const p = PROGRAMS[pid];
  el.innerHTML = `<article class="a4">
    <p class="meta">MUSE-AI · 교사용 지도안</p>
    <h1>${p.grade} · ${p.title}</h1>
    <p class="meta">${p.hall} · ${p.tool} · 차시당 ${p.minutes}분</p>
    <p><strong>왜:</strong> ${p.why}</p>
    <p><strong>철칙:</strong> ${p.rule}</p>
    ${p.lessons
      .map((l) => {
        const rows = l.beats.map((b) => `<tr><th>${b[0]}</th><td>${b[1]}</td></tr>`).join("");
        return `<h2>${l.n}차시 · ${l.title}</h2>
          <p><strong>목표:</strong> ${l.goal}</p>
          <p>${l.where}</p>
          <table>${rows}</table>
          <p><strong>오개념:</strong> ${l.miss.join(" / ")}</p>
          <p><strong>달성:</strong> ${l.assess}</p>`;
      })
      .join("")}
  </article>`;
}

export function renderPrompts(el) {
  const blocks = listPrograms()
    .map((p) => {
      const items = p.lessons
        .filter((l) => !l.ask.skip)
        .map((l) => {
          const sample = l.ask.build({});
          return `<h2>${p.grade} ${l.n}차시 · ${l.title}</h2>
            <p>${l.ask.lead}</p>
            <div class="blank" style="min-height:6em">${sample}</div>`;
        })
        .join("");
      return `<article class="a4">
        <p class="meta">MUSE-AI · AI 활용 가이드</p>
        <h1>${p.grade} · ${p.title}</h1>
        <p>관찰 칸이 비어 있으면 이 질문을 던지지 마세요. 대괄호는 학생 숫자로 바꿉니다.</p>
        ${items || "<p>이 프로그램의 앞 차시는 AI를 열지 않습니다.</p>"}
      </article>`;
    })
    .join("");
  el.innerHTML =
    `<article class="a4">
      <p class="meta">MUSE-AI · AI 활용 가이드</p>
      <h1>언제 열고, 무엇을 넣나</h1>
      <p>전시를 보기 전에 AI를 열지 않습니다. 질문에 학생의 장수·라벨·측정값이 없으면 그 대화는 수업이 아닙니다.</p>
      <h2>넣지 말 것</h2>
      <p>정답을 달라는 말. 검색 이미지. 전시에 없는 통계. 의학·심리 해석. 학명 추천.</p>
      <h2>넣어야 할 것</h2>
      <p>고른 전시 이름. 손으로 센 숫자. 라벨에서 옮긴 연대. Phyphox 행 수. 모델이 틀린 장면.</p>
    </article>` + blocks;
}
