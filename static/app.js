// State management
let activeContainer = null;
const mainWorkspace = document.getElementById('workspace-canvas');

// Default active container is the main workspace
setActiveContainer(mainWorkspace);

// Connection and status elements
const connectionDot = document.getElementById('connection-dot');
const connectionText = document.getElementById('connection-text');
const statusMotorAPos = document.getElementById('status-motor-a-pos');
const statusMotorBPos = document.getElementById('status-motor-b-pos');
const statusRobotMode = document.getElementById('status-robot-mode');

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
  
  // Normal blocks
  const block = document.createElement('div');
  block.className = 'program-block';
  block.dataset.blockType = type;
  
  let innerHTML = `<span class="block-handle">☰</span><div class="block-content">`;
  
  if (type === 'motor-a') {
    innerHTML += `
      <span>Move Motor A</span>
      <input type="number" value="100" min="1" max="10000" class="motor-steps">
      <span>steps at speed delay</span>
      <input type="number" value="2" min="1" max="50" class="motor-speed">
      <span>ms</span>
      <select class="motor-dir">
        <option value="1">Forward</option>
        <option value="-1">Backward</option>
      </select>
    `;
  } else if (type === 'motor-b') {
    innerHTML += `
      <span>Move Motor B</span>
      <input type="number" value="100" min="1" max="10000" class="motor-steps">
      <span>steps at speed delay</span>
      <input type="number" value="2" min="1" max="50" class="motor-speed">
      <span>ms</span>
      <select class="motor-dir">
        <option value="1">Forward</option>
        <option value="-1">Backward</option>
      </select>
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
      if (type === 'motor-a' || type === 'motor-b') {
        const motor = type === 'motor-a' ? 'A' : 'B';
        const steps = parseInt(child.querySelector('.motor-steps').value) || 0;
        const speed = parseInt(child.querySelector('.motor-speed').value) || 2;
        const dir = parseInt(child.querySelector('.motor-dir').value) || 1;
        
        blocks.push({
          action: 'move',
          motor: motor,
          steps: steps * dir,
          speed: speed
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
    console.error("Error stopping robot:", err);
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
    this.trackHeight = 180;
    this.handleSize = 50;
    this.borderSize = 2;
    this.maxDisplacement = (this.trackHeight - (this.borderSize * 2) - this.handleSize) / 2; // 63px
    this.centerTop = this.maxDisplacement; // 63px
    
    // State tracking to throttle requests
    this.currentState = "STOP";
    
    this.initEvents();
  }
  
  initEvents() {
    const startDrag = (e) => {
      // Don't override joysticks if autopilot, learning mode, or pet mode is active
      if (autopilotActive || learningModeActive || petModeActive) return;
      
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
    } else if (this.motorName === "A") {
      this.valDisplay.style.color = "var(--cyan-accent)";
    } else {
      this.valDisplay.style.color = "var(--purple-accent)";
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

// Instantiate Left and Right Joysticks
const joyA = new Joystick('joy-a-track', 'joy-a-handle', 'joy-a-val', 'A');
const joyB = new Joystick('joy-b-track', 'joy-b-handle', 'joy-b-val', 'B');


// --- 📷 CLIENT-SIDE COMPUTER VISION COLOR TRACKING ---

const visionVideo = document.getElementById('vision-video');
const visionCanvas = document.getElementById('vision-canvas');
const visionPlaceholder = document.getElementById('vision-placeholder');
const btnStartVision = document.getElementById('btn-start-vision');
const btnStopVision = document.getElementById('btn-stop-vision');
const colorPreview = document.getElementById('color-preview');

let visionActive = false;
let visionStream = null;
let targetColor = { r: 255, g: 0, b: 0 }; // Default tracking color: Red
let colorTolerance = 55; // Sensitivity margin for matching
let visionResult = 'none'; // 'left', 'center', 'right', or 'none'

// Centroid tracking coordinate states shared with neural network and pet mode
let currentCentroid = { x: 0, y: 0, detected: false };

// Target positions coordinates for Pet Mode (Wandering & Treats placement)
let virtualTreat = { x: 0, y: 0, active: false };
let exploreGoal = { x: 0, y: 0, active: false };

// Frame differencing variables to detect if the robot is moving or stuck (blocked)
let lastFrameData = null;
let currentFrameDiff = 0;

// Set internal analysis resolution
visionCanvas.width = 320;
visionCanvas.height = 240;

const ctx = visionCanvas.getContext('2d');

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
    
    visionActive = true;
    requestAnimationFrame(processFrame);
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
  currentFrameDiff = 0;
  virtualTreat.active = false;
  exploreGoal.active = false;
  
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

// Click-to-pick target tracking color OR place virtual food target in Pet Mode
visionCanvas.addEventListener('click', (e) => {
  if (!visionActive) return;
  
  const rect = visionCanvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * visionCanvas.width);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * visionCanvas.height);
  
  if (petModeActive) {
    // In Pet Mode, clicking the viewport places a virtual treat for the pet to track
    virtualTreat = { x: x, y: y, active: true };
    exploreGoal.active = false; // Override wandering goal
    petLogConsole("Candy target placed! 🍬");
    transitionPetState('PLAYING');
  } else {
    // Normal mode: pick color to track
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      targetColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
      colorPreview.style.backgroundColor = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
      
      // If we are in color registration training step, check if the color is registered successfully
      if (trainingState === 'COLOR_REGISTER') {
        setTimeout(() => {
          if (currentCentroid.detected) {
            logConsole(`Robot scanned successfully! Centroid locked at (${Math.floor(currentCentroid.x)}, ${Math.floor(currentCentroid.y)})`);
            startCountdownAndCalibrate();
          } else {
            logConsole("Scan failed. Marker not recognized. Click again on a bright, distinct color on the robot.");
          }
        }, 120);
      }
    } catch (err) {
      console.error("Color picker failed:", err);
    }
  }
});

// Image Processing loop (Color Blob Tracking + Visual Motion Diff + UI overlays)
function processFrame() {
  if (!visionActive) return;
  
  try {
    // Draw current camera frame
    ctx.drawImage(visionVideo, 0, 0, visionCanvas.width, visionCanvas.height);
    
    // Read frame pixels
    const imgData = ctx.getImageData(0, 0, visionCanvas.width, visionCanvas.height);
    const data = imgData.data;
    
    // 1. Calculate frame-to-frame change (difference) to detect if robot is blocked/moving
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
    
    // 2. Color Blob Tracking (tracking robot's visual marker)
    let sumX = 0;
    let sumY = 0;
    let matchCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      const dist = Math.sqrt(
        (r - targetColor.r) ** 2 +
        (g - targetColor.g) ** 2 +
        (b - targetColor.b) ** 2
      );
      
      if (dist < colorTolerance) {
        const idx = i / 4;
        const x = idx % visionCanvas.width;
        const y = Math.floor(idx / visionCanvas.width);
        
        sumX += x;
        sumY += y;
        matchCount++;
      }
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
    
    // Draw coordinates trails & visual markers
    let robotX = 0, robotY = 0;
    
    if (matchCount > 40) {
      const avgX = sumX / matchCount;
      const avgY = sumY / matchCount;
      
      robotX = avgX;
      robotY = avgY;
      
      currentCentroid = { x: avgX, y: avgY, detected: true };
      
      if (avgX < div1) {
        visionResult = 'left';
      } else if (avgX > div2) {
        visionResult = 'right';
      } else {
        visionResult = 'center';
      }
      
      // Draw crosshair target on robot marker
      ctx.strokeStyle = 'var(--cyan-accent)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(avgX, avgY, 15, 0, 2 * Math.PI);
      ctx.moveTo(avgX - 22, avgY); ctx.lineTo(avgX + 22, avgY);
      ctx.moveTo(avgX, avgY - 22); ctx.lineTo(avgX, avgY + 22);
      ctx.stroke();
      
      ctx.fillStyle = 'var(--cyan-accent)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`ROBOT (${Math.floor(avgX)}, ${Math.floor(avgY)})`, avgX + 20, avgY - 5);
    } else {
      visionResult = 'none';
      currentCentroid.detected = false;
    }
    
    // 3. Render Pet targets (Candy treat or Wander Goal)
    if (petModeActive) {
      if (virtualTreat.active) {
        // Draw placed candy target
        ctx.fillStyle = 'var(--green-accent)';
        ctx.beginPath();
        ctx.arc(virtualTreat.x, virtualTreat.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = 'var(--green-accent)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(virtualTreat.x, virtualTreat.y, 14, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText("🍬 CANDY TREAT", virtualTreat.x + 18, virtualTreat.y + 4);
        
        // Draw planned vector line from robot position to target
        if (currentCentroid.detected) {
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(robotX, robotY);
          ctx.lineTo(virtualTreat.x, virtualTreat.y);
          ctx.stroke();
          ctx.setLineDash([]); // Reset
        }
      } else if (exploreGoal.active) {
        // Draw dotted wander target
        ctx.strokeStyle = 'var(--orange-accent)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(exploreGoal.x, exploreGoal.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'var(--orange-accent)';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText("🔍 EXPLORING...", exploreGoal.x + 14, exploreGoal.y + 3);
        
        if (currentCentroid.detected) {
          ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(robotX, robotY);
          ctx.lineTo(exploreGoal.x, exploreGoal.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    } else {
      // Normal UI text indicator
      if (currentCentroid.detected) {
        ctx.fillStyle = 'var(--green-accent)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`TARGET ZONE: ${visionResult.toUpperCase()}`, 10, 20);
      } else {
        ctx.fillStyle = 'var(--red-accent)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('SEARCHING FOR MARKER...', 10, 20);
      }
    }
    
  } catch (err) {
    console.error("Frame processing error:", err);
  }
  
  requestAnimationFrame(processFrame);
}

// Push local vision sensor states to the ESP32 (throttled loop)
async function pushSensors() {
  if (!visionActive) return;
  
  try {
    await fetch('/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vision: visionResult })
    });
  } catch (err) {}
}
setInterval(pushSensors, 250);


// --- 🧠 CLIENT-SIDE NEURAL NETWORK KINEMATICS LEARNING ---

let learningModeActive = false;
let autopilotActive = false;
let trainingState = 'IDLE'; // 'IDLE', 'COLOR_REGISTER', 'BABBLING'
let learningSamples = [];

// Weights: mapping [norm_dx, norm_dy] input to [MotorA, MotorB] outputs
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

// Utility delay function
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

// NN Start Button triggers color registration step
btnLearnStart.addEventListener('click', () => {
  if (learningModeActive || petModeActive) return;
  
  // Guard check: camera feed must be active
  if (!visionActive) {
    alert("Camera feed must be ACTIVE first! Click '📷 START FEED' on the video panel.");
    return;
  }
  
  if (trainingState === 'IDLE') {
    trainingState = 'COLOR_REGISTER';
    btnLearnStart.innerText = "🎯 SCANNED?";
    btnLearnStart.classList.add('btn-stop');
    btnLearnStart.classList.remove('btn-run');
    
    learnConsole.innerText = "Console: WIZARD STARTED.";
    logConsole("STEP 1: SCAN THE ROBOT!");
    logConsole("Click directly on the robot's colored tracking marker in the camera view above to register its color.");
  } else if (trainingState === 'COLOR_REGISTER') {
    logConsole("Still waiting for robot scan. Click on the robot's colored marker in the video viewport.");
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
  
  logConsole("Robot locked! Keep workspace clear.");
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
    // --- Step 1: Babble Motor A (+) ---
    logConsole("Testing Left Motor A (+)...");
    await delay(500);
    let startCent = { x: currentCentroid.x, y: currentCentroid.y };
    await triggerCalibMove('A', 350);
    await delay(1600);
    
    if (!currentCentroid.detected) throw new Error("Lost tracking target! Place the target back and try again.");
    let dx = currentCentroid.x - startCent.x;
    let dy = currentCentroid.y - startCent.y;
    learningSamples.push({ motorA: 1.0, motorB: 0.0, dx: dx, dy: dy });
    logConsole(`A(+) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 2: Babble Motor A (-) ---
    logConsole("Testing Left Motor A (-)...");
    await delay(500);
    startCent = { x: currentCentroid.x, y: currentCentroid.y };
    await triggerCalibMove('A', -350);
    await delay(1600);
    
    if (!currentCentroid.detected) throw new Error("Lost tracking target!");
    dx = currentCentroid.x - startCent.x;
    dy = currentCentroid.y - startCent.y;
    learningSamples.push({ motorA: -1.0, motorB: 0.0, dx: dx, dy: dy });
    logConsole(`A(-) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 3: Babble Motor B (+) ---
    logConsole("Testing Right Motor B (+)...");
    await delay(500);
    startCent = { x: currentCentroid.x, y: currentCentroid.y };
    await triggerCalibMove('B', 350);
    await delay(1600);
    
    if (!currentCentroid.detected) throw new Error("Lost tracking target!");
    dx = currentCentroid.x - startCent.x;
    dy = currentCentroid.y - startCent.y;
    learningSamples.push({ motorA: 0.0, motorB: 1.0, dx: dx, dy: dy });
    logConsole(`B(+) displacement: dx=${dx.toFixed(1)}px, dy=${dy.toFixed(1)}px`);
    
    // --- Step 4: Babble Motor B (-) ---
    logConsole("Testing Right Motor B (-)...");
    await delay(500);
    startCent = { x: currentCentroid.x, y: currentCentroid.y };
    await triggerCalibMove('B', -350);
    await delay(1600);
    
    if (!currentCentroid.detected) throw new Error("Lost tracking target!");
    dx = currentCentroid.x - startCent.x;
    dy = currentCentroid.y - startCent.y;
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
      
      const predA = nnWeights[0][0]*norm_dx + nnWeights[0][1]*norm_dy + nnBiases[0];
      const predB = nnWeights[1][0]*norm_dx + nnWeights[1][1]*norm_dy + nnBiases[1];
      
      const errA = sample.motorA - predA;
      const errB = sample.motorB - predB;
      
      nnWeights[0][0] += lr * errA * norm_dx;
      nnWeights[0][1] += lr * errA * norm_dy;
      nnBiases[0] += lr * errA;
      
      nnWeights[1][0] += lr * errB * norm_dx;
      nnWeights[1][1] += lr * errB * norm_dy;
      nnBiases[1] += lr * errB;
    }
  }
  
  logConsole("Network converged successfully!");
  updateNetworkDisplay();
}

function updateNetworkDisplay() {
  const w = nnWeights;
  const b = nnBiases;
  
  networkDisplay.innerHTML = `
    <strong>Motor A (Left) Neural formula:</strong><br>
    SpeedA = (${w[0][0].toFixed(2)} × dx) + (${w[0][1].toFixed(2)} × dy) + ${b[0].toFixed(2)}<br><br>
    <em>Motor B (Right) Neural formula:</em><br>
    SpeedB = (${w[1][0].toFixed(2)} × dx) + (${w[1][1].toFixed(2)} × dy) + ${b[1].toFixed(2)}
  `;
}

// Map predictions from neural net to motor execution calls
function mapSpeedValue(normSpeed) {
  if (Math.abs(normSpeed) < 0.15) return { steps: 0, speed: 2 };
  
  const direction = normSpeed > 0 ? 1 : -1;
  const absVal = Math.min(1.0, Math.abs(normSpeed));
  
  let speed = 15;
  if (absVal > 0.7) speed = 2;
  else if (absVal > 0.4) speed = 8;
  
  return { steps: direction * 400, speed: speed };
}

// Autopilot loop: feeds camera offsets to neural net and moves motors
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


// --- 🐾 ROBOT PET FACE MODE STATE MACHINE ---

let petModeActive = false;
let petState = 'SLEEPING'; // 'SLEEPING', 'WAKING', 'EXPLORING', 'PLAYING', 'ANGRY'

// Audio mic / clap detection variables
let audioContext = null;
let audioStream = null;
let micAnalyser = null;
let micProcessInterval = null;

const petFaceOverlay = document.getElementById('pet-face-overlay');
const btnTogglePetMode = document.getElementById('btn-toggle-pet-mode');
const petStatusText = document.getElementById('pet-status-text');
const petLog = document.getElementById('pet-log');
const btnExitPet = document.getElementById('btn-exit-pet');

// Eye DOM elements for animations
const eyeLeft = document.getElementById('eye-left');
const eyeRight = document.getElementById('eye-right');

btnTogglePetMode.addEventListener('click', () => {
  if (petModeActive) {
    exitPetMode();
  } else {
    enterPetMode();
  }
});

btnExitPet.addEventListener('click', exitPetMode);

function petLogConsole(msg) {
  petLog.innerText += `\n> ${msg}`;
  petLog.scrollTop = petLog.scrollHeight;
}

async function enterPetMode() {
  if (learningModeActive || autopilotActive) {
    alert("Please stop calibration or autopilot before launching Pet Mode!");
    return;
  }
  
  petModeActive = true;
  petFaceOverlay.classList.remove('hidden');
  petFaceOverlay.offsetHeight; // force reflow
  petFaceOverlay.classList.add('active');
  
  // Re-parent the video and canvas into the Pet Mode overlay viewport container
  const visionPanel = document.getElementById('pet-vision-panel');
  visionPanel.appendChild(visionVideo);
  visionPanel.appendChild(visionCanvas);
  
  // Start vision processing in background
  if (!visionActive) {
    btnStartVision.click();
  }
  
  // Initialize microphone listener for clapping wake-ups
  await initMicrophone();
  
  // Initial state: sleeping
  transitionPetState('SLEEPING');
  petLog.innerText = "Console: Remote Robot Pet activated.";
  
  runPetStateMachine();
}

function exitPetMode() {
  if (!petModeActive) return;
  petModeActive = false;
  
  petFaceOverlay.classList.remove('active');
  setTimeout(() => petFaceOverlay.classList.add('hidden'), 500);
  
  // Re-parent video and canvas back to the main dashboard vision container card
  const mainVisionCard = document.querySelector('.vision-feed-container');
  mainVisionCard.appendChild(visionVideo);
  mainVisionCard.appendChild(visionCanvas);
  
  stopMicrophone();
  stopAll();
  
  virtualTreat.active = false;
  exploreGoal.active = false;
}

// State Machine transitions
function transitionPetState(newState) {
  petState = newState;
  
  // Reset CSS classes
  petFaceOverlay.classList.remove('pet-sleeping', 'pet-happy', 'pet-angry');
  
  if (newState === 'SLEEPING') {
    petFaceOverlay.classList.add('pet-sleeping');
    petStatusText.innerText = "ZZZ... Sleeping (CLAP to wake)";
  } else if (newState === 'WAKING') {
    petFaceOverlay.classList.add('pet-happy');
    petStatusText.innerText = "Yawn! waking up!";
  } else if (newState === 'EXPLORING') {
    // default scanning eyes
    petStatusText.innerText = "Exploring the room...";
  } else if (newState === 'PLAYING') {
    petFaceOverlay.classList.add('pet-happy');
    petStatusText.innerText = "PLAYING! Chasing candy 🍬";
  } else if (newState === 'ANGRY') {
    petFaceOverlay.classList.add('pet-angry');
    petStatusText.innerText = "OBSTACLE DETECTED! OUCH!";
  }
}

// Micro claps listener
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
    let lastClap = 0;
    
    micProcessInterval = setInterval(() => {
      if (!petModeActive) return;
      micAnalyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      let avgVolume = sum / bufferLength;
      
      // Clap spike trigger threshold
      if (avgVolume > 95) {
        let now = Date.now();
        if (now - lastClap > 600) {
          lastClap = now;
          onClapDetected();
        }
      }
    }, 40);
  } catch (err) {
    console.warn("Could not capture microphone: " + err.message);
  }
}

function stopMicrophone() {
  if (micProcessInterval) clearInterval(micProcessInterval);
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

// Wake up on clapping
async function onClapDetected() {
  if (!petModeActive) return;
  
  if (petState === 'SLEEPING') {
    transitionPetState('WAKING');
    petLogConsole("Clap heard! Waking up robot...");
    
    // Play happy waking wiggle dance
    try {
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'A', steps: 150, speed: 3 })
      });
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'B', steps: -150, speed: 3 })
      });
      await delay(500);
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'A', steps: -300, speed: 3 })
      });
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'B', steps: 300, speed: 3 })
      });
      await delay(500);
    } catch(err) {}
    
    transitionPetState('EXPLORING');
  } else if (petState === 'EXPLORING' || petState === 'PLAYING') {
    // Play happy spin on clap
    petLogConsole("Clap detected! Happy wiggle!");
    try {
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'A', steps: 400, speed: 2 })
      });
      await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: 'B', steps: -400, speed: 2 })
      });
    } catch(err) {}
  }
}

// Run state machine routine (re-evaluates every 350ms)
let petCycleCount = 0;
async function runPetStateMachine() {
  if (!petModeActive) return;
  
  try {
    // 1. SLEEPING STATE
    if (petState === 'SLEEPING') {
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
    }
    
    // 2. EXPLORING STATE (Wandering around the camera field autonomously)
    if (petState === 'EXPLORING') {
      // Pupils scan left/right
      petCycleCount++;
      const pupils = document.querySelectorAll('.pupil');
      const offset = Math.sin(petCycleCount * 0.4) * 15;
      pupils.forEach(pupil => {
        pupil.style.transform = `translateX(${offset}px)`;
      });
      
      // If client placed virtual food target, transition to Playing mode
      if (virtualTreat.active) {
        transitionPetState('PLAYING');
      } else {
        // Check if robot marker is visible
        if (currentCentroid.detected) {
          // If we reached our wander destination (or don't have one), pick a new random coord
          let arrivedAtGoal = false;
          if (exploreGoal.active) {
            const dist = Math.sqrt((exploreGoal.x - currentCentroid.x)**2 + (exploreGoal.y - currentCentroid.y)**2);
            if (dist < 20) arrivedAtGoal = true;
          }
          
          if (!exploreGoal.active || arrivedAtGoal) {
            exploreGoal = {
              x: 40 + Math.random() * 240, // [40, 280]
              y: 40 + Math.random() * 160, // [40, 200]
              active: true
            };
            petLogConsole(`Found new coordinate: (${Math.floor(exploreGoal.x)}, ${Math.floor(exploreGoal.y)})`);
            
            // Short wiggle pause upon goal arrival
            if (arrivedAtGoal) {
              await triggerCalibMove('A', 150);
              await triggerCalibMove('B', -150);
              await delay(400);
            }
          }
          
          // Check if driving but video pixels are static (blocked against obstacle)
          if (currentFrameDiff > 0 && currentFrameDiff < 3.2) {
            transitionPetState('ANGRY');
            exploreGoal.active = false;
            await stopAll();
            petLogConsole("Robot blocked! Reversing...");
            
            // Run escape move
            await fetch('/api/manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ motor: 'A', steps: -500, speed: 4 })
            });
            await fetch('/api/manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ motor: 'B', steps: -500, speed: 4 })
            });
            await delay(1200);
            
            // Spin to head in new direction
            await fetch('/api/manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ motor: 'A', steps: 400, speed: 3 })
            });
            await fetch('/api/manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ motor: 'B', steps: -400, speed: 3 })
            });
            await delay(1000);
            
            transitionPetState('EXPLORING');
          } else {
            // Drive towards the wandering exploreGoal coordinate using learned weights
            const dx = exploreGoal.x - currentCentroid.x;
            const dy = exploreGoal.y - currentCentroid.y;
            
            const norm_dx = dx / 320;
            const norm_dy = dy / 240;
            
            const predA = nnWeights[0][0]*norm_dx + nnWeights[0][1]*norm_dy + nnBiases[0];
            const predB = nnWeights[1][0]*norm_dx + nnWeights[1][1]*norm_dy + nnBiases[1];
            
            const actA = mapSpeedValue(predA);
            const actB = mapSpeedValue(predB);
            
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
          }
        } else {
          // If robot tracking marker is lost, search by spinning slowly
          await fetch('/api/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motor: 'A', steps: 200, speed: 10 })
          });
          await fetch('/api/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motor: 'B', steps: -200, speed: 10 })
          });
        }
      }
    }
    
    // 3. PLAYING STATE (Chasing the virtual treat coordinate)
    if (petState === 'PLAYING') {
      if (!virtualTreat.active) {
        transitionPetState('EXPLORING');
      } else if (currentCentroid.detected) {
        // Calculate error offsets between robot marker and treat
        const dx = virtualTreat.x - currentCentroid.x;
        const dy = virtualTreat.y - currentCentroid.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // If robot reached the treat (within 20 pixels radius)
        if (dist < 20) {
          virtualTreat.active = false;
          petLogConsole("Yum! Candy eaten! Happy wiggle! 🍬");
          
          // Happy dance wiggle
          await triggerCalibMove('A', 250);
          await triggerCalibMove('B', -250);
          await delay(450);
          await triggerCalibMove('A', -250);
          await triggerCalibMove('B', 250);
          await delay(450);
          
          transitionPetState('EXPLORING');
        } else {
          // Drive toward virtual treat using Neural Network formulas
          const norm_dx = dx / 320;
          const norm_dy = dy / 240;
          
          const predA = nnWeights[0][0]*norm_dx + nnWeights[0][1]*norm_dy + nnBiases[0];
          const predB = nnWeights[1][0]*norm_dx + nnWeights[1][1]*norm_dy + nnBiases[1];
          
          const actA = mapSpeedValue(predA);
          const actB = mapSpeedValue(predB);
          
          // Pupils track the treat visually
          const pupils = document.querySelectorAll('.pupil');
          const pupilX = (virtualTreat.x - 160) / 160 * 18;
          const pupilY = (virtualTreat.y - 120) / 120 * 18;
          pupils.forEach(pupil => {
            pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
          });
          
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
        }
      } else {
        // If robot marker is lost while chasing, wait and search
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
      }
    }
  } catch (err) {}
  
  // Recheck state loop
  setTimeout(runPetStateMachine, 350);
}


// --- 📈 PERIODIC STATUS UPDATES ---

// Periodic status monitor polling (every 1 second)
async function updateStatus() {
  try {
    const resp = await fetch('/api/status');
    if (!resp.ok) throw new Error("HTTP error " + resp.status);
    
    const status = await resp.json();
    
    statusMotorAPos.innerText = status.motorA.current;
    statusMotorBPos.innerText = status.motorB.current;
    
    const isMoving = status.motorA.moving || status.motorB.moving;
    
    if (isMoving) {
      if (petModeActive) {
        statusRobotMode.innerText = petState;
      } else {
        statusRobotMode.innerText = autopilotActive ? "AUTOPILOT" : "DRIVING";
      }
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

// Start polling status
setInterval(updateStatus, 1000);
updateStatus(); // Initial call
