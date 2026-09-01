import { listModules, MODULES } from "./lessons.js";
import { createLab } from "./lab.js";
import { renderSheet, renderGuide } from "./sheets.js";
import { renderCycleSheets, renderCycleGuide } from "./cycle-sheets.js";
import { renderAsk, loadCard } from "./redcard.js";
import { FILMS, listFilms } from "./films.js";
import { mountRush } from "./games/rush.js";
import { mountSolitaire } from "./games/solitaire.js";
import { mountFifteen } from "./games/fifteen.js";
import { mountSudoku } from "./games/sudoku.js";

const mounts = { rush: mountRush, solitaire: mountSolitaire, fifteen: mountFifteen, sudoku: mountSudoku };
const views = {
  hub: document.querySelector("#hub"),
  play: document.querySelector("#play"),
  ask: document.querySelector("#ask-view"),
  sheet: document.querySelector("#sheet-view"),
  guide: document.querySelector("#guide-view"),
  video: document.querySelector("#video-view"),
};
const stage = document.querySelector("#stage");
const stat = document.querySelector("#stat");
const modeTag = document.querySelector("#mode-tag");
const labAside = document.querySelector("#lab-body");
const labSteps = document.querySelector("#lab-steps");
const toLesson = document.querySelector("#to-lesson");
const toSheet = document.querySelector("#to-sheet");

const lab = createLab({
  root: labAside,
  stepsEl: labSteps,
  meterEl: document.querySelector("#meter"),
  hintBtn: document.querySelector("#btn-hint"),
});

let session = null;
let current = { view: "hub", id: "" };

function show(view) {
  Object.entries(views).forEach(([k, el]) => {
    if (el) el.hidden = k !== view;
  });
  document.body.dataset.view = view;
}

const BOARD_LINE = {
  rush: "지금 움직일 수 있는 차를 셉니다",
  solitaire: "점프할 때마다 식을 봅니다",
  fifteen: "밀 때마다 역전을 셉니다",
  sudoku: "칸을 고르면 후보가 뜹니다",
};

function renderHub() {
  const card = loadCard();
  const games = listModules()
    .map(
      (m) => `
      <article class="station station-card">
        <span class="mini mini-${m.id === "fifteen" ? "fif" : m.id === "sudoku" ? "sdk" : m.id === "solitaire" ? "sol" : "rush"}"></span>
        <strong>${m.title}</strong>
        <em>${BOARD_LINE[m.id] || ""}</em>
        <div class="cta-row">
          <a href="#free/${m.id}">규칙만</a>
          <a class="primary" href="#inquire/${m.id}">이걸로 세기</a>
        </div>
      </article>`
    )
    .join("");
  document.querySelector("#cards").innerHTML = games;
  const pathHint = document.querySelector(".path li:first-child p");
  if (pathHint && card.id) pathHint.textContent = `지금 카드 ${card.id}. 모둠 질문을 한 줄로 남깁니다.`;
}

let labAttached = false;

function applyTeacherChrome() {
  const teacher = lab.isTeacher();
  const lesson = current.view === "lesson";
  document.body.classList.toggle("is-teacher", teacher);
  document.body.classList.toggle("is-inquire", lesson);
  document.body.classList.toggle("is-free", current.view === "free");
  labSteps.hidden = !lesson || !teacher;
  labAside.hidden = !lesson || !teacher;
  const hint = document.querySelector("#btn-hint");
  if (hint) hint.hidden = !teacher;
  const strip = document.querySelector("#ask-strip");
  if (strip) {
    const q = loadCard();
    if (lesson) {
      strip.hidden = false;
      strip.textContent = q.picked
        ? `우리 질문 · ${q.id || "카드"} · ${q.picked}`
        : "탐구질문카드에 모둠 질문을 먼저 남기세요.";
    } else {
      strip.hidden = true;
    }
  }
  if (lesson && teacher && session && !labAttached) {
    lab.attach(current.id, session);
    labAttached = true;
  }
}

function openPlay(id, lesson) {
  if (!mounts[id]) return;
  session?.destroy();
  labAttached = false;
  current = { view: lesson ? "lesson" : "free", id };
  show("play");
  const q = loadCard();
  modeTag.textContent = lesson
    ? `2걸음 · 세기${q.id ? ` · ${q.id}` : ""}`
    : "해 보기 · 규칙만 만지기";
  toLesson.hidden = lesson;
  toLesson.href = `#inquire/${id}`;
  toLesson.textContent = "이걸로 세기";
  toSheet.href = "#write";
  toSheet.textContent = "쓰기로";
  stage.replaceChildren();
  const meter = document.querySelector("#meter");
  if (meter) meter.textContent = "—";
  session = mounts[id](stage, {
    lessonMode: lesson,
    onStatus(state) {
      stat.textContent = state.label || "";
      if (meter) meter.textContent = state.label || "—";
      if (lesson && lab.isTeacher()) lab.onState(state);
    },
  });
  applyTeacherChrome();
}

function openSheet(id) {
  session?.destroy();
  session = null;
  current = { view: "sheet", id };
  show("sheet");
  const sel = document.querySelector("#sheet-mod");
  sel.innerHTML = listModules()
    .map((m) => `<option value="${m.id}" ${m.id === id ? "selected" : ""}>${m.title}</option>`)
    .join("");
  renderSheet(document.querySelector("#sheet-root"), id);
  document.querySelector("#sheet-play").href = `#lesson/${id}`;
}

function openAsk() {
  session?.destroy();
  session = null;
  current = { view: "ask", id: "" };
  show("ask");
  renderAsk(document.querySelector("#ask-root"), () => {});
}

