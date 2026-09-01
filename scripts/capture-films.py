# -*- coding: utf-8 -*-
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "media" / "frames"
OUT.mkdir(parents=True, exist_ok=True)
FILMS = {
    "teacher": 8,
    "fifteen": 7,
    "rush": 6,
    "sudoku": 6,
    "solitaire": 6,
}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        for film, n in FILMS.items():
            for i in range(n):
                page.goto(f"http://127.0.0.1:8765/film-frame.html?film={film}&i={i}", wait_until="networkidle")
                page.wait_for_timeout(280)
                dest = OUT / f"{film}-{i:02d}.png"
                page.screenshot(path=str(dest), full_page=False)
                print("wrote", dest.name)
        browser.close()


if __name__ == "__main__":
    main()
