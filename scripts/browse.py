# -*- coding: utf-8 -*-
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path(__file__).resolve().parent.parent / "_shots"
out.mkdir(exist_ok=True)

def main():
    logs = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda err: logs.append(f"pageerror {err}"))
        page.on("console", lambda msg: logs.append(f"{msg.type} {msg.text}") if msg.type in ("error", "warning") else None)
        page.goto("http://127.0.0.1:8765/", wait_until="networkidle")
        page.screenshot(path=str(out / "hub.png"), full_page=True)
        for name, label in [("rush", "차 빼기"), ("solitaire", "솔리테르"), ("fifteen", "14/15 퍼즐"), ("sudoku", "수도쿠")]:
            page.goto(f"http://127.0.0.1:8765/#{name}", wait_until="networkidle")
            page.wait_for_timeout(400)
            page.screenshot(path=str(out / f"{name}.png"), full_page=True)
            title = page.locator("#plaque-title").inner_text()
            logs.append(f"opened {name} title={title}")
        page.goto("http://127.0.0.1:8765/#rush", wait_until="networkidle")
        page.wait_for_timeout(300)
        page.locator("#btn-hint").click()
        page.wait_for_timeout(200)
        stat = page.locator("#stat").inner_text()
        logs.append(f"rush after hint: {stat}")
        page.screenshot(path=str(out / "rush-hint.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto("http://127.0.0.1:8765/", wait_until="networkidle")
        page.screenshot(path=str(out / "hub-mobile.png"), full_page=True)
        page.goto("http://127.0.0.1:8765/#sudoku", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=str(out / "sudoku-mobile.png"), full_page=True)
        browser.close()
    print("\n".join(logs))

if __name__ == "__main__":
    main()
