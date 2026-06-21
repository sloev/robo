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
            translate([83.4/2, length/2 - 5, 45.6]) sphere(d=1);
            translate([-83.4/2, length/2 - 5, 45.6]) sphere(d=1);
            
            // Security screw anchor block at the rear
            translate([-5, length/2 - 6, floor_z - 0.1])
                difference() {
                    cube([10, 6, height - floor_z + 0.1]);
                    translate([5, 3, height - floor_z - 10]) cylinder(d=2.5, h=15); // pilot hole
                }
                
            // Internal Assembly Instructions & Wire Routing Paths
            translate([0, motor_y - 22, floor_z - 0.1]) linear_extrude(0.7) text("1. 28BYJ-48 MOTORS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, 2, floor_z - 0.1]) linear_extrude(0.7) text("2. ULN2003 BOARDS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, -25, floor_z - 0.1]) linear_extrude(0.7) text("3. ESP32-S2 MINI", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            
            translate([0, 22, floor_z - 0.1]) linear_extrude(0.7) text("--- WIRES ---", size=3, halign="center");
            
            // --- AI Phone Holder: bottom V-rest + horizontal V-clamp ---
            // Pedestal across the front (the V-rest groove and the left-jaw rail
            // are cut from it in the CUTS section below).
            translate([0, length/2 + 12, 8]) cube([96, 24, 16], center=true);
            // Fixed RIGHT V-jaw: vertical post up to the chassis top with a
            // vertical V-notch cradling the phone's right edge. The notch runs
            // straight up (constant section) so it prints standing, no overhang.
            difference() {
                translate([43, length/2 + 12, (16 + height) / 2]) cube([10, 22, height - 16], center=true);
                translate([38, length/2 + 12, 15]) linear_extrude(height)
                    polygon([[6, 0], [0, -7], [0, 7]]);
            }
            // Strong elastic anchor on the right jaw's back (hidden behind phone)
            translate([40, length/2 + 3, height - 9]) rotate([90, 0, 0]) {
                cylinder(d=4.5, h=4);
                translate([0, 0, 3]) cylinder(d=8, h=1.5);
            }
        }
        
        // --- CENTRALIZED CUTS ---
        
        // Lego Technic Grid Holes through the (solid 8mm) side walls, on the true
        // LEGO grid: hole centres at 5.8 + n*9.6. We use the three rows that
        // clear the flat floor (>4.8) and the lid rail (<45.6): 15.4, 25.0, 34.6.
        // Each is Ø4.8 with a Ø6.2 x 0.9 bevel on both outer faces like a real
        // Technic brick. These replace the (removed) underside attachment.
        // Holes pierce the side WALLS ONLY (h=12), not the whole cavity, and are
        // skipped over the front motor-mount zone so the wall stays solid for the
        // coupler pocket + motor screws.
        for (z = [15.4, 25.0, 34.6])
            for (y = [-60 : 8 : 60])
                if (y < motor_y - 22) {
                    translate([-44, y, z]) rotate([0, 90, 0]) cylinder(d=4.8, h=12, center=true);
                    translate([ 44, y, z]) rotate([0, 90, 0]) cylinder(d=4.8, h=12, center=true);
                    translate([-width/2, y, z]) rotate([0,  90, 0]) cylinder(d=6.2, h=0.9);
                    translate([ width/2, y, z]) rotate([0, -90, 0]) cylinder(d=6.2, h=0.9);
                }
        
        // Bottom V-rest groove: spans only the phone width (x -38..38) so the
        // phone's bottom edge drops into the V (self-centres any thickness),
        // leaving the outboard pedestal solid for the jaw rails. Opens upward
        // (prints with no support).
        translate([-38, length/2 + 12, 16]) rotate([0, 90, 0])
            linear_extrude(76) polygon([[9, 0], [0, -9], [0, 9]]);
        // Left-jaw slide rail: an outboard open-top channel in the pedestal top
        // (x -49..-37) that the adjustable jaw's foot slides along in X.
        translate([-49, length/2 + 3, 8]) cube([12, 20, 9]);
        
        // USB-C Pass-through
        translate([0, -length/2, 12.4]) cube([12, 6, 5], center=true);
        
        // Motor coupler sockets + screw pilots (both side walls). Each wall gets:
        //  - a Ø12.5 circular pocket in the inner face the coupler's Ø12 ring
        //    drops into,
        //  - a Ø8.5 hole through the rest of the wall for the coupler's Ø8 nose
        //    and the LEGO axle (the Ø12 ring can't pass it => captive),
        //  - two Ø2.5 pilots (ears 35mm apart) the motor screws into.
        // The motor mounts face-on to the wall; its shaft enters the coupler.
        for (s = [-1, 1]) {
            translate([s*40, motor_y, shaft_z]) rotate([0, s*90, 0]) cylinder(d=12.5, h=5.5);
            translate([s*40, motor_y, shaft_z]) rotate([0, s*90, 0]) cylinder(d=8.5, h=12);
            for (dy = [-17.5, 17.5])
                translate([s*40, motor_y + dy, motor_z]) rotate([0, s*90, 0]) cylinder(d=2.5, h=7);
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
        // Outer Body
        translate([0, 0, height/2]) cube([width, length, height], center=true);

        // Inner cavity. The long SIDE walls are a full LEGO unit (side_wall = 8mm)
        // thick, so the lid (79.6mm) slides into a real 1-unit wall and the
        // Technic holes / motor mounts sit in solid material. The end walls stay
        // thin (wall_t) to leave length for the motors and electronics.
        translate([0, 0, floor_z + height/2])
            cube([width - 2*side_wall, length - 2*wall_t, height], center=true);

        // (No bottom Lego cavity: a flat solid underside prints flat on the bed
        // with no support and a strong floor, instead of bridging a recess.)

        // Rear Wall Cutaway for Sliding Lid (open at the top to avoid a fragile bridge)
        translate([0, length/2, height - 1.6])
            cube([83.5, 5, 10], center=true);

        // Inner Side Grooves for Lid Rails (Z=44.8 to 46.4). Open at the front
        // for the lid to slide in, but stopped before the back (USB-C) wall so
        // it never cuts a slit through it -- the solid back wall is the lid stop.
        translate([0, 2.4, 45.6])
            cube([83.4, length - 1.2, 1.8], center=true);
    }
}


module esp32_snap_tray() {
    // Zero-screw friction-fit mount with massive bottom wire gap
    translate([0, -45, floor_z - 0.1]) {
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
    translate([x, y, floor_z - 0.1]) {
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
    // Wall-mounted cradles: each 28BYJ-48 mounts face-on to the inner wall (ears
    // screwed into the wall pilots) with its body centred at x=±30.5, supported
    // in a Ø28.5 trough. The cradle block is fused to the side wall and widened
    // in Y for strength, and open at the top to drop the motor in.
    for (s = [-1, 1]) {
        difference() {
            translate([s * 31, motor_y, (floor_z + motor_z) / 2 - 0.05])
                cube([34, 32, motor_z - floor_z + 0.1], center=true);
            translate([s * 30.5, motor_y, motor_z]) rotate([0, 90, 0])
                cylinder(d=28.5, h=24, center=true);
            translate([s * 30.5, motor_y, motor_z + 9])
                cube([30, 19, 18], center=true);
        }
    }
}


// Color applied for individual render view
color("#5b9bd5") vehicle_base();
