# Phone Clamp — Source of Truth

The horizontal phone clamp for the BlockBot chassis. This is the agreed,
working architecture. **Read this before touching any clamp geometry.** It went
through ~6 wrong iterations; the constraints below are the lessons from each.

## The core idea

The phone stands **in front of the chassis front wall** (NOT on top, NOT inside).
It leans back against the wall's front face. Two V-jaws grip its left/right side
edges; a rubber band squeezes them together. Like a car phone mount.

```
            phone (leans on wall front face, y56+)
            │
   ┌────────┴────────┐  ← grip fingers, V-notch grips side edges
   │ fixed   moving  │
   │ jaw      jaw    │
═══╪═════════╪═══════╪═══  ← clamp-wall (y48-56) with a horizontal T-slot
   │ rail z23-29 cut straight THROUGH the wall
   │
   gap y40-48 (BEHIND wall, in front of motors)
   ● ─────band───── ●     ← band posts at z26 = rail height, in-line pull
   │
   motors (y12-40, at the side walls)
```

## Geometry (in `lego_robot_common.scad` units, mm)

Front wall plane: `fy = length/2 = 48`.

| Feature | Where | Notes |
|---|---|---|
| Clamp-wall | `[0, 52, 18]` cube `[96,8,36]` | y48-56, z0-36. Carries the rail. |
| V-lip shelf | `[0, 61, 4]` cube `[92,16,8]` | y57-69, z0-8. Phone bottom sits here. |
| V-lip groove | `[-40,61,8]` rot[0,90,0] extrude 80, poly `[[7,0],[0,-7],[0,7]]` | narrows in Y, self-centers any thickness, opens up → no support |
| Rail slot | `[-100,48,23]` cube `[110,12,6]` | z23-29, full width + past left side for telescope. **x>10 left solid** for the fixed jaw. |
| Fixed jaw (right) | finger `[40,60,22]` cube `[10,18,28]`, V-notch poly `[[42,0],[36,-6],[36,6]]` | fused to chassis, flush to wall |
| Fixed band post | `[40,44,26]` rot[90,0,0] cyl d4 h3 + d7 head | y41-44, z26. **Clear of motor (y≤40).** |
| Moving jaw (left) | separate part, `lego_robot_phone_clamp.scad` | mirror geometry at x=-40 |
| Moving jaw band peg | `[-40,44,26]` rot[90,0,0] cyl d4 h3 + d7 head | matches fixed post |

## Hard constraints (each is a past bug — do not regress)

1. **Rail is in the WALL, not in the V-bed.** Slot ≥ half width; moving jaw's
   tongue extends half-width into the slot so it can **telescope out the side**.
2. **Fixed jaw is fused & flush to the wall.** No separate buttress/pedestal.
3. **Band attaches at rail height (z26), in-line with the slide.** Off-axis pull
   cocks the jaw and it jams. This is non-negotiable.
4. **Band lives in the cavity gap y40-48** — BEHIND the wall but IN FRONT of the
   motors. The motors occupy y12-40 at the side walls (x±40). Band posts at y44,
   z26 clear them by ~1mm. Anything at y<40 / x±40 / z11-39 collides with a motor.
5. **Band posts must be accessible**, never buried in solid wall.
6. **V-rest/V-lip carries the phone's weight; the side V-notches are pure
   vertical prisms** — jaw bottoms must NOT catch the phone.
7. **Fixed-jaw V-notch must reach the bottom V-groove** — no flat lip stopping it
   short of the floor groove.
8. **Everything prints support-free.** V-grooves open upward; the rail is a
   straight horizontal slot.
9. Both parts must render `Volumes: 2` (one solid + exterior). Higher = floating
   piece or unintended cavity. Validate with `./ci_render_part.sh`.

## Files that must stay in sync

- `lego_robot_base.scad` — clamp-wall, V-lip + groove, rail slot, fixed jaw, fixed band post.
- `lego_robot_phone_clamp.scad` — moving left jaw (grip finger + tongue + band peg).
- `lego_robot_showcase.scad` — illustration: phone `%` in front (`[0,60,78]`), band behind (`[0,44,26]`).
- `website/viewer.js` — band mesh at three.js `(0, 26, -44)`; clamp explode telescopes sideways `[-60,30,0]`.
- Coord map OpenSCAD→Three.js: `[x, y, z] → [x, z, -y]`.

## Known follow-up

Jaws grip the lower ~36mm of the phone's side edges (z8-36). Fine for a 6" phone
(V-lip carries weight, jaws hold it back). Bump the grip-finger height on both
jaws if a taller hold is wanted.
