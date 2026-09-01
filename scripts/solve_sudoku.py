# -*- coding: utf-8 -*-
"""MRV sudoku solver."""

def units():
    rows = [[r * 9 + c for c in range(9)] for r in range(9)]
    cols = [[r * 9 + c for r in range(9)] for c in range(9)]
    boxes = []
    for br in range(0, 9, 3):
        for bc in range(0, 9, 3):
            boxes.append([ (br + dr) * 9 + (bc + dc) for dr in range(3) for dc in range(3) ])
    peers = [set() for _ in range(81)]
    for group in rows + cols + boxes:
        for i in group:
            peers[i].update(group)
            peers[i].discard(i)
    return peers

PEERS = units()

def candidates(g, i):
    used = {g[j] for j in PEERS[i] if g[j]}
    return [n for n in range(1, 10) if n not in used]

def solve(g):
    def rec():
        empty = [i for i, v in enumerate(g) if v == 0]
        if not empty:
            return True
        i = min(empty, key=lambda k: len(candidates(g, k)))
        for n in candidates(g, i):
            g[i] = n
            if rec():
                return True
            g[i] = 0
        return False
    ok = rec()
    return ok, g

PUZZLES = {
    "e1": "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    "e2": "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
    "m1": "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
    "m2": "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
    "h1": "000000000000003085001020000000507000004000100090000500500000073002400000000000001",
    "h2": "003020800000580000070009004500000010040000300000007000000600090200010000000040007",
}

def norm(s):
    out = [int(ch) if ch in "123456789" else 0 for ch in s if ch in "1234567890."]
    assert len(out) == 81, len(out)
    return out

if __name__ == "__main__":
    for pid, raw in PUZZLES.items():
        g = norm(raw)
        ok, sol = solve(g[:])
        print(pid, "ok" if ok else "FAIL", "".join(str(n) if n else "0" for n in g))
        if ok:
            print("   ", "".join(str(n) for n in sol))
