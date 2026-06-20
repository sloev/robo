# Makefile for uploading and managing MicroPython ESP32-S2 Mini project

# Serial port configuration (adjust to /dev/ttyUSB0, COM3, etc.)
PORT ?= /dev/ttyACM0
BAUD ?= 115200

# Path to the downloaded MicroPython firmware .bin file
FIRMWARE ?= firmware.bin

# Tool to use: mpremote (default, recommended) or ampy
TOOL ?= mpremote

# Python and tool executables
PYTHON_CMD ?= python3
PIP_CMD ?= pip
MPREMOTE_CMD ?= mpremote
ESPTOOL_CMD ?= esptool.py
AMPY_CMD ?= ampy

# Use local virtual environment if it exists
ifneq (,$(wildcard venv/bin/activate))
	PYTHON_CMD = venv/bin/python3
	PIP_CMD = venv/bin/pip
	MPREMOTE_CMD = venv/bin/mpremote
	ESPTOOL_CMD = venv/bin/esptool.py
	AMPY_CMD = venv/bin/ampy
endif

.PHONY: all upload reset repl flash-firmware erase-flash install-tools help

all: help

help:
	@echo "Available commands:"
	@echo "  make install-tools   Install CLI flashing tools (mpremote, esptool)"
	@echo "  make upload          Upload all source and UI files to the ESP32"
	@echo "  make reset           Reboot the ESP32 board"
	@echo "  make repl            Open the MicroPython interactive REPL console"
	@echo "  make erase-flash     Erase the ESP32 board's flash memory"
	@echo "  make flash-firmware  Flash the MicroPython firmware binary (defined by FIRMWARE=)"

install-tools:
	$(PYTHON_CMD) -m venv venv
	venv/bin/pip install mpremote esptool adafruit-ampy pyserial

upload:
	@echo "Uploading project files to $(PORT) using $(TOOL)..."
ifeq ($(TOOL), mpremote)
	# Create static directory if it doesn't exist
	$(MPREMOTE_CMD) connect $(PORT) fs mkdir :static || true
	# Copy files
	$(MPREMOTE_CMD) connect $(PORT) fs cp boot.py :boot.py
	$(MPREMOTE_CMD) connect $(PORT) fs cp main.py :main.py
	$(MPREMOTE_CMD) connect $(PORT) fs cp stepper.py :stepper.py
	$(MPREMOTE_CMD) connect $(PORT) fs cp dns_server.py :dns_server.py
	$(MPREMOTE_CMD) connect $(PORT) fs cp web_server.py :web_server.py
	$(MPREMOTE_CMD) connect $(PORT) fs cp static/index.html.gz :static/index.html.gz
	$(MPREMOTE_CMD) connect $(PORT) fs cp static/style.css.gz :static/style.css.gz
	$(MPREMOTE_CMD) connect $(PORT) fs cp static/app.js.gz :static/app.js.gz
	$(MPREMOTE_CMD) connect $(PORT) fs cp static/blockly_compressed.js.gz :static/blockly_compressed.js.gz
	$(MPREMOTE_CMD) connect $(PORT) fs cp static/en.js.gz :static/en.js.gz
	$(MPREMOTE_CMD) connect $(PORT) fs mkdir :static/media || true
	for f in static/media/*; do $(MPREMOTE_CMD) connect $(PORT) fs cp $$f :static/media/$$(basename $$f) || true; done
else
	# Fallback using ampy (requires installation of adafruit-ampy)
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put boot.py
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put main.py
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put stepper.py
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put dns_server.py
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put web_server.py
	# Put static folder
	$(AMPY_CMD) --port $(PORT) --baud $(BAUD) put static
endif
	@echo "Upload complete!"

reset:
	@echo "Resetting board on $(PORT)..."
ifeq ($(TOOL), mpremote)
	$(MPREMOTE_CMD) connect $(PORT) reset
else
	# Soft-reboot using serial sequence Ctrl+C then Ctrl+D
	$(PYTHON_CMD) -c "import serial; s=serial.Serial('$(PORT)', $(BAUD)); s.write(b'\x03\x04')"
endif

repl:
	@echo "Opening REPL console. Press Ctrl+X to exit."
	$(MPREMOTE_CMD) connect $(PORT) repl

erase-flash:
	@echo "Erasing ESP32 flash memory..."
	$(ESPTOOL_CMD) --port $(PORT) erase_flash

flash-firmware:
	@echo "Flashing MicroPython firmware '$(FIRMWARE)' to ESP32-S2 at 0x1000..."
	$(ESPTOOL_CMD) --chip esp32s2 --port $(PORT) --baud 460800 write_flash -z 0x1000 $(FIRMWARE)

# --- LEGO VEHICLE AUTOMATION TARGETS ---

.PHONY: install-deps render-vehicle

# Installs necessary CLI 3D utilities via APT
install-deps:
	sudo apt-get update
	sudo apt-get install -y openscad

# Part targets. STL is OpenSCAD's native output and the format used for both
# 3D printing and the web viewer, so it is the single source of truth.
STLS = vehicle_base.stl vehicle_lid.stl vehicle_couplers.stl vehicle_phone_clamp.stl
PNGS = screenshots/vehicle_render.png screenshots/vehicle_base_render.png screenshots/vehicle_lid_render.png screenshots/vehicle_couplers_render.png screenshots/vehicle_phone_clamp_render.png

render-vehicle: vehicle_models.zip $(PNGS)
	@echo "Done! All files ready for slicer."

vehicle_models.zip: $(STLS)
	@echo "Creating ZIP archive of all parts..."
	zip -j $@ $^

# Individual part rendering rules
vehicle_base.stl: lego_robot_base.scad lego_robot_common.scad
	@echo "Rendering Chassis Base to STL..."
	openscad -o $@ $<

vehicle_lid.stl: lego_robot_lid.scad lego_robot_common.scad
	@echo "Rendering Sliding Lid to STL..."
	openscad -o $@ $<

vehicle_couplers.stl: lego_robot_couplers.scad lego_robot_common.scad
	@echo "Rendering Captive Couplers to STL..."
	openscad -o $@ $<

vehicle_phone_clamp.stl: lego_robot_phone_clamp.scad lego_robot_common.scad
	@echo "Rendering Portrait Phone Clamp to STL..."
	openscad -o $@ $<

# Screenshot rendering rules
screenshots/vehicle_render.png: lego_robot_showcase.scad lego_robot_common.scad lego_robot_base.scad lego_robot_lid.scad lego_robot_couplers.scad lego_robot_phone_clamp.scad
	@echo "Rendering Showcase Screenshot..."
	openscad -o $@ --colorscheme Nature --imgsize 1200,800 $<

screenshots/vehicle_base_render.png: lego_robot_base.scad lego_robot_common.scad
	@echo "Rendering Base Screenshot..."
	openscad -o $@ --colorscheme Nature --imgsize 800,600 $<

screenshots/vehicle_lid_render.png: lego_robot_lid.scad lego_robot_common.scad
	@echo "Rendering Lid Screenshot..."
	openscad -o $@ --colorscheme Nature --imgsize 800,600 $<

screenshots/vehicle_couplers_render.png: lego_robot_couplers.scad lego_robot_common.scad
	@echo "Rendering Couplers Screenshot..."
	openscad -o $@ --colorscheme Nature --imgsize 800,600 $<

screenshots/vehicle_phone_clamp_render.png: lego_robot_phone_clamp.scad lego_robot_common.scad
	@echo "Rendering Phone Clamp Screenshot..."
	openscad -o $@ --colorscheme Nature --imgsize 800,600 $<
