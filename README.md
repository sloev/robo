# ESP32-S2 Mini Robot Controller: Visual Kinematics Machine Learning Dashboard

This is an educational MicroPython project for the **ESP32-S2 Mini** board designed to control **28BYJ-48 stepper motors** via **ULN2003 driver boards**. 

It runs a fully self-contained Access Point (AP) with a **Captive Portal** DNS server. Any browser connecting to it will automatically redirect to a modern web-based control dashboard.

---

## 🖥️ Web User Interface in Action

Here is the control dashboard showing the visual block programming workspace, real-time camera tracking, Neural Network kinematics learning console, and dynamic vertical joystick overrides:

![Robo-Control Web UI in Action](screenshots/dashboard.jpg)

### Key UI Features:
1.  **🧩 Workflow Creator (Left Panel):** Drag-and-drop programming blocks with speed controls and custom conditional blocks based on camera vision tracking. It dynamically adapts its dropdown selectors based on the number of configured motors.
2.  **📷 Vision Sensor Color Tracker (Right Panel - Top):** Real-time client-side color blob centroid tracker with click-to-pick color selection.
3.  **🧠 Neural Network Learning Mode (Right Panel - Middle):** Self-calibrating gradient descent routine that learns motor kinematics on-the-fly to enable autonomous target following.
4.  **🕹️ Dynamic Joystick Manual Control (Right Panel - Bottom):** Throttled vertical joysticks with spring-back stop capabilities. The number of joysticks is automatically built based on the connected motors.

---

## 🛠️ Hardware Bill of Materials (BOM)

To build this robot, you will need the following components:

| Component | Quantity | Description | Estimated Cost |
| :--- | :---: | :--- | :---: |
| **ESP32-S2 Mini Development Board** | 1 | Microcontroller running MicroPython. Features a USB-C port, built-in Wi-Fi, and 5V pins connected to the USB rail. | $3.00 |
| **28BYJ-48 Stepper Motor (5V)** | 2+ | Standard, cheap 5-wire unipolar stepper motors. (Can scale to 3 or more motors). | $2.50 each |
| **ULN2003 Driver Board** | 2+ | Darlington transistor arrays used to amplify control signals from the ESP32. | $1.00 each |
| **Electrolytic Decoupling Capacitor** | 1 | **1000uF** (or **470uF**) rated at **10V or higher**. Crucial for smoothing current spikes from motors. | $0.20 |
| **USB Power Bank** | 1 | Standard phone charger power bank capable of delivering **at least 2.0A at 5V** via USB-C. | $10.00 |
| **Breadboard & Jumper Wires** | 1 set | For solderless prototyping. Female-to-Female and Male-to-Female jumpers. | $3.00 |
| **Perforated Board / Solderable Breadboard** | 1 | For final clean soldering assembly (optional but recommended). | $1.50 |

---

## 📂 3D Printing Guide

For a functional robot chassis, you can print standard components or mount them to a laser-cut base. Below are standard recommendations:

