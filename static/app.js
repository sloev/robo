// State management
let activeContainer = null;
const mainWorkspace = document.getElementById('workspace-canvas');

// Connection and status elements
const connectionDot = document.getElementById('connection-dot');
const connectionText = document.getElementById('connection-text');
const statusRobotMode = document.getElementById('status-robot-mode');

// Dynamic motors configuration
let configuredMotors = ['A', 'B']; // Default fallback
let activeJoysticks = {};

// Default active container is the main workspace
setActiveContainer(mainWorkspace);

// Navbar Tabs Toggle Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons and content panels
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Show corresponding view content
    const targetId = btn.dataset.target;
    document.getElementById(targetId).classList.add('active');
  });
});

// Set active container for block insertion
function setActiveContainer(container) {
  if (activeContainer) {
    activeContainer.classList.remove('active-dropzone');
    activeContainer.style.borderColor = '';
  }
  activeContainer = container;
  if (container !== mainWorkspace) {
    container.classList.add('active-dropzone');
    container.style.borderColor = 'var(--orange-accent)';
  }
  updateEmptyMessages();
}

// Show/hide empty workspace placeholders
function updateEmptyMessages() {
  const emptyMsg = document.getElementById('empty-message');
  if (mainWorkspace.children.length > 1) { // more than the empty message itself
    emptyMsg.style.display = 'none';
  } else {
    emptyMsg.style.display = 'flex';
  }
}

// Toolbox button actions (adding blocks)
document.querySelectorAll('.block-template').forEach(template => {
  template.addEventListener('click', () => {
    const type = template.dataset.type;
    const blockEl = createBlockElement(type);
    
    if (activeContainer === mainWorkspace) {
      mainWorkspace.appendChild(blockEl);
    } else {
      activeContainer.appendChild(blockEl);
    }
    
    updateEmptyMessages();
  });
});

// Click anywhere on workspace background to reset active target to main workspace
mainWorkspace.addEventListener('click', (e) => {
  if (e.target === mainWorkspace || e.target.id === 'empty-message') {
    setActiveContainer(mainWorkspace);
  }
});

// Helper to get dropdown options for configured motors
function getMotorOptionsHTML() {
  return configuredMotors.map(m => `<option value="${m}">Motor ${m}</option>`).join('');
}

// Recursively build HTML block elements
function createBlockElement(type) {
  if (type === 'loop') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.dataset.blockType = 'loop';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🔄 Repeat</span>
          <input type="number" value="3" min="1" max="100" class="loop-count">
          <span>times</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }
  
  if (type === 'if-vision') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--red-accent)';
    container.style.backgroundColor = 'rgba(255, 0, 85, 0.02)';
    container.dataset.blockType = 'if-vision';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🔍 If Vision detects target on</span>
          <select class="if-vision-value">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="none">None</option>
          </select>
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-sound') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--purple-accent)';
    container.style.backgroundColor = 'rgba(153, 102, 255, 0.02)';
    container.dataset.blockType = 'if-sound';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🎤 If Sound detects</span>
          <select class="if-sound-value">
            <option value="clap">Clap</option>
            <option value="none">None</option>
          </select>
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-button') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--orange-accent)';
    container.style.backgroundColor = 'rgba(255, 171, 25, 0.02)';
    container.dataset.blockType = 'if-button';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🔘 If Button</span>
          <select class="if-button-name">
            <option value="button_a">A (GP12)</option>
            <option value="button_b">B (GP13)</option>
          </select>
          <span>is</span>
          <select class="if-button-state">
            <option value="pressed">Pressed</option>
            <option value="released">Released</option>
          </select>
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-dial') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--orange-accent)';
    container.style.backgroundColor = 'rgba(255, 171, 25, 0.02)';
    container.dataset.blockType = 'if-dial';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🎛️ If Dial (GP14) is</span>
          <select class="if-dial-op">
            <option value="gt">Greater than</option>
            <option value="lt">Less than</option>
            <option value="eq">Equal to</option>
          </select>
          <input type="number" value="50" min="0" max="100" class="if-dial-val">%
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-ir') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--red-accent)';
    container.style.backgroundColor = 'rgba(255, 0, 85, 0.02)';
    container.dataset.blockType = 'if-ir';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>📡 If Infrared on</span>
          <select class="if-ir-port">
            <option value="button_a">GP12</option>
            <option value="button_b">GP13</option>
          </select>
          <span>detects</span>
          <select class="if-ir-state">
            <option value="pressed">Object/Line (Low)</option>
            <option value="released">Nothing (High)</option>
          </select>
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-light') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--orange-accent)';
    container.style.backgroundColor = 'rgba(255, 171, 25, 0.02)';
    container.dataset.blockType = 'if-light';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>☀️ If Light (GP14) is</span>
          <select class="if-light-op">
            <option value="lt">Darker than</option>
            <option value="gt">Brighter than</option>
            <option value="eq">Equal to</option>
          </select>
          <input type="number" value="30" min="0" max="100" class="if-light-val">%
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }

  if (type === 'if-limit') {
    const container = document.createElement('div');
    container.className = 'loop-container';
    container.style.borderLeft = '6px solid var(--red-accent)';
    container.style.backgroundColor = 'rgba(255, 0, 85, 0.02)';
    container.dataset.blockType = 'if-limit';
    
    container.innerHTML = `
      <div class="loop-header">
        <div class="loop-header-left">
          <span>🛑 If Limit Switch on</span>
          <select class="if-limit-port">
            <option value="button_a">GP12</option>
            <option value="button_b">GP13</option>
          </select>
          <span>is</span>
          <select class="if-limit-state">
            <option value="pressed">Triggered (Pressed)</option>
            <option value="released">Open (Released)</option>
          </select>
          <span>then:</span>
        </div>
        <button class="block-remove">&times;</button>
      </div>
      <div class="loop-body"></div>
    `;
    
    const body = container.querySelector('.loop-body');
    const removeBtn = container.querySelector('.block-remove');
    
    setTimeout(() => setActiveContainer(body), 50);
    
    body.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveContainer(body);
    });
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      if (activeContainer === body) {
        setActiveContainer(mainWorkspace);
      }
      updateEmptyMessages();
    });
    
    return container;
  }
  
  // Normal blocks
  const block = document.createElement('div');
  block.className = 'program-block';
  block.dataset.blockType = type;
  
  let innerHTML = `<span class="block-handle">☰</span><div class="block-content">`;
  
  if (type === 'motor') {
    innerHTML += `
      <span>Move</span>
      <select class="motor-name">${getMotorOptionsHTML()}</select>
      <input type="number" value="100" min="1" max="10000" class="motor-steps">
      <span>steps at speed delay</span>
      <input type="number" value="2" min="1" max="50" class="motor-speed">
      <span>ms</span>
      <select class="motor-dir">
        <option value="1">Forward</option>
        <option value="-1">Backward</option>
      </select>
    `;
  } else if (type === 'set-speed') {
    innerHTML += `
      <span>Set Speed of</span>
      <select class="motor-name">${getMotorOptionsHTML()}</select>
      <span>to speed delay</span>
      <input type="number" value="2" min="1" max="50" class="motor-speed">
      <span>ms</span>
    `;
  } else if (type === 'stop-all') {
    innerHTML += `
      <span>Stop All Motors</span>
    `;
  } else if (type === 'wait') {
    innerHTML += `
      <span>Wait</span>
      <input type="number" value="1.0" min="0.1" max="60" step="0.5" class="wait-duration">
      <span>seconds</span>
    `;
  }
  
  innerHTML += `</div><button class="block-remove">&times;</button>`;
  block.innerHTML = innerHTML;
  
  block.querySelector('.block-remove').addEventListener('click', (e) => {
    e.stopPropagation();
    block.remove();
    updateEmptyMessages();
  });
  
  block.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  return block;
}

