export const SIZE = 6;
export const EXIT_ROW = 2;

const COLORS = {
  R: "#e23d28",
  A: "#3b6fb6",
  B: "#e3b341",
  C: "#3fa36a",
  D: "#8b6bb8",
  E: "#ef7a3c",
  F: "#d6dce6",
  G: "#2aa7a1",
  H: "#c45c8a",
  I: "#6b7280",
  J: "#86b0d4",
};

/** @typedef {{id:string,color:string,len:number,r:number,c:number,axis:'h'|'v',target?:boolean}} Car */

export const LEVELS = [
  {
    id: 1,
    diff: 0,
    title: "출구가 보인다",
    cars: [{ id: "R", len: 2, r: 2, c: 3, axis: "h", target: true }],
  },
  {
    id: 2,
    diff: 0,
    title: "파란 트럭",
    cars: [
      { id: "R", len: 2, r: 2, c: 2, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 1, axis: "v" },
    ],
  },
  {
    id: 3,
    diff: 0,
    title: "길을 빌려 주세요",
    cars: [
      { id: "R", len: 2, r: 2, c: 3, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 0, axis: "v" },
      { id: "B", len: 2, r: 3, c: 0, axis: "h" },
    ],
  },
  {
    id: 4,
    diff: 1,
    title: "샛길",
    cars: [
      { id: "R", len: 2, r: 2, c: 2, axis: "h", target: true },
      { id: "A", len: 2, r: 0, c: 0, axis: "h" },
      { id: "B", len: 3, r: 1, c: 1, axis: "v" },
      { id: "C", len: 2, r: 0, c: 4, axis: "h" },
      { id: "D", len: 3, r: 2, c: 5, axis: "v" },
      { id: "E", len: 2, r: 3, c: 3, axis: "h" },
      { id: "F", len: 2, r: 4, c: 0, axis: "h" },
      { id: "G", len: 2, r: 5, c: 2, axis: "h" },
    ],
  },
  {
    id: 5,
    diff: 1,
    title: "세 대의 벽",
    cars: [
      { id: "R", len: 2, r: 2, c: 1, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 0, axis: "v" },
      { id: "B", len: 2, r: 0, c: 3, axis: "h" },
      { id: "C", len: 3, r: 1, c: 5, axis: "v" },
      { id: "D", len: 2, r: 3, c: 1, axis: "h" },
      { id: "E", len: 2, r: 4, c: 0, axis: "h" },
      { id: "F", len: 2, r: 4, c: 3, axis: "v" },
    ],
  },
  {
    id: 6,
    diff: 1,
    title: "가운데 교차",
    cars: [
      { id: "R", len: 2, r: 2, c: 3, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 0, axis: "v" },
      { id: "B", len: 2, r: 0, c: 2, axis: "h" },
      { id: "C", len: 2, r: 1, c: 2, axis: "v" },
      { id: "D", len: 2, r: 3, c: 0, axis: "h" },
      { id: "E", len: 2, r: 3, c: 2, axis: "v" },
      { id: "F", len: 3, r: 4, c: 3, axis: "h" },
      { id: "G", len: 2, r: 0, c: 5, axis: "v" },
    ],
  },
  {
    id: 7,
    diff: 2,
    title: "혼잡 출근",
    cars: [
      { id: "R", len: 2, r: 2, c: 2, axis: "h", target: true },
      { id: "A", len: 2, r: 0, c: 0, axis: "h" },
      { id: "B", len: 2, r: 0, c: 2, axis: "v" },
      { id: "C", len: 2, r: 0, c: 4, axis: "h" },
      { id: "D", len: 2, r: 1, c: 0, axis: "v" },
      { id: "E", len: 2, r: 1, c: 5, axis: "v" },
      { id: "F", len: 2, r: 3, c: 1, axis: "h" },
      { id: "G", len: 3, r: 3, c: 3, axis: "v" },
      { id: "H", len: 2, r: 4, c: 0, axis: "h" },
      { id: "I", len: 2, r: 5, c: 4, axis: "h" },
    ],
  },
  {
    id: 8,
    diff: 2,
    title: "퇴근 정체",
    cars: [
      { id: "R", len: 2, r: 2, c: 3, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 1, axis: "v" },
      { id: "B", len: 2, r: 0, c: 2, axis: "h" },
      { id: "C", len: 2, r: 0, c: 4, axis: "v" },
      { id: "D", len: 2, r: 1, c: 5, axis: "v" },
      { id: "E", len: 2, r: 2, c: 0, axis: "v" },
      { id: "F", len: 3, r: 3, c: 2, axis: "h" },
      { id: "G", len: 2, r: 4, c: 0, axis: "h" },
      { id: "H", len: 2, r: 4, c: 5, axis: "v" },
      { id: "I", len: 2, r: 5, c: 2, axis: "h" },
    ],
  },
  {
    id: 9,
    diff: 2,
    title: "마지막 칸",
    cars: [
      { id: "R", len: 2, r: 2, c: 3, axis: "h", target: true },
      { id: "A", len: 3, r: 0, c: 0, axis: "v" },
      { id: "B", len: 2, r: 0, c: 2, axis: "h" },
      { id: "C", len: 2, r: 1, c: 2, axis: "v" },
      { id: "D", len: 2, r: 3, c: 0, axis: "h" },
      { id: "E", len: 2, r: 3, c: 2, axis: "v" },
      { id: "F", len: 3, r: 4, c: 3, axis: "h" },
      { id: "G", len: 2, r: 0, c: 5, axis: "v" },
      { id: "H", len: 2, r: 4, c: 1, axis: "v" },
      { id: "I", len: 2, r: 5, c: 4, axis: "h" },
    ],
  },
];

