# 이매지너리 수학 실험실 (고등)

국립중앙과학관 IMAGINARY 키오스크 4게임을 **체험 → 수업 → 학습지 → 산출**까지 한 웹앱에서 돌립니다. 안내 영상 5편과 한글 학습지·지도안이 같이 있습니다.

교실: https://riedle03.github.io/muse-ai-imaginary-lab/

로컬: `python -m http.server 8765` 후 http://127.0.0.1:8765

## 동선
| 주소 | 용도 |
|------|------|
| `#hub` | 모듈 고르기 |
| `#free/fifteen` | 체험 (규칙만) |
| `#lesson/fifteen` | 수업 (단계 잠금) |
| `#sheet/fifteen` | 학생 활동지, 인쇄 |
| `#guide` | 교사용 지도안, 인쇄 |
| `#video/teacher` | 안내 영상 |

모듈: `fifteen` · `rush` · `sudoku` · `solitaire`

## 영상 (`media/`)
| 파일 | 대상 | 길이 |
|------|------|------|
| teacher-guide.mp4 | 교사, 수업 전 | 약 1분 3초 |
| fifteen-guide.mp4 | 학생, 추천 1차시 | 약 1분 |
| rush-guide.mp4 | 학생 | 약 1분 |
| sudoku-guide.mp4 | 학생 | 약 1분 |
| solitaire-guide.mp4 | 학생 | 약 1분 |

웹 `#video`에서도 같은 컷을 재생할 수 있습니다. 나레이션은 한국어 신경망 음성입니다.

## 인쇄 (`print/`)
| 파일 | 용도 |
|------|------|
| 학습지-14-15퍼즐.hwpx | 학생 활동지 |
| 학습지-차빼기.hwpx | 학생 활동지 |
| 학습지-수도쿠.hwpx | 학생 활동지 |
| 학습지-솔리테르.hwpx | 학생 활동지 |
| 지도안-이매지너리수학실험실.hwpx | 교사용 지도안 |

웹에서도 `#sheet`·`#guide`에서 바로 인쇄할 수 있습니다.

## 검사
`node scripts/check.mjs`
