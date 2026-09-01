# -*- coding: utf-8 -*-
"""Build printable HWPX worksheets + teacher guide from lesson copy."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "print"
SKILL = Path(r"C:\Users\lovyu\.claude\skills\hwpx")
BUILD = SKILL / "scripts" / "build_hwpx.py"

NS = (
    'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" '
    'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" '
    'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" '
    'xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core"'
)

PID = 1000000001
TID = 2000000001


def next_p():
    global PID
    PID += 1
    return PID


def next_t():
    global TID
    TID += 1
    return TID


def t(text=""):
    if text == "":
        return "<hp:t/>"
    return f"<hp:t>{escape(text)}</hp:t>"


def p(text, para=0, char=0, page_break=0):
    return f"""  <hp:p id="{next_p()}" paraPrIDRef="{para}" styleIDRef="0" pageBreak="{page_break}" columnBreak="0" merged="0">
    <hp:run charPrIDRef="{char}">{t(text)}</hp:run>
  </hp:p>
"""


def first_sec():
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<hs:sec {NS}>
  <hp:p id="{next_p()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">
        <hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>
        <hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>
        <hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>
        <hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>
        <hp:pagePr landscape="WIDELY" width="59528" height="84186" gutterType="LEFT_ONLY">
          <hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" top="5668" bottom="4252"/>
        </hp:pagePr>
        <hp:footNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="EACH_COLUMN" beneathText="0"/>
        </hp:footNotePr>
        <hp:endNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="END_OF_DOCUMENT" beneathText="0"/>
        </hp:endNotePr>
        <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
      </hp:secPr>
      <hp:ctrl>
        <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/>
      </hp:ctrl>
    </hp:run>
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>
"""


def cell(text, col, row, w, h, header=False, fill=4):
    ch = 9 if header else 0
    pa = 21 if header else 22
    return f"""          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="{fill}">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="{pa}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="{next_p()}">
                <hp:run charPrIDRef="{ch}">{t(text)}</hp:run>
              </hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="{col}" rowAddr="{row}"/>
            <hp:cellSpan colSpan="1" rowSpan="1"/>
            <hp:cellSz width="{w}" height="{h}"/>
            <hp:cellMargin left="140" right="140" top="140" bottom="140"/>
          </hp:tc>
"""


def table(rows, widths, row_h=2800):
    cols = len(widths)
    height = row_h * len(rows)
    body = []
    for r, row in enumerate(rows):
        tds = []
        for c, val in enumerate(row):
            tds.append(cell(val, c, r, widths[c], row_h, header=(r == 0)))
        body.append("        <hp:tr>\n" + "".join(tds) + "        </hp:tr>\n")
    return f"""  <hp:p id="{next_p()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="{next_t()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="{len(rows)}" colCnt="{cols}" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="{height}" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
{''.join(body)}      </hp:tbl>
    </hp:run>
  </hp:p>
"""