// Clear workspace
document.getElementById('btn-clear-workspace').addEventListener('click', () => {
  const children = Array.from(mainWorkspace.children);
  children.forEach(child => {
    if (child.id !== 'empty-message') {
      child.remove();
    }
  });
  setActiveContainer(mainWorkspace);
});

// Compile program blocks into a recipe JSON array
function compileWorkspace(container) {
  const blocks = [];
  const children = Array.from(container.children);
  
  for (let child of children) {
    if (child.id === 'empty-message') continue;
    
    if (child.classList.contains('program-block')) {
      const type = child.dataset.blockType;
      if (type === 'motor') {
        const motor = child.querySelector('.motor-name').value;
        const steps = parseInt(child.querySelector('.motor-steps').value) || 0;
        const speed = parseInt(child.querySelector('.motor-speed').value) || 2;
        const dir = parseInt(child.querySelector('.motor-dir').value) || 1;
        
        blocks.push({
          action: 'move',
          motor: motor,
          steps: steps * dir,
          speed: speed
        });
      } else if (type === 'set-speed') {
        const motor = child.querySelector('.motor-name').value;
        const speed = parseInt(child.querySelector('.motor-speed').value) || 2;
        
        blocks.push({
          action: 'set_speed',
          motor: motor,
          speed: speed
        });
      } else if (type === 'stop-all') {
        blocks.push({
          action: 'stop_all'
        });
      } else if (type === 'wait') {
        const duration = parseFloat(child.querySelector('.wait-duration').value) || 0.0;
        blocks.push({
          action: 'wait',
          duration: duration
        });
      }
    } else if (child.classList.contains('loop-container')) {
      const blockType = child.dataset.blockType;
      if (blockType === 'loop') {
        const iterations = parseInt(child.querySelector('.loop-count').value) || 1;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'loop',
          iterations: iterations,
          body: nestedBlocks
        });
      } else if (blockType === 'if-vision') {
        const value = child.querySelector('.if-vision-value').value;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: 'vision',
          value: value,
          body: nestedBlocks
        });
      } else if (blockType === 'if-sound') {
        const value = child.querySelector('.if-sound-value').value;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: 'sound',
          value: value,
          body: nestedBlocks
        });
      } else if (blockType === 'if-button') {
        const button = child.querySelector('.if-button-name').value;
        const state = child.querySelector('.if-button-state').value;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: button,
          value: state,
          op: 'eq',
          body: nestedBlocks
        });
      } else if (blockType === 'if-dial') {
        const op = child.querySelector('.if-dial-op').value;
        const val = parseInt(child.querySelector('.if-dial-val').value) || 0;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: 'potentiometer',
          value: val,
          op: op,
          body: nestedBlocks
        });
      } else if (blockType === 'if-ir') {
        const port = child.querySelector('.if-ir-port').value;
        const state = child.querySelector('.if-ir-state').value;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: port,
          value: state,
          op: 'eq',
          body: nestedBlocks
        });
      } else if (blockType === 'if-light') {
        const op = child.querySelector('.if-light-op').value;
        const val = parseInt(child.querySelector('.if-light-val').value) || 0;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: 'potentiometer',
          value: val,
          op: op,
          body: nestedBlocks
        });
      } else if (blockType === 'if-limit') {
        const port = child.querySelector('.if-limit-port').value;
        const state = child.querySelector('.if-limit-state').value;
        const loopBody = child.querySelector('.loop-body');
        const nestedBlocks = compileWorkspace(loopBody);
        
        blocks.push({
          action: 'if',
          sensor: port,
          value: state,
          op: 'eq',
          body: nestedBlocks
        });
      }
    }
  }
  return blocks;
}

