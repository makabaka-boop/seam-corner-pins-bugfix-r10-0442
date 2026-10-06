import numpy as np
from lscm import solve_lscm


def solve_pinned(sm, pins):
    ids = []
    for pin in pins:
        original = int(sm.faces[pin["face"], pin["corner"]])
        ids.append(next(i for i, v in enumerate(sm.orig_of_uv) if int(v) == original))
    result = solve_lscm(sm, ids[0], ids[1])
    uv = result["uv"].copy()
    for pin, uid in zip(pins, ids):
        uv[uid] = [pin["u"], pin["v"]]
    return {
        "uv": uv.tolist(),
        "energy": result["energy"],
        "pins": [dict(pin, uv_vertex=uid) for pin, uid in zip(pins, ids)],
        "corner_uv": sm.corner_uv.tolist(),
        "orig_of_uv": sm.orig_of_uv.tolist(),
    }
