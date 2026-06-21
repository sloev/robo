include <lego_robot_common.scad>

// Adjustable LEFT V-jaw of the horizontal phone clamp.
//
// HOW IT WORKS (mirror of the fixed right jaw, which is part of the chassis):
//  * The jaw's T-FOOT is captured in the pedestal's T-slot rail and can only
//    slide left-right (X) -- that's how it is attached to the chassis and how it
//    adjusts to different phone widths.
//  * A rubber band hooks on this jaw's rear peg and on the fixed jaw's rear peg
//    (both behind the phone) and pulls the two jaws together -> the squeeze.
//  * The vertical V-notch grips the phone's side edge for any thickness; the
//    bottom V-rest carries the weight, so this jaw only needs to squeeze.
// Prints standing on the foot, no support.
module phone_clamp_jaw() {
    cy = length / 2 + 12;
    difference() {
        union() {
            // Grip post: reaches inboard over the V-rest to grip the phone edge.
            translate([-41.5, cy, (14 + height) / 2]) cube([9, 14, height - 14], center=true);
            // T-foot captured in the pedestal rail (wide base + neck), slides in X.
            translate([-43.5, cy, 10])   cube([8, 9, 4], center=true);   // wide base (z8..12)
            translate([-43.5, cy, 13.2]) cube([8, 4.4, 3.6], center=true); // neck up to the post
        }
        // V-notch: mouth at x=-37 (the phone's left edge), apex inside the post.
        translate([0, cy, 13]) linear_extrude(height) polygon([[-43, 0], [-37, -6], [-37, 6]]);
    }
    // Rear elastic hook (band runs straight across the back to the fixed jaw).
    translate([-42, cy - 4, 26]) rotate([90, 0, 0]) {
        cylinder(d=4, h=5);
        translate([0, 0, 4]) cylinder(d=7, h=1.5);
    }
}

color("#27ae60") phone_clamp_jaw();
