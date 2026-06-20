include <lego_robot_common.scad>
use <lego_robot_base.scad>
use <lego_robot_lid.scad>
use <lego_robot_couplers.scad>
use <lego_robot_phone_clamp.scad>

color("#2c3e50") vehicle_base();
color("#e74c3c") translate([0, 0, height + 20]) sliding_lid();
color("#f1c40f") translate([-41.2, motor_y, shaft_z]) rotate([0, 90, 0]) motor_coupler();
color("#f1c40f") translate([41.2, motor_y, shaft_z]) rotate([0, -90, 0]) motor_coupler();
color("#27ae60") phone_clamp_jaw();

module showcase_electronics() {
    // Left Stepper Motor
    translate([-34, motor_y, motor_z]) rotate([0, 90, 0]) {
        color("silver") cylinder(d=28, h=19, center=true);
        color("dodgerblue") translate([0, 8, 0]) cube([15, 15, 19], center=true); // cable box
    }
    // Right Stepper Motor
    translate([34, motor_y, motor_z]) rotate([0, -90, 0]) {
        color("silver") cylinder(d=28, h=19, center=true);
        color("dodgerblue") translate([0, 8, 0]) cube([15, 15, 19], center=true);
    }
    
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
    
    // Show the clamp hovering in showcase mode
    color("#8e44ad") translate([0, length/2 + 2.5, 100]) phone_clamp_jaw();
}


%showcase_electronics();