SHEETS = [
    {
        "id": "fifteen",
        "file": "학습지-14-15퍼즐.hwpx",
        "title": "14/15 퍼즐 — 순열의 짝·홀",
        "meta": "확률과 통계 · 정보 · 50분 · 추천 1차시",
        "goal": "한 칸 밀기는 짝순열을 보존한다. 14와 15만 바꾼 배치는 홀순열이므로 이 규칙으로는 완성할 수 없다.",
        "observe": "완성된 판에서 14와 15만 바꾼 뒤, 섞기 버튼을 쓰지 말고 직접 밀어 보세요. 맞춰지면 맞춰졌다고, 안 되면 안 된다고 적습니다.",
        "obs_q": "이 배치를 맞췄는가?  (  맞췄다  /  여러 번 밀어도 안 맞았다  )     민 횟수: ______",
        "formal": "보드 위 숫자의 순서를 한 줄로 읽으면 순열입니다. 빈칸은 빼고 셉니다. 완성 배치는 역전 0개(짝). 14와 15만 바꾼 것은 전치 1회 → 역전 1개(홀).",
        "form_q": "14·15만 바꾼 순열의 홀짝:  (  짝순열  /  홀순열  )",
        "ask": "15퍼즐(4×4)이다. 완성 배치에서 14와 15만 자리를 바꿨다. 빈칸은 오른쪽 아래다. 나는 섞기 없이 n번 밀었고 맞추지 못했다. 이 배치를 맞출 수 있는지 순열의 짝·홀로 설명하라. 맞출 수 있다/없다만 말하지 말고, 역전 개수를 세어라.",
        "verify": "AI가 한 말을 보드의 숫자로 검열합니다. 보드는 1차 자료입니다.",
        "out": "한 문장으로 일반화합니다. 예: 밀기는 가해성의 홀짝을 바꾸지 못하므로, 홀순열 입력은 시작부터 버린다.",
    },
    {
        "id": "rush",
        "file": "학습지-차빼기.hwpx",
        "title": "차 빼기 — 상태와 탐색",
        "meta": "정보 · 인공지능 수학 · 50분",
        "goal": "한 상태를 차들의 위치로 적고, 한 수가 선택지(움직일 수 있는 차의 수)를 어떻게 바꾸는지 측정한다. AI가 말한 최소 수는 보드로 검열한다.",
        "observe": "보통 단계(샛길)에서 빨간 차를 빼 보세요. 밀기 전과 한 수 뒤에, 지금 움직일 수 있는 차가 몇 대인지 적습니다.",
        "obs_q": "시작 직후 움직일 수 있는 차: ______ 대     한 수 뒤: ______ 대     내가 민 횟수: ______",
        "formal": "상태는 각 차의 (위치, 방향) 묶음입니다. 한 수는 한 대를 그 축으로만 미는 것입니다. 최소 횟수는 가장 짧은 수순이지, 아무 탈출이나가 아닙니다.",
        "form_q": "한 상태를 가장 잘 적은 것:  (  차 색깔 목록  /  각 차의 위치와 가로·세로  /  지금까지 민 횟수  )",
        "ask": "6×6 차 빼기다. 가로 차는 좌우, 세로 차는 상하만 움직인다. 빨간 차는 가로이고 왼쪽 출구로 나가야 한다. 시작 때 움직일 수 있는 차와 한 수 뒤 대수를 넣어서, 이 판의 최소 이동 횟수와 수순을 물어라.",
        "verify": "AI가 최소 횟수나 수순을 주면 그 수순을 보드에서 재연합니다. 재연이 막히면 AI 오답입니다.",
        "out": "탐색 문제를 한 문장으로 남깁니다. 예: 탈출 가능과 최소 횟수는 다른 질문이다.",
    },
    {
        "id": "sudoku",
        "file": "학습지-수도쿠.hwpx",
        "title": "수도쿠 — 제약 만족",
        "meta": "정보 · 논리 · 50분",
        "goal": "한 빈칸의 후보 집합을 행·열·박스에서 직접 구하고, AI의 답을 그 집합에 들어있는지 본다.",
        "observe": "쉬움 판에서 빈칸 하나를 고르세요. 먼저 공책에 후보를 적고, 그다음 미터의 ‘이 칸 후보’와 비교합니다. 도움 버튼은 수업을 망치므로 꺼 두었습니다.",
        "obs_q": "고른 칸: ______     내가 적은 후보: ____________________     보드 후보: ____________________",
        "formal": "칸 i의 후보 C(i) = {1,…,9} − (같은 행 ∪ 같은 열 ∪ 같은 박스). 후보가 1개면 확정이고, 공집합이면 앞에서 제약을 어긴 것입니다.",
        "form_q": "후보가 하나인 칸을 채우는 행위:  (  추측  /  제약으로 확정  /  AI가 정해주는 일  )",
        "ask": "수도쿠 한 칸의 후보만 묻는다. 답을 한 숫자로 찍지 말고 가능한 집합을 말하라. 칸 위치, 같은 행·열·박스에 이미 있는 수를 질문에 넣는다.",
        "verify": "AI가 말한 집합과 보드 후보를 겹쳐 봅니다. 보드가 1차 자료입니다.",
        "out": "제약 만족을 한 문장으로 남깁니다. 예: 빈칸의 값은 취향이 아니라 세 제약의 교집합이다.",
    },
    {
        "id": "solitaire",
        "file": "학습지-솔리테르.hwpx",
        "title": "솔리테르 — 불변량",
        "meta": "수학(세기) · 정보 · 40분",
        "goal": "한 점프가 구슬 수를 1 줄인다는 것을 측정하고, 14개에서 1개로 가려면 점프가 13회여야 함을 설명한다.",
        "observe": "꼭짓점을 비운 판에서 점프를 세 번 이상 하세요. 점프할 때마다 남은 구슬이 어떻게 변하는지 적습니다.",
        "obs_q": "시작 구슬: ______     지금 구슬: ______     점프 횟수: ______     등식: ______ − ______ = ______",
        "formal": "남은 구슬 = 시작 구슬 − 점프 횟수. 14에서 1로 가려면 점프는 13회입니다. 오늘 증명의 핵심은 마지막 위치가 아니라 개수입니다.",
        "form_q": "14개를 1개로 줄이는 데 필요한 점프:  (  12회  /  13회  /  14회  )",
        "ask": "삼각 솔리테르 15칸, 시작은 꼭짓점 빈칸·구슬 14개다. 한 점프가 구슬을 몇 개 줄이는지, 1개로 끝내려면 점프가 몇 번인지 말하라. 특정 수를 추천하지 말고 개수 등식만 확인하라.",
        "verify": "AI가 말한 횟수를 지금 남은 구슬로 검열합니다.",
        "out": "일정하게 변하는 양도 증명에 쓸 수 있습니다. 예: 구슬 수는 점프마다 1씩 줄므로, 목표 개수가 정하면 필요한 점프 횟수는 정해진다.",
    },
]