// Send running recipe
document.getElementById('btn-run-program').addEventListener('click', async () => {
  const recipe = compileWorkspace(mainWorkspace);
  if (recipe.length === 0) {
    alert("Your workflow is empty! Add some blocks first.");
    return;
  }
  
  try {
    const resp = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe: recipe })
    });
    
    if (resp.status === 409) {
      alert("A program is already running. Stop it first!");
    } else if (!resp.ok) {
      alert("Error sending program: " + resp.statusText);
    }
  } catch (err) {
    alert("Connection error: " + err.message);
  }
});

// Stop program
async function stopAll() {
  try {
    await fetch('/api/stop', { method: 'POST' });
  } catch (err) {
    console.error("Error sending stop command:", err);
  }
}
document.getElementById('btn-stop-program').addEventListener('click', stopAll);

// Joystick Controller Class to handle drag-to-speed manual override
class Joystick {
  constructor(trackId, handleId, valId, motorName) {
    this.track = document.getElementById(trackId);
    this.handle = document.getElementById(handleId);
    this.valDisplay = document.getElementById(valId);
    this.motorName = motorName;
    
    this.isDragging = false;
    
    // Joystick geometry constants (in pixels)
    this.trackHeight = 160;
    this.handleSize = 42;
    this.borderSize = 2;
    this.maxDisplacement = (this.trackHeight - (this.borderSize * 2) - this.handleSize) / 2; // 57px
    this.centerTop = this.maxDisplacement; // 57px
    
    // State tracking to throttle requests
    this.currentState = "STOP";
    
    this.initEvents();
  }
  
  initEvents() {
    const startDrag = (e) => {
      // Don't override joysticks if autopilot or learning mode is active
      if (autopilotActive || learningModeActive) return;
      
      this.isDragging = true;
      this.handle.style.transition = 'none';
      
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = this.track.getBoundingClientRect();
      const trackCenterY = rect.top + this.trackHeight / 2;
      
      this.updatePosition(clientY - trackCenterY);
      
      window.addEventListener('mousemove', drag);
      window.addEventListener('touchmove', drag, { passive: false });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    };
    
    const drag = (e) => {
      if (!this.isDragging) return;
      if (e.cancelable) e.preventDefault();
      
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = this.track.getBoundingClientRect();
      const trackCenterY = rect.top + this.trackHeight / 2;
      
      this.updatePosition(clientY - trackCenterY);
    };
    
    const stopDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      
      this.handle.style.transition = 'top 0.2s ease-out';
      this.handle.style.top = this.centerTop + 'px';
      
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
      
      this.currentState = "STOP";
      this.sendMotorCommand("STOP");
    };
    
    this.handle.addEventListener('mousedown', startDrag);
    this.handle.addEventListener('touchstart', startDrag);
  }
  
  updatePosition(displacementY) {
    displacementY = Math.max(-this.maxDisplacement, Math.min(this.maxDisplacement, displacementY));
    
    this.handle.style.top = (this.centerTop + displacementY) + 'px';
    
    const normalizedVal = -(displacementY / this.maxDisplacement);
    
    let state = "STOP";
    const absVal = Math.abs(normalizedVal);
    
    if (absVal < 0.15) {
      state = "STOP";
    } else {
      const dir = normalizedVal > 0 ? "FWD" : "BWD";
      if (absVal < 0.45) {
        state = `SLOW_${dir}`;
      } else if (absVal < 0.75) {
        state = `MED_${dir}`;
      } else {
        state = `FAST_${dir}`;
      }
    }
    
    if (state !== this.currentState) {
      this.currentState = state;
      this.sendMotorCommand(state);
    }
  }
  
  async sendMotorCommand(state) {
    let label = "STOP";
    let steps = 0;
    let speed = 2;
    
    if (state !== "STOP") {
      const isFwd = state.includes("FWD");
      const direction = isFwd ? 1 : -1;
      steps = direction * 1000000;
      
      if (state.startsWith("SLOW")) {
        label = isFwd ? "SLOW ⏩" : "SLOW ⏪";
        speed = 15;
      } else if (state.startsWith("MED")) {
        label = isFwd ? "MED ⏩⏩" : "MED ⏪⏪";
        speed = 8;
      } else if (state.startsWith("FAST")) {
        label = isFwd ? "FAST 🔥" : "FAST ❄️";
        speed = 2;
      }
    }
    
    this.valDisplay.innerText = label;
    if (state === "STOP") {
      this.valDisplay.style.color = "var(--text-muted)";
    } else {
      this.valDisplay.style.color = this.handle.style.backgroundColor || "var(--cyan-accent)";
    }
    
    try {
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: this.motorName, steps: steps, speed: speed })
      });
    } catch (err) {
      console.error(`Error sending command for Motor ${this.motorName}:`, err);
    }
  }
}