export function paint(cars) {
  return cars.map((car) => ({ ...car, color: car.color || COLORS[car.id] || "#888" }));
}

export function cloneCars(cars) {
  return cars.map((car) => ({ ...car }));
}

export function occupies(car, r, c) {
  for (let i = 0; i < car.len; i += 1) {
    const rr = car.r + (car.axis === "v" ? i : 0);
    const cc = car.c + (car.axis === "h" ? i : 0);
    if (rr === r && cc === c) return true;
  }
  return false;
}

export function gridOf(cars, ignoreId = null) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (const car of cars) {
    if (car.id === ignoreId) continue;
    for (let i = 0; i < car.len; i += 1) {
      const r = car.r + (car.axis === "v" ? i : 0);
      const c = car.c + (car.axis === "h" ? i : 0);
      if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return null;
      if (grid[r][c]) return null;
      grid[r][c] = car.id;
    }
  }
  return grid;
}

export function validPack(cars) {
  return gridOf(cars) !== null;
}

export function slideRange(car, cars) {
  const grid = gridOf(cars, car.id);
  if (!grid) return { min: car.axis === "h" ? car.c : car.r, max: car.axis === "h" ? car.c : car.r };
  if (car.axis === "h") {
    let min = 0;
    let max = SIZE - car.len;
    for (let c = car.c - 1; c >= 0; c -= 1) {
      if (grid[car.r][c]) {
        min = c + 1;
        break;
      }
    }
    for (let c = car.c + car.len; c < SIZE; c += 1) {
      if (grid[car.r][c]) {
        max = c - car.len;
        break;
      }
    }
    return { min, max };
  }
  let min = 0;
  let max = SIZE - car.len;
  for (let r = car.r - 1; r >= 0; r -= 1) {
    if (grid[r][car.c]) {
      min = r + 1;
      break;
    }
  }
  for (let r = car.r + car.len; r < SIZE; r += 1) {
    if (grid[r][car.c]) {
      max = r - car.len;
      break;
    }
  }
  return { min, max };
}

export function isWon(cars) {
  const red = cars.find((car) => car.target);
  return Boolean(red && red.axis === "h" && red.r === EXIT_ROW && red.c === 0);
}

function keyOf(cars) {
  return cars
    .map((car) => `${car.id}:${car.r},${car.c}`)
    .sort()
    .join("|");
}

export function legalSlides(cars) {
  const moves = [];
  for (let i = 0; i < cars.length; i += 1) {
    const car = cars[i];
    const { min, max } = slideRange(car, cars);
    const pos = car.axis === "h" ? car.c : car.r;
    for (let p = min; p <= max; p += 1) {
      if (p === pos) continue;
      moves.push({ id: car.id, axis: car.axis, to: p });
    }
  }
  return moves;
}

export function applySlide(cars, move) {
  return cars.map((car) => {
    if (car.id !== move.id) return car;
    if (move.axis === "h") return { ...car, c: move.to };
    return { ...car, r: move.to };
  });
}

