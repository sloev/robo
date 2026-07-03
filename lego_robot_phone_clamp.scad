include <lego_robot_common.scad>

// Adjustable RIGHT V-jaw for the horizontal phone clamp.
//
// Rides the T-slot on the front face of the chassis clamp-wall (y=48-58).
// Telescope right to load phone; slide left until V-notch grips right edge.
// T-tongue (neck + full undercut) locks the jaw in Y so it cannot pull
// forward — only slides in X along the rail. The tongue's X span is derived
// from slot_x0/slot_x1 (lego_robot_common.scad) minus clamp_tol, so it can
// never reach past the chassis's actual T-slot cavity into solid wall.
// Band peg on jaw front face: hook rubber band before inserting phone.
// Prints standing (tongue face down), no support needed.

module phone_clamp_jaw() {
    fy  = length / 2;    // chassis front wall inner face (y=48)
    tol = clamp_tol;     // print clearance per mating surface

    // Tongue spans the T-slot cavity width minus clearance, so it always
    // stays inside the milled cavity (see lego_robot_common.scad slot_x0/x1).
    tx0 = slot_x0 + tol;
    tx1 = slot_x1 - tol;
    tw  = tx1 - tx0;

    // Grip finger held clamp_tol proud of the wall face (y=58) so it can't
    // bind against it, and clamp_tol above the V-lip shelf top so it can't
    // collide with that fixed feature of the base.
    finger_y0 = 58 + tol;
    finger_z0 = shelf_top_z + tol;

    // Neck tongue's front edge is extended past the wall face (open air) far
    // enough to overlap the (now offset) grip finger, keeping the jaw as one
    // connected solid.
    neck_y0 = fy + 5.6;
    neck_y1 = finger_y0 + 0.2;

    difference() {
        union() {
            // Grip finger in front of wall.
            translate([35, finger_y0, finger_z0])
                cube([10, 11, 36 - finger_z0]);

            // Filler block: thickens the tongue/finger junction into a solid
            // corner. Kept within the undercut cavity's y-range (<=54) so it
            // never reaches into the shallower neck cavity above it.
            translate([35, 53.5, slot_uc_z0 + tol])
                cube([10, 0.5, slot_uc_z1 - slot_uc_z0 - 2*tol]);

            // ── T-tongue: extends left from jaw body, spans the T-slot width ──
            // Neck (fits in slot neck y=54-58, z=10-29):
            translate([tx0, neck_y0, slot_neck_z0 + tol])
                cube([tw, neck_y1 - neck_y0, slot_neck_z1 - slot_neck_z0 - 2*tol]);

            // Full-height undercut body (fills entire undercut y=51-54, z=7-32):
            translate([tx0, fy + 3 + tol, slot_uc_z0 + tol])
                cube([tw, 3 - 2*tol, slot_uc_z1 - slot_uc_z0 - 2*tol]);

            // Band peg: front face of jaw, visible from outside, 1mm inset
            // from the jaw's front face (finger_y0 + 11) — no T-junction.
            translate([40, finger_y0 + 10, band_peg_z]) rotate([-90, 0, 0]) {
                cylinder(d=4, h=5);
                translate([0, 0, 3.5]) cylinder(d=7, h=1.5);
            }
        }

        // V-notch grips phone's right edge (mirror of fixed jaw).
        // Base flush with jaw inner face x=+35 — no 1mm flat wall.
        translate([0, fy + 14.5, 0]) linear_extrude(45)
            polygon([[44, 0], [35, -4.5], [35, 4.5]]);
    }
}

color("#27ae60") phone_clamp_jaw();