// Function to dynamically build Joysticks & Status Monitors
function initDynamicUI(motorsList) {
  configuredMotors = motorsList;
  
  // 1. Rebuild Status Monitors in UI
  const statusGrid = document.getElementById('status-grid');
  // Clear any existing dynamic motor status cards
  const existingCards = statusGrid.querySelectorAll('.dynamic-motor-card');
  existingCards.forEach(c => c.remove());
  
  // Create status cards for each motor
  motorsList.forEach(motorName => {
    const card = document.createElement('div');
    card.className = 'status-card dynamic-motor-card';
    card.innerHTML = `
      <div class="status-card-label">MOTOR ${motorName} POSITION</div>
      <div class="status-card-val" id="status-motor-${motorName.toLowerCase()}-pos">0</div>
    `;
    // Prepend before the first card (CREATION MODE)
    statusGrid.insertBefore(card, statusGrid.firstChild);
  });
  
  // 2. Rebuild Joysticks in UI
  const joysticksContainer = document.getElementById('joysticks-container');
  joysticksContainer.innerHTML = '';
  activeJoysticks = {};
  
  // Palette of colors for dynamic joysticks (Scratch-themed)
  const handleColors = ['#4c97ff', '#9966ff', '#0fbd8c', '#ffab19', '#ff6680'];
  
  motorsList.forEach((motorName, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'joystick-wrapper';
    wrapper.innerHTML = `
      <div class="joystick-label">MOTOR ${motorName}</div>
      <div class="joystick-track-vertical" id="joy-${motorName.toLowerCase()}-track">
        <div class="joystick-handle" id="joy-${motorName.toLowerCase()}-handle" style="background-color: ${handleColors[idx % handleColors.length]}"></div>
      </div>
      <div class="joystick-value" id="joy-${motorName.toLowerCase()}-val">STOP</div>
    `;
    joysticksContainer.appendChild(wrapper);
    
    // Instantiate joystick logic
    const trackId = `joy-${motorName.toLowerCase()}-track`;
    const handleId = `joy-${motorName.toLowerCase()}-handle`;
    const valId = `joy-${motorName.toLowerCase()}-val`;
    activeJoysticks[motorName] = new Joystick(trackId, handleId, valId, motorName);
  });

  // 3. Update dropdown options in existing blocks
  document.querySelectorAll('.program-block[data-block-type="motor"] select.motor-name, .program-block[data-block-type="set-speed"] select.motor-name').forEach(select => {
    const currentVal = select.value;
    select.innerHTML = getMotorOptionsHTML();
    if (motorsList.includes(currentVal)) {
      select.value = currentVal;
    }
  });
}

// --- 🎤 MICROPHONE CLAP SENSING ---

let audioContext = null;
let audioStream = null;
let micAnalyser = null;
let micProcessInterval = null;
let micActive = false;
let lastClapTime = 0;

const btnToggleMic = document.getElementById('btn-toggle-mic');

btnToggleMic.addEventListener('click', async () => {
  if (micActive) {
    stopMicrophone();
  } else {
    await initMicrophone();
  }
});

async function initMicrophone() {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    micAnalyser = audioContext.createAnalyser();
    micAnalyser.fftSize = 256;
    source.connect(micAnalyser);
    
    const bufferLength = micAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    micProcessInterval = setInterval(() => {
      if (!micActive) return;
      micAnalyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      let avgVolume = sum / bufferLength;
      
      // Clap spike trigger threshold
      if (avgVolume > 95) {
        let now = Date.now();
        if (now - lastClapTime > 600) {
          lastClapTime = now;
          onClapDetected();
        }
      }
    }, 40);
    
    micActive = true;
    btnToggleMic.innerHTML = '<span>🎤 MIC: ACTIVE</span>';
    btnToggleMic.style.backgroundColor = 'var(--green-accent)';
    btnToggleMic.style.color = '#ffffff';
    console.log("Microphone initialized successfully.");
  } catch (err) {
    alert("Could not capture microphone: " + err.message);
  }
}

function stopMicrophone() {
  micActive = false;
  if (micProcessInterval) clearInterval(micProcessInterval);
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  btnToggleMic.innerHTML = '<span>🎤 START MIC</span>';
  btnToggleMic.style.backgroundColor = '#ffffff';
  btnToggleMic.style.color = 'var(--cyan-accent)';
}

