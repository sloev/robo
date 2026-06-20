include <lego_robot_common.scad>

module vehicle_base() {
    difference() {
        union() {
            base_shell();
            esp32_snap_tray();
            uln2003_flat_tray(-20, 2);
            uln2003_flat_tray(20, 2);
            motor_bays();
            
            // Friction detent bumps for the sliding lid
            translate([83.0/2 - 1, length/2 - 5, 45.6]) sphere(d=1);
            translate([-83.0/2 + 1, length/2 - 5, 45.6]) sphere(d=1);
            
            // Security screw anchor block at the rear
            translate([-5, length/2 - 6, floor_z])
                difference() {
                    cube([10, 6, height - floor_z]);
                    translate([5, 3, height - floor_z - 10]) cylinder(d=2.5, h=15); // pilot hole
                }
                
            // Internal Assembly Instructions & Wire Routing Paths
            translate([0, motor_y - 22, floor_z]) linear_extrude(0.6) text("1. 28BYJ-48 MOTORS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, 2, floor_z]) linear_extrude(0.6) text("2. ULN2003 BOARDS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, -25, floor_z]) linear_extrude(0.6) text("3. ESP32-S2 MINI", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            
            translate([0, 22, floor_z]) linear_extrude(0.6) text("--- WIRES ---", size=3, halign="center");
            
            // Discreet AI Phone Mount (Bottom Lip at front of chassis)
            // Track box for the sliding jaw (beefed up for extreme stability)
            translate([0, length/2 + 4, 24]) cube([32, 8, 48], center=true); 
            // Phone resting lip
            translate([0, length/2 + 14, 1.5]) cube([75, 12, 3], center=true); 
            // Front retaining wall of the lip (strengthened)
            translate([0, length/2 + 21.5, 4]) cube([75, 3, 8], center=true);
            
            // Rubber band anchor pegs on the sides for the top clamp
            translate([-width/2 - 2, 55, 10]) rotate([0, 90, 0]) {
                cylinder(d=4, h=4, center=true);
                translate([0, 0, -1.5]) cylinder(d=6, h=1, center=true);
            }
            translate([width/2 + 2, 55, 10]) rotate([0, 90, 0]) {
                cylinder(d=4, h=4, center=true);
                translate([0, 0, 1.5]) cylinder(d=6, h=1, center=true);
            }
        }
        
        // --- CENTRALIZED CUTS ---
        
        // Lego Technic Grid Holes (Pierces Outer Walls and Thickeners cleanly once)
        for (y = [-60 : 8 : 60]) {
            translate([0, y, 4.8]) rotate([0, 90, 0]) cylinder(d=4.8, h=width+10, center=true);
            translate([0, y, 33.6]) rotate([0, 90, 0]) cylinder(d=4.8, h=width+10, center=true);
        }
        
        // T-slot cut for the phone clamp slider (deepened and widened for strength)
        translate([0, length/2 + 4, 24]) {
            // Narrow opening facing forward
            translate([0, 2, 0]) cube([14, 5, 50], center=true);
            // Wide inner channel
            translate([0, -1.5, 0]) cube([24, 6, 50], center=true);
        }
        
        // USB-C Pass-through
        translate([0, -length/2, 12.4]) cube([12, 6, 5], center=true);
        
        // Left Internal U-Slot (Hidden inside the thickened wall)
        translate([-41.2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=8.5, h=11, center=true);
            translate([0, 0, 15]) cube([11, 8.5, 30], center=true);
            // Captive Flange Groove
            rotate([0, 90, 0]) cylinder(d=12.5, h=2.5, center=true);
            translate([0, 0, 15]) cube([2.5, 12.5, 30], center=true);
        }
        
        // Right Internal U-Slot
        translate([41.2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=8.5, h=11, center=true);
            translate([0, 0, 15]) cube([11, 8.5, 30], center=true);
            rotate([0, 90, 0]) cylinder(d=12.5, h=2.5, center=true);
            translate([0, 0, 15]) cube([2.5, 12.5, 30], center=true);
        }
        
        // Left Horizontal Motor Mount Screw Holes (Depth 7mm, starts at -39 to cleanly pierce the -40 face)
        translate([-39, motor_y - 17.5, motor_z]) rotate([0, -90, 0]) cylinder(d=2.5, h=7);
        translate([-39, motor_y + 17.5, motor_z]) rotate([0, -90, 0]) cylinder(d=2.5, h=7);
        
        // Right Horizontal Motor Mount Screw Holes
        translate([39, motor_y - 17.5, motor_z]) rotate([0, 90, 0]) cylinder(d=2.5, h=7);
        translate([39, motor_y + 17.5, motor_z]) rotate([0, 90, 0]) cylinder(d=2.5, h=7);
        
        // External Axle Hole Indicators (0.5mm indented into outer walls)
        translate([-width/2 + 0.5, motor_y, shaft_z + 6]) rotate([90, 0, -90]) 
            linear_extrude(1) text("v AXLE v", size=4, halign="center", font="Liberation Sans:style=Bold");
        translate([width/2 - 0.5, motor_y, shaft_z + 6]) rotate([90, 0, 90]) 
            linear_extrude(1) text("v AXLE v", size=4, halign="center", font="Liberation Sans:style=Bold");
    }
}


