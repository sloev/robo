# Phone Clamp — Source of Truth

The horizontal phone clamp for the BlockBot chassis. **Read this before touching any
clamp geometry.** It went through ~9 wrong iterations; the constraints below are the
lessons from each. **When in doubt, don't trust this file's numbers over the code —
verify with the boolean-intersection check in "Verifying a change" below.** Iteration
#9 was this doc and the code silently drifting apart: a later edit shrank the T-slot
cavity and dropped the rail extension but never updated the tongue to match, so the
shipped tongue reached 20mm past the cavity into solid wall.

## The core idea

The phone stands **in front of the chassis front wall** (NOT on top, NOT inside).
It leans back against the wall's front face (y=58). Two V-jaws grip its left/right
side edges. A rubber band stretches between the forward-facing pegs on each jaw,
across the phone's front face — fully visible and accessible.

```
                  rubber band (y≈78, z=10)
         ●────────────────────────────────●
         │      phone front face (y=67)   │
   ┌─────┴──────────────────────────────┴─────┐
   │  L jaw           phone body        R jaw │  ← jaws V-grip side edges
   │  (fixed)                         (slide) │
═══╪══════════════════════════════════════════╪═══  ← clamp-wall y=48-58 (10mm)
   │ T-slot on front face (y=54-58 neck, y=51-54 undercut)
   │ No rail extension — slot spans the full chassis width (x=-10..+48)
   │
   gap y40-48 (cavity: motors clear of all clamp geometry)
```

## Shared constants (`lego_robot_common.scad`)

The T-slot cavity bounds and print tolerance live in ONE place and are referenced
by both `lego_robot_base.scad` (cavity cuts) and `lego_robot_phone_clamp.scad`
(tongue sizing), specifically to prevent the two from drifting apart again:

| Constant | Value | Meaning |
|---|---|---|
| `clamp_tol` | 0.3mm | Per-side print clearance for the sliding tongue fit |
| `slot_x0` / `slot_x1` | -10 / 48 (`width/2`) | T-slot cavity X span |
| `slot_neck_z0/z1` | 10 / 29 | Neck cavity Z span (jaw slides here) |
| `slot_uc_z0/z1` | 7 / 32 | Undercut cavity Z span (T-flange lock) |
| `shelf_top_z` | 8 | V-lip shelf top surface — jaw geometry must clear this |
| `band_peg_z` | 10 | Shared Z height for both band pegs (keeps rubber band level) |

## Geometry (mm, OpenSCAD coordinates)

`fy = length/2 = 48` (chassis front wall inner face).

