include <lego_robot_common.scad>

module vehicle_base() {
    difference() {
        union() {
            base_shell();
            esp32_snap_tray();
            uln_wall_mount_left();
            mirror([1, 0, 0]) uln_wall_mount_left();
            motor_bays();

            // Friction detent bumps for the sliding lid
            translate([83.4/2, length/2 - 5, lid_z]) sphere(d=1);
            translate([-83.4/2, length/2 - 5, lid_z]) sphere(d=1);
            
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
        
        // Lego Technic holes on the grid (5.8 + n*9.6), through the side WALLS
        // ONLY (h=12), Ø4.8 + Ø6.2x0.9 outer bevel. The top row (44.2) clears the
        // wall-mounted ULN boards (board top ~36); the lower rows are kept only
        // in the rear, behind the boards. The front motor zone stays solid.
        for (y = [-44 : 8 : 44]) {
            zs = (y < -30)            ? [15.4, 25.0, 34.6, 44.2]
               : (y < motor_y - 18)   ? [44.2]
               :                        [];
            for (z = zs) {
                translate([-44, y, z]) rotate([0, 90, 0]) cylinder(d=4.8, h=12, center=true);
                translate([ 44, y, z]) rotate([0, 90, 0]) cylinder(d=4.8, h=12, center=true);
                translate([-width/2, y, z]) rotate([0,  90, 0]) cylinder(d=6.2, h=0.9);
                translate([ width/2, y, z]) rotate([0, -90, 0]) cylinder(d=6.2, h=0.9);
            }
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
        translate([0, 2.4, lid_z])
            cube([83.4, length - 1.2, 1.8], center=true);
    }
}


// Reusable snap-in PCB mount: corner standoffs (clearance for bottom solder) +
// flexible cantilever snap hooks centred on each edge whose lip clicks over the
// board top. The board just presses in -- no screws. Prints support-free (the
// hook lip's small overhang bridges fine at this scale).
module snap_pcb_mount(bw, bl, so = 3.5, th = 1.6) {
    // corner standoffs
    for (sx = [-1, 1]) for (sy = [-1, 1])
        translate([sx*(bw/2 - 3), sy*(bl/2 - 3), 0]) cylinder(d=4.5, h=so);
    // snap hooks on the two long (±Y) edges
    for (sy = [-1, 1])
        translate([0, sy*(bl/2 + 0.3), 0]) {
            translate([-4, sy*0.2, 0]) cube([8, 1.6, so + th + 1.8]);            // flex arm
            translate([-4, (sy>0 ? -1.0 : 0.2), so + th]) cube([8, 1.8, 1.4]);   // lip over the board
        }
    // snap hooks on the two short (±X) edges
    for (sx = [-1, 1])
        translate([sx*(bw/2 + 0.3), 0, 0]) {
            translate([sx*0.2, -4, 0]) cube([1.6, 8, so + th + 1.8]);
            translate([(sx>0 ? -1.0 : 0.2), -4, so + th]) cube([1.8, 8, 1.4]);
        }
}

module esp32_snap_tray() {
    // ESP32-S2 Mini (25.4 x 34.3), snap-in on the floor between the wall ULN boards.
    translate([0, -10, floor_z - 0.1]) snap_pcb_mount(25.4, 34.3);
}


module uln_wall_mount_left() {
    // ULN2003 board stands flat against the LEFT inner wall (x=-40); it slides
    // down between two vertical ribs (at the board's Y-ends) onto a bottom ledge.
    // Components face the cavity. Mirror this for the right wall. Prints with no
    // support (vertical ribs + flat ledge).
    uy = -10;   // board centre Y
    for (ey = [uy - 18, uy + 18])                  // vertical guide ribs (Y retention)
        translate([-40, ey - 1.5, floor_z]) cube([11, 3, 34]);
    // bottom ledge the board rests on (Z retention)
    translate([-40, uy - 18, floor_z]) cube([11, 36, 2]);
    // top snap lip just inboard of the board's inner face: the board clicks past
    // it and is held flat against the wall (X retention).
    translate([-38, uy - 17, floor_z + 30]) cube([1.5, 34, 2]);
}


module motor_bays() {
    // Open saddle ribs that ONLY support the motor body from below -- they do not
    // enclose it, so the motor can be dropped in and slid toward the wall to seat
    // its shaft in the already-placed coupler, then fastened by screws through the
    // mounting ears into the wall pilots. Two Ø29 saddles per motor (open top and
    // open along X so insertion is never blocked).
    for (s = [-1, 1])
        for (rx = [s * 24, s * 37])
            difference() {
                translate([rx - 2, motor_y - 15, floor_z]) cube([4, 30, motor_z - floor_z + 13]);
                translate([rx, motor_y, motor_z]) rotate([0, 90, 0]) cylinder(d=29, h=10, center=true);
            }
}


// Color applied for individual render view
color("#5b9bd5") vehicle_base();