async function onClapDetected() {
  console.log("Clap detected!");
  try {
    // Show quick visual feedback on mic badge
    btnToggleMic.innerHTML = '<span>⚡ CLAP! ⚡</span>';
    btnToggleMic.style.backgroundColor = 'var(--orange-accent)';
    setTimeout(() => {
      if (micActive) {
        btnToggleMic.innerHTML = '<span>🎤 MIC: ACTIVE</span>';
        btnToggleMic.style.backgroundColor = 'var(--green-accent)';
      } else {
        btnToggleMic.innerHTML = '<span>🎤 START MIC</span>';
        btnToggleMic.style.backgroundColor = '#ffffff';
      }
    }, 800);

    // Send sensor state to ESP32-S2
    await fetch('/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sound: 'clap' })
    });
    
    // Reset sound state to none after 1.2 seconds
    setTimeout(async () => {
      try {
        await fetch('/api/sensors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sound: 'none' })
        });
      } catch(e) {}
    }, 1200);
    
  } catch (err) {
    console.error("Error sending clap sensor state:", err);
  }
}


// --- 📷 CLIENT-SIDE COMPUTER VISION MOTION/CHANGE TRACKING ---

const visionVideo = document.getElementById('vision-video');
const visionCanvas = document.getElementById('vision-canvas');
const visionPlaceholder = document.getElementById('vision-placeholder');
const btnStartVision = document.getElementById('btn-start-vision');
const btnStopVision = document.getElementById('btn-stop-vision');
const btnCalibrateBg = document.getElementById('btn-calibrate-bg');

let visionActive = false;
let visionStream = null;
let backgroundFrameData = null; // Stored background reference
let motionThreshold = 40; // Pixel change sensitivity threshold
let visionResult = 'none'; // 'left', 'center', 'right', or 'none'

// Centroid tracking coordinate states shared with neural network
let currentCentroid = { x: 0, y: 0, detected: false };

// Frame differencing variables to detect if the creation is moving or stuck
let lastFrameData = null;
let currentFrameDiff = 0;

// Set internal analysis resolution
visionCanvas.width = 320;
visionCanvas.height = 240;

const ctx = visionCanvas.getContext('2d');

// Copy current camera frame into background reference
function captureBackground() {
  if (!visionActive) return;
  try {
    ctx.drawImage(visionVideo, 0, 0, visionCanvas.width, visionCanvas.height);
    const imgData = ctx.getImageData(0, 0, visionCanvas.width, visionCanvas.height);
    if (!backgroundFrameData || backgroundFrameData.length !== imgData.data.length) {
      backgroundFrameData = new Uint8ClampedArray(imgData.data.length);
    }
    backgroundFrameData.set(imgData.data);
    console.log("Background frame captured successfully!");
  } catch (err) {
    console.error("Failed to capture background:", err);
  }
}

btnStartVision.addEventListener('click', async () => {
  if (visionActive) return;
  
  try {
    visionStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 320, height: 240 }
    });
    
    visionVideo.srcObject = visionStream;
    visionVideo.style.display = 'block';
    visionCanvas.style.display = 'block';
    visionPlaceholder.style.display = 'none';
    btnCalibrateBg.disabled = false;
    
    visionActive = true;
    requestAnimationFrame(processFrame);
    
    // Auto-capture background after 1.2s to allow camera exposure to stabilize
    setTimeout(() => {
      captureBackground();
    }, 1200);
  } catch (err) {
    alert("Could not access camera: " + err.message);
  }
});

async function stopVisionFeed() {
  if (!visionActive) return;
  visionActive = false;
  visionResult = 'none';
  currentCentroid.detected = false;
  lastFrameData = null;
  backgroundFrameData = null;
  currentFrameDiff = 0;
  btnCalibrateBg.disabled = true;
  
  if (visionStream) {
    visionStream.getTracks().forEach(track => track.stop());
    visionStream = null;
  }
  
  visionVideo.srcObject = null;
  visionVideo.style.display = 'none';
  visionCanvas.style.display = 'none';
  visionPlaceholder.style.display = 'flex';
  
  // Push final state reset to ESP32
  try {
    await fetch('/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vision: 'none' })
    });
  } catch (err) {}
}

btnStopVision.addEventListener('click', stopVisionFeed);

btnCalibrateBg.addEventListener('click', () => {
  captureBackground();
  logConsole("Background calibrated successfully!");
});

