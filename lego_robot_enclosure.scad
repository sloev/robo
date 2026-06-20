/* 
 * Parametric Lego-Compatible Enclosure for ESP32-S2 & 28BYJ-48
 * A completely self-contained OpenSCAD script.
 */

$fn = 60;

// --- LEGO & ENCLOSURE PARAMETERS ---
lego_pitch = 8.0;
lego_height = 9.6;
wall_thickness = 1.6;

// Box Outer Dimensions in Lego Units
box_width_lu = 12;  // 12 * 8 = 96.0 mm (Outer Width)
box_length_lu = 16; // 16 * 8 = 128.0 mm (Outer Length)
box_height_lh = 5;  // 5 * 9.6 = 48.0 mm (Outer Height)

box_width = box_width_lu * lego_pitch;
box_length = box_length_lu * lego_pitch;
box_height = box_height_lh * lego_height;

lid_thickness = 3.2; // Standard Lego plate thickness
base_height = box_height - lid_thickness;

inner_width = box_width - 2 * wall_thickness;
inner_length = box_length - 2 * wall_thickness;
floor_z = 4.8; // 3.2mm Lego tube basement + 1.6mm floor plate

// --- INTERNAL COMPONENT POSITIONS ---
esp32_y = -45.25;
uln_y = -4;
motor_y = 44;
shaft_z = 27;

// --- RENDER SELECTION ---
// Change this variable to render specific parts: "all", "base", "lid", "couplers"
part_to_render = "all"; 

if (part_to_render == "all") {
    enclosure_base();
    translate([0, 0, base_height + 15]) enclosure_lid();
    translate([-65, motor_y, 0]) motor_coupler();
    translate([65, motor_y, 0]) motor_coupler();
} else if (part_to_render == "base") {
    enclosure_base();
} else if (part_to_render == "lid") {
    enclosure_lid();
} else if (part_to_render == "couplers") {
    motor_coupler();
    translate([0, 20, 0]) motor_coupler();
}

// --- MODULES ---

module enclosure_base() {
    difference() {
        union() {
            base_shell();
            esp32_mount();
            uln2003_mount(-23, uln_y);
            uln2003_mount(23, uln_y);
            motor_bays();
            coupler_tracks();
            corner_pillars();
        }
        
        // Left wall U-slot cutout for Motor A Shaft
        translate([-box_width/2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=9.0, h=10, center=true);
            translate([0, 0, 15]) cube([10, 9.0, 30], center=true);
        }
        
        // Right wall U-slot cutout for Motor B Shaft
        translate([box_width/2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=9.0, h=10, center=true);
            translate([0, 0, 15]) cube([10, 9.0, 30], center=true);
        }
        
        // USB-C Pass-through Cutout (Flush with ESP32-S2 Mini)
        // 10mm x 4mm opening at exactly the USB port's Z-height
        translate([0, -box_length/2, 12.4])
            cube([10, 5, 4], center=true);
    }
}

module base_shell() {
    difference() {
        // Outer Main Block
        translate([-box_width/2, -box_length/2, 0])
            cube([box_width, box_length, base_height]);
            
        // Inner Cavity (stops at floor_z to leave the floor intact)
        translate([-inner_width/2, -inner_length/2, floor_z])
            cube([inner_width, inner_length, base_height]);
            
        // Bottom Female Lego Cavity
        translate([-(box_width - 2.4)/2, -(box_length - 2.4)/2, -0.1])
            cube([box_width - 2.4, box_length - 2.4, 3.2 + 0.1]);
    }
    
    // Bottom Female Lego Tubes
    start_x = - (box_width_lu * lego_pitch) / 2 + 4;
    start_y = - (box_length_lu * lego_pitch) / 2 + 4;
    for (i = [1 : box_width_lu - 1]) {
        for (j = [1 : box_length_lu - 1]) {
            translate([start_x + i * lego_pitch, start_y + j * lego_pitch, 0])
            difference() {
                cylinder(d=6.51, h=3.2); // Tube outer diameter
                translate([0,0,-0.1]) cylinder(d=4.8, h=3.4); // Tube inner diameter
            }
        }
    }
}

module esp32_mount() {
    translate([0, esp32_y, floor_z]) {
        // Protective Tray Frame / Basement Wall
        difference() {
            translate([0, 0, 3.5]) cube([25.4 + 4, 34.3 + 4, 7], center=true);
            translate([0, 0, 3.5]) cube([25.4 + 0.5, 34.3 + 0.5, 8], center=true);
            // Wide wire routing exit portal in the back wall
            translate([0, 15, 3.5]) cube([15, 10, 8], center=true);
        }
        
        // 4x Elevated Standoff Pegs
        for (dx = [-10.7, 10.7]) {
            for (dy = [-15.15, 15.15]) {
                translate([dx, dy, 0]) {
                    cylinder(d=4, h=4);   // 4mm tall standoff
                    cylinder(d=1.8, h=6); // 2mm locating pin for board holes
                }
            }
        }
    }
}

module uln2003_mount(x_pos, y_pos) {
    translate([x_pos, y_pos, floor_z]) {
        // 4x Screw Pillars per board
        for (dx = [-15, 15]) {
            for (dy = [-13.5, 13.5]) {
                translate([dx, dy, 0]) {
                    difference() {
                        cylinder(d=5, h=4);
                        translate([0,0,1]) cylinder(d=2.0, h=4); // Pilot hole
                    }
                }
            }
        }
    }
}

