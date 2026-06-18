import asyncio
from machine import Pin, ADC
from stepper import Stepper
from dns_server import DNSServer
from web_server import WebServer

# Pin Definitions (IN1, IN2, IN3, IN4 for each motor)
# Adjust these pins to match your physical wiring setup
MOTOR_PINS = {
    'A': [1, 2, 3, 4],
    'B': [5, 7, 9, 11]
}

# Initialize Stepper Motors
motors = {name: Stepper(pins) for name, pins in MOTOR_PINS.items()}

# Initialize Hardware Senses (Buttons/Switches with internal Pull-up)
btn_a = Pin(12, Pin.IN, Pin.PULL_UP)
btn_b = Pin(13, Pin.IN, Pin.PULL_UP)

# Initialize Hardware Senses (Analog Potentiometer / Dial)
pot = ADC(Pin(14))
pot.atten(ADC.ATTN_11DB) # 0-3.3V full range

# Active recipe task reference
recipe_task = None

# Shared sensor readings dictionary (starts with default off values)
sensor_data = {
    "vision": "none",
    "sound": "none",
    "button_a": "released",
    "button_b": "released",
    "potentiometer": 0
}

async def run_blocks(blocks):
    """Recursively execute compiled workflow blocks."""
    for block in blocks:
        action = block.get('action')
        
        if action == 'move':
            motor_name = block.get('motor')
            steps = int(block.get('steps', 0))
            speed = int(block.get('speed', 2))
            
            motor = motors.get(motor_name)
            if motor:
                motor.set_speed(speed)
                motor.move(steps)
                
                # Non-blocking wait for movement to complete
                while motor.is_moving:
                    await asyncio.sleep_ms(20)
                
        elif action == 'set_speed':
            motor_name = block.get('motor')
            speed = int(block.get('speed', 2))
            motor = motors.get(motor_name)
            if motor:
                motor.set_speed(speed)

        elif action == 'stop_all':
            for motor in motors.values():
                motor.stop()

        elif action == 'wait':
            duration = float(block.get('duration', 0.0))
            await asyncio.sleep(duration)
            
        elif action == 'loop':
            iterations = int(block.get('iterations', 1))
            body = block.get('body', [])
            for _ in range(iterations):
                await run_blocks(body)
                
        elif action == 'if':
            sensor_name = block.get('sensor')
            target_val = block.get('value')
            op = block.get('op', 'eq') # comparison operator: 'eq', 'gt', 'lt'
            body = block.get('body', [])
            
            current_val = sensor_data.get(sensor_name)
            
            # Match condition
            matched = False
            if op == 'eq':
                matched = (str(current_val) == str(target_val))
            elif op == 'gt':
                try:
                    matched = (float(current_val) > float(target_val))
                except: pass
            elif op == 'lt':
                try:
                    matched = (float(current_val) < float(target_val))
                except: pass
                
            if matched:
                await run_blocks(body)

async def execute_recipe(recipe):
    """Wrapper task for recipe execution that ensures cleanup on cancel."""
    global recipe_task
    try:
        print("Starting program execution...")
        await run_blocks(recipe)
        print("Program finished successfully.")
    except asyncio.CancelledError:
        print("Program execution stopped by user request.")
    finally:
        for motor in motors.values():
            motor.stop()
        recipe_task = None

async def execute_raw_code(code_str):
    """Wrapper task for raw MicroPython script execution that compiles and runs code in an async task."""
    global recipe_task
    try:
        print("Starting raw python execution...")
        # Indent the user's code to run it inside an async wrapper function
        indented_code = "\n".join("    " + line for line in code_str.split("\n"))
        wrapper = "async def run_user_code(motors, sensor_data, asyncio):\n" + indented_code
        
        # Create context dict and compile/execute definition
        env = {}
        exec(wrapper, globals(), env)
        
        # Execute the defined coroutine passing global objects
        await env['run_user_code'](motors, sensor_data, asyncio)
        print("Raw python finished successfully.")
    except asyncio.CancelledError:
        print("Raw python execution stopped by user request.")
    except Exception as e:
        print("Python execution error:", e)
    finally:
        for motor in motors.values():
            motor.stop()
        recipe_task = None

def run_recipe_callback(program):
    """
    Callback triggered by WebServer API endpoints to control the active task.
    Supports list recipes (Scratch blocks) and string raw code (MicroPython text).
    """
    global recipe_task
    
    # If program is None, stop the current program
    if program is None:
        if recipe_task:
            recipe_task.cancel()
            recipe_task = None
        return True
        
    # If a program is already running, return False (busy)
    if recipe_task is not None:
        return False
        
    # Start execution task in the background (detect type)
    if isinstance(program, str):
        recipe_task = asyncio.create_task(execute_raw_code(program))
    else:
        recipe_task = asyncio.create_task(execute_recipe(program))
    return True

async def poll_hardware_sensors():
    """Background loop that polls GPIO sensors and updates the state dictionary."""
    while True:
        # 0 = pressed (due to PULL_UP resistor wired to GND)
        sensor_data["button_a"] = "pressed" if btn_a.value() == 0 else "released"
        sensor_data["button_b"] = "pressed" if btn_b.value() == 0 else "released"
        
        try:
            # Read 16-bit ADC value (0 - 65535) and map to 0-100% dial range
            raw_adc = pot.read_u16()
            sensor_data["potentiometer"] = int((raw_adc / 65535) * 100)
        except Exception as e:
            pass
            
        await asyncio.sleep_ms(50)

async def main():
    print("Initializing systems...")
    
    # 1. Start Stepper Motor Background Loop tasks
    for motor in motors.values():
        asyncio.create_task(motor.run_loop())
    
    # 2. Start GPIO Hardware Sensors Background Poller
    asyncio.create_task(poll_hardware_sensors())
    
    # 3. Start Captive Portal DNS Server (Resolves all queries to ESP32 IP: 192.168.4.1)
    dns_server = DNSServer(ip="192.168.4.1")
    asyncio.create_task(dns_server.run())
    
    # 4. Start Web Server on port 80
    web_server = WebServer(motors, sensor_data=sensor_data, host="0.0.0.0", port=80, redirect_host="robot.com")
    await web_server.start(run_recipe_callback)
    
    # Keep the main loop alive
    while True:
        await asyncio.sleep(1)

# Start event loop
if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Program halted")