export function shortest(cars, limit = 40000) {
  if (isWon(cars)) return [];
  const start = cloneCars(cars);
  const queue = [{ cars: start, path: [] }];
  const seen = new Set([keyOf(start)]);
  let steps = 0;
  while (queue.length && steps < limit) {
    const cur = queue.shift();
    steps += 1;
    const slides = legalSlides(cur.cars);
    for (const move of slides) {
      const next = applySlide(cur.cars, move);
      const k = keyOf(next);
      if (seen.has(k)) continue;
      seen.add(k);
      const path = cur.path.concat(move);
      if (isWon(next)) return path;
      queue.push({ cars: next, path });
    }
  }
  return null;
}

export function hintMove(cars) {
  const path = shortest(cars);
  return path && path[0] ? path[0] : null;
}

export function mountRush(root, { onStatus, lessonMode = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "rush-wrap";
  wrap.innerHTML = `
    <div class="rush-side">
      <label class="diff-slider">
        <span>쉬움</span>
        <input type="range" min="0" max="${LEVELS.length - 1}" value="0" class="diff-input" aria-label="단계" />
        <span>어려움</span>
      </label>
      <p class="diff-caption"></p>
    </div>
    <div class="lot-frame">
      <div class="lot" role="application" aria-label="주차장"></div>
      <div class="exit-arrow" aria-hidden="true">출구</div>
    </div>
    <div class="win-banner hidden">탈출. 빨간 차가 나갔습니다.</div>
  `;
  root.append(wrap);
  const lot = wrap.querySelector(".lot");
  const diffInput = wrap.querySelector(".diff-input");
  const caption = wrap.querySelector(".diff-caption");
  const banner = wrap.querySelector(".win-banner");

  let cars = [];
  let origin = [];
  let moves = 0;
  let selected = null;
  let drag = null;
  let cell = 56;

  const snapshot = () => {
    const level = LEVELS[Number(diffInput.value)];
    const slides = legalSlides(cars);
    const movable = new Set(slides.map((m) => m.id)).size;
    return {
      moves,
      won: isWon(cars),
      movableCars: movable,
      legalSlides: slides.length,
      levelTitle: level.title,
      levelId: level.id,
    };
  };

  const setStatus = () => {
    const d = ["쉬움", "쉬움", "쉬움", "보통", "보통", "보통", "어려움", "어려움", "어려움"];
    const level = LEVELS[Number(diffInput.value)];
    caption.textContent = `${d[level.id - 1]} · ${level.title}`;
    const s = snapshot();
    onStatus?.({
      ...s,
      label: `${level.title} · ${moves}수 · 움직임 가능 ${s.movableCars}대`,
    });
  };

  const layout = () => {
    const box = lot.getBoundingClientRect();
    cell = box.width / SIZE;
    lot.style.setProperty("--cell", `${cell}px`);
  };

  const render = () => {
    lot.replaceChildren();
    for (let i = 0; i < SIZE * SIZE; i += 1) {
      const tile = document.createElement("div");
      tile.className = "lot-cell";
      if (Math.floor(i / SIZE) === EXIT_ROW && i % SIZE === 0) tile.classList.add("exit-cell");
      lot.append(tile);
    }
    for (const car of cars) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = `car ${car.axis}${car.target ? " target" : ""}`;
      el.style.setProperty("--r", car.r);
      el.style.setProperty("--c", car.c);
      el.style.setProperty("--len", car.len);
      el.style.setProperty("--color", car.color);
      el.dataset.id = car.id;
      el.setAttribute("aria-label", `${car.target ? "빨간 차" : "차"} ${car.id}`);
      if (selected === car.id) el.classList.add("is-on");
      el.innerHTML = `<span class="car-glass"></span><span class="car-wheel a"></span><span class="car-wheel b"></span>`;
      lot.append(el);
    }
    banner.classList.toggle("hidden", !isWon(cars));
    wrap.classList.toggle("is-won", isWon(cars));
  };

  const focusCar = (id) => {
    const ae = document.activeElement;
    if (ae && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT") && !wrap.contains(ae)) return;
    lot.querySelector(`.car[data-id="${id}"]`)?.focus();
  };

  const load = (index) => {
    const i = Math.max(0, Math.min(LEVELS.length - 1, Number(index)));
    diffInput.value = String(i);
    const level = LEVELS[i];
    cars = paint(cloneCars(level.cars));
    origin = cloneCars(cars);
    moves = 0;
    selected = null;
    drag = null;
    banner.classList.add("hidden");
    render();
    setStatus();
  };

  const moveCar = (id, to) => {
    const car = cars.find((c) => c.id === id);
    if (!car) return;
    const { min, max } = slideRange(car, cars);
    const clamped = Math.max(min, Math.min(max, to));
    const prev = car.axis === "h" ? car.c : car.r;
    if (clamped === prev) return;
    if (car.axis === "h") car.c = clamped;
    else car.r = clamped;
    moves += 1;
    render();
    setStatus();
    focusCar(id);
  };

  lot.addEventListener("pointerdown", (event) => {
    const btn = event.target.closest(".car");
    if (!btn) return;
    const car = cars.find((c) => c.id === btn.dataset.id);
    if (!car) return;
    selected = car.id;
    const start = car.axis === "h" ? car.c : car.r;
    drag = {
      id: car.id,
      axis: car.axis,
      startPtr: car.axis === "h" ? event.clientX : event.clientY,
      start,
      moved: false,
    };
    lot.querySelectorAll(".car").forEach((el) => el.classList.toggle("is-on", el.dataset.id === selected));
    btn.setPointerCapture(event.pointerId);
  });

  const placeCar = (car) => {
    const el = lot.querySelector(`.car[data-id="${car.id}"]`);
    if (!el) return;
    el.style.setProperty("--r", car.r);
    el.style.setProperty("--c", car.c);
  };

  lot.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const delta = (drag.axis === "h" ? event.clientX - drag.startPtr : event.clientY - drag.startPtr) / cell;
    const to = Math.round(drag.start + delta);
    const car = cars.find((c) => c.id === drag.id);
    const cur = drag.axis === "h" ? car.c : car.r;
    if (to === cur) return;
    const { min, max } = slideRange(car, cars);
    const clamped = Math.max(min, Math.min(max, to));
    if (clamped === cur) return;
    drag.moved = true;
    if (drag.axis === "h") car.c = clamped;
    else car.r = clamped;
    placeCar(car);
  });

  const endDrag = () => {
    if (!drag) return;
    const id = drag.id;
    const moved = drag.moved;
    drag = null;
    if (moved) {
      moves += 1;
      setStatus();
      render();
      focusCar(id);
    }
  };
  lot.addEventListener("pointerup", endDrag);
  lot.addEventListener("pointercancel", endDrag);

  wrap.addEventListener("keydown", (event) => {
    if (!selected) return;
    const car = cars.find((c) => c.id === selected);
    const pos = car.axis === "h" ? car.c : car.r;
    if (car.axis === "h" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      moveCar(car.id, pos + (event.key === "ArrowLeft" ? -1 : 1));
      event.preventDefault();
    }
    if (car.axis === "v" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      moveCar(car.id, pos + (event.key === "ArrowUp" ? -1 : 1));
      event.preventDefault();
    }
  });

  diffInput.addEventListener("input", () => load(Number(diffInput.value)));
  const ro = new ResizeObserver(() => {
    layout();
    if (drag) {
      const car = cars.find((c) => c.id === drag.id);
      if (car) placeCar(car);
    } else render();
  });
  ro.observe(lot);

  wrap.tabIndex = 0;
  load(lessonMode ? 3 : 0);
  layout();
  render();

  return {
    reset() {
      cars = cloneCars(origin);
      moves = 0;
      selected = null;
      render();
      setStatus();
    },
    applyTask(name) {
      if (name === "level4") load(3);
    },
    getState: snapshot,
    hint() {
      if (lessonMode) {
        onStatus?.({ ...snapshot(), label: "수업에서는 힌트가 보드를 대신 밀지 않습니다", notice: true });
        return;
      }
      const move = hintMove(cars);
      if (!move) {
        onStatus?.({ ...snapshot(), label: isWon(cars) ? "이미 탈출" : "힌트를 못 찾음", notice: true });
        return;
      }
      selected = move.id;
      moveCar(move.id, move.to);
    },
    destroy() {
      ro.disconnect();
      wrap.remove();
    },
  };
}
