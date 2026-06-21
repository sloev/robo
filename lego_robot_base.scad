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
            
            // --- AI Phone Cradle (front of chassis) ---
            // Full-width front bumper: a flat, full-width back-rest the phone
            // leans against, with the clamp slider T-slot down its centre. (A
            // phone needs a flat surface across its whole width, not just the
            // 32mm track, or it rocks.)
            translate([0, length/2 + 4, 24]) cube([88, 8, 48], center=true);
            // Deep solid resting shelf, fused full-width to the bumper.
            translate([0, length/2 + 13, 3]) cube([88, 26, 6], center=true);
            // Front retaining lip set ~14mm forward of the back-rest so a real
            // phone (8-11mm, plus a case) actually fits in the slot.
            translate([0, length/2 + 24, 11]) cube([88, 4, 22], center=true);
            // Gusset webs bracing the shelf + lip back to the bumper.
            for (gx = [-42, -21, 0, 21, 42])
                translate([gx + 1.5, length/2 + 8, 5]) rotate([0, -90, 0])
                    linear_extrude(3) polygon([[0, 0], [18, 0], [0, 12]]);
            
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
        
        // Lego Technic Grid Holes through the (solid 8mm) side walls, on the true
        // LEGO grid: hole centres at 5.8 + n*9.6. We use the three rows that
        // clear the flat floor (>4.8) and the lid rail (<45.6): 15.4, 25.0, 34.6.
        // Each is Ø4.8 with a Ø6.2 x 0.9 bevel on both outer faces like a real
        // Technic brick. These replace the (removed) underside attachment.
        for (z = [15.4, 25.0, 34.6])
            for (y = [-60 : 8 : 60]) {
                translate([0, y, z]) rotate([0, 90, 0]) cylinder(d=4.8, h=width+10, center=true);
                translate([-width/2, y, z]) rotate([0,  90, 0]) cylinder(d=6.2, h=0.9);
                translate([ width/2, y, z]) rotate([0, -90, 0]) cylinder(d=6.2, h=0.9);
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
        
        // Left motor U-slot (in the thick wall). The Ø8.5 hole passes the
        // coupler's Ø8 axle nose out through the wall; the coupler's Ø12 ring
        // can't pass the Ø8.5 hole, so it stays captive in the cavity against the
        // inner wall face (no central flange groove needed for the new coupler).
        // The open-top cube is the drop slot for assembling the motor + coupler.
        translate([-41.2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=8.5, h=20, center=true);
            translate([0, 0, 15]) cube([11, 8.5, 30], center=true);
        }

        // Right motor U-slot
        translate([41.2, motor_y, shaft_z]) {
            rotate([0, 90, 0]) cylinder(d=8.5, h=20, center=true);
            translate([0, 0, 15]) cube([11, 8.5, 30], center=true);
        }
        
        // (Motor is friction-held in the cradle -- no wall screw holes needed.)

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
    // Friction cradles that hold each 28BYJ-48 body in the cavity so its shaft
    // plugs straight into the captive coupler at the wall (no screws). The body
    // is centred at x = ±17.5 (shaft ends inside, at the coupler's inboard flat-D
    // socket; only the coupler nose + LEGO axle use the Ø8.5 wall hole). The
    // Ø28.5 trough is open at the top to drop the motor in.
    for (s = [-1, 1]) {
        difference() {
            translate([s * 17.5, motor_y, (floor_z + motor_z) / 2 - 0.05])
                cube([28, 28, motor_z - floor_z + 0.1], center=true);
            translate([s * 17.5, motor_y, motor_z]) rotate([0, 90, 0])
                cylinder(d=28.5, h=32, center=true);
            translate([s * 17.5, motor_y, motor_z + 8])
                cube([34, 17, 16], center=true);
        }
    }
}


// Color applied for individual render view
color("#5b9bd5") vehicle_base();
