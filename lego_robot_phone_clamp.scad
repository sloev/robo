include <lego_robot_common.scad>

module phone_clamp_jaw() {
    // Separate part: Clamps over the top of the phone, pulled down by rubber bands
    // to the side pegs on the chassis
    difference() {
        union() {
            // Main body
            cube([75, 12, 10], center=true);
            // Pegs for rubber bands
            translate([-37.5, 0, 0]) rotate([0, 90, 0]) {
                cylinder(d=4, h=8, center=true);
                translate([0, 0, -3]) cylinder(d=6, h=2, center=true); // Flange
            }
            translate([37.5, 0, 0]) rotate([0, 90, 0]) {
                cylinder(d=4, h=8, center=true);
                translate([0, 0, 3]) cylinder(d=6, h=2, center=true);
            }
        }
        // Groove for the phone (10mm thick phone capacity)
        translate([0, 0, -3]) cube([80, 10, 8], center=true);
        // Camera cutout in the center so it doesn't block top edge lenses
        cube([30, 20, 15], center=true);
    }
}


phone_clamp_jaw();
