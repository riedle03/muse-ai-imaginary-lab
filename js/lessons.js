/** 고등 1차시 = 모듈 1개. 게임은 답이 아니라 실험 장치다. */

export const STEP_IDS = ["goal", "observe", "formalize", "ask", "verify", "output"];

export const STEP_LABEL = {
  goal: "목표",
  observe: "관찰",
  formalize: "형식화",
  ask: "AI 질문",
  verify: "검증",
  output: "산출",
};

export const MODULES = {
  fifteen: {
    id: "fifteen",
    rec: true,
    minutes: 50,
    title: "14/15 퍼즐",
    subject: "확률과 통계 · 정보",
    concept: "순열의 짝·홀",
    why: "고등에서 이 보드가 가장 잘 먹힌다. ‘못 맞추는 배치’를 손으로 만들고, 그 불가능을 불변량으로 설명한다.",
    goal: "한 칸 밀기는 짝순열을 보존한다. 14와 15만 바꾼 배치는 홀순열이므로 이 규칙으로는 완성할 수 없다.",
    observe: {
      do: "완성된 판에서 14와 15만 바꾼 뒤, 섞기 버튼을 쓰지 말고 직접 밀어 보세요. 맞춰지면 맞춰졌다고, 안 되면 안 된다고 적습니다.",
      task: "swap14",
      fields: [
        { id: "moves", type: "ro", from: "moves", label: "내가 민 횟수" },
        {
          id: "tried",
          type: "choice",
          label: "이 배치를 맞췄는가",
          options: ["맞췄다", "여러 번 밀어도 안 맞았다"],
        },
      ],
      gate: (n) => n.tried === "여러 번 밀어도 안 맞았다",
      failHint: "14·15 바꾸기를 누른 다음, 맞춰질 때까지가 아니라 ‘안 맞음’을 확인할 때까지 미세요.",
    },
    formalize: {
      lead: "보드 위 숫자의 순서를 한 줄로 읽으면 순열입니다. 빈칸은 빼고 셉니다.",
      lines: [
        "완성 배치는 역전 0개 → 짝순열.",
        "이웃한 두 칸을 한 번 밀면, 숫자와 빈칸이 자리를 바꿉니다. 4×4에서 이 이동의 가해성 규칙은 역전 개수와 빈칸의 행을 함께 봅니다.",
        "14와 15만 바꾼 것은 전치 1회 → 역전 1개(홀). 밀기로는 이 홀짝을 완성 쪽과 맞출 수 없습니다.",
      ],
      fields: [
        {
          id: "evenodd",
          type: "choice",
          label: "14·15만 바꾼 순열의 홀짝",
          options: ["짝순열", "홀순열"],
        },
      ],
      gate: (n) => n.evenodd === "홀순열",
    },
    ask: {
      build(n, s) {
        return [
          "15퍼즐(4×4)이다.",
          "완성 배치에서 14와 15만 자리를 바꿨다. 빈칸은 오른쪽 아래다.",
          `나는 섞기 없이 ${s.moves ?? "n"}번 밀었고 맞추지 못했다.`,
          "이 배치를 맞출 수 있는지 순열의 짝·홀로 설명하라.",
          "맞출 수 있다/없다만 말하지 말고, 역전 개수를 세어라.",
        ].join("\n");
      },
    },
    verify: {
      lead: "AI가 한 말을 보드의 숫자로 검열합니다. 보드는 1차 자료입니다.",
      fields: [
        { id: "ai", type: "text", label: "AI가 말한 것" },
        { id: "board", type: "text", label: "보드에서 본 것 (역전 수, 맞췄는지)" },
        {
          id: "diff",
          type: "choice",
          label: "판정",
          options: ["AI와 보드가 같다", "AI가 틀렸다", "내가 질문을 잘못 던졌다"],
        },
      ],
      gate: (n) => Boolean(n.ai && n.board && n.diff),
    },
    output: {
      lead: "한 문장으로 일반화합니다. 이 문장이 오늘 수업의 산출입니다.",
      fields: [
        {
          id: "gen",
          type: "text",
          label: "일반화",
          placeholder: "예: 밀기는 가해성의 홀짝을 바꾸지 못하므로, 홀순열 입력은 시작부터 버린다.",
        },
      ],
      gate: (n) => (n.gen || "").trim().length >= 12,
    },
  },
  rush: {
    id: "rush",
    minutes: 50,
    title: "차 빼기",
    subject: "정보 · 인공지능 수학",
    concept: "상태와 탐색",
    why: "한 대를 밀 때마다 ‘지금 움직일 수 있는 차’가 바뀝니다. 답을 외우는 게임이 아니라 상태 공간을 세는 실험입니다.",
    goal: "한 상태를 차들의 위치로 적고, 한 수가 선택지(움직일 수 있는 차의 수)를 어떻게 바꾸는지 측정한다. AI가 말한 최소 수는 보드로 검열한다.",
    observe: {
      do: "보통 단계(샛길)에서 빨간 차를 빼 보세요. 밀기 전과 한 수 뒤에, 지금 움직일 수 있는 차가 몇 대인지 적습니다.",
      task: "level4",
      fields: [
        { id: "before", type: "number", label: "시작 직후, 움직일 수 있는 차 (대)" },
        { id: "after", type: "number", label: "한 수 뒤, 움직일 수 있는 차 (대)" },
        { id: "myMoves", type: "ro", from: "moves", label: "내가 민 횟수" },
      ],
      gate: (n, s) => n.before !== "" && n.after !== "" && (s.moves || 0) >= 1,
      failHint: "한 대라도 민 다음, 미터의 ‘움직임 가능’을 보고 칸을 채우세요.",
    },
    formalize: {
      lead: "상태는 각 차의 (위치, 방향) 묶음입니다. 한 수는 한 대를 그 축으로만 미는 것입니다.",
      lines: [
        "빈칸이 많다고 선택이 많지 않습니다. 축이 막히면 그 차는 0입니다.",
        "최소 횟수는 ‘가장 짧은 수순’이지, 아무 탈출이나가 아닙니다.",
      ],
      fields: [
        {
          id: "stateDef",
          type: "choice",
          label: "한 상태를 가장 잘 적은 것",
          options: [
            "차 색깔 목록",
            "각 차의 위치와 가로/세로",
            "지금까지 민 횟수",
          ],
        },
      ],
      gate: (n) => n.stateDef === "각 차의 위치와 가로/세로",
    },
    ask: {
      build(n, s) {
        return [
          "6×6 차 빼기(Rush Hour)다. 가로 차는 좌우, 세로 차는 상하만 움직인다.",
          "빨간 차는 가로이고 왼쪽 출구로 나가야 한다.",
          `지금 판 이름: ${s.levelTitle || "샛길"}. 나는 ${s.moves ?? 0}수 움직였다.`,
          `시작 때 움직일 수 있는 차는 ${n.before}대, 한 수 뒤 ${n.after}대라고 셌다.`,
          "이 판의 최소 이동 횟수를 말하고, 그 수를 세는 방법을 짧게 설명하라.",
          "수순을 한 줄로 적어 주면 보드에서 검열하겠다.",
        ].join("\n");
      },
    },
    verify: {
      lead: "AI가 최소 횟수나 수순을 주면, 그 수순을 보드에서 재연합니다. 재연이 막히면 AI 오답입니다.",
      fields: [
        { id: "ai", type: "text", label: "AI가 말한 최소 수 / 수순" },
        { id: "board", type: "text", label: "보드에서 재연한 결과" },
        {
          id: "diff",
          type: "choice",
          label: "판정",
          options: ["재연 성공", "수순이 막힘", "횟수만 있고 수순이 없음"],
        },
      ],
      gate: (n) => Boolean(n.ai && n.board && n.diff),
    },
    output: {
      lead: "탐색 문제를 한 문장으로 남깁니다.",
      fields: [
        {
          id: "gen",
          type: "text",
          label: "일반화",
          placeholder: "예: 탈출 가능과 최소 횟수는 다른 질문이다. 후자는 상태 그래프의 최단 경로.",
        },
      ],
      gate: (n) => (n.gen || "").trim().length >= 12,
    },
  },
  sudoku: {
    id: "sudoku",
    minutes: 50,
    title: "수도쿠",
    subject: "정보 · 논리",
    concept: "제약 만족",
    why: "빈칸의 후보는 추측이 아니라 행·열·박스의 여집합입니다. AI가 말한 숫자를 그 집합으로 검열합니다.",
    goal: "한 빈칸의 후보 집합을 행·열·박스에서 직접 구하고, AI의 답을 그 집합에 들어있는지 본다.",
    observe: {
      do: "쉬움 판에서 빈칸 하나를 고르세요. 먼저 공책에 후보를 적고, 그다음 미터의 ‘이 칸 후보’와 비교합니다. 도움 버튼은 수업을 망치므로 꺼 두었습니다.",
      task: "pickCell",
      fields: [
        { id: "cell", type: "ro", from: "cellLabel", label: "고른 칸" },
        { id: "mine", type: "text", label: "내가 적은 후보 (예: 2 5 7)" },
        { id: "boardCand", type: "ro", from: "candText", label: "보드가 계산한 후보" },
      ],
      gate: (n, s) => Boolean(n.mine && s.sel >= 0),
      failHint: "빈칸을 클릭한 뒤, 후보를 손수 적으세요.",
    },
    formalize: {
      lead: "칸 i의 후보 C(i) = {1,…,9} − (같은 행 ∪ 같은 열 ∪ 같은 박스).",
      lines: [
        "후보가 1개면 그 숫자는 그 칸에 확정입니다. 이건 추측이 아닙니다.",
        "후보가 공집합이면 그 앞의 어느 칸에서 제약을 어긴 것입니다.",
      ],
      fields: [
        {
          id: "naked",
          type: "choice",
          label: "후보가 하나인 칸을 채우는 행위",
          options: ["추측", "제약으로 확정", "AI가 정해주는 일"],
        },
      ],
      gate: (n) => n.naked === "제약으로 확정",
    },
    ask: {
      build(n, s) {
        return [
          "수도쿠 한 칸의 후보만 묻는다. 답을 한 숫자로 찍지 말고 가능한 집합을 말하라.",
          `칸 위치: ${s.cellLabel || n.cell || "(행,열)"}`,
          `같은 행에 이미 있는 수: ${s.rowDigits || "?"}`,
          `같은 열: ${s.colDigits || "?"}`,
          `같은 3×3 박스: ${s.boxDigits || "?"}`,
          "위 세 집합의 합집합을 {1..9}에서 뺀 것이 후보다.",
        ].join("\n");
      },
    },
    verify: {
      lead: "AI가 말한 집합과 보드 후보를 겹쳐 봅니다. 보드가 1차 자료입니다.",
      fields: [
        { id: "ai", type: "text", label: "AI가 말한 후보" },
        { id: "board", type: "ro", from: "candText", label: "보드 후보" },
        {
          id: "diff",
          type: "choice",
          label: "판정",
          options: ["집합이 같다", "AI가 이미 있는 수를 넣었다", "AI가 가능한 수를 빠뜨렸다"],
        },
      ],
      gate: (n) => Boolean(n.ai && n.diff),
    },
    output: {
      lead: "제약 만족을 한 문장으로 남깁니다.",
      fields: [
        {
          id: "gen",
          type: "text",
          label: "일반화",
          placeholder: "예: 빈칸의 값은 취향이 아니라 세 제약의 교집합이다.",
        },
      ],
      gate: (n) => (n.gen || "").trim().length >= 12,
    },
  },
  solitaire: {
    id: "solitaire",
    minutes: 40,
    title: "솔리테르",
    subject: "수학(세기) · 정보",
    concept: "불변량",
    why: "점프마다 구슬이 정확히 하나 줄어듭니다. ‘어떻게 두면 예쁠까’가 아니라, 줄곧 보존되는 양을 셉니다.",
    goal: "한 점프가 구슬 수를 1 줄인다는 것을 측정하고, 14개에서 1개로 가려면 점프가 13회여야 함을 설명한다.",
    observe: {
      do: "꼭짓점을 비운 판에서 점프를 세 번 이상 하세요. 점프할 때마다 남은 구슬이 어떻게 변하는지 적습니다.",
      task: "jumps",
      fields: [
        { id: "start", type: "ro", from: "startN", label: "시작 구슬" },
        { id: "now", type: "ro", from: "remaining", label: "지금 구슬" },
        { id: "jumps", type: "ro", from: "moves", label: "점프 횟수" },
      ],
      gate: (n, s) => (s.moves || 0) >= 3,
      failHint: "구슬을 골라 빈칸으로 세 번 이상 뛰어넘으세요.",
    },
    formalize: {
      lead: "남은 구슬 = 시작 구슬 − 점프 횟수. 이 등식이 깨지면 규칙을 어긴 것입니다.",
      lines: [
        "14에서 1로 가려면 점프는 13회입니다. 12회면 구슬이 2개 남습니다.",
        "마지막 한 개의 위치는 시작 빈칸에 따라 달라질 수 있습니다. 오늘 증명의 핵심은 개수입니다.",
      ],
      fields: [
        {
          id: "need",
          type: "choice",
          label: "14개를 1개로 줄이는 데 필요한 점프",
          options: ["12회", "13회", "14회"],
        },
      ],
      gate: (n) => n.need === "13회",
    },
    ask: {
      build(n, s) {
        return [
          "삼각 솔리테르 15칸, 시작은 꼭짓점 빈칸·구슬 14개다.",
          `나는 ${s.moves ?? 0}번 점프했고 구슬이 ${s.remaining ?? "?"}개 남았다.`,
          "한 점프가 구슬을 몇 개 줄이는지, 1개로 끝내려면 점프가 몇 번인지 말하라.",
          "특정 수를 추천하지 말고, 개수 등식만 확인하라.",
        ].join("\n");
      },
    },
    verify: {
      lead: "AI가 말한 횟수를 지금 남은 구슬로 검열합니다.",
      fields: [
        { id: "ai", type: "text", label: "AI가 말한 것" },
        { id: "board", type: "ro", from: "eq", label: "보드 등식 (시작−점프=남음)" },
        {
          id: "diff",
          type: "choice",
          label: "판정",
          options: ["등식이 맞다", "AI가 횟수를 틀렸다", "내가 점프 횟수를 잘못 셌다"],
        },
      ],
      gate: (n) => Boolean(n.ai && n.diff),
    },
    output: {
      lead: "불변량이 아니라 ‘일정하게 변하는 양’도 증명에 쓸 수 있습니다.",
      fields: [
        {
          id: "gen",
          type: "text",
          label: "일반화",
          placeholder: "예: 구슬 수는 점프마다 1씩 줄므로, 목표 개수가 정하면 필요한 점프 횟수는 정해진다.",
        },
      ],
      gate: (n) => (n.gen || "").trim().length >= 12,
    },
  },
};

