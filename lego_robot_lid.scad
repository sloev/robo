include <lego_robot_common.scad>

module sliding_lid() {
    lid_len = length - 1.6;   // tracks the chassis length
    // Centered relative to the actual internal span
    translate([0, 0.8, height - 1.6]) {
        difference() {
            union() {
                // Main lid
                cube([79.6, lid_len, 3.2], center=true);
                // Side guide tongues
                translate([0, 0, -0.8]) cube([83.0, lid_len, 1.4], center=true);
                
                // Top Studs (Shifted to perfectly align with global Lego Grid)
                // We limit width to 10 units since the lid fits inside the thick walls
                start_x = - ((box_w_lu - 2) * lego_pitch) / 2 + 4;
                start_y = - (box_l_lu * lego_pitch) / 2 + 4;
                for (i = [0, box_w_lu - 3]) {
                    for (j = [1 : box_l_lu - 2]) {
                        // Canonical LEGO stud: Ø4.8 x 1.6 high (the 0.8mm rule)
                        translate([start_x + i*8, start_y + j*8 - 0.8, 1.5])
                            cylinder(d=4.8, h=1.6);
                    }
                }
            }
            // Security screw hole
            translate([0, lid_len/2 - 3.1, 0]) cylinder(d=3.2, h=10, center=true);
            translate([0, lid_len/2 - 3.1, 1.5]) cylinder(d=6, h=10);

            // Recessed detents for friction click-lock
            translate([83.0/2, lid_len/2 - 5, -0.8]) sphere(d=1);
            translate([-83.0/2, lid_len/2 - 5, -0.8]) sphere(d=1);
        }
    }
}


// Color applied for individual render view
color("#e74c3c") sliding_lid();
