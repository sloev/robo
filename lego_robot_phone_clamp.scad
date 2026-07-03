include <lego_robot_common.scad>

// Adjustable RIGHT V-jaw for the horizontal phone clamp.
//
// Rides the T-slot on the front face of the chassis clamp-wall (y=48-58).
// Telescope right to load phone; slide left until V-notch grips right edge.
// T-tongue (neck z=23-29 + full undercut z=20-32) locks the jaw in Y
// so it cannot pull forward — only slides in X along the rail.
// Band peg on jaw front face: hook rubber band before inserting phone.
// Prints standing (tongue face down), no support needed.

module phone_clamp_jaw() {
    fy  = length / 2;   // chassis front wall inner face (y=48)
    cl  = 0.2;          // clearance per side (sliding fit)

    difference() {
        union() {
            // Grip finger in front of wall (y=58-69), avoiding overlap with wall (y=48-58)
            translate([40, fy + 15.5, 21.5]) cube([10, 11, 29], center=true);

            // Filler block: extends the tongue forward inside the jaw block to form a solid corner
            translate([40, fy + 8, 19.5]) cube([10, 5, 25], center=true);

            // ── T-tongue: 75 mm long, extends left from jaw body ─────────────
            // Neck (fits in slot neck  y=54-58, z=10-29):
            translate([-30, fy + 5.6, 10 + cl])
                cube([75, 4.6, 19 - 2*cl]);

            // Full-height undercut body (fills entire undercut y=51-54, z=7-32):
            translate([-30, fy + 3 + cl, 7 + cl])
                cube([75, 3 - 2*cl, 25 - 2*cl]);

            // Band peg: front face of jaw, visible from outside.
            // Hook rubber band on this + fixed jaw's matching peg.
            translate([40, fy + 20, 10]) rotate([-90, 0, 0]) {
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
