include <lego_robot_common.scad>

// Adjustable LEFT V-jaw for the horizontal phone clamp.
//
// Rides the T-slot on the front face of the chassis clamp-wall (y=48-58).
// Telescope left to load phone; slide right until V-notch grips left edge.
// T-tongue (neck z=23-29 + flanges z=20-23 / z=29-32) locks the jaw in Y
// so it cannot pull forward — only slides in X along the rail.
// Band peg on jaw front face: hook rubber band before inserting phone.
// Prints standing (tongue face down), no support needed.

module phone_clamp_jaw() {
    fy  = length / 2;   // chassis front wall inner face (y=48)
    cl  = 0.2;          // clearance per side (sliding fit)

    difference() {
        union() {
            // Grip finger in front of wall (y=53-71), mirrors fixed right jaw
            translate([-40, fy + 14, 22]) cube([10, 18, 28], center=true);

            // ── T-tongue: 65 mm long, extends left from jaw body ─────────────
            // Neck (fits in slot neck  y=54-58, z=23-29):
            translate([-100, fy + 6 + cl, 23 + cl])
                cube([65, 4 - 2*cl, 6 - 2*cl]);

            // Bottom flange (locks in undercut y=51-54, z=20-23):
            translate([-100, fy + 3 + cl, 20 + cl])
                cube([65, 3 - 2*cl, 3 - 2*cl]);

            // Top flange (locks in undercut y=51-54, z=29-32):
            translate([-100, fy + 3 + cl, 29 + cl])
                cube([65, 3 - 2*cl, 3 - 2*cl]);

            // Band peg: front face of jaw, visible from outside.
            // Hook rubber band on this + fixed jaw's matching peg.
            translate([-40, fy + 22, 10]) rotate([-90, 0, 0]) {
                cylinder(d=4, h=5);
                translate([0, 0, 3.5]) cylinder(d=7, h=1.5);
            }
        }

        // V-notch grips phone's left edge (mirror of fixed jaw).
        // Base flush with jaw inner face x=-35 — no 1mm flat wall.
        translate([0, fy + 14, 7]) linear_extrude(34)
            polygon([[-44, 0], [-35, -9], [-35, 9]]);
    }
}

color("#27ae60") phone_clamp_jaw();
