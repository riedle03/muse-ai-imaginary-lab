from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path(__file__).resolve().parent.parent / "_shots"
out.mkdir(exist_ok=True)

def main():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        page = b.new_page(viewport={"width": 1440, "height": 900})
        logs = []
        page.on("pageerror", lambda e: logs.append(str(e)))
        for name, url in [
            ("pack-hub", "http://127.0.0.1:8765/#hub"),
            ("pack-sheet", "http://127.0.0.1:8765/#sheet/fifteen"),
            ("pack-guide", "http://127.0.0.1:8765/#guide"),
            ("pack-video", "http://127.0.0.1:8765/#video/teacher"),
            ("pack-free", "http://127.0.0.1:8765/#free/fifteen"),
            ("pack-lesson", "http://127.0.0.1:8765/#lesson/fifteen"),
        ]:
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(500)
            page.screenshot(path=str(out / f"{name}.png"), full_page=True)
            logs.append(name + " ok")
        print("\n".join(logs))
        b.close()

if __name__ == "__main__":
    main()
