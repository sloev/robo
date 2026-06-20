include <lego_robot_common.scad>
use <lego_robot_base.scad>
use <lego_robot_lid.scad>
use <lego_robot_couplers.scad>
use <lego_robot_phone_clamp.scad>

color("#5b9bd5") vehicle_base();
color("#e74c3c") translate([0, 0, height + 20]) sliding_lid();
color("#f1c40f") translate([-41.2, motor_y, shaft_z]) rotate([0, 90, 0]) motor_coupler();
color("#f1c40f") translate([41.2, motor_y, shaft_z]) rotate([0, -90, 0]) motor_coupler();
color("#27ae60") phone_clamp_jaw();

// Accurate 28BYJ-48 stepper. Local frame: body axis along X, body centered at
// origin; shaft exits +X offset +8mm in Z (so the body sits on motor_z and the
// shaft lands on shaft_z). Mount-ear holes are 35mm apart, aligning with the
// chassis motor-mount screw holes.
module byj48() {
    rotate([0, 90, 0]) cylinder(d=28, h=19, center=true);            // body can
    translate([0, 0, 8]) {                                           // offset shaft
        translate([9.5, 0, 0]) rotate([0, 90, 0]) cylinder(d=9, h=1.5);   // boss
        translate([11, 0, 0]) rotate([0, 90, 0]) difference() {
            cylinder(d=5, h=9);
            translate([0,  3.5, 4.5]) cube([10, 2, 11], center=true);     // flat-D
            translate([0, -3.5, 4.5]) cube([10, 2, 11], center=true);
        }
    }
    for (dy = [-17.5, 17.5])                                         // mount ears
        difference() {
            hull() {
                translate([9.1, dy, 0])     rotate([0, 90, 0]) cylinder(d=7,  h=0.8);
                translate([9.1, dy*0.4, 0]) rotate([0, 90, 0]) cylinder(d=12, h=0.8);
            }
            translate([8.5, dy, 0]) rotate([0, 90, 0]) cylinder(d=4, h=3);
        }
    translate([-2, 0, 13]) cube([14.6, 10, 6], center=true);         // cable connector
    for (dy = [-4, -2, 0, 2, 4]) translate([-2, dy, 16]) cylinder(d=1, h=5);  // wires
}

module showcase_electronics() {
    // Stepper motors (accurate 28BYJ-48), mounted to the inside walls
    color("silver") translate([30, motor_y, motor_z]) byj48();
    color("silver") translate([-30, motor_y, motor_z]) rotate([0, 0, 180]) byj48();

    // ESP32-S2 Mini Board
    translate([0, -45, floor_z + 4]) {
        color("purple") cube([34.3, 25.4, 1.6], center=true);
        color("silver") translate([0, -10, 2]) cube([10, 8, 3], center=true); // USB-C
    }
    
    // ULN2003 Driver Boards (Flat)
    color("green") translate([-20, 2, floor_z + 2.8]) cube([35, 32, 1.6], center=true);
    color("green") translate([20, 2, floor_z + 2.8]) cube([35, 32, 1.6], center=true);
    
    // Highlight the Technic Axle insertion path
    color("red") translate([-50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
    color("red") translate([50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
    
}


%showcase_electronics();
