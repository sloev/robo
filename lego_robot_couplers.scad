include <lego_robot_common.scad>

module motor_coupler() {
    // Bridging custom module: Plugs into Stepper, accepts Technic Axle
    difference() {
        union() {
            rotate([0, 90, 0]) cylinder(d=8, h=10.4, center=true);
            rotate([0, 90, 0]) cylinder(d=12, h=2, center=true); // Captive Flange
        }
        
        // 28BYJ-48 Stepper Flat-D Socket (Inside)
        translate([2.0, 0, 0]) difference() {
            rotate([0, 90, 0]) cylinder(d=5.2, h=6.5, center=true);
            translate([0, 2.5, 0]) cube([8, 2, 6], center=true);
            translate([0, -2.5, 0]) cube([8, 2, 6], center=true);
        }
        
        // Lego Technic Cross Axle Socket (Outside)
        translate([-2.0, 0, 0]) rotate([0, 90, 0]) {
            cube([5.1, 1.8, 6.5], center=true);
            cube([1.8, 5.1, 6.5], center=true);
        }
    }
}


motor_coupler();
translate([0, 20, 0]) motor_coupler();