// Image Processing loop (Background Differencing + Visual Motion Diff + UI overlays)
function processFrame() {
  if (!visionActive) return;
  
  try {
    // Draw current camera frame
    ctx.drawImage(visionVideo, 0, 0, visionCanvas.width, visionCanvas.height);
    
    // Read frame pixels
    const imgData = ctx.getImageData(0, 0, visionCanvas.width, visionCanvas.height);
    const data = imgData.data;
    
    // 1. Calculate frame-to-frame change (difference) to detect if creation is blocked/moving
    if (lastFrameData) {
      let diffSum = 0;
      let pixelStep = 8;
      let sampleCount = 0;
      for (let i = 0; i < data.length; i += 4 * pixelStep) {
        diffSum += Math.abs(data[i] - lastFrameData[i]) +
                   Math.abs(data[i+1] - lastFrameData[i+1]) +
                   Math.abs(data[i+2] - lastFrameData[i+2]);
        sampleCount++;
      }
      currentFrameDiff = diffSum / sampleCount;
    }
    
    // Save current frame for the next differencing check
    if (!lastFrameData || lastFrameData.length !== data.length) {
      lastFrameData = new Uint8ClampedArray(data.length);
    }
    lastFrameData.set(data);
    
    // 2. Background differencing to find moving/changed parts (magic tracking)
    let sumX = 0;
    let sumY = 0;
    let matchCount = 0;
    
    if (backgroundFrameData) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        const bg_r = backgroundFrameData[i];
        const bg_g = backgroundFrameData[i+1];
        const bg_b = backgroundFrameData[i+2];
        
        // Euclidean distance in RGB color space
        const dist = Math.sqrt(
          (r - bg_r) ** 2 +
          (g - bg_g) ** 2 +
          (b - bg_b) ** 2
        );
        
        if (dist > motionThreshold) {
          const idx = i / 4;
          const x = idx % visionCanvas.width;
          const y = Math.floor(idx / visionCanvas.width);
          
          sumX += x;
          sumY += y;
          matchCount++;
          
          // Draw a light red tint overlay on changed pixels
          data[i] = Math.min(255, data[i] + 40);
        }
      }
      
      // Update canvas with highlighted pixels
      ctx.putImageData(imgData, 0, 0);
    }
    
    // Draw visual sector grid division lines (35% and 65%)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    const div1 = visionCanvas.width * 0.35;
    const div2 = visionCanvas.width * 0.65;
    
    ctx.beginPath();
    ctx.moveTo(div1, 0); ctx.lineTo(div1, visionCanvas.height);
    ctx.moveTo(div2, 0); ctx.lineTo(div2, visionCanvas.height);
    ctx.stroke();
    
    // Require at least 150 matching pixels to filter out noise
    if (matchCount > 150) {
      const avgX = sumX / matchCount;
      const avgY = sumY / matchCount;
      
      currentCentroid = { x: avgX, y: avgY, detected: true };
      
      if (avgX < div1) {
        visionResult = 'left';
      } else if (avgX > div2) {
        visionResult = 'right';
      } else {
        visionResult = 'center';
      }
      
      // Draw crosshair target on the tracked movement centroid
      ctx.strokeStyle = 'var(--cyan-accent)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(avgX, avgY, 15, 0, 2 * Math.PI);
      ctx.moveTo(avgX - 22, avgY); ctx.lineTo(avgX + 22, avgY);
      ctx.moveTo(avgX, avgY - 22); ctx.lineTo(avgX, avgY + 22);
      ctx.stroke();
      
      ctx.fillStyle = 'var(--cyan-accent)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`CREATION (${Math.floor(avgX)}, ${Math.floor(avgY)})`, avgX + 20, avgY - 5);
    } else {
      visionResult = 'none';
      currentCentroid.detected = false;
    }
    
    // Send tracking results to the backend sensors model periodically
    sendVisionResult();
    
  } catch (err) {
    console.error("Frame process error:", err);
  }
  
  requestAnimationFrame(processFrame);
}

// Throttle sensor posts
let lastSentResult = 'none';
async function sendVisionResult() {
  if (visionResult === lastSentResult) return;
  lastSentResult = visionResult;
  
  try {
    await fetch('/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vision: visionResult })
    });
  } catch (err) {}
}


// --- 🧠 NEURAL NETWORK REINFORCEMENT LEARNING MODE ---

let learningModeActive = false;
let autopilotActive = false;
let trainingState = 'IDLE'; // 'IDLE', 'BG_CAPTURE', 'BABBLING'
let learningSamples = [];

// Single-Layer Perceptron weights and biases mapping (dx, dy) -> Motor speeds (A, B)
let nnWeights = [[0.0, 0.0], [0.0, 0.0]];
let nnBiases = [0.0, 0.0];

const btnLearnStart = document.getElementById('btn-learn-start');
const btnLearnTest = document.getElementById('btn-learn-test');
const learnConsole = document.getElementById('learning-console');
const networkDisplay = document.getElementById('network-display');

function logConsole(msg) {
  learnConsole.innerText += `\n> ${msg}`;
  learnConsole.scrollTop = learnConsole.scrollHeight;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// Trigger manual motor movement for calibration
async function triggerCalibMove(motor, steps) {
  try {
    await fetch('/api/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motor: motor, steps: steps, speed: 4 })
    });
  } catch (err) {
    logConsole(`Motor ${motor} command error: ` + err.message);
  }
}

// NN Start Button triggers background calibration step
btnLearnStart.addEventListener('click', async () => {
  if (learningModeActive) return;
  
  // Guard check: camera feed must be active
  if (!visionActive) {
    alert("Camera feed must be ACTIVE first! Click '📷 START FEED' on the video panel.");
    return;
  }
  
  if (trainingState === 'IDLE') {
    trainingState = 'BG_CAPTURE';
    btnLearnStart.innerText = "📸 CALIBRATING...";
    btnLearnStart.disabled = true;
    
    learnConsole.innerText = "Console: WIZARD STARTED.";
    logConsole("STEP 1: BACKGROUND CALIBRATION");
    logConsole("Capturing background scene... Please make sure your creation is STILL and hands are out of the frame.");
    
    await delay(1200); // Wait 1.2s for camera stability
    captureBackground();
    logConsole("Background captured successfully!");
    
    startCountdownAndCalibrate();
  }
});

