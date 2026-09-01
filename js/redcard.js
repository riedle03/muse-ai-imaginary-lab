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
      <p class="meta">1걸음 · 질문 남기기</p>
      <h1>질문을 한 줄로 남깁니다</h1>
      <p>먼저 나만의 질문을 씁니다. 모둠이 하나를 고르면, 그 한 줄이 레드카드가 됩니다.</p>
      <label>모둠 이름 <input id="rc-group" value="${c.group}" /></label>
      <label>내 이름 <input id="rc-names" value="${c.names}" /></label>
      <label>내가 만든 질문
        <textarea id="rc-mine" rows="3">${c.mine}</textarea>
      </label>
      <label>왜 이 질문인가요
        <textarea id="rc-why" rows="2">${c.why}</textarea>
      </label>
      <label>모둠이 고른 질문 (한 줄)
        <textarea id="rc-picked" rows="3">${c.picked}</textarea>
      </label>
      <label>오늘 셀 놀이
        <select id="rc-game">${GAMES.map((g) => `<option value="${g.id}" ${c.game === g.id ? "selected" : ""}>${g.title}</option>`).join("")}</select>
      </label>
      <label>어디서 하나요
        <select id="rc-where">
          <option value="web" ${c.where === "web" ? "selected" : ""}>이 화면 (웹앱)</option>
          <option value="kiosk" ${c.where === "kiosk" ? "selected" : ""}>과학관 키오스크</option>
        </select>
      </label>
      <p class="card-id">카드 번호: <strong id="rc-id">${c.id || "아직 없음"}</strong></p>
      <button type="button" class="next" id="rc-make">레드카드 만들기</button>
      <p class="hint-mute">카드를 만들면 2걸음에서 그 놀이의 미터를 셉니다.</p>
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
    let go = root.querySelector("#rc-go");
    if (!go) {
      go = document.createElement("a");
      go.id = "rc-go";
      go.className = "btn primary";
      go.textContent = "세러 가기";
      root.querySelector("#rc-make").after(go);
    }
    go.href = `#inquire/${next.game}`;
    onIssued?.(next);
  });
}
