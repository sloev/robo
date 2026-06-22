# Phone Clamp — Source of Truth

The horizontal phone clamp for the BlockBot chassis. **Read this before touching any
clamp geometry.** It went through ~8 wrong iterations; the constraints below are the
lessons from each.

## The core idea

The phone stands **in front of the chassis front wall** (NOT on top, NOT inside).
It leans back against the wall's front face (y=58). Two V-jaws grip its left/right
side edges. A rubber band stretches between the forward-facing pegs on each jaw,
across the phone's front face — fully visible and accessible.

```
                  rubber band (y≈76, z=10)
         ●────────────────────────────────●
         │      phone front face (y=67)   │
   ┌─────┴──────────────────────────────┴─────┐
   │  R jaw           phone body        L jaw │  ← jaws V-grip side edges
   │  (fixed)                         (slide) │
═══╪══════════════════════════════════════════╪═══  ← clamp-wall y=48-58 (10mm)
   │ T-slot on front face (y=54-58 neck, y=51-54 undercut)
   │ Rail extension x=-96..-48 for jaw telescoping
   │
   gap y40-48 (cavity: motors clear of all clamp geometry)
```

## Geometry (mm, OpenSCAD coordinates)

`fy = length/2 = 48` (chassis front wall inner face).

| Feature | Where | Notes |
|---|---|---|
| Clamp-wall | `[0,53,18]` cube `[96,10,36]` | y=48-58, z=0-36. Carries T-slot on front face. |
| Rail extension | `[-72,53,26]` cube `[48,10,12]` | x=-96..-48, y=48-58, z=20-32. Jaw telescopes here. |
| V-lip shelf | `[0,65,4]` cube `[92,14,8]` | y=58-72, z=0-8. Phone bottom rests here. |
| V-lip groove | `[-40,65,8]` rot[0,90,0] extrude 80, poly `[[7,0],[0,-7],[0,7]]` | Narrows in Y, self-centres thickness. Opens up → no support. |
| T-slot neck | `[-96,54,23]` cube `[106,4,6]` | y=54-58, z=23-29. Jaw neck slides here. |
| T-slot undercut | `[-96,51,20]` cube `[106,3,12]` | y=51-54, z=20-32. Flanges lock here — jaw can't pull out in Y. |
| Fixed jaw (right) | finger `[40,62,22]` cube `[10,18,28]` | y=53-71, z=8-36. Fused to chassis. |
| Fixed jaw V-notch | poly `[[44,0],[35,-9],[35,9]]` extrude from z=7 | Tip at x=44, base at x=35 (inner face). No flat wall. |
| Fixed band peg | `[40,71,10]` rot[-90,0,0] cyl d4 h5 + d7 head | Forward-facing (+Y). Visible/accessible from front. |
| Moving jaw (left) | separate part, `lego_robot_phone_clamp.scad` | Mirror geometry at x=-40 |
| Moving jaw tongue | neck y=54.2-57.8, z=23.2-28.8; flanges y=51.2-53.8, z=20.2-23.0 and z=29.0-31.8 | 65mm long, x=-100..-35. 0.2mm clearance per side. |
| Moving jaw band peg | `[-40,71,10]` rot[-90,0,0] | Matches fixed peg. |

## Hard constraints (each is a past bug — do not regress)

1. **T-slot is on the WALL FRONT FACE, not through the wall.** Neck y=54-58 (4mm),
   undercut y=51-54 (3mm), leaving 3mm solid wall at back (y=48-51). Never cut
   past y=48 = cavity boundary.
2. **T-profile is mandatory.** A rectangular slot lets the jaw pull straight out in Y.
   The flanges behind the undercut ledges are what locks it.
3. **Rail extension x=-96..-48 lets the moving jaw telescope outside the chassis
   width for phone loading.** Tongue stays captured as long as ≥ 20mm is in rail.
4. **V-notch base is flush with the jaw inner face (x=±35).** No flat wall between
   the notch base and the jaw edge. Both jaws use this: `[[44,0],[35,-9],[35,9]]`
   and `[[-44,0],[-35,-9],[-35,9]]`.
5. **Band pegs are on the jaw FRONT FACES, visible and accessible.** Not buried in
   the cavity. Forward-facing (rotate([-90,0,0])) so the rubber band hooks on and
   stretches across the phone front. No off-axis pull.
6. **V-lip shelf carries phone weight; V-notches are pure vertical prisms.**
   Jaw bottoms must not catch the phone. Shelf: y=58-72, z=0-8.
7. **Everything prints support-free.** V-grooves open upward; T-slot cuts are
   straight horizontal channels; tongue profile is symmetrical.
8. Both parts render `Volumes: 2`. Validate with `./ci_render_part.sh`.

## Loading sequence

1. Telescope moving jaw far left (to x≈-80, tongue still ≥20mm in rail).
2. Hook rubber band on fixed jaw peg (now fully accessible, moving jaw is out).
3. Place phone against wall (y=58), bottom edge in V-groove.
4. Slide moving jaw right until V-notch grips phone's left edge.
5. Hook rubber band on moving jaw peg — tension holds both jaws closed.

## Files that must stay in sync

- `lego_robot_base.scad` — clamp-wall, rail ext, shelf, V-groove, T-slot cuts, fixed jaw, fixed band peg.
- `lego_robot_phone_clamp.scad` — moving jaw (finger + T-tongue + band peg).
- `lego_robot_showcase.scad` — band at `[0, length/2+28, 10]`; phone at `[0, length/2+14.5, 78]`.
- Coord map OpenSCAD→Three.js: `[x, y, z] → [x, z, -y]`.
