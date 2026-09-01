# -*- coding: utf-8 -*-
"""Make unique-solution sudoku strings."""
import random

def ok(g, i, n):
    r, c = divmod(i, 9)
    br, bc = 3 * (r // 3), 3 * (c // 3)
    for k in range(9):
        if g[r * 9 + k] == n or g[k * 9 + c] == n:
            return False
    for rr in range(br, br + 3):
        for cc in range(bc, bc + 3):
            if g[rr * 9 + cc] == n:
                return False
    return True

def solve(g, count_only=False, limit=2):
    found = []
    def rec(grid):
        if len(found) >= limit:
            return
        try:
            i = grid.index(0)
        except ValueError:
            found.append(grid[:])
            return
        nums = list(range(1, 10))
        random.shuffle(nums)
        for n in nums:
            if ok(grid, i, n):
                grid[i] = n
                rec(grid)
                grid[i] = 0
    rec(g[:])
    return found

def full_grid(seed):
    random.seed(seed)
    g = [0] * 81
    return solve(g, limit=1)[0]

def punch(sol, holes, seed):
    random.seed(seed)
    g = sol[:]
    order = list(range(81))
    random.shuffle(order)
    removed = 0
    for i in order:
        if removed >= holes:
            break
        keep = g[i]
        g[i] = 0
        if len(solve(g, limit=2)) != 1:
            g[i] = keep
        else:
            removed += 1
    return g

def s(g):
    return "".join(str(n) for n in g)

def main():
    specs = [("e1", 40, 1), ("e2", 42, 2), ("m1", 50, 3), ("m2", 52, 4), ("h1", 56, 5), ("h2", 58, 6)]
    print("export const PUZZLES = [")
    for pid, holes, seed in specs:
        sol = full_grid(seed * 17)
        given = punch(sol, holes, seed * 31)
        print("  {")
        print(f'    id: "{pid}",')
        print(f"    diff: {0 if holes < 45 else 1 if holes < 54 else 2},")
        print(f'    given: "{s(given)}",')
        print(f'    solution: "{s(sol)}",')
        print("  },")
    print("];")

if __name__ == "__main__":
    main()
