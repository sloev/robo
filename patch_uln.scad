module uln2003_flat_tray(x, y) {
    translate([x, y, floor_z]) {
        for(dx=[-17.5, 17.5]) {
            for(dy=[-16, 16]) {
                translate([dx + (dx<0?3:-3), dy + (dy<0?3:-3), 0]) cylinder(d=5, h=2);
            }
        }
        for(dx=[-17.5, 17.5]) {
            translate([dx + (dx>0 ? 0.5 : -2.5), -10, 0]) {
                cube([2, 20, 5]); 
                translate([dx>0 ? -1 : 1, 0, 4]) cube([2, 20, 1]); 
            }
        }
        translate([-10, 16, 0]) cube([20, 2, 4]);
        translate([-10, -18, 0]) cube([20, 2, 4]);
    }
}
