include <lego_robot_common.scad>

module phone_clamp_jaw() {
    // Align with the chassis Y coordinate for easy visualization in showcase
    // The inner channel in the chassis is at y = length/2 + 2 = 66
    
    // T-bar slider (185mm long: lets the jaw reach the top edge of a 6"
    // (~163mm) phone while keeping plenty of rail engaged in the chassis T-slot)
    translate([0, length/2 + 4, 92.5]) {
        // Wide inner part (slides in the 24x6 channel)
        translate([0, -1.5, 0]) cube([23.4, 5.4, 185], center=true);
        // Neck (slides in the 14x5 opening and reaches out to the jaw)
        translate([0, 3, 0]) cube([13.4, 6, 185], center=true);
    }

    // Jaw at the top
    translate([0, length/2 + 14, 180]) {
        // Main block over phone
        cube([24, 25, 10], center=true);
        
        // Drop down lip in front of phone (strengthened to 5mm thick)
        translate([0, 11, -9.9]) cube([24, 5, 10.2], center=true);
        
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

// Color applied for individual render view
color("#27ae60") phone_clamp_jaw();
// trigger ci rebuild
