include <lego_robot_common.scad>

// Motor coupler: maps the 28BYJ-48 flat-D shaft to a standard LEGO Technic
// cross axle. Profile is Ø12 at the motor (captive) end stepping DOWN to Ø8 at
// the axle end, so it prints standing on the wide end (widest -> narrowest, no
// supports) while the Ø12 ring stays captive behind the chassis wall and the
// Ø8 nose pokes out through the Ø8.5 hole.
module motor_coupler() {
    difference() {
        union() {
            // Motor/captive end (Ø12) and axle nose (Ø8), axis along X.
            translate([3.0, 0, 0])  rotate([0, 90, 0]) cylinder(d=12, h=5, center=true);
            translate([-2.5, 0, 0]) rotate([0, 90, 0]) cylinder(d=8,  h=6, center=true);
        }
        // 28BYJ-48 flat-D socket (motor end, +X): Ø5.2 with 3mm across the flats
        translate([2.5, 0, 0]) {
            rotate([0, 90, 0]) cylinder(d=5.2, h=7, center=true);
            translate([0,  2.6, 0]) cube([8, 2, 7], center=true);
            translate([0, -2.6, 0]) cube([8, 2, 7], center=true);
        }
        // LEGO Technic cross-axle socket (axle end, -X)
        translate([-3.0, 0, 0]) rotate([0, 90, 0]) {
            cube([5.1, 1.8, 8], center=true);
            cube([1.8, 5.1, 8], center=true);
        }
    }
}

// Color applied for individual render view
color("#f1c40f") motor_coupler();
