export function solved() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
}

export function inversionCount(tiles) {
  const flat = tiles.filter((n) => n !== 0);
  let inv = 0;
  for (let i = 0; i < flat.length; i += 1) {
    for (let j = i + 1; j < flat.length; j += 1) if (flat[i] > flat[j]) inv += 1;
  }
  return inv;
}

export function isSolvable(tiles) {
  const inv = inversionCount(tiles);
  const rowFromBottom = 4 - Math.floor(tiles.indexOf(0) / 4);
  if (rowFromBottom % 2 === 1) return inv % 2 === 0;
  return inv % 2 === 1;
}

export function isSolved(tiles) {
  return tiles.every((n, i) => (i === 15 ? n === 0 : n === i + 1));
}

export function neighbors(empty) {
  const r = Math.floor(empty / 4);
  const c = empty % 4;
  const out = [];
  if (r > 0) out.push(empty - 4);
  if (r < 3) out.push(empty + 4);
  if (c > 0) out.push(empty - 1);
  if (c < 3) out.push(empty + 1);
  return out;
}

export function slide(tiles, index) {
  const empty = tiles.indexOf(0);
  if (!neighbors(empty).includes(index)) return tiles;
  const next = tiles.slice();
  next[empty] = next[index];
  next[index] = 0;
  return next;
}

export function swap14and15() {
  const tiles = solved();
  const a = tiles.indexOf(14);
  const b = tiles.indexOf(15);
  [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
  return tiles;
}

export function shuffleFromSolved(steps, rng = Math.random) {
  let tiles = solved();
  let empty = 15;
  let last = -1;
  for (let s = 0; s < steps; s += 1) {
    const opts = neighbors(empty).filter((n) => n !== last);
    const pick = opts[Math.floor(rng() * opts.length)];
    tiles = slide(tiles, pick);
    last = empty;
    empty = pick;
  }
  return tiles;
}

export function mountFifteen(root, { onStatus, lessonMode = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "fif-wrap";
  wrap.innerHTML = `
    <div class="fif-toolbar">
      <button type="button" data-task="swap14">14와 15만 바꾸기</button>
      ${lessonMode ? "" : `
      <button type="button" data-mix="0">초기화</button>
      <button type="button" data-mix="5">5번 섞기</button>
      <button type="button" data-mix="10">10번 섞기</button>
      <button type="button" data-mix="20">20번 섞기</button>
      <button type="button" data-mix="50">50번 섞기</button>`}
    </div>
    ${lessonMode ? "" : `<div class="skin-row">
      <button type="button" class="skin is-on" data-skin="num">숫자</button>
      <button type="button" class="skin" data-skin="glass">유리</button>
      <button type="button" class="skin" data-skin="geo">해바라기</button>
    </div>`}
    <div class="fif-board" role="application" aria-label="15퍼즐"></div>
    <p class="fif-win hidden">맞춰졌습니다. 이 배치는 짝순열입니다.</p>
  `;
  root.append(wrap);
  const boardEl = wrap.querySelector(".fif-board");
  let tiles = lessonMode ? swap14and15() : solved();
  let moves = 0;
  let skin = "num";

  const snapshot = () => {
    const inv = inversionCount(tiles);
    const blankRowFromBottom = 4 - Math.floor(tiles.indexOf(0) / 4);
    return {
      moves,
      inversions: inv,
      blankRowFromBottom,
      solvable: isSolvable(tiles),
      solved: isSolved(tiles),
      tiles: tiles.slice(),
    };
  };

  const status = () => {
    const s = snapshot();
    onStatus?.({
      ...s,
      label: s.solved
        ? "완성"
        : `역전 ${s.inversions}(${s.inversions % 2 ? "홀" : "짝"}) · ${s.moves}수`,
    });
    wrap.querySelector(".fif-win").classList.toggle("hidden", !isSolved(tiles));
  };

  const render = () => {
    boardEl.replaceChildren();
    tiles.forEach((n, i) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `fif-tile skin-${skin}${n === 0 ? " is-empty" : ""}`;
      cell.dataset.i = String(i);
      if (n === 0) {
        cell.setAttribute("aria-label", "빈칸");
      } else {
        const home = n - 1;
        cell.style.setProperty("--hx", String(home % 4));
        cell.style.setProperty("--hy", String(Math.floor(home / 4)));
        if (skin === "num") cell.textContent = String(n);
        else cell.innerHTML = `<span>${n}</span>`;
      }
      boardEl.append(cell);
    });
  };

  const doSlide = (i) => {
    const next = slide(tiles, i);
    if (next === tiles) return;
    tiles = next;
    moves += 1;
    render();
    status();
  };

  boardEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".fif-tile");
    if (btn) doSlide(Number(btn.dataset.i));
  });

  wrap.querySelector("[data-task=swap14]")?.addEventListener("click", () => {
    tiles = swap14and15();
    moves = 0;
    render();
    status();
  });

  wrap.querySelectorAll("[data-mix]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = Number(btn.dataset.mix);
      tiles = n === 0 ? solved() : shuffleFromSolved(n);
      moves = 0;
      render();
      status();
    });
  });

  wrap.querySelectorAll("[data-skin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      skin = btn.dataset.skin;
      wrap.querySelectorAll("[data-skin]").forEach((b) => b.classList.toggle("is-on", b === btn));
      render();
    });
  });

  wrap.addEventListener("keydown", (event) => {
    const empty = tiles.indexOf(0);
    const map = { ArrowUp: empty + 4, ArrowDown: empty - 4, ArrowLeft: empty + 1, ArrowRight: empty - 1 };
    if (event.key in map) {
      doSlide(map[event.key]);
      event.preventDefault();
    }
  });

  render();
  status();
  return {
    reset() {
      tiles = lessonMode ? swap14and15() : solved();
      moves = 0;
      render();
      status();
    },
    applyTask(name) {
      if (name === "swap14") {
        tiles = swap14and15();
        moves = 0;
        render();
        status();
      }
    },
    getState: snapshot,
    hint() {
      const empty = tiles.indexOf(0);
      const opts = neighbors(empty);
      onStatus?.({
        ...snapshot(),
        notice: true,
        label: opts.length ? `빈칸 옆 ${opts.length}칸만 밀 수 있습니다` : "이동 불가",
      });
    },
    destroy() {
      wrap.remove();
    },
  };
}
