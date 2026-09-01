const KEY = "muse-ai-red-card";
export const GAMES = [
  { id: "rush", title: "차 빼기" },
  { id: "solitaire", title: "솔리테르" },
  { id: "fifteen", title: "14/15 퍼즐" },
  { id: "sudoku", title: "수도쿠" },
];

export function emptyCard() {
  return {
    id: "",
    group: "",
    names: "",
    game: "rush",
    mine: "",
    why: "",
    picked: "",
    where: "web",
  };
}

export function loadCard() {
  try {
    return { ...emptyCard(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return emptyCard();
  }
}

export function saveCard(card) {
  localStorage.setItem(KEY, JSON.stringify(card));
  return card;
}

export function issueId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `R-${n}`;
}

export function renderAsk(root, onIssued) {
  const c = loadCard();
  root.innerHTML = `
    <article class="a4 red-sheet">
      <p class="meta">1차시 · 질문하기</p>
      <h1>탐구질문 만들고 레드카드</h1>
      <p>개인이 질문을 쓰고, 모둠이 하나 고르고, 아래에서 카드를 만듭니다. 카드에는 탐구질문 한 줄만 남습니다.</p>
      <label>모둠 <input id="rc-group" value="${c.group}" /></label>
      <label>이름 <input id="rc-names" value="${c.names}" /></label>
      <label>나의 탐구질문
        <textarea id="rc-mine" rows="3">${c.mine}</textarea>
      </label>
      <label>이 질문을 만든 이유
        <textarea id="rc-why" rows="2">${c.why}</textarea>
      </label>
      <label>모둠이 고른 탐구질문
        <textarea id="rc-picked" rows="3">${c.picked}</textarea>
      </label>
      <label>탐구할 게임
        <select id="rc-game">${GAMES.map((g) => `<option value="${g.id}" ${c.game === g.id ? "selected" : ""}>${g.title}</option>`).join("")}</select>
      </label>
      <label>오늘 탐구 장소
        <select id="rc-where">
          <option value="web" ${c.where === "web" ? "selected" : ""}>웹앱</option>
          <option value="kiosk" ${c.where === "kiosk" ? "selected" : ""}>과학관 키오스크</option>
        </select>
      </label>
      <p class="card-id">카드 ID: <strong id="rc-id">${c.id || "아직 없음"}</strong></p>
      <button type="button" class="next" id="rc-make">레드카드 만들기</button>
      <p class="hint-mute">만든 뒤에는 탐구하기에서 이 게임과 미터를 엽니다.</p>
    </article>
  `;
  const read = () => ({
    ...loadCard(),
    group: root.querySelector("#rc-group").value,
    names: root.querySelector("#rc-names").value,
    mine: root.querySelector("#rc-mine").value,
    why: root.querySelector("#rc-why").value,
    picked: root.querySelector("#rc-picked").value,
    game: root.querySelector("#rc-game").value,
    where: root.querySelector("#rc-where").value,
  });
  root.querySelector("#rc-make").addEventListener("click", () => {
    const next = read();
    if (!next.picked.trim()) {
      alert("모둠이 고른 탐구질문을 적으세요.");
      return;
    }
    if (!next.id) next.id = issueId();
    saveCard(next);
    root.querySelector("#rc-id").textContent = next.id;
    onIssued?.(next);
  });
}
