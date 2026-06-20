# 🛠️ BlockBot General Assembly Instructions

Welcome to the general assembly guide for BlockBot! This guide covers the core physical build.

## Prerequisites
1. Ensure you have downloaded the `vehicle_models.zip` from the repository.
2. 3D Print all parts (`vehicle_base.stl`, `vehicle_lid.stl`, `vehicle_couplers.stl`, `vehicle_phone_clamp.stl`) without supports.
3. Gather your electronics: ESP32-S2 Mini, two ULN2003 drivers, two 28BYJ-48 stepper motors, and a USB power bank.

## Step 1: Chassis Base & Motors
1. Slide your two 28BYJ-48 stepper motors into the internal `motor_bays` of the `vehicle_base` part. The wires should point upwards or inwards.
2. The motor mounting holes align with the tiny friction pegs inside the base. Press them firmly into place.
3. Attach the 3D-printed `vehicle_couplers` onto the flattened stepper motor shafts protruding from the sides.
4. Push standard Technic axles into the couplers, and attach your desired wheels or tracks!

## Step 2: Electronics Placement
1. Place the ESP32-S2 Mini into the `esp32_snap_tray` on the top deck of the chassis base. It will friction-snap in.
2. Place the two ULN2003 driver boards into the `uln2003_flat_tray` slots.
3. Wire the components according to the diagram in the [README.md](README.md). (Remember the 1000uF capacitor if using a single power supply!).

## Step 3: Sliding Lid
1. Once all wires are tucked in securely, take the `vehicle_lid` piece.
2. Align it with the top rails of the `vehicle_base`.
3. Slide it forward until it is completely flush and closes the enclosure. The top of the lid has Lego-compatible studs for further building!

## Step 4: Portrait Phone Clamp (For AI Autonomy)
If you want to use the Autonomous AI Car mode:
1. Rest the bottom edge of your smartphone on the ultra-thin lip located at the front-bottom of the chassis base.
2. Place the small `vehicle_phone_clamp` jaw piece over the top edge of your phone.
3. Hook a rubber band onto the tiny peg on the left side of the jaw, stretch it down, and hook it onto the peg on the left side of the chassis base. Repeat for the right side.
4. The tension will firmly hold your phone vertically against the front wall of the robot!
