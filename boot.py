# boot.py -- run on boot-up
import network
import gc

# Run garbage collector to start fresh
gc.collect()

# Configure Access Point (AP)
ap = network.WLAN(network.AP_IF)
ap.active(True)

# Explicitly set AP IP configuration: (IP, Subnet, Gateway, DNS)
ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '192.168.4.1'))

# Configure SSID: 'Robo-Control-AP', Open network for easy captive portal access
ap.config(essid='Robo-Control-AP', authmode=network.AUTH_OPEN)

print("Access Point 'Robo-Control-AP' is active.")
print("IP Address configuration:", ap.ifconfig())
