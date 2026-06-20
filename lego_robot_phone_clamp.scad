include <lego_robot_common.scad>

module phone_clamp_jaw() {
    // Align with the chassis Y coordinate for easy visualization in showcase
    // The inner channel in the chassis is at y = length/2 + 2 = 66
    
    // T-bar slider (130mm long to support up to 160mm tall phones)
    translate([0, length/2 + 2, 65]) {
        // Wide inner part (slides in the 20x3.2 channel)
        cube([19, 2.6, 130], center=true);
        // Neck (slides in the 12x4 opening)
        translate([0, 2.5, 0]) cube([11, 4, 130], center=true);
    }
    
    // Jaw at the top
    translate([0, length/2 + 10.5, 125]) {
        // Main block over phone
        cube([24, 25, 10], center=true);
        
        // Drop down lip in front of phone
        translate([0, 11, -10]) cube([24, 3, 10], center=true);
        
        // Pegs for elastic bands
        translate([-13, -5, 0]) rotate([0, 90, 0]) {
            cylinder(d=4, h=6, center=true);
            translate([0, 0, -2]) cylinder(d=6, h=1, center=true);
        }
        translate([13, -5, 0]) rotate([0, 90, 0]) {
            cylinder(d=4, h=6, center=true);
            translate([0, 0, 2]) cylinder(d=6, h=1, center=true);
        }
    }
}

phone_clamp_jaw();