| Feature | Where | Notes |
|---|---|---|
| Clamp-wall | `[0,53,18]` cube `[96,10,36]`, centered | x=-48..+48, y=48-58, z=0-36. Carries T-slot on front face. No rail extension. |
| V-lip shelf | center `[0,60,4]` cube `[92,16,8]` | x=-46..+46, y=52-68, z=0-8. Phone bottom rests here. |
| V-lip groove | `[-46,60,8]` rot[0,90,0] extrude 92, poly `[[5,0],[0,-5],[0,5]]` | x=-46..+46. Narrows in Y, self-centres thickness. Opens up → no support. |
| T-slot neck | `[slot_x0,54,slot_neck_z0]` cube `[58,4,19]` | x=-10..+48, y=54-58, z=10-29. Jaw neck slides here. |
| T-slot undercut | `[slot_x0,51,slot_uc_z0]` cube `[58,3,25]` | x=-10..+48, y=51-54, z=7-32. Tongue fills here — jaw can't pull out in Y. |
| Fixed jaw (left) | finger `[-40,61.5,21.5]` cube `[10,15,29]` | x=-45..-35, y=54-69, z=7-36. Fused to chassis. |
| Fixed jaw V-notch | poly `[[-44,0],[-35,-4.5],[-35,4.5]]` translate `[0,62.5,6]` extrude 35 | Tip at x=-44, base at x=-35 (inner face). Spans y=58-67 (phone thickness). |
| Fixed band peg | `[-40,68,band_peg_z]` rot[-90,0,0] cyl d4 h5 + d7 head | Forward-facing (+Y). Visible/accessible from front. |
| Moving jaw (right) | separate part, `lego_robot_phone_clamp.scad` | Mirror geometry at x=+40 |
| Moving jaw tongue | x = `slot_x0+clamp_tol` .. `slot_x1-clamp_tol` (≈-9.7..47.7) | Neck z=10.3-28.7, y=53.6-58.5; full undercut z=7.3-31.7, y=51.3-53.7. Always inside the T-slot cavity — never size or position this independently of `slot_x0`/`slot_x1`. |
| Moving jaw grip finger | `[35,58.3,8.3]` cube `[10,11,27.7]` | Held `clamp_tol` off the wall face (y=58) and `clamp_tol` above the shelf top (z=8) so it can't bind or collide with either. |
| Moving jaw band peg | `[40,68.3,band_peg_z]` rot[-90,0,0] | Matches fixed peg (offset by the finger's `clamp_tol` standoff). |

## Hard constraints (each is a past bug — do not regress)

1. **T-slot is on the WALL FRONT FACE, not through the wall.** Neck y=54-58 (4mm),
   undercut y=51-54 (3mm), leaving 3mm solid wall at back (y=48-51). Never cut
   past y=48 = cavity boundary.
2. **T-profile is mandatory.** A rectangular slot lets the jaw pull straight out in Y.
   The tongue fills the FULL undercut height (`slot_uc_z0`-`slot_uc_z1`) — not just
   two flanges.
3. **The moving jaw's tongue X span must be derived from `slot_x0`/`slot_x1`
   (minus `clamp_tol`), never hardcoded independently.** There is no rail
   extension — the whole T-slot cavity is `slot_x0..slot_x1`. A tongue sized or
   positioned outside that range collides with solid, un-milled wall (this
   shipped once: 20mm of tongue inside solid material, ~2.8cm³ of interference).
4. **V-notch base is flush with the jaw inner face (x=±35).** No flat wall between
   the notch base and the jaw edge. Fixed jaw: `[[-44,0],[-35,-4.5],[-35,4.5]]`.
   Moving jaw: `[[44,0],[35,-4.5],[35,4.5]]`.
5. **Band pegs are on the jaw FRONT FACES, visible and accessible.** Not buried in
   the cavity. Forward-facing (rotate([-90,0,0])) so the rubber band hooks on and
   stretches across the phone front. No off-axis pull. Both pegs share `band_peg_z`.
6. **V-lip shelf carries phone weight; V-notches are pure vertical prisms.**
   Jaw bottoms must not catch the phone, and any moving-jaw solid crossing the
   shelf's footprint (x<=46, y<=68) must stay at or above `shelf_top_z + clamp_tol`.
7. **Everything prints support-free.** V-grooves open upward; T-slot cuts are
   straight horizontal channels; tongue profile is symmetrical.
8. Both parts render `Volumes: 2` (a single connected solid each). Validate with
   `./ci_render_part.sh`.

## Verifying a change

`Volumes: 2` only proves each part is manifold on its own — it does NOT prove the
two parts don't collide with each other. Before trusting a geometry change, boolean
the two rendered parts together and confirm the intersection is empty:

```
openscad -o /tmp/collision.stl - <<'EOF'
use <lego_robot_base.scad>
use <lego_robot_phone_clamp.scad>
intersection() { vehicle_base(); phone_clamp_jaw(); }
EOF
```

`Current top level object is empty` = no collision. Any exported geometry means the
two parts physically overlap and cannot be assembled as printed.

## Loading sequence

1. Telescope moving jaw right to load the phone (only the finger + band peg are
   visible/accessible outside the chassis footprint; the tongue stays inside the
   T-slot cavity throughout).
2. Hook rubber band on fixed jaw peg (now fully accessible, moving jaw is out).
3. Place phone against wall (y=58), bottom edge in V-groove.
4. Slide moving jaw left until V-notch grips phone's right edge.
5. Hook rubber band on moving jaw peg — tension holds both jaws closed.

## Files that must stay in sync

- `lego_robot_common.scad` — shared T-slot constants (`slot_x0/x1`, `clamp_tol`, etc).
- `lego_robot_base.scad` — clamp-wall, shelf, V-groove, T-slot cuts, fixed jaw, fixed band peg.
- `lego_robot_phone_clamp.scad` — moving jaw (finger + T-tongue + band peg), all sized from the shared constants.
- `lego_robot_showcase.scad` — band at `[0, length/2+28, 10]`; phone at `[0, length/2+14.5, 78]`.
- `website/viewer.js` — clamp exploded pos `[60, 30, 0]` (Three.js, jaw slides right).
- Coord map OpenSCAD→Three.js: `[x, y, z] → [x, z, -y]`.