// Countdown from 3 before running the motor babble sequence
async function startCountdownAndCalibrate() {
  trainingState = 'BABBLING';
  learningModeActive = true;
  btnLearnStart.innerText = "🎓 CALIBRATING...";
  btnLearnStart.disabled = true;
  btnLearnTest.disabled = true;
  btnLearnTest.innerText = "🤖 START AUTOPILOT";
  
  logConsole("Creation locked! Keep workspace clear.");
  await delay(600);
  
  logConsole("Starting kinematics babble in 3...");
  await delay(1000);
  logConsole("2...");
  await delay(1000);
  logConsole("1...");
  await delay(1000);
  
  runBabblingCalibration();
}

// Run babbling sequence to collect training samples
async function runBabblingCalibration() {
  learningSamples = [];
  logConsole("Executing motor babble sequence...");
  
  try {
    // Helper function to resolve current centroid coordinate (home is 160, 120)
    const getCent = () => currentCentroid.detected ? 
      { x: currentCentroid.x, y: currentCentroid.y } : 
      { x: 160, y: 120 };

    // --- Step 1: Babble Motor A (+) ---
    logConsole("Testing Left Motor A (+)...");
    await delay(500);
    let startCent = getCent();
    await triggerCalibMove('A', 350);
    await delay(1600);
    
    let endCent = getCent();
    let dx = endCent.x - startCent.x;
    let dy = endCent.y - startCent.y;
    learningSamples.push({ motorA: 1.0, motorB: 0.0, dx: dx, dy: dy });
    logConsole(`A(+) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 2: Babble Motor A (-) ---
    logConsole("Testing Left Motor A (-)...");
    await delay(500);
    startCent = getCent();
    await triggerCalibMove('A', -350);
    await delay(1600);
    
    endCent = getCent();
    dx = endCent.x - startCent.x;
    dy = endCent.y - startCent.y;
    learningSamples.push({ motorA: -1.0, motorB: 0.0, dx: dx, dy: dy });
    logConsole(`A(-) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 3: Babble Motor B (+) ---
    logConsole("Testing Right Motor B (+)...");
    await delay(500);
    startCent = getCent();
    await triggerCalibMove('B', 350);
    await delay(1600);
    
    endCent = getCent();
    dx = endCent.x - startCent.x;
    dy = endCent.y - startCent.y;
    learningSamples.push({ motorA: 0.0, motorB: 1.0, dx: dx, dy: dy });
    logConsole(`B(+) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 4: Babble Motor B (-) ---
    logConsole("Testing Right Motor B (-)...");
    await delay(500);
    startCent = getCent();
    await triggerCalibMove('B', -350);
    await delay(1600);
    
    endCent = getCent();
    dx = endCent.x - startCent.x;
    dy = endCent.y - startCent.y;
    learningSamples.push({ motorA: 0.0, motorB: -1.0, dx: dx, dy: dy });
    logConsole(`B(-) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // Run gradient descent training on collected datasets
    trainNeuralNetwork();
    
    btnLearnTest.disabled = false;
  } catch (err) {
    logConsole("Calibration failed: " + err.message);
    stopAll();
  } finally {
    learningModeActive = false;
    trainingState = 'IDLE';
    btnLearnStart.disabled = false;
    btnLearnStart.innerText = "🎓 START TRAINING";
    btnLearnStart.classList.add('btn-run');
    btnLearnStart.classList.remove('btn-stop');
  }
}

// Train the linear Single-Layer Neural Network using gradient descent
function trainNeuralNetwork() {
  logConsole("Initializing neural weights...");
  
  nnWeights = [[0.0, 0.0], [0.0, 0.0]];
  nnBiases = [0.0, 0.0];
  
  const lr = 0.1;
  const epochs = 1000;
  
  logConsole("Training network (1000 epochs)...");
  
  for (let epoch = 1; epoch <= epochs; epoch++) {
    for (let sample of learningSamples) {
      const norm_dx = sample.dx / 320;
      const norm_dy = sample.dy / 240;
      
      // Predict output mapping
      const predA = nnWeights[0][0]*norm_dx + nnWeights[0][1]*norm_dy + nnBiases[0];
      const predB = nnWeights[1][0]*norm_dx + nnWeights[1][1]*norm_dy + nnBiases[1];
      
      // Calculate delta error
      const errA = sample.motorA - predA;
      const errB = sample.motorB - predB;
      
      // Adjust weights
      nnWeights[0][0] += lr * errA * norm_dx;
      nnWeights[0][1] += lr * errA * norm_dy;
      nnBiases[0] += lr * errA;
      
      nnWeights[1][0] += lr * errB * norm_dx;
      nnWeights[1][1] += lr * errB * norm_dy;
      nnBiases[1] += lr * errB;
    }
  }
  
  logConsole("Neural calibration complete!");
  
  networkDisplay.innerHTML = `
    <strong>Weights:</strong><br>
    Motor A (Left) = [${nnWeights[0][0].toFixed(2)} * dx, ${nnWeights[0][1].toFixed(2)} * dy]<br>
    Motor B (Right) = [${nnWeights[1][0].toFixed(2)} * dx, ${nnWeights[1][1].toFixed(2)} * dy]
  `;
}

// Convert NN predictions [-1.0, 1.0] to API steps/speed delays
function mapSpeedValue(value) {
  const absVal = Math.abs(value);
  if (absVal < 0.15) {
    return { steps: 0, speed: 2 };
  }
  
  const direction = value > 0 ? 1 : -1;
  const steps = direction * 280; // step count size
  
  let speed = 15; // Slow
  if (absVal > 0.45 && absVal <= 0.75) {
    speed = 8;  // Medium
  } else if (absVal > 0.75) {
    speed = 2;  // Fast
  }
  
  return { steps: steps, speed: speed };
}

// Run Autopilot Control loop utilizing the trained Single-Layer Perceptron
async function runAutopilotLoop() {
  if (!autopilotActive) return;
  
  if (currentCentroid.detected) {
    const dx = 160 - currentCentroid.x;
    const dy = 120 - currentCentroid.y;
    
    const norm_dx = dx / 320;
    const norm_dy = dy / 240;
    
    const predA = nnWeights[0][0]*norm_dx + nnWeights[0][1]*norm_dy + nnBiases[0];
    const predB = nnWeights[1][0]*norm_dx + nnWeights[1][1]*norm_dy + nnBiases[1];
    
    const actA = mapSpeedValue(predA);
    const actB = mapSpeedValue(predB);
    
    try {
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'A', steps: actA.steps, speed: actA.speed })
      });
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'B', steps: actB.steps, speed: actB.speed })
      });
    } catch (err) {}
  } else {
    try {
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'A', steps: 0, speed: 2 })
      });
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'B', steps: 0, speed: 2 })
      });
    } catch (err) {}
  }
  
  setTimeout(runAutopilotLoop, 350);
}

