const DIRS = [
  [0, 2],
  [0, -2],
  [2, 0],
  [-2, 0],
  [2, 2],
  [-2, -2],
];

export function holes() {
  const list = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c <= r; c += 1) list.push({ r, c, i: list.length });
  }
  return list;
}

export const HOLES = holes();

function at(r, c) {
  if (r < 0 || c < 0 || r > 4 || c > r) return -1;
  return (r * (r + 1)) / 2 + c;
}

export function startBoard(empty = "apex") {
  const filled = Array(15).fill(true);
  if (empty === "center") filled[at(2, 1)] = false;
  else if (empty === "base") filled[at(4, 2)] = false;
  else filled[0] = false;
  return filled;
}

export function jumpsFrom(board, i) {
  if (!board[i]) return [];
  const { r, c } = HOLES[i];
  const out = [];
  for (const [dr, dc] of DIRS) {
    const mid = at(r + dr / 2, c + dc / 2);
    const land = at(r + dr, c + dc);
    if (mid < 0 || land < 0) continue;
    if (board[mid] && !board[land]) out.push({ from: i, over: mid, to: land });
  }
  return out;
}

export function allJumps(board) {
  return HOLES.flatMap((_, i) => jumpsFrom(board, i));
}

export function applyJump(board, jump) {
  const next = board.slice();
  next[jump.from] = false;
  next[jump.over] = false;
  next[jump.to] = true;
  return next;
}

export function remaining(board) {
  return board.filter(Boolean).length;
}

export function mountSolitaire(root, { onStatus, lessonMode = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "sol-wrap";
  wrap.innerHTML = `
    <div class="sol-toolbar">
      <button type="button" data-empty="apex">꼭짓점 비우기</button>
      <button type="button" data-empty="center">가운데 비우기</button>
      <button type="button" data-empty="base">밑변 비우기</button>
    </div>
    <div class="tri-board" role="application" aria-label="삼각 솔리테르"></div>
    <p class="sol-win hidden">구슬이 하나 남았습니다.</p>
  `;
  root.append(wrap);
  const boardEl = wrap.querySelector(".tri-board");
  let board = startBoard("apex");
  let selected = -1;
  let history = [];

  const startN = 14;
  const snapshot = () => {
    const n = remaining(board);
    const j = history.length;
    return {
      moves: j,
      remaining: n,
      startN,
      legalJumpCount: allJumps(board).length,
      eq: `${startN} − ${j} = ${n}`,
    };
  };

  const status = () => {
    const s = snapshot();
    onStatus?.({
      ...s,
      label: `남은 구슬 ${s.remaining} · 점프 ${s.moves} · 가능 ${s.legalJumpCount}`,
    });
    wrap.querySelector(".sol-win").classList.toggle("hidden", s.remaining !== 1);
  };

  const render = () => {
    boardEl.replaceChildren();
    const options = selected >= 0 ? jumpsFrom(board, selected) : [];
    const land = new Set(options.map((j) => j.to));
    const W = boardEl.clientWidth || 440;
    const H = boardEl.clientHeight || 380;
    const spacing = (W * 0.56) / 4;
    const top = H * 0.18;
    const bot = H * 0.78;
    HOLES.forEach((h, i) => {
      const x = W / 2 + (h.c - h.r / 2) * spacing;
      const y = top + (h.r / 4) * (bot - top);
      const hole = document.createElement("button");
      hole.type = "button";
      hole.className = "peg-hole";
      hole.style.left = `${x}px`;
      hole.style.top = `${y}px`;
      hole.dataset.i = String(i);
      hole.setAttribute("aria-label", `${h.r}행 ${h.c}열`);
      if (land.has(i)) hole.classList.add("is-land");
      if (board[i]) {
        const peg = document.createElement("span");
        peg.className = `peg${selected === i ? " is-on" : ""}`;
        hole.append(peg);
      }
      boardEl.append(hole);
    });
  };

  boardEl.addEventListener("click", (event) => {
    const hole = event.target.closest(".peg-hole");
    if (!hole) return;
    const i = Number(hole.dataset.i);
    if (selected >= 0) {
      const jump = jumpsFrom(board, selected).find((j) => j.to === i);
      if (jump) {
        history.push(board);
        board = applyJump(board, jump);
        selected = -1;
        render();
        status();
        return;
      }
    }
    if (board[i]) selected = selected === i ? -1 : i;
    else selected = -1;
    render();
  });

  wrap.querySelectorAll("[data-empty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      board = startBoard(btn.dataset.empty);
      selected = -1;
      history = [];
      render();
      status();
    });
  });

  const ro = new ResizeObserver(() => render());
  ro.observe(boardEl);
  render();
  status();

  return {
    reset() {
      board = startBoard("apex");
      selected = -1;
      history = [];
      render();
      status();
    },
    applyTask() {},
    getState: snapshot,
    hint() {
      if (lessonMode) {
        onStatus?.({ ...snapshot(), label: `지금 가능한 점프 ${allJumps(board).length}개`, notice: true });
        return;
      }
      const js = allJumps(board);
      if (!js.length) {
        onStatus?.({ ...snapshot(), label: "점프할 수가 없습니다", notice: true });
        return;
      }
      selected = js[0].from;
      render();
    },
    destroy() {
      ro.disconnect();
      wrap.remove();
    },
  };
}
