/* 
 * Parametric Lego-Compatible Robotic Vehicle Enclosure
 * Completely self-contained OpenSCAD script.
 */

$fn = 60;

// --- LEGO & ENCLOSURE PARAMETERS ---
lego_pitch = 8.0;
lego_height = 9.6;
wall_t = 1.6;

// Outer Dimensions
box_w_lu = 12; // 96.0 mm (Outer Width)
box_l_lu = 16; // 128.0 mm (Outer Length)
box_h_lh = 5;  // 48.0 mm (Outer Height)

width = box_w_lu * lego_pitch;
length = box_l_lu * lego_pitch;
height = box_h_lh * lego_height;

lid_t = 3.2; // Sliding lid thickness
floor_z = 4.8; // 3.2mm Lego tube cavity + 1.6mm floor

// --- ALIGNED INTERNAL POSITIONS ---
shaft_z = 33.6; // Precisely aligned with upper Technic hole grid
motor_y = 44.0; // Precisely aligned with Y-axis Lego grid
motor_z = shaft_z - 8.0;

// --- RENDER TARGET ---
