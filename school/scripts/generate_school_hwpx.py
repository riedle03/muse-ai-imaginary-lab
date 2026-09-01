# -*- coding: utf-8 -*-
"""Build school-program HWPX from programs.json."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent.parent
SCHOOL = ROOT / "school"
OUT = ROOT / "print"
SKILL = Path(r"C:\Users\lovyu\.claude\skills\hwpx")
BUILD = SKILL / "scripts" / "build_hwpx.py"
NS = (
    'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" '
    'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section"'
)
PID = 1000000001


def next_p():
    global PID
    PID += 1
    return PID


def t(text=""):
    return "<hp:t/>" if text == "" else f"<hp:t>{escape(text)}</hp:t>"


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


def cell(text, col, row, w, h, header=False):
    ch = 9 if header else 0
    pa = 21 if header else 22
    return f"""          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
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


def table(rows, widths, row_h=2400):
    height = row_h * len(rows)
    body = []
    for r, row in enumerate(rows):
        tds = "".join(cell(val, c, r, widths[c], row_h, header=(r == 0)) for c, val in enumerate(row))
        body.append("        <hp:tr>\n" + tds + "        </hp:tr>\n")
    return f"""  <hp:p id="{next_p()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="{next_p()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="{len(rows)}" colCnt="{len(widths)}" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="{height}" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
{''.join(body)}      </hp:tbl>
    </hp:run>
  </hp:p>
"""


def pack_student(prog):
    global PID
    PID = 1000000001
    parts = [first_sec()]
    parts.append(p("MUSE-AI · 학생 활동지", 20, 11))
    parts.append(p(f"{prog['grade']} · {prog['title']}", 20, 7))
    parts.append(p(f"{prog['hall']} · {prog['tool']} · 차시당 {prog['minutes']}분", 20, 0))
    parts.append(p("학교 ________  학급 ________  이름 ____________________"))
    parts.append(p("철칙: " + prog["rule"]))
    for i, les in enumerate(prog["lessons"]):
        parts.append(p(f"{les['n']}차시 · {les['title']}", 0, 8, page_break=0 if i == 0 else 1))
        parts.append(p("오늘 증명: " + les["goal"]))
        parts.append(p("1. 관찰", 0, 8))
        parts.append(p(les["observe"]["do"]))
        for f in les["observe"]["fields"]:
            parts.append(p(f["label"] + " ________________________________"))
        parts.append(p("2. AI 질문", 0, 8))
        parts.append(p("오늘은 AI를 열지 않습니다." if les["ask"].get("skip") else "관찰한 숫자를 넣은 질문을 붙이세요. 정답을 달라고 고치지 마세요."))
        parts.append(p("________________________________________________________________"))
        parts.append(p("3. 검증", 0, 8))
        parts.append(p(les["verify"]["lead"]))
        for f in les["verify"]["fields"]:
            parts.append(p(f["label"] + " ________________________________"))
        parts.append(p("4. 산출", 0, 8))
        parts.append(p(les["output"]["lead"]))
        parts.append(p("________________________________________________________________"))
    parts.append("</hs:sec>\n")
    return "".join(parts)


def pack_guide(prog):
    global PID
    PID = 1000000001
    parts = [first_sec()]
    parts.append(p("MUSE-AI · 교사용 지도안", 20, 11))
    parts.append(p(f"{prog['grade']} · {prog['title']}", 20, 7))
    parts.append(p(f"{prog['hall']} · {prog['tool']}", 20, 0))
    parts.append(p("왜: " + prog["why"]))
    parts.append(p("철칙: " + prog["rule"]))
    for i, les in enumerate(prog["lessons"]):
        parts.append(p(f"{les['n']}차시 · {les['title']}", 0, 8, page_break=0 if i == 0 else 1))
        parts.append(p("목표: " + les["goal"]))
        parts.append(p(les.get("where") or prog["hall"]))
        rows = [["분", "활동"]] + [list(b) for b in les["beats"]]
        parts.append(table(rows, [7000, 35520], 2200))
        parts.append(p("오개념: " + " / ".join(les["miss"])))
        parts.append(p("달성: " + les["assess"]))
    parts.append("</hs:sec>\n")
    return "".join(parts)


def pack_prompts(data):
    global PID
    PID = 1000000001
    parts = [first_sec()]
    parts.append(p("MUSE-AI · AI 활용 가이드", 20, 11))
    parts.append(p("언제 열고, 무엇을 넣나", 20, 7))
    parts.append(p("전시를 보기 전에 AI를 열지 않습니다. 질문에 학생의 장수·라벨·측정값이 없으면 그 대화는 수업이 아닙니다."))
    parts.append(p("넣지 말 것: 정답을 달라는 말, 검색 이미지, 전시에 없는 통계, 의학·심리 해석, 학명 추천."))
    parts.append(p("넣어야 할 것: 고른 전시 이름, 손으로 센 숫자, 라벨에서 옮긴 연대, Phyphox 행 수, 모델이 틀린 장면."))
    first = True
    for prog in data.values():
        for les in prog["lessons"]:
            if les["ask"].get("skip"):
                continue
            parts.append(p(f"{prog['grade']} {les['n']}차시 · {les['title']}", 0, 8, page_break=0 if first else 1))
            first = False
            parts.append(p(les["ask"]["lead"]))
            parts.append(p("대괄호는 학생 관찰로 바꿉니다. 웹앱의 ‘질문 복사’를 쓰면 숫자가 이미 들어가 있습니다."))
    parts.append("</hs:sec>\n")
    return "".join(parts)


def build(xml, dest, title):
    OUT.mkdir(exist_ok=True)
    tmp = OUT / "_section0.xml"
    tmp.write_text(xml, encoding="utf-8")
    r = subprocess.run(
        [sys.executable, str(BUILD), "--template", "report", "--section", str(tmp), "--title", title, "--creator", "MUSE-AI", "--output", str(dest)],
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        raise SystemExit(dest.name)
    print("ok", dest.name)


FILES = {
    "elem": ("활동지-초등-스마트시티.hwpx", "지도안-초등-스마트시티.hwpx"),
    "mid": ("활동지-중등-화석.hwpx", "지도안-중등-화석.hwpx"),
    "high": ("활동지-고등-데이터.hwpx", "지도안-고등-데이터.hwpx"),
}


def main():
    data = json.loads((SCHOOL / "js" / "programs.json").read_text(encoding="utf-8"))
    for pid, (sf, gf) in FILES.items():
        build(pack_student(data[pid]), OUT / sf, data[pid]["title"])
        build(pack_guide(data[pid]), OUT / gf, data[pid]["title"] + " 지도안")
    build(pack_prompts(data), OUT / "AI활용가이드.hwpx", "AI 활용 가이드")
    (OUT / "_section0.xml").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
