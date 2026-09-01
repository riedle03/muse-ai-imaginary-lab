import { listModules, MODULES } from "./lessons.js";
import { createLab } from "./lab.js";
import { renderSheet, renderGuide } from "./sheets.js";
import { FILMS, listFilms } from "./films.js";
import { mountRush } from "./games/rush.js";
import { mountSolitaire } from "./games/solitaire.js";
import { mountFifteen } from "./games/fifteen.js";
import { mountSudoku } from "./games/sudoku.js";

const mounts = { rush: mountRush, solitaire: mountSolitaire, fifteen: mountFifteen, sudoku: mountSudoku };
const views = {
  hub: document.querySelector("#hub"),
  play: document.querySelector("#play"),
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

function renderHub() {
  const cards = document.querySelector("#cards");
  cards.innerHTML = listModules()
    .map(
      (m) => `
      <article class="station station-card">
        <span class="st-no">${m.rec ? "추천 1차시" : `${m.minutes}분`}</span>
        <span class="mini mini-${m.id === "fifteen" ? "fif" : m.id === "sudoku" ? "sdk" : m.id === "solitaire" ? "sol" : "rush"}"></span>
        <strong>${m.title}</strong>
        <em>${m.concept}</em>
        <span class="subj">${m.subject} · ${m.minutes}분</span>
        <div class="cta-row">
          <a href="#free/${m.id}">체험</a>
          <a href="#lesson/${m.id}">수업</a>
          <a href="#sheet/${m.id}">학습지</a>
          <a href="#video/${m.id}">안내</a>
        </div>
      </article>`
    )
    .join("");
}

function openPlay(id, lesson) {
  if (!mounts[id]) return;
  session?.destroy();
  current = { view: lesson ? "lesson" : "free", id };
  show("play");
  document.body.classList.toggle("is-free", !lesson);
  modeTag.textContent = lesson ? "수업 · 관찰이 데이터" : "체험 · 규칙만 만지기";
  labSteps.hidden = !lesson;
  labAside.hidden = !lesson;
  toLesson.hidden = lesson;
  toLesson.href = `#lesson/${id}`;
  toSheet.href = `#sheet/${id}`;
  stage.replaceChildren();
  const meter = document.querySelector("#meter");
  if (meter) meter.textContent = "—";
  session = mounts[id](stage, {
    lessonMode: lesson,
    onStatus(state) {
      stat.textContent = state.label || "";
      if (meter) meter.textContent = state.label || "—";
      if (lesson) lab.onState(state);
    },
  });
  if (lesson) lab.attach(id, session);
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

function openGuide() {
  session?.destroy();
  session = null;
  current = { view: "guide", id: "" };
  show("guide");
  renderGuide(document.querySelector("#guide-root"));
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
  if (view === "free" && mounts[id]) return openPlay(id, false);
  if (view === "lesson" && mounts[id]) return openPlay(id, true);
  if (view === "sheet") return openSheet(id && MODULES[id] ? id : "fifteen");
  if (view === "guide") return openGuide();
  if (view === "video") return openVideo(id || "teacher");
  if (mounts[view] && !id) return openPlay(view, true);
  session?.destroy();
  session = null;
  current = { view: "hub", id: "" };
  show("hub");
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
  document.querySelector("#teacher").textContent = next ? "교사 잠금 해제됨" : "교사";
});
lab.setTeacher(false);

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
