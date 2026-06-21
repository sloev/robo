include <lego_robot_common.scad>

// Adjustable LEFT V-jaw of the horizontal phone clamp.
//
// The phone stands IN FRONT of the chassis front wall. This jaw:
//  * grips the phone's left side edge with a vertical V-notch (any thickness),
//  * rides a horizontal T-slot rail cut THROUGH the front clamp-wall via its
//    tongue -- it is held to the chassis and slides in X (adjusts to width and
//    telescopes out the side for loading),
//  * has a band peg in the gap BEHIND the wall (at the rail height) so a rubber
//    band, hooked to the fixed band post on the chassis, pulls it inward in-line
//    with the rail (so it can't cock/jam).
// Prints standing, no support.
module phone_clamp_jaw() {
    fy = length / 2;   // chassis front wall plane
    difference() {
        union() {
            // grip finger in front of the wall (y56-66 = the phone plane)
            translate([-40, fy + 12, 22]) cube([10, 18, 28], center=true);
            // tongue: rides the wall rail (z23-29), reaching back into the cavity gap
            translate([-40, fy + 2, 26]) cube([8, 16, 5.6], center=true);
        }
        // V-notch (mirror of the fixed jaw) grips the phone's left edge
        translate([0, fy + 12, 7]) linear_extrude(34) polygon([[-42, 0], [-36, -6], [-36, 6]]);
    }
    // Band peg behind the wall, in the gap in front of the motor (y>40), at rail
    // height (z26) so the band pull is in-line with the slide.
    translate([-40, fy - 4, 26]) rotate([90, 0, 0]) {
        cylinder(d=4, h=3);
        translate([0, 0, 2.5]) cylinder(d=7, h=1.5);
    }
}

color("#27ae60") phone_clamp_jaw();
