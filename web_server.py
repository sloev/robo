import uasyncio as asyncio
import json
import os

class WebServer:
    def __init__(self, stepper_a, stepper_b, sensor_data=None, host="0.0.0.0", port=80, redirect_host="robot.com"):
        self.stepper_a = stepper_a
        self.stepper_b = stepper_b
        self.sensor_data = sensor_data if sensor_data is not None else {"vision": "none"}
        self.host = host
        self.port = port
        self.redirect_host = redirect_host
        self.server = None
        self.run_recipe_cb = None
        
    async def start(self, run_recipe_cb):
        self.run_recipe_cb = run_recipe_cb
        self.server = await asyncio.start_server(self.handle_client, self.host, self.port)
        print(f"Web Server started on http://{self.host}:{self.port}")

    async def handle_client(self, reader, writer):
        try:
            req_line = await reader.readline()
            if not req_line:
                writer.close()
                await writer.wait_closed()
                return

            # Parse request line: METHOD PATH VERSION
            req_parts = req_line.decode('utf-8').strip().split(' ')
            if len(req_parts) < 2:
                writer.close()
                await writer.wait_closed()
                return
                
            method, path = req_parts[0], req_parts[1]
            
            # Read headers
            headers = {}
            content_length = 0
            while True:
                line = await reader.readline()
                if line == b'\r\n' or line == b'\n' or not line:
                    break
                # Parse header
                parts = line.decode('utf-8').split(':', 1)
                if len(parts) == 2:
                    name = parts[0].strip().lower()
                    val = parts[1].strip()
                    headers[name] = val
                    if name == 'content-length':
                        content_length = int(val)

            # Clean path (strip query parameters if any)
            clean_path = path.split('?')[0]
            
            # 1. API Endpoints
            if clean_path.startswith('/api/'):
                await self.handle_api(method, clean_path, content_length, reader, writer)
            
            # 2. Static Files
            elif clean_path in ('/', '/index.html'):
                await self.serve_file('/static/index.html', 'text/html', writer)
            elif clean_path == '/style.css':
                await self.serve_file('/static/style.css', 'text/css', writer)
            elif clean_path == '/app.js':
                await self.serve_file('/static/app.js', 'application/javascript', writer)
                
            # 3. Captive Portal Redirection
            else:
                # Redirect everything else to robot.com
                print(f"Captive Redirect: {path} -> http://{self.redirect_host}/")
                response = (
                    "HTTP/1.1 302 Found\r\n"
                    f"Location: http://{self.redirect_host}/\r\n"
                    "Content-Length: 0\r\n"
                    "Connection: close\r\n\r\n"
                )
                writer.write(response.encode('utf-8'))
                await writer.drain()
                writer.close()
                await writer.wait_closed()
                
        except Exception as e:
            print("Web Server handler error:", e)
            try:
                writer.close()
                await writer.wait_closed()
            except:
                pass

    async def serve_file(self, filepath, content_type, writer):
        try:
            # Check if file exists
            os.stat(filepath)
            size = os.stat(filepath)[6]
            
            header = (
                "HTTP/1.1 200 OK\r\n"
                f"Content-Type: {content_type}\r\n"
                f"Content-Length: {size}\r\n"
                "Connection: close\r\n\r\n"
            )
            writer.write(header.encode('utf-8'))
            await writer.drain()
            
            # Send file in chunks to keep memory usage low
            with open(filepath, 'rb') as f:
                while True:
                    chunk = f.read(512)
                    if not chunk:
                        break
                    writer.write(chunk)
                    await writer.drain()
            
            writer.close()
            await writer.wait_closed()
        except OSError:
            # File not found
            response = (
                "HTTP/1.1 404 Not Found\r\n"
                "Content-Type: text/plain\r\n"
                "Content-Length: 9\r\n"
                "Connection: close\r\n\r\n"
                "Not Found"
            )
            writer.write(response.encode('utf-8'))
            await writer.drain()
            writer.close()
            await writer.wait_closed()

    async def handle_api(self, method, path, content_length, reader, writer):
        resp_data = {"status": "ok"}
        status_code = 200
        
        try:
            body_bytes = b''
            if content_length > 0:
                body_bytes = await reader.readexactly(content_length)
                
            if path == '/api/sensors' and method == 'POST':
                data = json.loads(body_bytes.decode('utf-8'))
                self.sensor_data.update(data)
                resp_data = {"status": "updated"}
            elif path == '/api/status' and method == 'GET':
                resp_data = {
                    "motorA": {
                        "current": self.stepper_a.current_position,
                        "target": self.stepper_a.target_position,
                        "moving": self.stepper_a.is_moving,
                        "speed_delay": self.stepper_a.step_delay_ms
                    },
                    "motorB": {
                        "current": self.stepper_b.current_position,
                        "target": self.stepper_b.target_position,
                        "moving": self.stepper_b.is_moving,
                        "speed_delay": self.stepper_b.step_delay_ms
                    }
                }
            elif path == '/api/manual' and method == 'POST':
                data = json.loads(body_bytes.decode('utf-8'))
                motor = data.get('motor')
                steps = int(data.get('steps', 0))
                speed = int(data.get('speed', 2))
                
                target_motor = None
                if motor == 'A':
                    target_motor = self.stepper_a
                elif motor == 'B':
                    target_motor = self.stepper_b
                    
                if target_motor:
                    target_motor.set_speed(speed)
                    if steps == 0:
                        target_motor.stop()
                        resp_data = {"status": "stopped", "motor": motor}
                    else:
                        target_motor.move(steps)
                        resp_data = {"status": "moving", "motor": motor, "steps": steps}
                else:
                    status_code = 400
                    resp_data = {"error": "Invalid motor selection"}
            elif path == '/api/run' and method == 'POST':
                data = json.loads(body_bytes.decode('utf-8'))
                recipe = data.get('recipe', [])
                
                # Execute recipe (handled in main.py loop)
                success = self.run_recipe_cb(recipe)
                if success:
                    resp_data = {"status": "running"}
                else:
                    status_code = 409
                    resp_data = {"error": "Another program is already running"}
            elif path == '/api/stop' and method == 'POST':
                # Stop motors
                self.stepper_a.stop()
                self.stepper_b.stop()
                
                # Terminate running script
                self.run_recipe_cb(None)
                resp_data = {"status": "stopped"}
            else:
                status_code = 404
                resp_data = {"error": "API endpoint not found"}
                
        except Exception as e:
            print("API Error:", e)
            status_code = 500
            resp_data = {"error": str(e)}
            
        # Send JSON response
        resp_bytes = json.dumps(resp_data).encode('utf-8')
        
        status_text = "OK"
        if status_code == 400:
            status_text = "Bad Request"
        elif status_code == 404:
            status_text = "Not Found"
        elif status_code == 409:
            status_text = "Conflict"
        elif status_code == 500:
            status_text = "Internal Server Error"
            
        response_headers = (
            f"HTTP/1.1 {status_code} {status_text}\r\n"
            "Content-Type: application/json\r\n"
            f"Content-Length: {len(resp_bytes)}\r\n"
            "Connection: close\r\n\r\n"
        )
        writer.write(response_headers.encode('utf-8'))
        writer.write(resp_bytes)
        await writer.drain()
        writer.close()
        await writer.wait_closed()
