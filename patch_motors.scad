module motor_cradle(x_pos, y_pos, z_pos, orient) {
    difference() {
        translate([x_pos, y_pos - 14, floor_z]) cube([15, 28, z_pos - floor_z]);
        translate([x_pos - 5, y_pos, z_pos]) rotate([0, 90, 0]) cylinder(d=28.5, h=25);
        translate([x_pos - 5, y_pos - 8, floor_z - 1]) cube([25, 16, z_pos]);
    }
}
