import uasyncio as asyncio
from stepper import Stepper
from dns_server import DNSServer
from web_server import WebServer

# Pin Definitions (IN1, IN2, IN3, IN4 for each motor)
# Adjust these pins to match your physical wiring setup
MOTOR_A_PINS = [1, 2, 3, 4]
MOTOR_B_PINS = [5, 7, 9, 11]

# Initialize Stepper Motors
motor_a = Stepper(MOTOR_A_PINS)
motor_b = Stepper(MOTOR_B_PINS)

# Active recipe task reference
recipe_task = None

# Shared sensor readings dictionary
sensor_data = {"vision": "none"}

async def run_blocks(blocks):
    """Recursively execute compiled workflow blocks."""
    for block in blocks:
        action = block.get('action')
        
        if action == 'move':
            motor_name = block.get('motor')
            steps = int(block.get('steps', 0))
            speed = int(block.get('speed', 2))
            
            motor = motor_a if motor_name == 'A' else motor_b
            motor.set_speed(speed)
            motor.move(steps)
            
            # Non-blocking wait for movement to complete
            while motor.is_moving:
                await asyncio.sleep_ms(20)
                
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
            body = block.get('body', [])
            
            current_val = sensor_data.get(sensor_name, 'none')
            if current_val == target_val:
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
        motor_a.stop()
        motor_b.stop()
        recipe_task = None

def run_recipe_callback(recipe):
    """
    Callback triggered by WebServer API endpoints to control the recipe task.
    Returns True if successfully started/stopped, False if conflict occurs.
    """
    global recipe_task
    
    # If recipe is None, stop the current program
    if recipe is None:
        if recipe_task:
            recipe_task.cancel()
            recipe_task = None
        return True
        
    # If a program is already running, return False (busy)
    if recipe_task is not None:
        return False
        
    # Start execution task in the background
    recipe_task = asyncio.create_task(execute_recipe(recipe))
    return True

async def main():
    print("Initializing systems...")
    
    # 1. Start Stepper Motor Background Loop tasks
    asyncio.create_task(motor_a.run_loop())
    asyncio.create_task(motor_b.run_loop())
    
    # 2. Start Captive Portal DNS Server (Resolves all queries to ESP32 IP: 192.168.4.1)
    dns_server = DNSServer(ip="192.168.4.1")
    asyncio.create_task(dns_server.run())
    
    # 3. Start Web Server on port 80
    web_server = WebServer(motor_a, motor_b, sensor_data=sensor_data, host="0.0.0.0", port=80, redirect_host="robot.com")
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
