# -*- coding: utf-8 -*-
"""TTS + ffmpeg slideshow for ~1 minute classroom guide films."""
import asyncio
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "media"
FRAMES = MEDIA / "frames"
VOICE = "ko-KR-SunHiNeural"
TARGET = 58.0

SCRIPTS = {
    "teacher": (
        "과학관 키오스크를 그대로 틀면 학생은 삼 분 만에 게임을 깨고 끝납니다. 그건 수업이 아닙니다. "
        "이 실험실에서 보드는 정답기가 아니라 숫자를 재는 장치입니다. 깨기가 아니라 재기입니다. "
        "한 차시에는 모듈 하나만 합니다. 추천 첫 시간은 십사 십오 퍼즐, 오십 분입니다. "
        "관찰 단계에서는 손으로 밀고 숫자를 적습니다. 에이아이 창은 아직 닫아 두세요. "
        "관찰한 숫자가 들어간 질문만 복사해서 에이아이에게 던집니다. 정답을 달라고 고치지 마세요. "
        "에이아이가 말한 것은 보드로 검열합니다. 보드가 일 차 자료입니다. "
        "힌트와 수도쿠 도움은 꺼 둡니다. 힌트가 보드를 대신 밀면 오늘 수업이 사라집니다. "
        "수업이 끝나면 학습지에 한 문장을 남깁니다. 그 문장이 오늘 산출입니다."
    ),
    "fifteen": (
        "완성된 판에서 십사와 십오만 자리를 바꿉니다. 빈칸은 오른쪽 아래에 둡니다. "
        "섞기 버튼은 쓰지 마세요. 섞으면 오늘 볼 홀짝이 리셋됩니다. "
        "이웃한 칸만 직접 밀어 보세요. 몇 번을 밀었는지는 미터에 나옵니다. "
        "맞춰지지 않으면 그게 실패가 아니라 오늘 데이터입니다. 안 맞음을 기록하세요. "
        "미터의 역전 수를 보세요. 십사와 십오만 바꾼 배치는 역전 한 개, 홀순열입니다. "
        "에이아이에게는 맞출 수 있느냐가 아니라, 역전을 세어 달라고 묻습니다. "
        "에이아이 답은 보드의 역전 수로 검열합니다. 보드가 일 차 자료입니다."
    ),
    "rush": (
        "보통 단계, 샛길에서 시작합니다. 지금 밀 수 있는 차가 몇 대인지 먼저 셉니다. "
        "한 대만 민 뒤 다시 셉니다. 밀기 전과 한 수 뒤, 두 숫자가 오늘 데이터입니다. "
        "한 상태는 차 색깔 목록이 아닙니다. 각 차의 위치와 가로 세로를 적는 것입니다. "
        "최소 횟수는 아무 탈출이나가 아닙니다. 가장 짧은 수순입니다. "
        "에이아이에게 최소 횟수와 수순을 한 줄로 적어 달라고 묻습니다. "
        "그 수순을 보드에서 재연하세요. 막히면 에이아이가 틀린 겁니다."
    ),
    "sudoku": (
        "도움 버튼은 수업에서 꺼 두었습니다. 쉬움 판에서 빈칸 하나를 고르세요. "
        "후보를 먼저 공책에 손으로 적습니다. 추측해서 숫자를 넣지 마세요. "
        "그다음 미터의 후보와 비교합니다. 후보는 행과 열과 박스의 여집합입니다. "
        "후보가 하나면 그건 추측이 아니라 제약으로 확정된 수입니다. "
        "에이아이에게 한 숫자를 찍으라고 하지 마세요. 가능한 집합을 말하라고 묻습니다. "
        "에이아이가 말한 집합을 손과 보드, 세 곳으로 대조하세요. 보드가 일 차 자료입니다."
    ),
    "solitaire": (
        "예쁘게 남기는 게임이 아닙니다. 꼭짓점을 비우고 구슬 열네 개로 시작하세요. "
        "점프를 세 번 이상 하세요. 점프마다 구슬이 정확히 하나 줄어듭니다. "
        "시작 구슬에서 점프 횟수를 빼면 남은 수와 같아야 합니다. 등식이 깨지면 규칙을 어긴 겁니다. "
        "한 개로 줄이려면 점프는 십삼 회입니다. 십이 회면 구슬이 두 개 남습니다. "
        "에이아이에게는 수를 추천하지 말고, 개수 등식만 확인하라고 묻습니다. "
        "에이아이가 말한 횟수를 지금 남은 구슬로 검열하세요. 등식이 일 차 자료입니다."
    ),
}

COUNTS = {"teacher": 8, "fifteen": 7, "rush": 6, "sudoku": 6, "solitaire": 6}


async def tts(name, text):
    out = MEDIA / f"{name}-vo.mp3"
    comm = edge_tts.Communicate(text, VOICE, rate="-5%")
    await comm.save(str(out))
    print("vo", out.name)
    return out


def duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(r.stdout.strip())


def pad_audio(src, dest, whole):
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-af", f"apad=whole_dur={whole:.2f}",
            "-ar", "48000", "-ac", "2",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )


def assemble(name, vo):
    n = COUNTS[name]
    dur = duration(vo)
    work = Path(tempfile.mkdtemp(prefix="imfilm-"))
    vo_use = work / "vo.mp3"
    if dur < TARGET - 0.4:
        pad_audio(vo, vo_use, TARGET)
        dur = TARGET
    else:
        shutil.copy(vo, vo_use)
    each = max(5.5, dur / n)
    for i in range(n):
        shutil.copy(FRAMES / f"{name}-{i:02d}.png", work / f"{i:02d}.png")
    tmp_out = work / "out.mp4"
    fps = 1.0 / each
    cmd = [
        "ffmpeg", "-y",
        "-framerate", f"{fps:.6f}",
        "-i", "%02d.png",
        "-i", "vo.mp3",
        "-vf", "fps=25,scale=1920:1080,format=yuv420p",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-profile:v", "high",
        "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart",
        "out.mp4",
    ]
    subprocess.run(cmd, cwd=work, check=True)
    dest = MEDIA / f"{name}-guide.mp4"
    shutil.copy(tmp_out, dest)
    print("mp4", dest.name, "vo", round(duration(vo), 1), "out", round(duration(dest), 1))
    shutil.rmtree(work, ignore_errors=True)


async def main():
    MEDIA.mkdir(exist_ok=True)
    for name, text in SCRIPTS.items():
        vo = await tts(name, text)
        assemble(name, vo)


if __name__ == "__main__":
    asyncio.run(main())
