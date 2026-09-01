import { loadCard, GAMES } from "./redcard.js";
import { MODULES } from "./lessons.js";

function gameTitle(id) {
  return GAMES.find((g) => g.id === id)?.title || id;
}

export function renderCycleSheets(el) {
  const c = loadCard();
  const m = MODULES[c.game] || MODULES.rush;
  const where = c.where === "kiosk" ? "과학관 키오스크" : "웹앱";
  el.innerHTML = `
    <article class="a4">
      <p class="meta">이매지너리 수학놀이 · 1/3</p>
      <h1>1차시 · 질문하기</h1>
      <p class="meta">학번 ________ 이름 ${c.names || "________"} 모둠 ${c.group || "________"}</p>
      <p><strong>의뢰:</strong> 키오스크에는 차 빼기, 솔리테르, 14/15 퍼즐, 수도쿠가 있다. 모둠은 하나를 고른다.</p>
      <h2>나의 탐구질문</h2>
      <div class="blank">${c.mine || " "}</div>
      <h2>만든 이유</h2>
      <div class="blank">${c.why || " "}</div>
      <h2>모둠이 고른 탐구질문</h2>
      <div class="blank">${c.picked || " "}</div>
      <p>탐구할 게임: <strong>${gameTitle(c.game)}</strong> · 카드 ID: <strong>${c.id || "—"}</strong></p>
      <p>오늘 장소: ${where}</p>
    </article>
    <article class="a4">
      <p class="meta">이매지너리 수학놀이 · 2/3</p>
      <h1>2차시 · 탐구하기</h1>
      <p>모둠 탐구질문(카드 ${c.id || "—"})을 다시 적습니다.</p>
      <div class="blank">${c.picked || " "}</div>
      <p>장소 □ 과학관 키오스크  □ 웹앱  (표시: ${where})</p>
      <h2>보드에서 잰 것</h2>
      <p>${m.title} 미터를 그대로 옮기세요. 차 빼기=움직임 가능 대수, 수도쿠=후보, 15퍼즐=역전, 솔리테르=등식.</p>
      <div class="blank"> </div>
      <h2>그 숫자가 우리 질문에 답이 되나</h2>
      <div class="blank"> </div>
      <p>깨기가 목적이 아닙니다. 못 깨도 숫자가 있으면 탐구입니다.</p>
    </article>
    <article class="a4">
      <p class="meta">이매지너리 수학놀이 · 3/3</p>
      <h1>3차시 · 쓰기</h1>
      <h2>우리 탐구질문</h2>
      <div class="blank">${c.picked || " "}</div>
      <h2>잰 숫자</h2>
      <div class="blank"> </div>
      <h2>결론 한 문장</h2>
      <div class="blank"> </div>
      <h2>성찰 — 내가 한 일 / 남는 생각</h2>
      <div class="blank tall"> </div>
    </article>
  `;
}

export function renderCycleGuide(el) {
  el.innerHTML = `
    <article class="a4 guide">
      <p class="meta">MUSE-AI · 교사용</p>
      <h1>이매지너리 · 질문하기-탐구하기-쓰기</h1>
      <p>사진 IMG_8957–8968. 교실 웹앱만으로 성립. 과학관은 최선.</p>
      <h2>1차시 질문하기 (50분)</h2>
      <p>개인 질문 → 모둠 선정 → 웹에서 탐구질문카드(한 줄) → 카드 ID. 게임 하나.</p>
      <h2>2차시 탐구하기 (50분)</h2>
      <p>고른 게임을 키오스크 또는 웹앱에서. 미터를 읽는다. 힌트·수도쿠 도움 끄기.</p>
      <h2>3차시 쓰기 (40분)</h2>
      <p>종이 3장. 질문 + 숫자 + 한 문장. 웹 보고서는 필수가 아니다.</p>
      <p><strong>철칙:</strong> 보드는 1차 자료. 깨기 목적 아님. Cinderella 그림 복제 금지.</p>
    </article>
  `;
}