1.  **Differential Drive Rover Chassis:**
    *   Search Printables or Thingiverse for **"28BYJ-48 Stepper Chassis"** or use models like the [Mini 28BYJ-48 Stepper Rover on Printables](https://www.printables.com/model/59104-mini-stepper-motor-rover).
    *   Print a simple base plate, two motor holders, two snap-on wheels, and a front caster/slider wheel.
2.  **Phone Stand / Mount:**
    *   Since the phone sits elsewhere watching the robot's workspace, print a simple adjustable tripod phone stand like the [Universal Phone Stand on Thingiverse](https://www.thingiverse.com/thing:2123786) to position the phone camera pointing down at the workspace.
3.  **Print Settings:**
    *   **Material:** PLA or PETG.
    *   **Infill:** 15% to 20% Gyroid.
    *   **Walls/Perimeters:** 3 minimum for mechanical strength around the stepper mounts.

---

## 🔌 Electrical Wiring & Schematic

Yes! You can power both the ESP32-S2 Mini and the stepper motors from the **same USB power bank** using the board's **onboard 5V pin**. 

The **5V pin** on the ESP32-S2 Mini is directly connected to the USB-C port's `VBUS` power line. When you plug a USB power bank into the board's USB-C port, the 5V pin becomes a 5V power output. 

### ⚠️ Important Engineering Rules to Prevent Resets (Brownouts)
When stepper motors rotate, they draw pulsed current spikes. This can create voltage sags on the 5V rail that cause the ESP32 to reboot. To make this setup 100% stable:
1.  **Use a Decoupling Capacitor:** Connect the positive (+) lead of the **1000uF Electrolytic Capacitor** to the 5V rail, and the negative (-) lead to the GND rail.
2.  **Dedicated Power:** Plug the USB-C cable into a dedicated portable phone charger power bank. Avoid laptop USB ports which limit output to 500mA.

### 📊 Connection Table
Configure the motor pins by adjusting the `MOTOR_PINS` dictionary in `main.py`:

| Motor | ULN2003 Driver Pin | ESP32-S2 Mini GPIO |
| :---: | :---: | :---: |
| **Motor A (Left)** | IN1, IN2, IN3, IN4 | GP1, GP2, GP3, GP4 |
| **Motor B (Right)** | IN1, IN2, IN3, IN4 | GP5, GP7, GP9, GP11 |
| *(Aux)* **Motor C** | IN1, IN2, IN3, IN4 | GP12, GP13, GP14, GP16 *(configurable)* |

### 🔌 Schematic Diagram (ASCII Art)
```
                     +---------------------------------------+
                     |         USB-C POWER BANK (2A)         |
                     +---------------------------------------+
                                         |
                                         v  (Standard USB-C Cable)
                     +---------------------------------------+
                     |          ESP32-S2 MINI BOARD          |
                     |                                       |
                     | GP1  GP2  GP3  GP4   GP5  GP7  GP9  GP11|
                     +--+----+----+----+-----+----+----+----+--+
                        |    |    |    |     |    |    |    |
                        |    |    |    |     |    |    |    |
                        |    |    |    |     |    |    |    |
     +------------------+    |    |    |     |    |    |    |
     |  +--------------------+    |    |     |    |    |    |
     |  |  +----------------------+    |     |    |    |    |
     |  |  |  +------------------------+     |    |    |    |
     |  |  |  |                              |    |    |    |
     |  |  |  |      +-----------------------+    |    |    |
     |  |  |  |      |  +-------------------------+    |    |
     |  |  |  |      |  |  +---------------------------+    |
     |  |  |  |      |  |  |  +-----------------------------+
     |  |  |  |      |  |  |  |
  +--+--+--+--+--+   +--+--+--+--+--+
  | IN1 IN2 IN3 IN4  |   | IN1 IN2 IN3 IN4  |
  |                  |   |                  |
  |  DRIVER BOARD A  |   |  DRIVER BOARD B  |
  |  (LEFT MOTOR A)  |   | (RIGHT MOTOR B)  |
  |  VCC        GND  |   |  VCC        GND  |
  +---+----------+---+   +---+----------+---+
      |          |           |          |
      |          |           |          |
      |          +-----------|----------+-------> to ESP32-S2 "GND" Pin
      |                      |
      +----------------------+------------------> to ESP32-S2 "5V" Pin
                 |           |
                 |   +-------+-------+
                 |   |  Capacitor:   |
                 |   |  1000uF, 10V  |
                 |   |  (+)     (-)  |
                 +---+--(+)     (-)--+
```

---

## 🛠️ Step-by-Step Assembly & Soldering Guide

Follow these steps to build your robot:

### Step 1: Chassis Assembly
1.  Mount the two **28BYJ-48 stepper motors** into your 3D printed rover chassis. Screw them down tightly using M3 screws and nuts.
2.  Press the wheels onto the output shafts of the stepper motors. Secure the wheel hubs if your print design uses lock screws.
3.  Add the front caster wheel/glide slider to balance the chassis.

### Step 2: Preparing the Power Rails & Soldering
1.  If using a solderable perfboard, place the **ESP32-S2 Mini** in a set of female pin headers so it can be detached easily.
2.  **Solder the Power Buses:** Create a dedicated **5V Power Rail** and a **GND Rail** on your board.
3.  Connect the **5V pin** of the ESP32-S2 Mini to the 5V Rail.
4.  Connect the **GND pin** of the ESP32-S2 Mini to the GND Rail.
5.  **Solder the Capacitor:** Place the **1000uF Electrolytic Capacitor** directly across the 5V and GND Rails. 
    *   *⚠️ WARNING:* Polarized capacitor! Ensure the **longer lead (+)** is soldered to the 5V Rail and the **striped side lead (-)** is soldered to the GND Rail. Soldering it backwards will damage the capacitor.

### Step 3: Connecting Drivers & Motors
1.  Connect the **VCC** and **GND** power pins of the ULN2003 Driver Boards to the common 5V and GND rails on your board.
2.  Route the control wires:
    *   Connect Driver A **IN1-IN4** to GP1, GP2, GP3, GP4.
    *   Connect Driver B **IN1-IN4** to GP5, GP7, GP9, GP11.
3.  Plug the 5-pin white connectors from the stepper motors directly into their matching sockets on the driver boards.

---

## 🧠 Kinematic AI Training Guide (Remote Stationary setup)

Unlike standard rovers, the phone is placed **stationary in a stand** overlooking the robot's workspace:

1.  **Scan the robot:**
    *   Click **Start Training** in the AI panel.
    *   Click on the robot's colored marker in the video feed to scan it. The system locks onto the centroid.
2.  **Start Kinematic Calibration:**
    *   The robot wiggles its wheels back and forth.
    *   The system measures how moving each motor moves the visual centroid in the camera frame.
3.  **Learn and Pilot:**
    *   A neural network maps visual target displacements $(\Delta X, \Delta Y)$ to motor inputs.
    *   Click **Start Autopilot** to watch the robot navigate autonomously to track visual targets!

---

## 🚀 How to Flash and Run

All uploading, configuration, and flashing tasks are simplified via the included [Makefile](Makefile).

### 1. Install CLI Tools
Install the necessary python command-line tools (`mpremote` and `esptool`):
```bash
make install-tools
```

### 2. Upload Code to ESP32
Connect your board to your computer and upload all files (defaults to serial port `/dev/ttyACM0`):
```bash
make upload
```

### 3. Reset the Board
Run the following command to reboot the board and launch the program:
```bash
make reset
```
*(If your port is different, e.g. COM3 or /dev/ttyUSB0, append `PORT=COM3` to make commands).*