btnLearnTest.addEventListener('click', () => {
  if (autopilotActive) {
    autopilotActive = false;
    btnLearnTest.innerText = "🤖 START AUTOPILOT";
    btnLearnTest.classList.remove('btn-stop');
    btnLearnTest.classList.add('btn-clear');
    logConsole("Autopilot stopped.");
    stopAll();
  } else {
    autopilotActive = true;
    btnLearnTest.innerText = "⏹ STOP AUTOPILOT";
    btnLearnTest.classList.remove('btn-clear');
    btnLearnTest.classList.add('btn-stop');
    logConsole("Autopilot started! Tracking color target...");
    runAutopilotLoop();
  }
});


// --- 📈 PERIODIC STATUS UPDATES ---

// Periodic status monitor polling (every 1 second)
async function updateStatus() {
  try {
    const resp = await fetch('/api/status');
    if (!resp.ok) throw new Error("HTTP error " + resp.status);
    
    const status = await resp.json();
    
    // Check if the motors list has changed from what we currently display
    const statusMotors = Object.keys(status.motors);
    const listsMatch = configuredMotors.length === statusMotors.length && 
                       configuredMotors.every(m => statusMotors.includes(m));
                       
    if (!listsMatch && statusMotors.length > 0) {
      initDynamicUI(statusMotors);
    }
    
    let isMoving = false;
    
    configuredMotors.forEach(motorName => {
      const valEl = document.getElementById(`status-motor-${motorName.toLowerCase()}-pos`);
      if (valEl && status.motors[motorName]) {
        valEl.innerText = status.motors[motorName].current;
        if (status.motors[motorName].moving) {
          isMoving = true;
        }
      }
    });

    // Update physical sensors indicators
    if (status.sensors) {
      const btnAEl = document.getElementById('status-btn-a');
      const btnBEl = document.getElementById('status-btn-b');
      const dialEl = document.getElementById('status-dial');
      
      if (btnAEl && status.sensors.button_a) {
        btnAEl.innerText = status.sensors.button_a.toUpperCase();
        if (status.sensors.button_a === 'pressed') {
          btnAEl.style.color = 'var(--cyan-accent)';
        } else {
          btnAEl.style.color = '';
        }
      }
      if (btnBEl && status.sensors.button_b) {
        btnBEl.innerText = status.sensors.button_b.toUpperCase();
        if (status.sensors.button_b === 'pressed') {
          btnBEl.style.color = 'var(--purple-accent)';
        } else {
          btnBEl.style.color = '';
        }
      }
      if (dialEl && status.sensors.potentiometer !== undefined) {
        dialEl.innerText = `${status.sensors.potentiometer}%`;
      }
    }
    
    if (isMoving) {
      statusRobotMode.innerText = autopilotActive ? "AUTOPILOT" : "DRIVING";
      statusRobotMode.style.color = "var(--cyan-accent)";
    } else {
      statusRobotMode.innerText = "IDLE";
      statusRobotMode.style.color = "";
    }
    
    connectionDot.className = "status-dot online";
    connectionText.innerText = "CONNECTED";
  } catch (err) {
    connectionDot.className = "status-dot";
    connectionText.innerText = "OFFLINE";
    statusRobotMode.innerText = "UNKNOWN";
    statusRobotMode.style.color = "var(--red-accent)";
  }
}

// Start polling status & dynamic UI initialization
initDynamicUI(configuredMotors);
setInterval(updateStatus, 1000);
updateStatus(); // Initial call
