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

def add_dir(dir_path, dest_dir):
    for root, _, files in os.walk(dir_path):
        for file in files:
            src = os.path.join(root, file)
            dest = os.path.join(dest_dir, os.path.relpath(src, dir_path)).replace('\\', '/')
            add_file(src, dest)

add_dir('static', 'static')

with open('robo-filesystem.bin', 'wb') as f:
    f.write(fs.context.buffer)

print("Created robo-filesystem.bin")
