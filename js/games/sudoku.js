export const PUZZLES = [
  {
    id: "e1",
    diff: 0,
    given: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  {
    id: "e2",
    diff: 0,
    given: "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
    solution: "483921657967345821251876493548132976729564138136798245372689514814253769695417382",
  },
  {
    id: "m1",
    diff: 1,
    given: "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
    solution: "245981376169273584837564219976125438513498627482736951391657842728349165654812793",
  },
  {
    id: "m2",
    diff: 1,
    given: "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
    solution: "462831957795426183381795426173984265659312748248567319926178534834259671517643892",
  },
  {
    id: "h1",
    diff: 2,
    given: "500608000070000308108302500000001020020000790003900000960507000080000030000000179",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  {
    id: "h2",
    diff: 2,
    given: "000920000007300800200006400040000000029500000006008005000680510000000709090410082",
    solution: "483921657967345821251876493548132976729564138136798245372689514814253769695417382",
  },
];

function parse(s) {
  return s.replace(/\D/g, "").slice(0, 81).split("").map((ch) => Number(ch));
}

export function rowOf(i) {
  return Math.floor(i / 9);
}
export function colOf(i) {
  return i % 9;
}
export function boxOf(i) {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

export function conflicts(grid, index, value) {
  if (!value) return false;
  const r = rowOf(index);
  const c = colOf(index);
  const b = boxOf(index);
  for (let i = 0; i < 81; i += 1) {
    if (i === index || grid[i] !== value) continue;
    if (rowOf(i) === r || colOf(i) === c || boxOf(i) === b) return true;
  }
  return false;
}

export function candidates(grid, index) {
  if (grid[index]) return [];
  const used = new Set();
  const r = rowOf(index);
  const c = colOf(index);
  const b = boxOf(index);
  for (let i = 0; i < 81; i += 1) {
    if (!grid[i]) continue;
    if (rowOf(i) === r || colOf(i) === c || boxOf(i) === b) used.add(grid[i]);
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
}

const SAFE_PUZZLES = PUZZLES.filter((p) => p.solution.length === 81 && p.given.length === 81);

function digitsIn(grid, pred) {
  return [...new Set(grid.filter((v, i) => v && pred(i)))].sort().join(" ");
}

export function mountSudoku(root, { onStatus, lessonMode = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "sdk-wrap";
  wrap.innerHTML = `
    <div class="sdk-toolbar">
      <button type="button" data-act="new">새 판</button>
      <button type="button" data-act="reset">처음</button>
      ${lessonMode ? "" : '<button type="button" data-act="help">도움</button>'}
      <button type="button" data-act="check">검사</button>
      <button type="button" data-act="save">저장</button>
      <label class="pen-toggle"><input type="checkbox" class="pen" /> 메모</label>
    </div>
    <div class="sdk-diff">
      <button type="button" data-diff="0" class="is-on">쉬움</button>
      <button type="button" data-diff="1">보통</button>
      <button type="button" data-diff="2">어려움</button>
    </div>
    <div class="sdk-board" role="grid" aria-label="수도쿠"></div>
    <div class="sdk-pad"></div>
    <p class="sdk-msg"></p>
  `;
  root.append(wrap);
  const boardEl = wrap.querySelector(".sdk-board");
  const pad = wrap.querySelector(".sdk-pad");
  const msg = wrap.querySelector(".sdk-msg");
  const pen = wrap.querySelector(".pen");

  let diff = 0;
  let puzzle = SAFE_PUZZLES.find((p) => p.diff === 0);
  let given = parse(puzzle.given);
  let grid = given.slice();
  let notes = Array.from({ length: 81 }, () => new Set());
  let sel = -1;
  let checkMask = Array(81).fill(false);

  const snapshot = () => {
    const cand = sel >= 0 && !grid[sel] ? candidates(grid, sel) : [];
    const r = sel >= 0 ? rowOf(sel) : -1;
    const c = sel >= 0 ? colOf(sel) : -1;
    return {
      sel,
      cellLabel: sel >= 0 ? `${r + 1}행 ${c + 1}열` : "칸을 고르세요",
      cand,
      candText: cand.join(" ") || "—",
      rowDigits: sel >= 0 ? digitsIn(grid, (i) => rowOf(i) === r) : "",
      colDigits: sel >= 0 ? digitsIn(grid, (i) => colOf(i) === c) : "",
      boxDigits: sel >= 0 ? digitsIn(grid, (i) => boxOf(i) === boxOf(sel)) : "",
      filled: grid.filter(Boolean).length,
    };
  };

  const status = () => {
    const s = snapshot();
    onStatus?.({
      ...s,
      label: sel < 0 ? `${s.filled}/81` : `${s.cellLabel} · 후보 {${s.candText}}`,
    });
  };

  const focusSel = () => {
    if (sel < 0) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT") && !wrap.contains(ae)) return;
    boardEl.querySelector(`.sdk-cell[data-i="${sel}"]`)?.focus();
  };

  const render = () => {
    boardEl.replaceChildren();
    for (let i = 0; i < 81; i += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "sdk-cell";
      cell.dataset.i = String(i);
      if (given[i]) cell.classList.add("is-given");
      if (sel === i) cell.classList.add("is-on");
      if (sel >= 0 && grid[sel] && grid[i] === grid[sel]) cell.classList.add("is-same");
      if (grid[i] && conflicts(grid, i, grid[i])) cell.classList.add("is-bad");
      if (checkMask[i]) cell.classList.add("is-wrong");
      const r = rowOf(i);
      const c = colOf(i);
      if (c % 3 === 0) cell.classList.add("box-l");
      if (r % 3 === 0) cell.classList.add("box-t");
      if (c === 8) cell.classList.add("box-r");
      if (r === 8) cell.classList.add("box-b");
      if (grid[i]) cell.textContent = String(grid[i]);
      else if (notes[i].size) {
        const n = document.createElement("span");
        n.className = "notes";
        n.textContent = [...notes[i]].sort().join("");
        cell.append(n);
      }
      boardEl.append(cell);
    }
    focusSel();
  };

  pad.replaceChildren();
  for (let n = 1; n <= 9; n += 1) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = String(n);
    b.addEventListener("click", () => put(n));
    pad.append(b);
  }
  const clr = document.createElement("button");
  clr.type = "button";
  clr.textContent = "지움";
  clr.addEventListener("click", () => put(0));
  pad.append(clr);

  const put = (n) => {
    if (sel < 0 || given[sel]) return;
    checkMask[sel] = false;
    if (pen.checked && n) {
      if (notes[sel].has(n)) notes[sel].delete(n);
      else notes[sel].add(n);
    } else {
      grid[sel] = grid[sel] === n ? 0 : n;
      notes[sel] = new Set();
    }
    if (grid.every((v, i) => v === parse(puzzle.solution)[i])) {
      msg.textContent = "완성했습니다.";
    }
    render();
    status();
  };

  boardEl.addEventListener("click", (event) => {
    const cell = event.target.closest(".sdk-cell");
    if (!cell) return;
    sel = Number(cell.dataset.i);
    render();
    status();
  });

  const loadPuzzle = () => {
    const pool = SAFE_PUZZLES.filter((p) => p.diff === diff);
    puzzle = pool[Math.floor(Math.random() * pool.length)];
    given = parse(puzzle.given);
    grid = given.slice();
    notes = Array.from({ length: 81 }, () => new Set());
    checkMask = Array(81).fill(false);
    sel = given.findIndex((v) => !v);
    msg.textContent = "";
    render();
    status();
  };

  wrap.querySelectorAll("[data-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      diff = Number(btn.dataset.diff);
      wrap.querySelectorAll("[data-diff]").forEach((b) => b.classList.toggle("is-on", b === btn));
      loadPuzzle();
    });
  });

  wrap.querySelector("[data-act=new]").addEventListener("click", loadPuzzle);
  wrap.querySelector("[data-act=reset]").addEventListener("click", () => {
    grid = given.slice();
    notes = Array.from({ length: 81 }, () => new Set());
    checkMask = Array(81).fill(false);
    msg.textContent = "";
    render();
    status();
  });
  wrap.querySelector("[data-act=help]")?.addEventListener("click", () => {
    const sol = parse(puzzle.solution);
    const idx = grid.findIndex((v, i) => !v && candidates(grid, i).length === 1);
    const i = idx >= 0 ? idx : grid.findIndex((v, j) => !v);
    if (i < 0) return;
    grid[i] = sol[i];
    sel = i;
    msg.textContent = "후보가 하나인 칸을 채웠습니다.";
    render();
    status();
  });
  wrap.querySelector("[data-act=check]").addEventListener("click", () => {
    const sol = parse(puzzle.solution);
    checkMask = grid.map((v, i) => Boolean(v) && v !== sol[i]);
    const n = checkMask.filter(Boolean).length;
    msg.textContent = n ? `다른 칸 ${n}개` : "지금까지 적은 숫자는 해와 같습니다.";
    render();
  });
  wrap.querySelector("[data-act=save]").addEventListener("click", () => {
    localStorage.setItem(
      "muse-ai-sudoku",
      JSON.stringify({ id: puzzle.id, grid, notes: notes.map((s) => [...s]) })
    );
    msg.textContent = "이 브라우저에 저장했습니다.";
  });

  wrap.addEventListener("keydown", (event) => {
    if (sel < 0) return;
    if (event.key >= "1" && event.key <= "9") put(Number(event.key));
    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") put(0);
    const jump = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 }[event.key];
    if (jump) {
      sel = Math.max(0, Math.min(80, sel + jump));
      render();
      status();
      event.preventDefault();
    }
  });

  try {
    const saved = JSON.parse(localStorage.getItem("muse-ai-sudoku") || "null");
    if (saved?.id) {
      const found = SAFE_PUZZLES.find((p) => p.id === saved.id);
      if (found) {
        puzzle = found;
        given = parse(puzzle.given);
        grid = saved.grid;
        notes = saved.notes.map((arr) => new Set(arr));
      }
    }
  } catch {
    /* ignore */
  }

  if (sel < 0) sel = given.findIndex((v) => !v);
  render();
  status();
  return {
    reset: loadPuzzle,
    applyTask() {},
    getState: snapshot,
    hint() {
      if (lessonMode) {
        onStatus?.({ ...snapshot(), label: "후보를 직접 구하세요. 도움이 답을 채우지 않습니다.", notice: true });
        return;
      }
      wrap.querySelector("[data-act=help]")?.click();
    },
    destroy() {
      wrap.remove();
    },
  };
}
