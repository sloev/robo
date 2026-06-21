include <lego_robot_common.scad>

// Adjustable LEFT V-jaw of the horizontal phone clamp. It slides in X along the
// pedestal rail and is pulled inward by an elastic band hooked between its rear
// peg and the fixed right jaw's rear peg (behind the phone, hidden). The V-notch
// grips the phone's left edge for any thickness; it mirrors the fixed right jaw.
// Prints standing on its foot with no support (vertical notch, flat foot).
module phone_clamp_jaw() {
    difference() {
        union() {
            // Jaw post up to the chassis top
            translate([-43, length/2 + 12, (16 + height) / 2]) cube([10, 22, height - 16], center=true);
            // Foot that rides the pedestal rail (slides in X)
            translate([-43, length/2 + 12, 12.5]) cube([11, 18, 8], center=true);
        }
        // V-notch facing +X (toward the phone), mirror of the right jaw
        translate([-38, length/2 + 12, 15]) linear_extrude(height)
            polygon([[-6, 0], [0, -7], [0, 7]]);
    }
    // Strong elastic anchor peg on the back (hidden behind the phone)
    translate([-40, length/2 + 3, height - 9]) rotate([90, 0, 0]) {
        cylinder(d=4.5, h=4);
        translate([0, 0, 3]) cylinder(d=8, h=1.5);
    }
}

color("#27ae60") phone_clamp_jaw();
