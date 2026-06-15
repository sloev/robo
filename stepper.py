import uasyncio as asyncio
from machine import Pin

class Stepper:
    def __init__(self, pin_ids, step_delay_ms=2):
        """
        Initialize the stepper motor with 4 pin numbers.
        Sequence of pins should match IN1, IN2, IN3, IN4 on the ULN2003 board.
        """
        self.pins = [Pin(p, Pin.OUT) for p in pin_ids]
        self.target_position = 0
        self.current_position = 0
        self.step_delay_ms = step_delay_ms
        self.running = False
        self.step_index = 0
        
        # 8-step half-stepping sequence
        self.sequence = [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 1]
        ]
        self.release()

    def release(self):
        """Release coils to save power and prevent overheating."""
        for pin in self.pins:
            pin.value(0)

    def move(self, steps):
        """Set relative movement target in steps (positive or negative)."""
        self.target_position += steps

    def move_to(self, position):
        """Set absolute target position."""
        self.target_position = position

    def stop(self):
        """Cancel current movement immediately."""
        self.target_position = self.current_position
        self.release()

    def set_speed(self, delay_ms):
        """Set the delay between steps in milliseconds (lower is faster)."""
        self.step_delay_ms = max(1, delay_ms)

    @property
    def is_moving(self):
        return self.current_position != self.target_position

    async def run_loop(self):
        """Background coroutine that handles stepping to the target position."""
        self.running = True
        try:
            while self.running:
                if self.current_position != self.target_position:
                    direction = 1 if self.target_position > self.current_position else -1
                    self.step_index = (self.step_index + direction) % 8
                    
                    # Apply coil sequence
                    vals = self.sequence[self.step_index]
                    for pin, val in zip(self.pins, vals):
                        pin.value(val)
                        
                    self.current_position += direction
                    # Non-blocking sleep for step delay
                    await asyncio.sleep_ms(self.step_delay_ms)
                else:
                    self.release()
                    # Sleep when idle to avoid hogging CPU
                    await asyncio.sleep_ms(10)
        except asyncio.CancelledError:
            self.stop()
            raise
