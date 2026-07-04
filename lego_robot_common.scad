/* 
 * Parametric Lego-Compatible Robotic Vehicle Enclosure
 * Completely self-contained OpenSCAD script.
 */

$fn = 60;

// --- LEGO & ENCLOSURE PARAMETERS ---
lego_pitch = 8.0;
lego_height = 9.6;
wall_t = 1.6;        // thin end walls (front/back) for electronics clearance
side_wall = 8.0;     // long side walls: a full LEGO unit so the lid seats and
                     // Technic holes/motor mounts sit in solid wall

// Outer Dimensions. Shorter + taller (reorg): the ULN2003 boards stand on the
// inner side walls and the ESP32 lies between them, so the floor needs less
// length; the extra height lets the phone clamp grip higher.
box_w_lu = 12; // 96.0 mm (Outer Width)
box_l_lu = 12; // 96.0 mm (Outer Length, shortened from 128)
box_h_lh = 6;  // 57.6 mm (Outer Height, raised from 48)

width = box_w_lu * lego_pitch;
length = box_l_lu * lego_pitch;
height = box_h_lh * lego_height;

lid_t = 3.2; // Sliding lid thickness
floor_z = 4.8; // 3.2mm Lego tube cavity + 1.6mm floor
lid_z = height - 2.4; // centre Z of the sliding-lid rail groove (just below top)

// --- ALIGNED INTERNAL POSITIONS ---
shaft_z = 33.6; // motor shaft / coupler height
motor_y = 26.0; // front; keeps the front mounting ear (motor_y+17.5) inside the cavity
motor_z = shaft_z - 8.0;

// --- PHONE CLAMP T-SLOT (shared by the base cavity + the moving jaw tongue) ---
// Keeping these numbers in one place stops the two parts drifting out of
// sync -- a past edit shrank the cavity without updating the tongue to
// match, letting the tongue reach 20mm past the cavity into solid wall.
clamp_tol    = 0.3;        // per-side print clearance for the sliding tongue fit
slot_x0      = -10;        // T-slot cavity start (chassis X)
slot_x1      = width / 2;  // T-slot cavity end == chassis half-width
slot_neck_z0 = 10;  slot_neck_z1 = 29;  // neck cavity Z range (jaw slides here)
slot_uc_z0   = 7;   slot_uc_z1   = 32;  // undercut cavity Z range (T-flange lock)
shelf_top_z  = 8;          // V-lip shelf top surface -- jaw geometry must clear this
// Shared Z height for both band pegs (keeps rubber band level). Must clear
// the moving jaw's grip finger floor (slot_neck_z0 + clamp_tol = 10.3) by
// enough for the d=4 peg shaft (radius 2) to stay embedded in it.
band_peg_z   = 14;

// --- STRUCTURAL HELPERS ---
// V-notch/groove with a rounded (filleted) tip instead of a sharp point.
// A sharp interior point is a stress concentrator, and printing it thin
// leaves almost no backing material behind it -- both make the V prone to
// snapping under a side load. hull() of a real circle at the tip with two
// near-zero-radius circles at the base corners gives sharp base corners
// (needed where the notch must sit flush against a flat face) and a smooth
// fillet at the tip, entirely automatically (no manual tangent-angle math).
// The tip still reaches exactly to tip_x, same as an unrounded V would --
// call this with a shallower tip_x than a knife-edge design to actually gain
// backing material, not just a rounded version of the same knife edge.
module rounded_notch_2d(tip_x, base_x, half_width, r) {
    hull() {
        translate([tip_x + r * sign(base_x - tip_x), 0]) circle(r = r);
        translate([base_x, half_width]) circle(r = 0.01);
        translate([base_x, -half_width]) circle(r = 0.01);
    }
}

// --- RENDER TARGET ---
