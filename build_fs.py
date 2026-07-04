from littlefs import LittleFS
import os

fs = LittleFS(block_size=4096, block_count=512)

def add_file(src_path, dest_path):
    print(f"Adding {dest_path}")
    with open(src_path, 'rb') as f:
        data = f.read()
    # Ensure parent directories exist in LittleFS
    parts = dest_path.split('/')
    for i in range(1, len(parts)):
        dir_path = '/'.join(parts[:i])
        try:
            fs.mkdir(dir_path)
        except FileExistsError:
            pass
            
    with fs.open(dest_path, 'wb') as f:
        f.write(data)

add_file('main.py', 'main.py')
add_file('stepper.py', 'stepper.py')
add_file('web_server.py', 'web_server.py')
add_file('dns_server.py', 'dns_server.py')
add_file('boot.py', 'boot.py')

# static/models (TFJS COCO-SSD, ~18MB) and static/lib (tf.min.js, ~1.3MB) are
# the "heavy PWA" AI assets -- they don't fit in this device's flash and were
# never meant to: per the README's offline-AI instructions, the phone installs
# the full PWA from the online GitHub Pages demo over its own internet
# connection first (caching those assets in the browser), then switches to the
# robot's "BlockBot" Wi-Fi and opens the already-installed app, which talks to
# this on-device server for control/video only. The device just needs the
# lightweight dashboard shell + a captive-portal notice for anyone who lands
# here without having installed the PWA yet.
SKIP_DIRS = {'models', 'lib'}

def add_dir(dir_path, dest_dir):
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for file in files:
            src = os.path.join(root, file)
            dest = os.path.join(dest_dir, os.path.relpath(src, dir_path)).replace('\\', '/')
            add_file(src, dest)

add_dir('static', 'static')

with open('robo-filesystem.bin', 'wb') as f:
    f.write(fs.context.buffer)

print("Created robo-filesystem.bin")
