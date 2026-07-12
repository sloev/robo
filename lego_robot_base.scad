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
            
            // Internal Assembly Instructions & Wire Routing Paths
            translate([0, motor_y - 22, floor_z - 0.1]) linear_extrude(0.7) text("1. 28BYJ-48 MOTORS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, 2, floor_z - 0.1]) linear_extrude(0.7) text("2. ULN2003 BOARDS", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            translate([0, -25, floor_z - 0.1]) linear_extrude(0.7) text("3. ESP32-S2 MINI", size=3.5, halign="center", font="Liberation Sans:style=Bold");
            
            translate([0, 22, floor_z - 0.1]) linear_extrude(0.7) text("--- WIRES ---", size=3, halign="center");
            
            // --- AI Phone Holder: phone stands IN FRONT of the chassis front wall ---
            // Single wide cube: clamp-wall (x=-48..+48) fused
            // into one piece.
            // T-slot is milled into the front face (y=58). Moving jaw telescopes right.
            translate([0, length/2 + 5, 18]) cube([96, 10, 36], center=true); // x=-48..+48, y=48-58, z=0-36
            // V-lip shelf: phone bottom rests in V-groove (cut below). 6mm overlap into
            // wall (y=52..58) so there is no T-junction at the wall front face (y=58).
            translate([0, length/2 + 12, 4]) cube([92, 16, 8], center=true);     // shelf y52-68, z0-8
            // Fixed LEFT jaw: V-notch grips phone left edge; fused to wall.
            // Jaw front (y=69) is 1mm past shelf front (y=68) — no coplanar face.
            difference() {
                translate([-40, length/2 + 13.5, 21.5]) cube([10, 15, 29], center=true); // y54-69, z7-36
                // V-notch: tip at x=-42, base flush with inner jaw face x=-35 (no flat wall).
                // Tip pulled in from the finger's outer face (x=-45) to leave 3mm of backing
                // material instead of 1mm, and rounded (not a knife edge) so there's no sharp
                // stress-concentrating point right behind that thin material -- a sharp V here
                // both had barely any material behind it and was prone to snapping under a
                // side load from the phone.
                translate([0, length/2 + 14.5, 6]) linear_extrude(35)
                    rounded_notch_2d(tip_x = -42, base_x = -35, half_width = 4.5, r = 1.2);
            }
            // Band peg on jaw front face — fully visible, hooked before phone is inserted.
            // Peg base is 1mm inside jaw body (y=68 < jaw front y=69) — no T-junction.
            translate([-40, length/2 + 20, band_peg_z]) rotate([-90, 0, 0]) {
                cylinder(d=4, h=5);
                translate([0, 0, 3.5]) cylinder(d=7, h=1.5);
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
        
        // V-lip groove centred in shelf (y=60): phone bottom self-centres. Opens up.
        // Tip pulled up from 5mm deep to 4mm (leaves 4mm of shelf below the groove
        // instead of 3mm) and rounded instead of a knife edge, for the same reason
        // as the jaw V-notches: less material and a sharp stress point right where
        // the phone's weight presses down.
        translate([-46, length/2 + 12, 8]) rotate([0, 90, 0])
            linear_extrude(92) rounded_notch_2d(tip_x = 4, base_x = 0, half_width = 5, r = 1);
        // T-slot milled into front face of clamp-wall. Bounds come from
        // lego_robot_common.scad so the moving jaw's tongue (sized from the
        // same constants) can never drift out of sync with this cavity.
        // Neck (4mm deep from front face, 19mm tall): jaws slide freely in X.
        translate([slot_x0, length/2 + 6, slot_neck_z0])
            cube([slot_x1 - slot_x0, 4, slot_neck_z1 - slot_neck_z0]); // x=-10..+48, y=54-58, z=10-29
        // Undercut (3mm deeper, 25mm tall): T-flanges lock tongue — can't pull out in Y.
        translate([slot_x0, length/2 + 3, slot_uc_z0])
            cube([slot_x1 - slot_x0, 3, slot_uc_z1 - slot_uc_z0]);    // x=-10..+48, y=51-54, z=7-32
        
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
    uy = uln_uy;   // board centre Y -- moved back so the motor's rear ear (y~8.5) has room
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
    //
    // The motor is rolled shaft-down, which also swings its wire connector + lead
    // stubs to the UNDERSIDE (connector centred ~z=motor_z-13). A channel is cut
    // through the inboard-bottom corner of each cradle so the connector and harness
    // route toward the centre cavity (ULN boards) instead of jamming into the
    // cradle belly or the floor.
    for (s = [-1, 1])
        difference() {
            translate([s * 30.5, motor_y, (floor_z + motor_z - 4) / 2])
                cube([20, 30, motor_z - floor_z - 4], center=true);
            translate([s * 30.5, motor_y, motor_z]) rotate([0, 90, 0])
                cylinder(d=29, h=24, center=true);
            // Cable/connector relief: a channel through the cradle belly under the
            // body, over the connector's footprint (~x=s*28.5), opening inboard past
            // the cradle's inner face so the downward-facing connector (14.6w x 10d x
            // 6t) and lead stubs clear the belly and route out to the cavity. Kept
            // narrow in Y (motor_y +/- 7) so the cradle's front/back arc still carries
            // the round body.
            translate([s * 27.5, motor_y, floor_z + 3])
                cube([26, 14, 12], center=true);
        }
}


// Color applied for individual render view
color("#5b9bd5") vehicle_base();