def sheet_xml(s):
    global PID
    PID = 1000000001
    parts = [first_sec()]
    parts.append(p("MUSE-AI · 이매지너리 수학 실험실 · 고등 활동지", 20, 11))
    parts.append(p(s["title"], 20, 7))
    parts.append(p(s["meta"], 20, 0))
    parts.append(p("학교 ____________    학급 ________    이름 ____________________    날짜 ________"))
    parts.append(p("오늘 증명", 0, 8))
    parts.append(p(s["goal"]))
    parts.append(p("1. 관찰", 0, 8))
    parts.append(p(s["observe"]))
    parts.append(p(s["obs_q"]))
    parts.append(p("기록"))
    parts.append(p("________________________________________________________________"))
    parts.append(p("2. 형식화", 0, 8))
    parts.append(p(s["formal"]))
    parts.append(p(s["form_q"]))
    parts.append(p("3. AI 질문", 0, 8))
    parts.append(p("관찰한 숫자를 넣은 질문을 복사해 붙이세요. 정답을 달라고 고치지 마세요."))
    parts.append(p(s["ask"]))
    parts.append(p("내가 던진 질문"))
    parts.append(p("________________________________________________________________"))
    parts.append(p("________________________________________________________________"))
    parts.append(p("4. 검증 — 보드가 1차 자료", 0, 8))
    parts.append(p(s["verify"]))
    parts.append(table(
        [["AI가 말한 것", "보드에서 본 것", "판정"], ["", "", ""]],
        [14173, 14173, 14174],
        3600,
    ))
    parts.append(p("5. 산출", 0, 8))
    parts.append(p(s["out"]))
    parts.append(p("한 문장"))
    parts.append(p("________________________________________________________________"))
    parts.append(p("철칙: 보드는 1차 자료다. AI는 관찰 다음에만 쓴다. 힌트가 보드를 대신 밀면 수업이 아니다.", 0, 11))
    parts.append("</hs:sec>\n")
    return "".join(parts)


