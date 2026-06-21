/* 
 * Parametric Lego-Compatible Robotic Vehicle Enclosure
 * Completely self-contained OpenSCAD script.
 */

$fn = 60;

// --- LEGO & ENCLOSURE PARAMETERS ---
lego_pitch = 8.0;
lego_height = 9.6;
wall_t = 1.6;        // thin end walls (front/back) for electronics clearance
side_wall = 8.0;     // long side walls: a full LEGO unit so the lid seats and
                     // Technic holes/motor mounts sit in solid wall

// Outer Dimensions. Shorter + taller (reorg): the ULN2003 boards stand on the
// inner side walls and the ESP32 lies between them, so the floor needs less
// length; the extra height lets the phone clamp grip higher.
box_w_lu = 12; // 96.0 mm (Outer Width)
box_l_lu = 12; // 96.0 mm (Outer Length, shortened from 128)
box_h_lh = 6;  // 57.6 mm (Outer Height, raised from 48)

width = box_w_lu * lego_pitch;
length = box_l_lu * lego_pitch;
height = box_h_lh * lego_height;

lid_t = 3.2; // Sliding lid thickness
floor_z = 4.8; // 3.2mm Lego tube cavity + 1.6mm floor
lid_z = height - 2.4; // centre Z of the sliding-lid rail groove (just below top)

// --- ALIGNED INTERNAL POSITIONS ---
shaft_z = 33.6; // motor shaft / coupler height
motor_y = 30.0; // front, fits the shortened cavity
motor_z = shaft_z - 8.0;

// --- RENDER TARGET ---
