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
            
            // --- AI Phone Holder: phone stands IN FRONT of the chassis front wall ---
            // A thick CLAMP-WALL protrudes forward and carries a horizontal T-slot
            // rail (cut below). The phone leans on the wall's front face, bottom
            // edge in the V-lip; the two jaws ride the rail and grip the side
            // edges; the rubber band is BEHIND, in the cavity, on accessible posts.
            translate([0, length/2 + 4, 18]) cube([96, 8, 36], center=true);   // clamp-wall y48-56, z0-36
            // V-lip shelf in front; the phone's bottom edge sits in its V-groove (cut below)
            translate([0, length/2 + 13, 4]) cube([92, 16, 8], center=true);   // shelf y57-69, z0-8
            // Fixed RIGHT jaw: a finger in front of the wall whose V-notch grips
            // the phone's right edge (the phone leans on the wall at y56).
            difference() {
                translate([40, length/2 + 12, 22]) cube([10, 18, 28], center=true);  // y56-66, z8-36
                translate([0, length/2 + 12, 7]) linear_extrude(34)
                    polygon([[42, 0], [36, -6], [36, 6]]);
            }
            // Accessible band post (fixed end), BEHIND the wall in the cavity, at
            // the rail height so the band pulls in-line (no jam). Band hooks here
            // and on the moving jaw's matching peg.
            translate([40, length/2 - 4, 26]) rotate([90, 0, 0]) {
                cylinder(d=4, h=3);
                translate([0, 0, 2.5]) cylinder(d=7, h=1.5);
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
        
        // V-lip groove in the shelf top: the phone's bottom edge drops into the V
        // (narrowing in Y, self-centres any thickness). Opens upward (no support).
        translate([-40, length/2 + 13, 8]) rotate([0, 90, 0])
            linear_extrude(80) polygon([[7, 0], [0, -7], [0, 7]]);
        // Horizontal rail: a slot straight THROUGH the clamp-wall at z23-29. The
        // jaws' tongues ride in it (captured vertically by the slot, free to slide
        // in X). It runs the full width plus past the left side so the moving jaw
        // can telescope out. The fixed jaw side (x>10) is left solid.
        translate([-100, length/2, 23]) cube([110, 12, 6]);
        
        // USB-C Pass-through (aligned with the ESP32's USB-C edge at the back)
        translate([0, -length/2, 9.5]) cube([13, 8, 7], center=true);
        
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
    // ESP32-S2 Mini (25.4 x 34.3), snap-in on the floor at the BACK so its USB-C
    // edge lines up with the back-wall pass-through.
    translate([0, -29, floor_z - 0.1]) snap_pcb_mount(25.4, 34.3);
}


module uln_wall_mount_left() {
    // ULN2003 board stands flat against the LEFT inner wall (x=-40); it slides
    // down between two vertical ribs (at the board's Y-ends) onto a bottom ledge.
    // Components face the cavity. Mirror this for the right wall. Prints with no
    // support (vertical ribs + flat ledge).
    uy = -16;   // board centre Y -- moved back so the motor's rear ear (y~8.5) has room
    for (ey = [uy - 18, uy + 18])                  // vertical guide ribs (Y retention)
        translate([-41, ey - 1.5, floor_z]) cube([12, 3, 34]);   // overlap the wall (-41)
    // bottom ledge the board rests on (Z retention)
    translate([-41, uy - 18, floor_z]) cube([12, 36, 2]);
    // Snap-in fingers (X retention): flexible cantilevers just inboard of the
    // board's inner face; the board slides down, flexes them out, then the lip
    // clicks over its top edge and holds it flat against the wall. They start at
    // the floor so they fuse to the ledge (one solid part).
    for (fy = [uy - 9, uy + 9])
        translate([-37.5, fy - 2.5, floor_z]) {
            cube([1.6, 5, 32]);                        // flexible finger (overlaps ledge)
            translate([-1.2, 0, 30]) cube([1.4, 5, 2]); // lip clicking over the board top
        }
}


module motor_bays() {
    // One SOLID half-tube cradle per motor. A block from the floor up to the body
    // axis has a Ø29 bore removing its upper half, leaving a smooth arc that
    // carries the round Ø28 body. It is open at the top (the motor drops straight
    // in) and does not cap the ends, so the motor then slides toward the wall to
    // seat its shaft in the coupler and is screwed to the wall through its ears.
    // The cradle top stops ~4mm BELOW the ear line (motor_z) so the motor can be
    // slid sideways into its coupler without the ears fouling the cradle.
    for (s = [-1, 1])
        difference() {
            translate([s * 30.5, motor_y, (floor_z + motor_z - 4) / 2])
                cube([20, 30, motor_z - floor_z - 4], center=true);
            translate([s * 30.5, motor_y, motor_z]) rotate([0, 90, 0])
                cylinder(d=29, h=24, center=true);
        }
}


// Color applied for individual render view
color("#5b9bd5") vehicle_base();