module motor_bays() {
    // Left Motor (Motor A)
    translate([-23, motor_y - 17.5, floor_z]) 
        difference() { cylinder(d=8, h=19-floor_z); translate([0,0,10]) cylinder(d=2.5, h=20); }
    translate([-23, motor_y + 17.5, floor_z]) 
        difference() { cylinder(d=8, h=19-floor_z); translate([0,0,10]) cylinder(d=2.5, h=20); }
    difference() { // Body Cradle
        translate([-25, motor_y - 10, floor_z]) cube([19, 20, 19 - floor_z]);
        translate([-25-1, motor_y, 19]) rotate([0, 90, 0]) cylinder(d=28.5, h=21);
    }
    
    // Right Motor (Motor B)
    translate([23, motor_y - 17.5, floor_z]) 
        difference() { cylinder(d=8, h=19-floor_z); translate([0,0,10]) cylinder(d=2.5, h=20); }
    translate([23, motor_y + 17.5, floor_z]) 
        difference() { cylinder(d=8, h=19-floor_z); translate([0,0,10]) cylinder(d=2.5, h=20); }
    difference() { // Body Cradle
        translate([6, motor_y - 10, floor_z]) cube([19, 20, 19 - floor_z]);
        translate([5, motor_y, 19]) rotate([0, 90, 0]) cylinder(d=28.5, h=21);
    }
}

module coupler_tracks() {
    // Left Captive Track Block
    translate([-43, motor_y, floor_z]) {
        difference() {
            translate([-5, -8, 0]) cube([10, 16, base_height - floor_z]);
            translate([0, 0, shaft_z - floor_z]) {
                // Shaft track
                rotate([0, 90, 0]) cylinder(d=8.5, h=12, center=true);
                translate([0, 0, 15]) cube([12, 8.5, 30], center=true);
                // Flange captive groove
                rotate([0, 90, 0]) cylinder(d=12.5, h=3.5, center=true);
                translate([0, 0, 15]) cube([3.5, 12.5, 30], center=true);
            }
        }
    }
    
    // Right Captive Track Block
    translate([43, motor_y, floor_z]) {
        difference() {
            translate([-5, -8, 0]) cube([10, 16, base_height - floor_z]);
            translate([0, 0, shaft_z - floor_z]) {
                // Shaft track
                rotate([0, 90, 0]) cylinder(d=8.5, h=12, center=true);
                translate([0, 0, 15]) cube([12, 8.5, 30], center=true);
                // Flange captive groove
                rotate([0, 90, 0]) cylinder(d=12.5, h=3.5, center=true);
                translate([0, 0, 15]) cube([3.5, 12.5, 30], center=true);
            }
        }
    }
}

module corner_pillars() {
    for (x = [-inner_width/2 + 4, inner_width/2 - 4]) {
        for (y = [-inner_length/2 + 4, inner_length/2 - 4]) {
            translate([x, y, floor_z])
                difference() {
                    cylinder(d=6, h=base_height - floor_z);
                    cylinder(d=2.5, h=base_height - floor_z + 1); // Lid screw holes
                }
        }
    }
}

module enclosure_lid() {
    difference() {
        union() {
            // Main Flat Top
            translate([0, 0, lid_thickness/2])
                cube([box_width, box_length, lid_thickness], center=true);
                
            // Interlocking Inner Lip
            translate([0, 0, -1])
                cube([inner_width - 0.4, inner_length - 0.4, 2], center=true);
                
            // Top Lego Studs
            start_x = - (box_width_lu * lego_pitch) / 2 + 4;
            start_y = - (box_length_lu * lego_pitch) / 2 + 4;
            for (i = [0 : box_width_lu - 1]) {
                for (j = [0 : box_length_lu - 1]) {
                    translate([start_x + i * lego_pitch, start_y + j * lego_pitch, lid_thickness])
                        cylinder(d=4.8, h=1.8);
                }
            }
        }
        
        // Countersunk Corner Screw Holes
        for (x = [-inner_width/2 + 4, inner_width/2 - 4]) {
            for (y = [-inner_length/2 + 4, inner_length/2 - 4]) {
                translate([x, y, -3]) cylinder(d=3.2, h=10);
                translate([x, y, 1.5]) cylinder(d=6, h=10); 
            }
        }
    }
}

module motor_coupler() {
    difference() {
        union() {
            // Main Coupler Shaft
            rotate([0, 90, 0]) cylinder(d=8, h=15, center=true);
            // Captive Flange Collar
            rotate([0, 90, 0]) cylinder(d=12, h=3, center=true);
        }
        
        // 28BYJ-48 Flat-Sided Receiver Hole
        translate([3.5, 0, 0])
        difference() {
            rotate([0, 90, 0]) cylinder(d=5.2, h=9, center=true); // 0.2mm tolerance
            // Parallel flats 3.0mm apart
            translate([0, 2.5, 0]) cube([10, 2, 6], center=true);
            translate([0, -2.5, 0]) cube([10, 2, 6], center=true);
        }
        
        // Lego Technic Axle Cross Hole
        translate([-4, 0, 0]) {
            rotate([0, 90, 0]) {
                cube([5.1, 1.8, 10], center=true); // 0.3mm tolerance for easy fit
                cube([1.8, 5.1, 10], center=true);
            }
        }
    }
}
