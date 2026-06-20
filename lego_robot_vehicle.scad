/* 
 * Parametric Lego-Compatible Robotic Vehicle Enclosure
 * Completely self-contained OpenSCAD script.
 */

$fn = 60;

// --- LEGO & ENCLOSURE PARAMETERS ---
lego_pitch = 8.0;
lego_height = 9.6;
wall_t = 1.6;

// Outer Dimensions
box_w_lu = 12; // 96.0 mm (Outer Width)
box_l_lu = 16; // 128.0 mm (Outer Length)
box_h_lh = 5;  // 48.0 mm (Outer Height)

width = box_w_lu * lego_pitch;
length = box_l_lu * lego_pitch;
height = box_h_lh * lego_height;

lid_t = 3.2; // Sliding lid thickness
floor_z = 4.8; // 3.2mm Lego tube cavity + 1.6mm floor

// --- ALIGNED INTERNAL POSITIONS ---
shaft_z = 33.6; // Precisely aligned with upper Technic hole grid
motor_y = 44.0; // Precisely aligned with Y-axis Lego grid
motor_z = shaft_z - 8.0;

// --- RENDER TARGET ---
// Pass via CLI: -D 'part_to_render="base"'
part_to_render = "all"; 

if (part_to_render == "all") {
    color("#2c3e50") vehicle_base();
    color("#e74c3c") translate([0, 0, height + 20]) sliding_lid(); // Hovering lid
    
    // Show couplers in their assembled positions
    color("#f1c40f") translate([-41.2, motor_y, shaft_z]) rotate([0, 90, 0]) motor_coupler();
    color("#f1c40f") translate([41.2, motor_y, shaft_z]) rotate([0, -90, 0]) motor_coupler();
    
    // Virtual Electronic Components (Only for "all" screenshot showcase)
    %showcase_electronics();
    
} else if (part_to_render == "base") {
    color("#2c3e50") vehicle_base();
} else if (part_to_render == "lid") {
    color("#e74c3c") sliding_lid();
} else if (part_to_render == "couplers") {
    color("#f1c40f") motor_coupler();
    color("#f1c40f") translate([0, 20, 0]) motor_coupler();
}


// --- MODULES ---

module vehicle_base() {
    difference() {
        union() {
            base_shell();
            esp32_snap_tray();
            uln2003_mount(-20, 2);
            uln2003_mount(20, 2);
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
            
            translate([0, -12, floor_z]) linear_extrude(0.6) text("--- WIRES ---", size=3, halign="center");
            translate([0, 22, floor_z]) linear_extrude(0.6) text("--- WIRES ---", size=3, halign="center");
        }
        
        // --- CENTRALIZED CUTS ---
        
        // Lego Technic Grid Holes (Pierces Outer Walls and Thickeners cleanly once)
        for (y = [-60 : 8 : 60]) {
            translate([0, y, 4.8]) rotate([0, 90, 0]) cylinder(d=4.8, h=width+10, center=true);
            translate([0, y, 33.6]) rotate([0, 90, 0]) cylinder(d=4.8, h=width+10, center=true);
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
            
        // Rear Wall Cutaway for Sliding Lid
        translate([0, length/2, height - 1.6])
            cube([83.5, 5, 3.2 + 0.1], center=true); 
            
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

module uln_rail(x, y, orient) {
    translate([x, y, floor_z]) {
        difference() {
            translate([-3, (orient==1 ? 0 : -4), 0]) cube([6, 4, 35]);
            // 1.6mm vertical PCB groove
            translate([-1.5, (orient==1 ? 1 : -2.6), 5]) cube([3, 1.6, 31]);
        }
        // Snap-fit tension ramp at the top
        translate([-1.5, (orient==1 ? 2 : -2), 35]) 
            rotate([orient==1 ? -45 : 45, 0, 0]) cube([3, 1, 2]);
    }
}

module uln2003_mount(x, y) {
    // 100% toolless friction slide tracks
    uln_rail(x, y + 16.2, -1);
    uln_rail(x, y - 16.2, 1);
}

module motor_bays() {
    // Left Rigid Motor Mount (Mirrored M3 ears)
    translate([-34, motor_y - 17.5, floor_z]) difference() { cylinder(d=8, h=motor_z-floor_z); translate([0,0,-1]) cylinder(d=2.8, h=30); }
    translate([-34, motor_y + 17.5, floor_z]) difference() { cylinder(d=8, h=motor_z-floor_z); translate([0,0,-1]) cylinder(d=2.8, h=30); }
    difference() {
        translate([-39, motor_y - 10, floor_z]) cube([15, 20, motor_z-floor_z]);
        translate([-41, motor_y, motor_z]) rotate([0, 90, 0]) cylinder(d=28.5, h=20);
    }
    
    // Right Rigid Motor Mount
    translate([34, motor_y - 17.5, floor_z]) difference() { cylinder(d=8, h=motor_z-floor_z); translate([0,0,-1]) cylinder(d=2.8, h=30); }
    translate([34, motor_y + 17.5, floor_z]) difference() { cylinder(d=8, h=motor_z-floor_z); translate([0,0,-1]) cylinder(d=2.8, h=30); }
    difference() {
        translate([24, motor_y - 10, floor_z]) cube([15, 20, motor_z-floor_z]);
        translate([21, motor_y, motor_z]) rotate([0, 90, 0]) cylinder(d=28.5, h=20);
    }
}

module sliding_lid() {
    // Centered relative to the actual internal span
    translate([0, 0.8, height - 1.6]) {
        difference() {
            union() {
                // Main lid
                cube([79.6, 126.4, 3.2], center=true);
                // Side guide tongues
                translate([0, 0, -0.8]) cube([83.0, 126.4, 1.4], center=true);
                
                // Top Studs (Shifted to perfectly align with global Lego Grid)
                // We limit width to 10 units since the lid fits inside the thick walls
                start_x = - ((box_w_lu - 2) * lego_pitch) / 2 + 4;
                start_y = - (box_l_lu * lego_pitch) / 2 + 4;
                for (i = [0 : box_w_lu - 3]) {
                    for (j = [0 : box_l_lu - 1]) {
                        translate([start_x + i*8, start_y + j*8 - 0.8, 1.6])
                            cylinder(d=4.8, h=1.8);
                    }
                }
            }
            // Security screw hole
            translate([0, 126.4/2 - 3, 0]) cylinder(d=3.2, h=10, center=true);
            translate([0, 126.4/2 - 3, 1.5]) cylinder(d=6, h=10);
            
            // Recessed detents for friction click-lock
            translate([83.0/2 - 1, 126.4/2 - 5, -0.8]) sphere(d=1);
            translate([-83.0/2 + 1, 126.4/2 - 5, -0.8]) sphere(d=1);
        }
    }
}

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
    
    // ULN2003 Driver Boards
    color("green") translate([-20, 2, floor_z + 17.5]) rotate([0, -90, 0]) cube([35, 32, 1.6], center=true);
    color("green") translate([20, 2, floor_z + 17.5]) rotate([0, 90, 0]) cube([35, 32, 1.6], center=true);
    
    // Highlight the Technic Axle insertion path
    color("red") translate([-50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
    color("red") translate([50, motor_y, shaft_z]) rotate([0, 90, 0]) cylinder(d=4.5, h=20, center=true);
}
