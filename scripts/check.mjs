import { LEVELS, paint, cloneCars, validPack, shortest, isWon } from "../js/games/rush.js";
import { startBoard, allJumps, applyJump, remaining } from "../js/games/solitaire.js";
import { shuffleFromSolved, isSolvable, isSolved, solved, inversionCount, swap14and15 } from "../js/games/fifteen.js";
import { PUZZLES, conflicts } from "../js/games/sudoku.js";

function parse(s) {
  return s.replace(/\D/g, "").slice(0, 81).split("").map(Number);
}

let fail = 0;
function ok(name, cond, extra = "") {
  if (!cond) {
    fail += 1;
    console.error("FAIL", name, extra);
  } else console.log("PASS", name, extra);
}

for (const level of LEVELS) {
  const cars = paint(cloneCars(level.cars));
  ok(`rush pack ${level.id}`, validPack(cars) === true);
  const path = shortest(cars, 80000);
  ok(`rush solvable ${level.id} ${level.title}`, Array.isArray(path), path ? `${path.length} moves` : "null");
  if (path) {
    let cur = cars;
    for (const mv of path) {
      cur = cur.map((c) => (c.id === mv.id ? (mv.axis === "h" ? { ...c, c: mv.to } : { ...c, r: mv.to }) : c));
    }
    ok(`rush path wins ${level.id}`, isWon(cur));
  }
}

const board = startBoard("apex");
ok("solitaire start 14 pegs", remaining(board) === 14);
ok("solitaire has a jump", allJumps(board).length > 0);
const j = allJumps(board)[0];
ok("solitaire jump reduces", remaining(applyJump(board, j)) === 13);

ok("fifteen solved even", inversionCount(solved()) === 0);
const swapped = swap14and15();
ok("fourteen-fifteen swap unsolvable", !isSolvable(swapped) && inversionCount(swapped) === 1);
ok("fourteen-fifteen not solved", !isSolved(swapped));
for (let i = 0; i < 20; i += 1) {
  const t = shuffleFromSolved(30);
  ok(`fifteen shuffle solvable ${i}`, isSolvable(t));
}

const safe = PUZZLES.filter((p) => p.given.length === 81 && p.solution.length === 81);
ok("sudoku at least 4", safe.length >= 4);
for (const p of safe) {
  const g = parse(p.given);
  const s = parse(p.solution);
  ok(`${p.id} lengths`, g.length === 81 && s.length === 81);
  let clash = false;
  for (let i = 0; i < 81; i += 1) {
    if (g[i] && g[i] !== s[i]) clash = true;
    if (conflicts(s, i, s[i])) clash = true;
  }
  ok(`${p.id} solution matches givens and no conflicts`, !clash);
}

if (fail) {
  console.error(`\n${fail} failed`);
  process.exit(1);
}
console.log("\nall passed");