export function listModules() {
  return ["fifteen", "rush", "sudoku", "solitaire"].map((id) => MODULES[id]);
}

export const GUIDES = {
  prep: ["태블릿 1인 1기기 또는 2인 1기기", "AI 창은 관찰이 끝날 때까지 열지 않음", "힌트·수도쿠 도움은 꺼 둔 채 시작", "활동지는 웹에서 쓰거나 인쇄"],
  rule: "보드는 1차 자료다. AI는 관찰 다음에만 쓴다. 힌트가 보드를 대신 밀면 수업이 아니다.",
  modules: {
    fifteen: {
      beats: [
        ["0–5", "목표 문장 함께 읽기. 오늘 맞추는 게임이 아님을 명시."],
        ["5–20", "14·15만 바꾸고 직접 밀기. 맞추지 못한 횟수가 데이터."],
        ["20–28", "역전·빈칸 행을 미터에서 읽고 홀짝 고르기."],
        ["28–36", "숫자가 들어간 질문 복사 → AI."],
        ["36–44", "AI 답을 역전 수로 검열."],
        ["44–50", "일반화 한 문장 기록·공유."],
      ],
      miss: ["섞기 버튼으로 홀짝을 리셋함", "AI가 ‘맞출 수 있다’고 하면 바로 믿음", "역전을 빈칸 포함해 셈"],
      assess: "14·15 판을 맞출 수 없다고 쓰고, 그 이유를 홀짝으로 한 문장 말하면 달성.",
    },
    rush: {
      beats: [
        ["0–5", "상태라는 말 없이, ‘지금 밀 수 있는 차’만 세게 함."],
        ["5–22", "샛길 판에서 한 수 전후 대수를 기록."],
        ["22–30", "상태 = 각 차의 위치와 축."],
        ["30–38", "최소 횟수 질문 복사. 수순을 달라고 함."],
        ["38–46", "수순 재연. 막히면 AI 오답."],
        ["46–50", "탈출 가능과 최소 횟수는 다른 질문이라고 쓰기."],
      ],
      miss: ["아무 탈출이나 최소로 적음", "힌트로 수순을 받음"],
      assess: "한 수 전후 움직임 가능 대수가 다르다고 쓰고, 최소 횟수를 보드로 검열하면 달성.",
    },
    sudoku: {
      beats: [
        ["0–5", "도움 버튼이 없는 이유를 말함."],
        ["5–20", "빈칸 하나 후보를 손으로 적고 미터와 비교."],
        ["20–28", "여집합 식 C(i)."],
        ["28–38", "집합을 물어보는 질문만 복사."],
        ["38–46", "AI 집합과 보드 집합 대조."],
        ["46–50", "후보 1개는 추측이 아니라고 쓰기."],
      ],
      miss: ["한 숫자로 찍으라고 AI에 물음", "도움으로 칸을 채움"],
      assess: "한 칸의 후보를 손·보드·AI 세 곳으로 대조한 기록이 있으면 달성.",
    },
    solitaire: {
      beats: [
        ["0–4", "예쁘게 남기는 게임이 아님을 명시."],
        ["4–18", "점프 3회 이상. 등식 확인."],
        ["18–26", "14→1은 13점프."],
        ["26–34", "개수 등식만 묻는 질문."],
        ["34–40", "AI 횟수를 남은 구슬로 검열."],
      ],
      miss: ["점프를 안 하고 횟수만 적음", "마지막 위치까지 오늘 증명으로 욕심냄"],
      assess: "시작−점프=남음이 성립함을 숫자로 보이면 달성.",
    },
  },
};