function openInquire(id) {
  const card = loadCard();
  const gid = mounts[id] ? id : card.game && mounts[card.game] ? card.game : "rush";
  openPlay(gid, true);
}

function openWrite() {
  session?.destroy();
  session = null;
  current = { view: "write", id: "" };
  show("sheet");
  const sel = document.querySelector("#sheet-mod");
  if (sel) sel.hidden = true;
  renderCycleSheets(document.querySelector("#sheet-root"));
}

function openGuide() {
  session?.destroy();
  session = null;
  current = { view: "guide", id: "" };
  show("guide");
  renderCycleGuide(document.querySelector("#guide-root"));
}

let filmId = "teacher";
let filmIdx = 0;
let filmTimer = 0;
let filmPlaying = false;

function paintFilm() {
  const f = FILMS[filmId];
  const sc = f.scenes[filmIdx];
  document.querySelector("#film-kicker").textContent = `${f.who} · ${sc.kicker}`;
  document.querySelector("#film-line").textContent = sc.line;
  document.querySelector("#film-cap").textContent = sc.cap;
  document.querySelector("#film-pos").textContent = `${filmIdx + 1} / ${f.scenes.length} · ${f.length}`;
  document.querySelector("#film-stage").dataset.film = filmId;
}

function stopFilm() {
  filmPlaying = false;
  clearTimeout(filmTimer);
  document.querySelector("#film-play").textContent = "재생";
}

function sceneMs(f) {
  return Math.max(6500, Math.round(60000 / Math.max(1, f.scenes.length)));
}

function playFilm() {
  filmPlaying = true;
  document.querySelector("#film-play").textContent = "멈춤";
  const tick = () => {
    if (!filmPlaying) return;
    const f = FILMS[filmId];
    if (filmIdx >= f.scenes.length - 1) {
      stopFilm();
      return;
    }
    filmIdx += 1;
    paintFilm();
    filmTimer = setTimeout(tick, sceneMs(f));
  };
  filmTimer = setTimeout(tick, sceneMs(FILMS[filmId]));
}

function openVideo(id) {
  session?.destroy();
  session = null;
  current = { view: "video", id };
  show("video");
  filmId = FILMS[id] ? id : "teacher";
  filmIdx = 0;
  stopFilm();
  const pick = document.querySelector("#film-pick");
  pick.innerHTML = listFilms()
    .map(
      (f) =>
        `<a href="#video/${f.id}" class="${f.id === filmId ? "is-on" : ""}">${f.who} · ${f.title}</a>`
    )
    .join("");
  paintFilm();
  const files = document.querySelector("#film-files");
  files.innerHTML = `
    <video controls playsinline src="./media/${filmId}-guide.mp4"></video>
    <p>교실에서는 위 화면을 재생하거나, MP4를 내려받아 프로젝터에 틀면 됩니다.</p>
    <p>
      <a href="./media/teacher-guide.mp4">교사용</a> ·
      <a href="./media/fifteen-guide.mp4">15퍼즐</a> ·
      <a href="./media/rush-guide.mp4">차 빼기</a> ·
      <a href="./media/sudoku-guide.mp4">수도쿠</a> ·
      <a href="./media/solitaire-guide.mp4">솔리테르</a>
    </p>
  `;
}

function route() {
  const raw = location.hash.replace(/^#/, "");
  const [view, id] = raw.split("/");
  if (view === "ask") return openAsk();
  if (view === "inquire") return openInquire(id);
  if (view === "write" || view === "sheet") return openWrite();
  if (view === "free" && mounts[id]) return openPlay(id, false);
  if (view === "lesson" && mounts[id]) return openPlay(id, true);
  if (view === "guide") return openGuide();
  if (view === "video") return openVideo(id || "teacher");
  if (mounts[view] && !id) return openInquire(view);
  session?.destroy();
  session = null;
  current = { view: "hub", id: "" };
  show("hub");
  renderHub();
}

document.querySelector("#to-hub")?.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = "hub";
});
document.querySelector("#btn-reset")?.addEventListener("click", () => session?.reset());
document.querySelector("#btn-hint")?.addEventListener("click", () => session?.hint());
document.querySelector("#teacher")?.addEventListener("click", () => {
  const next = !lab.isTeacher();
  lab.setTeacher(next);
  document.querySelector("#teacher").classList.toggle("is-on", next);
  document.querySelector("#teacher").textContent = "교사";
  document.querySelector("#teacher").setAttribute("aria-pressed", next ? "true" : "false");
  applyTeacherChrome();
});

document.querySelector("#sheet-mod")?.addEventListener("change", (e) => {
  location.hash = `sheet/${e.target.value}`;
});
document.querySelector("#sheet-print")?.addEventListener("click", () => window.print());
document.querySelector("#guide-print")?.addEventListener("click", () => window.print());
document.querySelector("#film-prev")?.addEventListener("click", () => {
  stopFilm();
  filmIdx = Math.max(0, filmIdx - 1);
  paintFilm();
});
document.querySelector("#film-next")?.addEventListener("click", () => {
  stopFilm();
  const f = FILMS[filmId];
  filmIdx = Math.min(f.scenes.length - 1, filmIdx + 1);
  paintFilm();
});
document.querySelector("#film-play")?.addEventListener("click", () => {
  if (filmPlaying) stopFilm();
  else playFilm();
});

renderHub();
window.addEventListener("hashchange", route);
route();
document.querySelector("#teacher")?.classList.toggle("is-on", lab.isTeacher());
document.querySelector("#teacher")?.setAttribute("aria-pressed", lab.isTeacher() ? "true" : "false");
applyTeacherChrome();
