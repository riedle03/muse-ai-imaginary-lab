# -*- coding: utf-8 -*-
"""Click-through browser QA of the imaginary-math lab. Collects findings instead of dying early."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "_shots"
OUT.mkdir(exist_ok=True)
BASE = "http://127.0.0.1:8765"
log = []
findings = []


def shot(page, name):
    page.screenshot(path=str(OUT / f"chk-{name}.png"), full_page=True)


def ok(msg):
    log.append(f"OK  {msg}")


def fail(msg):
    log.append(f"FAIL {msg}")
    findings.append(msg)


def note(msg):
    log.append(f"··  {msg}")


def vis(page, sel):
    loc = page.locator(sel)
    if loc.count() == 0:
        return False
    return loc.first.is_visible()


def main():
    errors = []
    failed = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda e: errors.append(f"pageerror {e}"))
        page.on("console", lambda m: errors.append(f"console.{m.type} {m.text}") if m.type == "error" else None)
        page.on("requestfailed", lambda r: failed.append(f"{r.method} {r.url} {r.failure}"))

        # --- HUB ---
        page.goto(BASE + "/", wait_until="networkidle")
        page.wait_for_timeout(500)
        titles = page.locator(".station strong").all_inner_texts()
        note(f"hub cards: {titles}")
        if titles == ["14/15 퍼즐", "차 빼기", "수도쿠", "솔리테르"]:
            ok("hub 4 cards")
        else:
            fail(f"hub titles {titles}")
        for label in ["체험", "수업", "학습지", "안내"]:
            n = page.locator(".cta-row a", has_text=label).count()
            if n == 4:
                ok(f"hub '{label}' x4")
            else:
                fail(f"hub '{label}' count={n}")
        if vis(page, "#hub") and not vis(page, "#play"):
            ok("hub visible, play hidden")
        else:
            fail(f"hub leak play={vis(page,'#play')} sheet={vis(page,'#sheet-view')}")
        shot(page, "hub")

        # --- FREE FIFTEEN via card click ---
        page.locator(".station").first.locator("a", has_text="체험").click()
        page.wait_for_timeout(600)
        h = page.evaluate("location.hash")
        mode = page.locator("#mode-tag").inner_text()
        note(f"free hash={h} mode={mode}")
        if h != "#free/fifteen":
            fail(f"체험 click hash {h}")
        else:
            ok("체험 → #free/fifteen")
        if vis(page, "#play") and not vis(page, "#hub"):
            ok("play shown, hub hidden")
        else:
            fail("play/hub visibility after 체험")
        if vis(page, "#lab-body"):
            fail("lab aside visible in free mode")
        else:
            ok("lab hidden in free")
        tiles = page.locator(".fif-tile").all_inner_texts()
        note(f"free tiles={tiles}")
        if "유리화" in page.content() and page.locator("button", has_text="유리화").count():
            if vis(page, "button:has-text('유리화')"):
                ok("free shows 유리화/격자")
            else:
                fail("유리화 present but not visible")
        meter = page.locator("#meter").inner_text().strip()
        note(f"free fifteen meter={meter!r}")
        if "역전" in meter and "빈칸" in meter:
            fail(f"free fifteen meter still lab leftover: {meter}")
        elif meter in {"—", "-"}:
            fail(f"free fifteen meter empty ({meter!r}); expected 완성")
        elif "완성" in meter or "짝" in meter or "홀" in meter:
            ok(f"free fifteen meter={meter}")
        else:
            fail(f"free fifteen unexpected meter {meter!r}")
        shot(page, "free-fifteen")

        # mix then slide
        if page.locator("button", has_text="5번 섞기").count():
            page.locator("button", has_text="5번 섞기").click()
            page.wait_for_timeout(250)
            meter = page.locator("#meter").inner_text().strip()
            note(f"after shuffle meter={meter}")
            empty = page.locator(".fif-tile.is-empty")
            if empty.count():
                # click a numbered neighbor if any clickable
                page.locator(".fif-tile").nth(14).click()
                page.wait_for_timeout(200)
                note(f"after tile click meter={page.locator('#meter').inner_text().strip()}")

        # --- LESSON FIFTEEN ---
        page.locator("#to-lesson").click()
        page.wait_for_timeout(700)
        note(f"lesson hash={page.evaluate('location.hash')}")
        if vis(page, "#lab-body"):
            ok("lesson lab visible")
        else:
            fail("lesson lab hidden")
        if page.locator("button", has_text="유리화").count() and vis(page, "button:has-text('유리화')"):
            fail("유리화 visible in lesson")
        else:
            ok("유리화 hidden in lesson")
        tiles = [t.strip() for t in page.locator(".fif-tile").all_inner_texts() if t.strip()]
        note(f"lesson tiles={tiles}")
        if tiles[-3:] == ["13", "15", "14"] or (len(tiles) >= 3 and tiles[-2:] == ["15", "14"]):
            ok("lesson starts 14↔15 swapped")
        else:
            fail(f"lesson tiles not 14-15 swap: {tiles}")
        h2 = page.locator("#lab-body h2").inner_text()
        note(f"lesson h2={h2}")
        meter = page.locator("#meter").inner_text().strip()
        note(f"lesson meter={meter}")
        if "역전" not in meter:
            fail(f"lesson fifteen meter missing 역전: {meter}")
        else:
            ok(f"lesson fifteen meter={meter}")
        if vis(page, "#btn-hint"):
            fail("hint visible before teacher unlock")
        else:
            ok("hint hidden until teacher")
        shot(page, "lesson-goal")

        page.locator("#lab-body .next").click()
        page.wait_for_timeout(400)
        h2 = page.locator("#lab-body h2").inner_text()
        note(f"after next: {h2}")
        if "관찰" not in h2:
            fail(f"did not enter 관찰: {h2}")
        else:
            ok("goal → 관찰")
        page.locator(".fif-tile", has_text="12").click()
        page.wait_for_timeout(250)
        meter = page.locator("#meter").inner_text().strip()
        note(f"after slide meter={meter}")
        if "1수" not in meter and "1수" not in meter.replace(" ", ""):
            # lab format: N수 at end
            if not meter.endswith("수"):
                fail(f"slide did not bump moves: {meter}")
            else:
                ok(f"slide meter={meter}")
        else:
            ok(f"slide meter={meter}")
        page.locator("text=여러 번 밀어도 안 맞았다").click()
        page.locator("#lab-body .next").click()
        page.wait_for_timeout(400)
        h2 = page.locator("#lab-body h2").inner_text()
        note(f"formalize? {h2}")
        if "형식화" in h2:
            ok("관찰 → 형식화 after gate")
        else:
            fail(f"gate blocked or wrong step: {h2}")
        shot(page, "lesson-observe-or-form")

        # --- FREE RUSH (stale meter check) ---
        page.goto(BASE + "/#free/rush", wait_until="networkidle")
        page.wait_for_timeout(600)
        cars = page.locator(".car").count()
        note(f"rush cars={cars}")
        meter = page.locator("#meter").inner_text().strip()
        note(f"free rush meter={meter}")
        if "역전" in meter or "빈칸" in meter:
            fail(f"STALE fifteen meter on rush: {meter}")
        elif "출구" in meter or "움직임" in meter:
            ok(f"rush meter={meter}")
        elif meter in {"—", "-"}:
            fail("rush meter empty after remount")
        else:
            fail(f"rush unexpected meter {meter!r}")
        if vis(page, ".exit-arrow"):
            ok("rush exit arrow visible")
        else:
            fail("rush exit arrow missing")
        shot(page, "free-rush")

        cap = page.locator(".diff-caption").inner_text().strip()
        note(f"free rush caption={cap}")
        if "출구가 보인다" not in cap:
            fail(f"free rush caption should be level1, got {cap}")
        else:
            ok(f"free rush caption={cap}")

        def rush_won():
            return page.locator(".win-banner").evaluate("el => !el.classList.contains('hidden')")

        def rush_col():
            return page.evaluate(
                """() => {
                  const el = document.querySelector('.car.target');
                  return el ? Number(el.style.getPropertyValue('--c')) : null;
                }"""
            )

        red = page.locator(".car.target")
        if not red.count():
            fail("no red car")
        else:
            red.click()
            page.wait_for_timeout(120)
            for _ in range(4):
                page.keyboard.press("ArrowLeft")
                page.wait_for_timeout(80)
            page.wait_for_timeout(250)
            col = rush_col()
            meter = page.locator("#meter").inner_text().strip()
            note(f"after arrows col={col} meter={meter} won={rush_won()}")
            if rush_won():
                ok("rush level1 escaped with keyboard")
            else:
                box = red.bounding_box()
                lotb = page.locator(".lot").bounding_box()
                if box and lotb:
                    cell = lotb["width"] / 6
                    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                    page.mouse.down()
                    page.mouse.move(box["x"] + box["width"] / 2 - cell * 3.4, box["y"] + box["height"] / 2, steps=16)
                    page.mouse.up()
                    page.wait_for_timeout(350)
                note(f"after drag col={rush_col()} meter={page.locator('#meter').inner_text().strip()} won={rush_won()}")
                if rush_won():
                    ok("rush level1 escaped with drag")
                else:
                    fail(f"rush red car did not exit (col={rush_col()})")
            shot(page, "free-rush-moved")

        # teacher toggle + hint
        page.locator("#teacher").click()
        page.wait_for_timeout(200)
        ttxt = page.locator("#teacher").inner_text()
        note(f"teacher btn={ttxt} hint hidden={page.locator('#btn-hint').get_attribute('hidden')}")
        # hint only shows when lab attached (lesson). go lesson rush
        page.goto(BASE + "/#lesson/rush", wait_until="networkidle")
        page.wait_for_timeout(500)
        cap = page.locator(".diff-caption").inner_text().strip()
        cars_n = page.locator(".car").count()
        slider = page.locator(".diff-input").input_value()
        note(f"lesson rush caption={cap} cars={cars_n} slider={slider}")
        if "샛길" not in cap or slider != "3":
            fail(f"lesson rush should load 샛길 (slider 3), got cap={cap} slider={slider} cars={cars_n}")
        else:
            ok(f"lesson rush 샛길 slider={slider} cars={cars_n}")
        hint_hidden = page.locator("#btn-hint").get_attribute("hidden")
        note(f"lesson rush hint hidden attr={hint_hidden} teacher={page.locator('#teacher').inner_text()}")
        if hint_hidden is not None:
            page.locator("#teacher").click()
            page.wait_for_timeout(200)
        if page.locator("#btn-hint").get_attribute("hidden") is None:
            ok("hint unlocked in lesson after teacher")
            page.locator("#btn-hint").click()
            page.wait_for_timeout(200)
            hm = page.locator("#meter").inner_text().strip()
            note(f"hint meter={hm}")
            if "대신 밀지" in hm:
                ok("lesson hint notice stays on meter")
            else:
                fail(f"lesson hint notice overwritten: {hm}")
        else:
            fail("hint still hidden after teacher")
        shot(page, "lesson-rush")

        # --- SUDOKU LESSON ---
        page.goto(BASE + "/#lesson/sudoku", wait_until="networkidle")
        page.wait_for_timeout(500)
        cells = page.locator(".sdk-cell").count()
        help_n = page.locator("[data-act=help]").count()
        note(f"sudoku cells={cells} help={help_n}")
        if cells != 81:
            fail(f"sudoku cells {cells}")
        else:
            ok("sudoku 81 cells")
        if help_n:
            fail("도움 button present in lesson")
        else:
            ok("도움 hidden in lesson")
        # click first empty cell
        empty_i = page.evaluate(
            """() => {
              const cells = [...document.querySelectorAll('.sdk-cell')];
              const i = cells.findIndex(c => !c.classList.contains('is-given') && !c.textContent.trim());
              return i;
            }"""
        )
        note(f"first empty index={empty_i}")
        if empty_i >= 0:
            page.locator(".sdk-cell").nth(empty_i).click()
            page.wait_for_timeout(250)
        meter = page.locator("#meter").inner_text().strip()
        note(f"sudoku meter after click={meter}")
        on_n = page.locator(".sdk-cell.is-on").count()
        note(f"sudoku is-on={on_n}")
        if "행" in meter and "후보" in meter:
            ok(f"sudoku meter updates on select: {meter}")
        else:
            fail(f"sudoku meter did not update on cell click: {meter!r} (is-on={on_n})")
        # type a number via pad
        page.locator(".sdk-pad button", has_text="1").first.click()
        page.wait_for_timeout(200)
        note(f"after pad 1 meter={page.locator('#meter').inner_text().strip()} msg={page.locator('.sdk-msg').inner_text()}")
        shot(page, "lesson-sudoku")

        # --- SOLITAIRE ---
        page.goto(BASE + "/#lesson/solitaire", wait_until="networkidle")
        page.wait_for_timeout(500)
        holes = page.locator(".peg-hole").count()
        pegs = page.locator(".peg").count()
        note(f"solitaire holes={holes} pegs={pegs}")
        if holes != 15:
            fail(f"holes {holes}")
        else:
            ok("15 holes")
        if pegs != 14:
            fail(f"pegs {pegs}")
        else:
            ok("14 pegs")
        meter = page.locator("#meter").inner_text().strip()
        note(f"solitaire meter={meter}")
        if "14" in meter and "점프" in meter:
            ok(f"solitaire meter={meter}")
        else:
            fail(f"solitaire meter {meter}")
        # click a peg then a land if any
        page.locator(".peg").nth(2).click()
        page.wait_for_timeout(200)
        lands = page.locator(".peg-hole.is-land").count()
        note(f"after peg click lands={lands}")
        if lands:
            page.locator(".peg-hole.is-land").first.click()
            page.wait_for_timeout(250)
            pegs2 = page.locator(".peg").count()
            note(f"after jump pegs={pegs2} meter={page.locator('#meter').inner_text().strip()}")
            if pegs2 == pegs - 1:
                ok("solitaire jump removed a peg")
            else:
                fail(f"jump did not reduce pegs {pegs}->{pegs2}")
        else:
            # try another peg
            jumped = False
            for i in range(min(14, page.locator(".peg").count())):
                page.locator(".peg").nth(i).click()
                page.wait_for_timeout(80)
                if page.locator(".peg-hole.is-land").count():
                    page.locator(".peg-hole.is-land").first.click()
                    page.wait_for_timeout(200)
                    jumped = True
                    break
            if jumped:
                ok(f"solitaire jump via scan, pegs={page.locator('.peg').count()}")
            else:
                fail("no legal land after clicking pegs")
        shot(page, "lesson-solitaire")

        # --- SHEET ---
        page.goto(BASE + "/#sheet/fifteen", wait_until="networkidle")
        page.wait_for_timeout(400)
        sh = page.locator("#sheet-root h1").inner_text()
        note(f"sheet h1={sh}")
        if "14/15" not in sh and "퍼즐" not in sh:
            fail(f"sheet h1 {sh}")
        else:
            ok(f"sheet h1={sh}")
        body = page.locator("#sheet-root").inner_text()
        if "여러 번 밀어도 안 맞았다" in body:
            ok("sheet pulled lab observation")
        else:
            fail("sheet missing observation note")
        if vis(page, "#sheet-view") and not vis(page, "#guide-view") and not vis(page, "#play"):
            ok("only sheet view visible")
        else:
            fail(f"sheet leak play={vis(page,'#play')} guide={vis(page,'#guide-view')}")
        shot(page, "sheet")

        page.select_option("#sheet-mod", "rush")
        page.wait_for_timeout(400)
        h = page.evaluate("location.hash")
        sh = page.locator("#sheet-root h1").inner_text()
        note(f"sheet after select hash={h} h1={sh}")
        if h != "#sheet/rush":
            fail(f"select did not route {h}")
        else:
            ok("sheet select → #sheet/rush")
        if "차" not in sh and "상태" not in sh:
            fail(f"rush sheet h1 {sh}")
        else:
            ok(f"rush sheet={sh}")
        shot(page, "sheet-rush")

        # --- GUIDE ---
        page.locator("nav.main-nav a", has_text="지도안").click()
        page.wait_for_timeout(500)
        note(f"guide hash={page.evaluate('location.hash')}")
        gh = page.locator("#guide-root h1").inner_text()
        tables = page.locator("#guide-root table").count()
        note(f"guide h1={gh} tables={tables}")
        if "실험실" not in gh:
            fail(f"guide h1 {gh}")
        else:
            ok(f"guide h1={gh}")
        if tables < 4:
            fail(f"guide tables {tables}")
        else:
            ok(f"guide tables={tables}")
        gtxt = page.locator("#guide-root").inner_text()
        if "정답기" in gtxt or "정답" in gtxt:
            ok("guide mentions 정답 금지 rule")
        shot(page, "guide")

        # --- VIDEO ---
        page.locator("nav.main-nav a", has_text="안내 영상").click()
        page.wait_for_timeout(900)
        note(f"video hash={page.evaluate('location.hash')}")
        v = page.locator("#film-files video")
        note(f"video count={v.count()}")
        if v.count() == 0:
            fail("no <video> on #video")
        else:
            meta = page.evaluate(
                """() => new Promise((resolve) => {
                  const el = document.querySelector('#film-files video');
                  if (!el) return resolve(null);
                  const done = () => resolve({
                    dur: el.duration, ready: el.readyState,
                    src: el.currentSrc, err: el.error && el.error.message
                  });
                  if (el.readyState >= 1) done();
                  else {
                    el.addEventListener('loadedmetadata', done, {once:true});
                    el.addEventListener('error', done, {once:true});
                    setTimeout(done, 4000);
                  }
                })"""
            )
            note(f"video meta={meta}")
            if not meta or not meta.get("dur") or meta["dur"] < 10:
                fail(f"teacher mp4 duration bad: {meta}")
            else:
                ok(f"teacher mp4 duration={meta['dur']:.1f}s")
        line = page.locator("#film-line").inner_text()
        note(f"film line={line}")
        if not line.strip():
            fail("empty film line")
        else:
            ok(f"film line={line}")
        page.locator("#film-play").click()
        page.wait_for_timeout(4500)
        after = page.locator("#film-line").inner_text()
        pos = page.locator("#film-pos").inner_text()
        note(f"after autoplay line={after} pos={pos}")
        if after == line and "1 /" in pos:
            fail("slideshow play did not advance")
        else:
            ok(f"slideshow advanced to {pos}")
        shot(page, "video")

        # play the actual mp4 a moment
        if v.count():
            played = page.evaluate(
                """() => {
                  const el = document.querySelector('#film-files video');
                  if (!el) return {ok:false};
                  el.muted = true;
                  const p = el.play();
                  return Promise.resolve(p).then(() => ({ok:true, t: el.currentTime, paused: el.paused}))
                    .catch(e => ({ok:false, err: String(e)}));
                }"""
            )
            page.wait_for_timeout(1200)
            t = page.evaluate("() => { const el=document.querySelector('#film-files video'); return el? {t:el.currentTime, paused:el.paused, ended:el.ended}: null }")
            note(f"mp4 play={played} later={t}")
            if played and played.get("ok") and t and t.get("t", 0) > 0.2:
                ok(f"mp4 actually playing t={t['t']:.2f}")
            else:
                fail(f"mp4 did not play: {played} {t}")

        page.locator("#film-pick a", has_text="15").click()
        page.wait_for_timeout(800)
        note(f"fifteen film={page.locator('#film-line').inner_text()} hash={page.evaluate('location.hash')}")
        vmeta = page.evaluate(
            """() => {
              const el=document.querySelector('#film-files video');
              return el? {src: el.getAttribute('src'), cur: el.currentSrc}: null;
            }"""
        )
        note(f"fifteen video src={vmeta}")
        if vmeta and "fifteen-guide" in (vmeta.get("src") or "") + (vmeta.get("cur") or ""):
            ok("fifteen film swapped mp4")
        else:
            fail(f"fifteen film src {vmeta}")
        shot(page, "video-fifteen")

        # --- NAV: 처음 ---
        page.locator("nav.main-nav a", has_text="처음").click()
        page.wait_for_timeout(400)
        if vis(page, "#hub") and not vis(page, "#play"):
            ok("처음 → hub")
        else:
            fail("처음 did not show hub")

        # --- MOBILE ---
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(BASE + "/#hub", wait_until="networkidle")
        page.wait_for_timeout(400)
        overflow = page.evaluate(
            "() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})"
        )
        note(f"mobile hub overflow={overflow}")
        if overflow["sw"] > overflow["cw"] + 8:
            fail(f"hub horizontal overflow {overflow}")
        else:
            ok("hub no horizontal overflow on 390px")
        shot(page, "hub-mobile")

        page.goto(BASE + "/#lesson/fifteen", wait_until="networkidle")
        page.wait_for_timeout(500)
        overflow = page.evaluate(
            "() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})"
        )
        note(f"mobile lesson overflow={overflow}")
        if overflow["sw"] > overflow["cw"] + 24:
            fail(f"lesson horizontal overflow {overflow}")
        else:
            ok("lesson no major overflow on 390px")
        if vis(page, "#lab-body"):
            ok("lab visible on mobile")
        shot(page, "lesson-mobile")

        page.goto(BASE + "/#sheet/fifteen", wait_until="networkidle")
        page.wait_for_timeout(400)
        overflow = page.evaluate(
            "() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})"
        )
        note(f"mobile sheet overflow={overflow}")
        shot(page, "sheet-mobile")

        page.goto(BASE + "/#free/sudoku", wait_until="networkidle")
        page.wait_for_timeout(400)
        if page.locator("[data-act=help]").count():
            ok("free sudoku shows 도움")
        else:
            fail("free sudoku missing 도움")
        shot(page, "free-sudoku-mobile")

        browser.close()

    print("=== LOG ===")
    print("\n".join(log))
    print("=== FINDINGS ===")
    print("\n".join(findings) or "(none)")
    print("=== PAGE ERRORS ===")
    print("\n".join(errors) or "(none)")
    print("=== FAILED REQUESTS ===")
    print("\n".join(failed) or "(none)")
    if findings or errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
