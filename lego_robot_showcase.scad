include <lego_robot_common.scad>
use <lego_robot_base.scad>
use <lego_robot_lid.scad>
use <lego_robot_couplers.scad>
use <lego_robot_phone_clamp.scad>

color("#5b9bd5") vehicle_base();
color("#e74c3c") translate([0, 0, height + 20]) sliding_lid();
// Couplers (already X-axis): Ø8 nose into the wall hole, Ø12 captive inboard.
color("#f1c40f") translate([-46, motor_y, shaft_z]) motor_coupler();                 // left
color("#f1c40f") translate([ 46, motor_y, shaft_z]) rotate([0, 0, 180]) motor_coupler(); // right (flipped)
color("#27ae60") phone_clamp_jaw();

// --- Phone clamp in use (illustration) ---
// Rubber band: hooks on the forward-facing pegs (right jaw x=40, left jaw x=-40,
// both at y=76, z=10) and stretches across the phone's front face — fully visible.
color("#222")
    translate([0, length/2 + 27, 10]) rotate([0, 90, 0]) cylinder(d=2, h=80, center=true);
// Phone (translucent) standing IN FRONT of the front wall (y=58): bottom edge
// in the V-lip shelf, side edges gripped by the two V-notch jaws.
%translate([0, length/2 + 14.5, 8 + 70]) cube([75, 9, 140], center=true);

// Accurate 28BYJ-48 stepper. Local frame: body axis along X, body centered at
// origin; shaft exits +X offset +8mm in Z (so the body sits on motor_z and the
// shaft lands on shaft_z). Mount-ear holes are 35mm apart, aligning with the
// chassis motor-mount screw holes.
module byj48() {
    rotate([0, 90, 0]) cylinder(d=28, h=19, center=true);            // body can
    translate([0, 0, 8]) {                                           // shaft offset 8mm above mount line
        translate([9.5, 0, 0]) rotate([0, 90, 0]) cylinder(d=9, h=1.5);   // Ø9 x 1.5 collar
        translate([11, 0, 0]) rotate([0, 90, 0]) difference() {
            cylinder(d=5, h=6);                                           // Ø5 shaft, 6mm
            translate([0,  2.5, 3]) cube([10, 2, 8], center=true);        // flat-D (3mm across flats)
            translate([0, -2.5, 3]) cube([10, 2, 8], center=true);
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
    // Stepper motors (accurate 28BYJ-48) friction-cradled, shafts plugging into
    // the captive couplers at the walls (body centred at x=±17.5).
    color("silver") translate([30.5, motor_y, motor_z]) byj48();
    color("silver") translate([-30.5, motor_y, motor_z]) rotate([0, 0, 180]) byj48();

    // ESP32-S2 Mini, flat on the floor, centred between the wall ULN boards
    translate([0, -29, floor_z + 4]) {
        color("purple") cube([25.4, 34.3, 1.6], center=true);
        color("silver") translate([0, -18, 0]) cube([9, 6, 3.5], center=true); // USB-C through back wall
    }

    // ULN2003 driver boards, standing vertically on the inner side walls
    for (s = [-1, 1])
        color("green") translate([s*37, -10, floor_z + 16]) cube([1.6, 35, 31.5], center=true);
    
    // Highlight the Technic Axle insertion path
    color("red") translate([-50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
    color("red") translate([50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
    
}


%showcase_electronics();
