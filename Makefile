# Makefile for uploading and managing MicroPython ESP32-S2 Mini project

# Serial port configuration (adjust to /dev/ttyUSB0, COM3, etc.)
PORT ?= /dev/ttyACM0
BAUD ?= 115200

# Path to the downloaded MicroPython firmware .bin file
FIRMWARE ?= firmware.bin

# Tool to use: mpremote (default, recommended) or ampy
TOOL ?= mpremote

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
	pip install mpremote esptool

upload:
	@echo "Uploading project files to $(PORT) using $(TOOL)..."
ifeq ($(TOOL), mpremote)
	# Create static directory if it doesn't exist
	mpremote connect $(PORT) fs mkdir :static || true
	# Copy files
	mpremote connect $(PORT) fs cp boot.py :boot.py
	mpremote connect $(PORT) fs cp main.py :main.py
	mpremote connect $(PORT) fs cp stepper.py :stepper.py
	mpremote connect $(PORT) fs cp dns_server.py :dns_server.py
	mpremote connect $(PORT) fs cp web_server.py :web_server.py
	mpremote connect $(PORT) fs cp static/index.html.gz :static/index.html.gz
	mpremote connect $(PORT) fs cp static/style.css.gz :static/style.css.gz
	mpremote connect $(PORT) fs cp static/app.js.gz :static/app.js.gz
	mpremote connect $(PORT) fs cp static/blockly_compressed.js.gz :static/blockly_compressed.js.gz
	mpremote connect $(PORT) fs cp static/en.js.gz :static/en.js.gz
	mpremote connect $(PORT) fs mkdir :static/media || true
	for f in static/media/*; do mpremote connect $(PORT) fs cp $$f :static/media/$$(basename $$f) || true; done
else
	# Fallback using ampy (requires installation of adafruit-ampy)
	ampy --port $(PORT) --baud $(BAUD) put boot.py
	ampy --port $(PORT) --baud $(BAUD) put main.py
	ampy --port $(PORT) --baud $(BAUD) put stepper.py
	ampy --port $(PORT) --baud $(BAUD) put dns_server.py
	ampy --port $(PORT) --baud $(BAUD) put web_server.py
	# Put static folder
	ampy --port $(PORT) --baud $(BAUD) put static
endif
	@echo "Upload complete!"

reset:
	@echo "Resetting board on $(PORT)..."
ifeq ($(TOOL), mpremote)
	mpremote connect $(PORT) reset
else
	# Soft-reboot using serial sequence Ctrl+C then Ctrl+D
	python3 -c "import serial; s=serial.Serial('$(PORT)', $(BAUD)); s.write(b'\x03\x04')"
endif

repl:
	@echo "Opening REPL console. Press Ctrl+X to exit."
	mpremote connect $(PORT) repl

erase-flash:
	@echo "Erasing ESP32 flash memory..."
	esptool.py --port $(PORT) erase_flash

flash-firmware:
	@echo "Flashing MicroPython firmware '$(FIRMWARE)' to ESP32-S2 at 0x1000..."
	esptool.py --chip esp32s2 --port $(PORT) --baud 460800 write_flash -z 0x1000 $(FIRMWARE)