module base_shell() {
    difference() {
        union() {
            // Outer Body
            translate([0, 0, height/2]) cube([width, length, height], center=true);
            
            // Internal Wall Thickeners (Merged here to prevent zero-thickness face errors)
            translate([-width/2 + wall_t - 0.1, -length/2 + wall_t, floor_z])
                cube([6.4 + 0.1, length - 2*wall_t, height - floor_z]);
            translate([width/2 - wall_t - 6.4, -length/2 + wall_t, floor_z])
                cube([6.4 + 0.1, length - 2*wall_t, height - floor_z]);
        }
        
        // Inner Volume (starts precisely at Z=4.8 to leave 1.6mm floor above the 3.2mm cavity)
        translate([0, 0, floor_z + height/2]) 
            cube([width - 2*wall_t, length - 2*wall_t, height], center=true);
            
        // Bottom Lego Cavity
        translate([0, 0, 3.2/2 - 0.1]) 
            cube([width - 2.4, length - 2.4, 3.2 + 0.2], center=true);
            
        // Rear Wall Cutaway for Sliding Lid (Open at the top to prevent a fragile 1.6mm bridge)
        translate([0, length/2, height - 1.6])
            cube([83.5, 5, 10], center=true); 
            
        // Inner Side Grooves for Lid Rails (Z=44.8 to 46.4)
        translate([0, 0, 45.6])
            cube([83.4, length + 2, 1.8], center=true);
    }
    
    // Bottom Lego Receiving Tubes
    start_x = - (box_w_lu * lego_pitch) / 2 + 4;
    start_y = - (box_l_lu * lego_pitch) / 2 + 4;
    for (i = [1 : box_w_lu - 1]) {
        for (j = [1 : box_l_lu - 1]) {
            translate([start_x + i * lego_pitch, start_y + j * lego_pitch, 0])
            difference() {
                // Extended into the floor slightly to guarantee valid CGAL union
                cylinder(d=6.51, h=3.3);
                translate([0,0,-0.1]) cylinder(d=4.8, h=3.5);
            }
        }
    }
}


module esp32_snap_tray() {
    // Zero-screw friction-fit mount with massive bottom wire gap
    translate([0, -45, floor_z]) {
        for (dx = [-10.7, 10.7]) {
            for (dy = [-15.15, 15.15]) {
                translate([dx, dy, 0]) {
                    cylinder(d=4, h=4); // Standoff
                    cylinder(d=1.8, h=5.6); // Locating pin
                }
            }
        }
        // Flexible locking hooks
        for (dx = [-12.7, 12.7]) {
            translate([dx + (dx>0 ? 0.5 : -2.5), -5, 0]) {
                cube([2, 10, 6.5]); // Upright flex arm
                translate([dx>0 ? -1 : 1, 0, 5.5]) cube([2, 10, 1]); // Snap lip
            }
        }
    }
}


module uln2003_flat_tray(x, y) {
    // Flat toolless snap-tray for perfect wire routing straight to motors and ESP32
    translate([x, y, floor_z]) {
        // Corner standoffs to clear bottom solder joints
        for(dx=[-17.5, 17.5]) {
            for(dy=[-16, 16]) {
                translate([dx + (dx<0?3:-3), dy + (dy<0?3:-3), 0]) cylinder(d=5, h=2);
            }
        }
        // Flexible locking hooks along the X edges
        for(dx=[-17.5, 17.5]) {
            translate([dx + (dx>0 ? 0.5 : -2.5), -10, 0]) {
                cube([2, 20, 5.5]); // Upright flex arm
                translate([dx>0 ? -1 : 1, 0, 4.5]) cube([2, 20, 1]); // Snap lip
            }
        }
        // End stops to prevent Y-axis sliding
        translate([-10, 16, 0]) cube([20, 2, 4]);
        translate([-10, -18, 0]) cube([20, 2, 4]);
    }
}


module motor_bays() {
    // Left Horizontal Cradle (Supports the motor body, leaves massive gap for cable)
    difference() {
        translate([-40, motor_y - 14, floor_z]) cube([15, 28, motor_z - floor_z]);
        translate([-45, motor_y, motor_z]) rotate([0, 90, 0]) cylinder(d=28.5, h=25);
        translate([-45, motor_y - 8, floor_z - 1]) cube([25, 16, motor_z]);
    }
    
    // Right Horizontal Cradle
    difference() {
        translate([25, motor_y - 14, floor_z]) cube([15, 28, motor_z - floor_z]);
        translate([20, motor_y, motor_z]) rotate([0, 90, 0]) cylinder(d=28.5, h=25);
        translate([20, motor_y - 8, floor_z - 1]) cube([25, 16, motor_z]);
    }
}


// Color applied for individual render view
color("#2c3e50") vehicle_base();
