include <lego_robot_common.scad>

// Adjustable LEFT V-jaw of the horizontal phone clamp. Its foot slides in X along
// the pedestal rail; an elastic band hooked between its rear peg and the fixed
// right jaw's rear peg (behind the phone) pulls it inward to clamp. The V-notch
// is a constant-section vertical prism (mirror of the fixed jaw) so it grips the
// phone's left edge without resting the phone on a ledge -- the bottom V-rest
// carries the weight. Prints standing on the foot, no support.
module phone_clamp_jaw() {
    cy = length / 2 + 12;
    difference() {
        union() {
            translate([-41, cy, (14 + height) / 2]) cube([10, 14, height - 14], center=true);  // jaw post
            translate([-41, cy, 12]) cube([9, 17, 8], center=true);                            // rail foot
        }
        // V-notch (mirror of the fixed jaw) gripping the phone's left edge
        translate([0, cy, 13]) linear_extrude(height) polygon([[-42, 0], [-36, -6], [-36, 6]]);
    }
    // rear elastic peg (matches the fixed jaw's; the band runs behind the phone)
    translate([-41, cy - 7, height - 11]) rotate([90, 0, 0]) {
        cylinder(d=4.5, h=4);
        translate([0, 0, 3]) cylinder(d=8, h=1.5);
    }
}

color("#27ae60") phone_clamp_jaw();