GUIDE_BEATS = {
    "추천 · 14/15 퍼즐 (50분)": {
        "goal": "한 칸 밀기는 짝순열을 보존한다. 14와 15만 바꾼 배치는 홀순열이므로 이 규칙으로는 완성할 수 없다.",
        "beats": [
            ["0–5", "목표 문장 함께 읽기. 오늘 맞추는 게임이 아님을 명시."],
            ["5–20", "14·15만 바꾸고 직접 밀기. 맞추지 못한 횟수가 데이터."],
            ["20–28", "역전·빈칸 행을 미터에서 읽고 홀짝 고르기."],
            ["28–36", "숫자가 들어간 질문 복사 → AI."],
            ["36–44", "AI 답을 역전 수로 검열."],
            ["44–50", "일반화 한 문장 기록·공유."],
        ],
        "miss": "섞기 버튼으로 홀짝을 리셋함 / AI가 ‘맞출 수 있다’고 하면 바로 믿음 / 역전을 빈칸 포함해 셈",
        "assess": "14·15 판을 맞출 수 없다고 쓰고, 그 이유를 홀짝으로 한 문장 말하면 달성.",
    },
    "차 빼기 (50분)": {
        "goal": "한 상태를 차들의 위치로 적고, 한 수가 선택지(움직일 수 있는 차의 수)를 어떻게 바꾸는지 측정한다.",
        "beats": [
            ["0–5", "상태라는 말 없이, ‘지금 밀 수 있는 차’만 세게 함."],
            ["5–22", "샛길 판에서 한 수 전후 대수를 기록."],
            ["22–30", "상태 = 각 차의 위치와 축."],
            ["30–38", "최소 횟수 질문 복사. 수순을 달라고 함."],
            ["38–46", "수순 재연. 막히면 AI 오답."],
            ["46–50", "탈출 가능과 최소 횟수는 다른 질문이라고 쓰기."],
        ],
        "miss": "아무 탈출이나 최소로 적음 / 힌트로 수순을 받음",
        "assess": "한 수 전후 움직임 가능 대수가 다르다고 쓰고, 최소 횟수를 보드로 검열하면 달성.",
    },
    "수도쿠 (50분)": {
        "goal": "한 빈칸의 후보 집합을 행·열·박스에서 직접 구하고, AI의 답을 그 집합에 들어있는지 본다.",
        "beats": [
            ["0–5", "도움 버튼이 없는 이유를 말함."],
            ["5–20", "빈칸 하나 후보를 손으로 적고 미터와 비교."],
            ["20–28", "여집합 식 C(i)."],
            ["28–38", "집합을 물어보는 질문만 복사."],
            ["38–46", "AI 집합과 보드 집합 대조."],
            ["46–50", "후보 1개는 추측이 아니라고 쓰기."],
        ],
        "miss": "한 숫자로 찍으라고 AI에 물음 / 도움으로 칸을 채움",
        "assess": "한 칸의 후보를 손·보드·AI 세 곳으로 대조한 기록이 있으면 달성.",
    },
    "솔리테르 (40분)": {
        "goal": "한 점프가 구슬 수를 1 줄인다는 것을 측정하고, 14개에서 1개로 가려면 점프가 13회여야 함을 설명한다.",
        "beats": [
            ["0–4", "예쁘게 남기는 게임이 아님을 명시."],
            ["4–18", "점프 3회 이상. 등식 확인."],
            ["18–26", "14→1은 13점프."],
            ["26–34", "개수 등식만 묻는 질문."],
            ["34–40", "AI 횟수를 남은 구슬로 검열."],
        ],
        "miss": "점프를 안 하고 횟수만 적음 / 마지막 위치까지 오늘 증명으로 욕심냄",
        "assess": "시작−점프=남음이 성립함을 숫자로 보이면 달성.",
    },
}


def guide_xml():
    global PID
    PID = 1000000001
    parts = [first_sec()]
    parts.append(p("MUSE-AI · 교사용 지도안", 20, 11))
    parts.append(p("이매지너리 수학 실험실", 20, 7))
    parts.append(p("고등 · 1차시 1모듈 · 보드는 1차 자료다. AI는 관찰 다음에만 쓴다.", 20, 0))
    parts.append(p("준비", 0, 8))
    for line in [
        "태블릿 1인 1기기 또는 2인 1기기",
        "AI 창은 관찰이 끝날 때까지 열지 않음",
        "힌트·수도쿠 도움은 꺼 둔 채 시작",
        "활동지는 웹에서 쓰거나 이 한글 파일을 인쇄",
        "수업 전에 안내 영상(약 1분)을 한 번 틀면 됨",
    ]:
        parts.append(p("· " + line))
    parts.append(p("철칙", 0, 8))
    parts.append(p("보드는 1차 자료다. AI는 관찰 다음에만 쓴다. 힌트가 보드를 대신 밀면 수업이 아니다."))
    first = True
    for title, g in GUIDE_BEATS.items():
        parts.append(p(title, 0, 8, page_break=0 if first else 1))
        first = False
        parts.append(p("목표: " + g["goal"]))
        parts.append(table([["분", "활동"]] + g["beats"], [7000, 35520], 2400))
        parts.append(p("오개념: " + g["miss"]))
        parts.append(p("달성: " + g["assess"]))
    parts.append(p("웹앱 주소는 허브에서 체험·수업·학습지·안내를 고릅니다. 추천 1차시는 14/15 퍼즐입니다.", 0, 11))
    parts.append("</hs:sec>\n")
    return "".join(parts)


def build(section_text, dest, title):
    OUT.mkdir(exist_ok=True)
    tmp = OUT / "_section0.xml"
    tmp.write_text(section_text, encoding="utf-8")
    cmd = [
        sys.executable,
        str(BUILD),
        "--template", "report",
        "--section", str(tmp),
        "--title", title,
        "--creator", "MUSE-AI",
        "--output", str(dest),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout)
        print(r.stderr)
        raise SystemExit(f"build failed {dest.name}")
    print("ok", dest.name)


def main():
    for s in SHEETS:
        build(sheet_xml(s), OUT / s["file"], s["title"])
    build(guide_xml(), OUT / "지도안-이매지너리수학실험실.hwpx", "이매지너리 수학 실험실 지도안")
    (OUT / "_section0.xml").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
