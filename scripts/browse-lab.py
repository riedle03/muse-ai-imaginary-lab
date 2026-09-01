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
        page.on("pageerror", lambda err: logs.append(f"ERR {err}"))
        page.goto("http://127.0.0.1:8765/", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=str(out / "hs-hub.png"), full_page=True)
        logs.append("hub " + page.locator(".station strong").nth(0).inner_text())
        page.locator("[data-open=fifteen]").click()
        page.wait_for_timeout(500)
        page.screenshot(path=str(out / "hs-fifteen-goal.png"), full_page=True)
        logs.append("goal " + page.locator("#lab-body h2").inner_text())
        page.locator("#lab-body .next").click()
        page.wait_for_timeout(400)
        logs.append("observe " + page.locator("#lab-body h2").inner_text())
        logs.append("meter " + page.locator("#meter").inner_text())
        page.screenshot(path=str(out / "hs-fifteen-observe.png"), full_page=True)
        # try skip without filling
        page.locator("#lab-body .next").click()
        page.wait_for_timeout(200)
        logs.append("gate " + page.locator("#lab-body h2").inner_text())
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto("http://127.0.0.1:8765/#fifteen", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=str(out / "hs-fifteen-mobile.png"), full_page=True)
        browser.close()
    print("\n".join(logs))

if __name__ == "__main__":
    main()
