// Determine if we are hosted online (e.g. GitHub Pages PWA).
// If so, all API calls must be directed to the captive portal domain.
const API_BASE = window.location.protocol === 'https:' ? 'http://robot.com' : '';

// State management
const mainWorkspace = document.getElementById('workspace-canvas');

// Connection and status elements
const connectionDot = document.getElementById('connection-dot');
const connectionText = document.getElementById('connection-text');
const statusRobotMode = document.getElementById('status-robot-mode');

// Dynamic motors configuration
let configuredMotors = ['A', 'B']; // Default fallback
let activeJoysticks = {};
let workspace = null;

// --- DUAL BLOCKS/CODE WORKSPACE MANAGER ---
let currentEditorMode = 'blocks'; // 'blocks' or 'code'

const btnModeBlocks = document.getElementById('btn-mode-blocks');
const btnModeCode = document.getElementById('btn-mode-code');
const workspaceCanvas = document.getElementById('workspace-canvas');
const codePreviewPane = document.getElementById('code-preview-pane');
const rawCodeEditor = document.getElementById('raw-code-editor');
const rawCodeTextarea = document.getElementById('raw-code-textarea');
const toolboxAside = document.querySelector('.toolbox');

// Helper to get dropdown options for configured motors dynamically
function getMotorOptions() {
  if (!configuredMotors || configuredMotors.length === 0) {
    return [["Motor A", "A"], ["Motor B", "B"]];
  }
  return configuredMotors.map(m => ["Motor " + m, m]);
}

// Define custom Blockly blocks
Blockly.Blocks['motor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move")
        .appendField(new Blockly.FieldDropdown(() => getMotorOptions()), "MOTOR")
        .appendField(new Blockly.FieldNumber(100, 1, 10000), "STEPS")
        .appendField("steps at speed delay")
        .appendField(new Blockly.FieldNumber(2, 1, 50), "SPEED")
        .appendField("ms")
        .appendField(new Blockly.FieldDropdown([["Forward", "1"], ["Backward", "-1"]]), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4C97FF");
  }
};

Blockly.Blocks['set-speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set Speed of")
        .appendField(new Blockly.FieldDropdown(() => getMotorOptions()), "MOTOR")
        .appendField("to speed delay")
        .appendField(new Blockly.FieldNumber(2, 1, 50), "SPEED")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4C97FF");
  }
};

Blockly.Blocks['stop-all'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🛑 Stop Motors");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4C97FF");
  }
};

Blockly.Blocks['wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Wait")
        .appendField(new Blockly.FieldNumber(1.0, 0.1, 60, 0.1), "DURATION")
        .appendField("seconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 Repeat")
        .appendField(new Blockly.FieldNumber(3, 1, 100), "COUNT")
        .appendField("times");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-vision'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔍 If Vision detects target on")
        .appendField(new Blockly.FieldDropdown([
          ["Left", "left"],
          ["Center", "center"],
          ["Right", "right"],
          ["None", "none"]
        ]), "VALUE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF6680");
  }
};

Blockly.Blocks['if-sound'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎤 If Sound detects")
        .appendField(new Blockly.FieldDropdown([
          ["Clap", "clap"],
          ["None", "none"]
        ]), "VALUE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9966FF");
  }
};

Blockly.Blocks['if-tilt'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📱 If Phone is tilted")
        .appendField(new Blockly.FieldDropdown([
          ["Forward", "forward"],
          ["Backward", "backward"],
          ["Left", "left"],
          ["Right", "right"]
        ]), "VALUE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-shake'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📳 If Phone is shaken");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-compass'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧭 If Phone points")
        .appendField(new Blockly.FieldDropdown([
          ["North", "north"],
          ["South", "south"],
          ["East", "east"],
          ["West", "west"]
        ]), "VALUE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-button'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔘 If Button")
        .appendField(new Blockly.FieldDropdown([
          ["A (GP12)", "button_a"],
          ["B (GP13)", "button_b"]
        ]), "BUTTON")
        .appendField("is")
        .appendField(new Blockly.FieldDropdown([
          ["Pressed", "pressed"],
          ["Released", "released"]
        ]), "STATE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF6680");
  }
};

Blockly.Blocks['if-dial'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎛️ If Dial (GP14) is")
        .appendField(new Blockly.FieldDropdown([
          ["Greater than", "gt"],
          ["Less than", "lt"],
          ["Equal to", "eq"]
        ]), "OP")
        .appendField(new Blockly.FieldNumber(50, 0, 100), "VAL")
        .appendField("%");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📡 If Infrared on")
        .appendField(new Blockly.FieldDropdown([
          ["GP12", "button_a"],
          ["GP13", "button_b"]
        ]), "PORT")
        .appendField("detects")
        .appendField(new Blockly.FieldDropdown([
          ["Object/Line (Low)", "pressed"],
          ["Nothing (High)", "released"]
        ]), "STATE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF6680");
  }
};

Blockly.Blocks['if-light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("☀️ If Light (GP14) is")
        .appendField(new Blockly.FieldDropdown([
          ["Darker than", "lt"],
          ["Brighter than", "gt"],
          ["Equal to", "eq"]
        ]), "OP")
        .appendField(new Blockly.FieldNumber(30, 0, 100), "VAL")
        .appendField("%");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FFAB19");
  }
};

Blockly.Blocks['if-limit'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🛑 If Limit Switch on")
        .appendField(new Blockly.FieldDropdown([
          ["GP12", "button_a"],
          ["GP13", "button_b"]
        ]), "PORT")
        .appendField("is")
        .appendField(new Blockly.FieldDropdown([
          ["Triggered (Pressed)", "pressed"],
          ["Open (Released)", "released"]
        ]), "STATE");
    this.appendStatementInput("SUBSTACK")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF6680");
  }
};

// Category Toolbox JSON configuration (matches Scratch visually)
const toolboxJson = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Motion",
      "colour": "#4C97FF",
      "contents": [
        {
          "kind": "block",
          "type": "motor"
        },
        {
          "kind": "block",
          "type": "set-speed"
        },
        {
          "kind": "block",
          "type": "stop-all"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Control",
      "colour": "#FFAB19",
      "contents": [
        {
          "kind": "block",
          "type": "wait"
        },
        {
          "kind": "block",
          "type": "loop"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Sensing",
      "colour": "#FF6680",
      "contents": [
        {
          "kind": "block",
          "type": "if-vision"
        },
        {
          "kind": "block",
          "type": "if-sound"
        },
        {
          "kind": "block",
          "type": "if-tilt"
        },
        {
          "kind": "block",
          "type": "if-shake"
        },
        {
          "kind": "block",
          "type": "if-compass"
        },
        {
          "kind": "block",
          "type": "if-button"
        },
        {
          "kind": "block",
          "type": "if-dial"
        },
        {
          "kind": "block",
          "type": "if-ir"
        },
        {
          "kind": "block",
          "type": "if-light"
        },
        {
          "kind": "block",
          "type": "if-limit"
        }
      ]
    }
  ]
};

// Initialize Blockly Workspace
function initBlockly() {
  workspace = Blockly.inject('workspace-canvas', {
    toolbox: toolboxJson,
    media: 'media/',   // ship Blockly's sounds/sprites locally -- the default is a remote URL that's unreachable on the robot's offline captive portal
    scrollbars: true,
    trashcan: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true
    }
  });

  // Watch for workspace changes to regenerate preview and auto-save
  workspace.addChangeListener((event) => {
    if (event.isUiEvent) return;
    updateCodePreview();
  });
}

btnModeBlocks.addEventListener('click', () => {
  if (currentEditorMode === 'blocks') return;
  currentEditorMode = 'blocks';
  
  btnModeBlocks.classList.add('active');
  btnModeCode.classList.remove('active');
  
  workspaceCanvas.style.display = 'block';
  codePreviewPane.style.display = 'flex';
  rawCodeEditor.style.display = 'none';
  if (toolboxAside) toolboxAside.style.display = 'none';
  
  localStorage.setItem('editor_mode', 'blocks');
  
  if (workspace) {
    Blockly.svgResize(workspace);
  }
  updateCodePreview();
});

btnModeCode.addEventListener('click', () => {
  if (currentEditorMode === 'code') return;
  currentEditorMode = 'code';
  
  btnModeCode.classList.add('active');
  btnModeBlocks.classList.remove('active');
  
  workspaceCanvas.style.display = 'none';
  codePreviewPane.style.display = 'none';
  rawCodeEditor.style.display = 'flex';
  if (toolboxAside) toolboxAside.style.display = 'none';
  
  localStorage.setItem('editor_mode', 'code');
  
  const recipe = compileWorkspace();
  const pythonCode = generateMicroPython(recipe);
  rawCodeTextarea.value = pythonCode || "# Write custom MicroPython code here...\nimport uasyncio as asyncio\n\n";
  localStorage.setItem('raw_python_code', rawCodeTextarea.value);
});

// Update the code preview and save settings automatically
function updateCodePreview() {
  const recipe = compileWorkspace();
  const pythonCode = generateMicroPython(recipe);
  const previewText = document.getElementById('code-preview-text');
  if (previewText) {
    previewText.innerText = pythonCode || "# Drag blocks here to generate MicroPython code...";
  }
  
  // Auto-save blocks structure in Blockly XML/JSON serialization format
  if (workspace && currentEditorMode === 'blocks') {
    try {
      const state = Blockly.serialization.workspaces.save(workspace);
      localStorage.setItem('workspace_blocks', JSON.stringify(state));
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }
  updateEmptyMessages();
}

// Show/hide empty workspace placeholders
function updateEmptyMessages() {
  const emptyMsg = document.getElementById('empty-message');
  if (!emptyMsg) return;
  const hasBlocks = workspace && workspace.getAllBlocks(false).length > 0;
  if (hasBlocks) {
    emptyMsg.style.display = 'none';
  } else {
    emptyMsg.style.display = 'flex';
  }
}

// Clear workspace
document.getElementById('btn-clear-workspace').addEventListener('click', () => {
  if (workspace) {
    workspace.clear();
  }
  updateCodePreview();
});

// Compile visual nested block tree to flat recipe arrays
function compileWorkspace(container) {
  if (!workspace) return [];
  const topBlocks = workspace.getTopBlocks(true); // Sorted top-to-bottom
  const recipe = [];
  topBlocks.forEach(block => {
    recipe.push(...compileBlocklyStack(block));
  });
  return recipe;
}

function compileBlocklyStack(block) {
  const steps = [];
  let current = block;
  while (current) {
    if (!current.isInsertionMarker()) {
      const step = blocklyToRecipeStep(current);
      if (step) {
        steps.push(step);
      }
    }
    current = current.getNextBlock();
  }
  return steps;
}

function blocklyToRecipeStep(block) {
  const type = block.type;
  
  if (type === 'motor') {
    const motor = block.getFieldValue('MOTOR');
    const steps = parseInt(block.getFieldValue('STEPS')) || 0;
    const speed = parseInt(block.getFieldValue('SPEED')) || 2;
    const dir = parseInt(block.getFieldValue('DIR')) || 1;
    return {
      action: 'move',
      motor: motor,
      steps: steps * dir,
      speed: speed
    };
  }
  
  if (type === 'set-speed') {
    const motor = block.getFieldValue('MOTOR');
    const speed = parseInt(block.getFieldValue('SPEED')) || 2;
    return {
      action: 'set_speed',
      motor: motor,
      speed: speed
    };
  }
  
  if (type === 'stop-all') {
    return {
      action: 'stop_all'
    };
  }
  
  if (type === 'wait') {
    const duration = parseFloat(block.getFieldValue('DURATION')) || 0.0;
    return {
      action: 'wait',
      duration: duration
    };
  }
  
  if (type === 'loop') {
    const iterations = parseInt(block.getFieldValue('COUNT')) || 1;
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'loop',
      iterations: iterations,
      body: nestedBlocks
    };
  }
  
  if (type === 'if-vision') {
    const value = block.getFieldValue('VALUE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: 'vision',
      value: value,
      body: nestedBlocks
    };
  }
  
  if (type === 'if-sound') {
    const value = block.getFieldValue('VALUE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: 'sound',
      value: value,
      body: nestedBlocks
    };
  }
  
  if (type === 'if-tilt' || type === 'if-compass') {
    const value = block.getFieldValue('VALUE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: type === 'if-tilt' ? 'tilt' : 'compass',
      value: value,
      body: nestedBlocks
    };
  }

  if (type === 'if-shake') {
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: 'shake',
      value: 'shaken',
      body: nestedBlocks
    };
  }
  
  if (type === 'if-button') {
    const name = block.getFieldValue('BUTTON');
    const state = block.getFieldValue('STATE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: name,
      value: state,
      op: 'eq',
      body: nestedBlocks
    };
  }
  
  if (type === 'if-dial') {
    const op = block.getFieldValue('OP');
    const val = parseInt(block.getFieldValue('VAL')) || 0;
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: 'potentiometer',
      value: val,
      op: op,
      body: nestedBlocks
    };
  }
  
  if (type === 'if-ir') {
    const port = block.getFieldValue('PORT');
    const state = block.getFieldValue('STATE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: port,
      value: state,
      op: 'eq',
      body: nestedBlocks
    };
  }
  
  if (type === 'if-light') {
    const op = block.getFieldValue('OP');
    const val = parseInt(block.getFieldValue('VAL')) || 0;
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: 'potentiometer',
      value: val,
      op: op,
      body: nestedBlocks
    };
  }
  
  if (type === 'if-limit') {
    const port = block.getFieldValue('PORT');
    const state = block.getFieldValue('STATE');
    const substackBlock = block.getInputTargetBlock('SUBSTACK');
    const nestedBlocks = substackBlock ? compileBlocklyStack(substackBlock) : [];
    return {
      action: 'if',
      sensor: port,
      value: state,
      op: 'eq',
      body: nestedBlocks
    };
  }
  
  return null;
}

function loadSavedWorkspace() {
  const savedMode = localStorage.getItem('editor_mode');
  if (savedMode === 'code') {
    currentEditorMode = 'code';
    btnModeCode.classList.add('active');
    btnModeBlocks.classList.remove('active');
    workspaceCanvas.style.display = 'none';
    codePreviewPane.style.display = 'none';
    rawCodeEditor.style.display = 'flex';
    if (toolboxAside) toolboxAside.style.display = 'none';
  } else {
    currentEditorMode = 'blocks';
    btnModeBlocks.classList.add('active');
    btnModeCode.classList.remove('active');
    workspaceCanvas.style.display = 'block';
    codePreviewPane.style.display = 'flex';
    rawCodeEditor.style.display = 'none';
    if (toolboxAside) toolboxAside.style.display = 'none';
  }
  
  const savedBlocksJson = localStorage.getItem('workspace_blocks');
  if (savedBlocksJson && workspace) {
    try {
      const state = JSON.parse(savedBlocksJson);
      Blockly.serialization.workspaces.load(state, workspace);
    } catch (err) {
      console.warn("Failed to restore blocks workspace:", err);
    }
  }
  
  const savedPythonCode = localStorage.getItem('raw_python_code');
  if (savedPythonCode !== null) {
    rawCodeTextarea.value = savedPythonCode;
  }
  
  updateCodePreview();
}

// Initialize Blockly and load saved settings
initBlockly();
loadSavedWorkspace();

// Generate MicroPython from block recipes
function generateMicroPython(blocks, indent = "") {
  let code = "";
  
  if (!blocks || blocks.length === 0) {
    return indent + "pass\n";
  }
  
  blocks.forEach(block => {
    const action = block.action;
    
    if (action === 'move') {
      code += indent + `motors['${block.motor}'].set_speed(${block.speed})\n`;
      code += indent + `motors['${block.motor}'].move(${block.steps})\n`;
      code += indent + `while motors['${block.motor}'].is_moving: await asyncio.sleep_ms(20)\n`;
    } 
    else if (action === 'set_speed') {
      code += indent + `motors['${block.motor}'].set_speed(${block.speed})\n`;
    } 
    else if (action === 'stop_all') {
      code += indent + `for m in motors.values(): m.stop()\n`;
    } 
    else if (action === 'wait') {
      code += indent + `await asyncio.sleep(${block.duration})\n`;
    } 
    else if (action === 'loop') {
      code += indent + `for _ in range(${block.iterations}):\n`;
      code += generateMicroPython(block.body, indent + "    ");
    } 
    else if (action === 'if') {
      const sensor = block.sensor;
      const val = block.value;
      const op = block.op || 'eq';
      
      let condition = "";
      if (sensor === 'potentiometer') {
        const opSymbol = op === 'gt' ? '>' : op === 'lt' ? '<' : '==';
        condition = `sensor_data['potentiometer'] ${opSymbol} ${val}`;
      } else {
        condition = `sensor_data['${sensor}'] == '${val}'`;
      }
      
      code += indent + `if ${condition}:\n`;
      code += generateMicroPython(block.body, indent + "    ");
    }
  });
  
  return code;
}

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
    
    // Auto-stop video feeds when switching to a different view

    if (targetId !== 'view-car' && typeof carVisionActive !== 'undefined' && carVisionActive) {
      const stopBtn = document.getElementById('btn-car-stop-vision');
      if (stopBtn) stopBtn.click();
    }
  });
});

// Send running recipe
document.getElementById('btn-run-program').addEventListener('click', async () => {
  if (currentEditorMode === 'code') {
    const rawCode = rawCodeTextarea.value;
    if (!rawCode.trim()) {
      alert("Your Python code is empty!");
      return;
    }
    
    try {
      const resp = await fetch(API_BASE + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode })
      });
      
      if (resp.status === 409) {
        alert("A program is already running. Stop it first!");
      } else if (!resp.ok) {
        alert("Error sending program: " + resp.statusText);
      }
    } catch (err) {
      if (window.location.hostname.includes("github.io")) {
        alert("Demo Mode: Hardware disconnected. Command simulation mode.");
      } else {
        alert("Connection error: " + err.message);
      }
    }
  } else {
    const recipe = compileWorkspace(mainWorkspace);
    if (recipe.length === 0) {
      alert("Your workflow is empty! Add some blocks first.");
      return;
    }
    
    try {
      const resp = await fetch(API_BASE + '/api/run', {
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
      if (window.location.hostname.includes("github.io")) {
        alert("Demo Mode: Hardware disconnected. Command simulation mode.");
      } else {
        alert("Connection error: " + err.message);
      }
    }
  }
});

// Stop program
async function stopAll() {
  try {
    await fetch(API_BASE + '/api/stop', { method: 'POST' });
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
      if (isCarAutopilotActive) return;
      
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
      await fetch(API_BASE + '/api/manual', {
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
    await fetch(API_BASE + '/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sound: 'clap' })
    });
    
    // Reset sound state to none after 1.2 seconds
    setTimeout(async () => {
      try {
        await fetch(API_BASE + '/api/sensors', {
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


// --- 📈 PERIODIC STATUS UPDATES ---

// Periodic status monitor polling (every 1 second)
async function updateStatus() {
  try {
    const resp = await fetch(API_BASE + '/api/status');
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
      statusRobotMode.innerText = isCarAutopilotActive ? "AUTOPILOT" : "DRIVING";
      statusRobotMode.style.color = "var(--cyan-accent)";
    } else {
      statusRobotMode.innerText = "IDLE";
      statusRobotMode.style.color = "";
    }
    
    connectionDot.className = "status-dot online";
    connectionText.innerText = "CONNECTED";
  } catch (err) {
    connectionDot.className = "status-dot";
    connectionText.innerText = window.location.hostname.includes("github.io") ? "DEMO MODE" : "OFFLINE";
    if (window.location.hostname.includes("github.io")) {
       connectionText.parentElement.style.cursor = "pointer";
       connectionText.parentElement.onclick = () => {
         if (confirm("Demo Mode.\n\nTo control real hardware:\n1. Connect to 'Robo-Control' Wi-Fi\n2. Click OK to open the dashboard")) {
           window.location.href = "http://192.168.4.1/";
         }
       };
    }
    statusRobotMode.innerText = "UNKNOWN";
    statusRobotMode.style.color = "var(--red-accent)";
  }
}

// Start polling status & dynamic UI initialization
initDynamicUI(configuredMotors);
setInterval(updateStatus, 1000);
updateStatus(); // Initial call


// --- 🚗 AI CAR AUTOPILOT ---
//
// Drives the robot like a car using the phone's camera. The drive geometry is
// DECLARED, never guessed: the user picks the drive type below (differential
// tank drive, or Ackermann drive+steer) and the constants in DRIVE_CFG describe
// the build. All maneuvers (turns, junctions, parking) are computed from these
// constants — there is no runtime calibration, babbling, or motion learning.

const carVideo = document.getElementById('car-video');
const carCanvas = document.getElementById('car-canvas');
const carPlaceholder = document.getElementById('car-placeholder');
const btnCarStartVision = document.getElementById('btn-car-start-vision');
const btnCarStopVision = document.getElementById('btn-car-stop-vision');
const btnCarAuto = document.getElementById('btn-car-auto');
const btnCarPark = document.getElementById('btn-car-park');
const carConsole = document.getElementById('car-console');

const carCtx = carCanvas.getContext('2d');
carCanvas.width = 320;
carCanvas.height = 240;

// Offscreen canvas for pixel analysis (the visible canvas has HUD drawn over
// the video, so road scanning reads from this clean copy instead).
const scanCanvas = document.createElement('canvas');
scanCanvas.width = 320;
scanCanvas.height = 240;
const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });

function logCarConsole(msg) {
  carConsole.innerText += `\n> ${msg}`;
  carConsole.scrollTop = carConsole.scrollHeight;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Fixed drive geometry (edit to match your build; do not auto-tune) ---
const DRIVE_CFG = {
  STEPS_PER_REV: 4096,      // 28BYJ-48 half-step, matches firmware stepper.py
  WHEEL_DIAMETER_MM: 56,    // drive wheel diameter
  TRACK_WIDTH_MM: 104,      // differential: distance between the two wheels
  WHEELBASE_MM: 90,         // ackermann: front-to-rear axle distance
  MAX_STEER_DEG: 28,        // ackermann: front wheel angle at full lock
  STEER_LOCK_STEPS: 300,    // ackermann: steering motor steps from center to full lock
  LEFT: 'A', RIGHT: 'B',    // differential wheel motors
  DRIVE_MOTOR: 'A', STEER_MOTOR: 'B', // ackermann motor roles
  INVERT_LEFT: false, INVERT_RIGHT: false,
  INVERT_DRIVE: false, INVERT_STEER: false,
  CONT_STEPS: 100000,       // "keep going" step target, refreshed every tick
};
const STEPS_PER_MM = DRIVE_CFG.STEPS_PER_REV / (Math.PI * DRIVE_CFG.WHEEL_DIAMETER_MM);
// Speed = firmware per-step delay in ms (2 fast ... 20 crawl)
const SPD = { CRUISE: 5, SLOW: 9, CREEP: 14, TURN: 3, PARK: 5 };
const wheelMmPerSec = delayMs => (1000 / delayMs) / STEPS_PER_MM;

let driveMode = localStorage.getItem('drive_mode') === 'ackermann' ? 'ackermann' : 'differential';
let steerPosSteps = 0;        // ackermann: client-tracked steering position (centered at autopilot start)
let lastCmdFailed = false;    // true => no robot reachable (demo mode)
let hudSteerBias = 0;         // -1..1 shown on the HUD needle

async function motorCmd(motor, steps, speed) {
  try {
    await fetch(API_BASE + '/api/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motor: motor, steps: Math.round(steps), speed: speed })
    });
    lastCmdFailed = false;
  } catch (err) {
    lastCmdFailed = true;
  }
}

// Core motion primitive. dir: 1 forward, -1 reverse, 0 stop.
// steerBias: -1 (full left) .. 0 .. +1 (full right). Non-blocking; callers
// refresh it every tick for continuous motion, or time it for maneuvers.
function setMotion(dir, steerBias, speed) {
  hudSteerBias = steerBias;
  const c = DRIVE_CFG;
  if (dir === 0) {
    if (driveMode === 'differential') {
      motorCmd(c.LEFT, 0, speed); motorCmd(c.RIGHT, 0, speed);
    } else {
      motorCmd(c.DRIVE_MOTOR, 0, speed);
    }
    return;
  }
  if (driveMode === 'differential') {
    // Arc by slowing the inner wheel: delay grows with |bias|. At (near) full
    // lock the inner wheel stops entirely -- these steppers are slow, and a
    // merely-slowed inner wheel would make sharp turns take half a minute.
    const fullLock = Math.abs(steerBias) >= 0.9;
    const inner = Math.min(24, Math.round(speed * (1 + 2.5 * Math.abs(steerBias))));
    const lDelay = steerBias < 0 ? inner : speed;   // left is inner on a left turn
    const rDelay = steerBias > 0 ? inner : speed;
    const s = dir * c.CONT_STEPS;
    const lSteps = (fullLock && steerBias < 0) ? 0 : s * (c.INVERT_LEFT ? -1 : 1);
    const rSteps = (fullLock && steerBias > 0) ? 0 : s * (c.INVERT_RIGHT ? -1 : 1);
    motorCmd(c.LEFT, lSteps, lDelay);
    motorCmd(c.RIGHT, rSteps, rDelay);
  } else {
    steerTo(steerBias);
    motorCmd(c.DRIVE_MOTOR, dir * c.CONT_STEPS * (c.INVERT_DRIVE ? -1 : 1), speed);
  }
}

// Ackermann steering: move the steering motor to a tracked absolute position.
function steerTo(bias) {
  const target = Math.round(Math.max(-1, Math.min(1, bias)) * DRIVE_CFG.STEER_LOCK_STEPS);
  const dSteps = target - steerPosSteps;
  if (dSteps !== 0) {
    motorCmd(DRIVE_CFG.STEER_MOTOR, dSteps * (DRIVE_CFG.INVERT_STEER ? -1 : 1), 3);
    steerPosSteps = target;
  }
}

function haltDrive() { setMotion(0, hudSteerBias, SPD.CRUISE); }

// Yaw rate (deg/s) at a given steer bias and speed — pure declared geometry.
// Must mirror setMotion()'s wheel assignments exactly or timed turns drift.
function yawRateDegPerSec(bias, speed) {
  const c = DRIVE_CFG;
  if (driveMode === 'differential') {
    const inner = Math.min(24, Math.round(speed * (1 + 2.5 * Math.abs(bias))));
    const vOut = wheelMmPerSec(speed);
    const vIn = Math.abs(bias) >= 0.9 ? 0 : wheelMmPerSec(inner);  // full lock stops the inner wheel
    return ((vOut - vIn) / c.TRACK_WIDTH_MM) * (180 / Math.PI);
  }
  const v = wheelMmPerSec(speed);
  const steerRad = Math.abs(bias) * c.MAX_STEER_DEG * Math.PI / 180;
  return (v * Math.tan(steerRad) / c.WHEELBASE_MM) * (180 / Math.PI);
}

// A cancellable timed motion segment: keeps refreshing the motion command so
// long maneuvers survive step-target exhaustion, and aborts early if the
// autopilot is switched off or an emergency (pedestrian etc.) is flagged.
let maneuverAbort = false;
async function moveFor(ms, dir, bias, speed) {
  const until = Date.now() + ms;
  setMotion(dir, bias, speed);
  while (Date.now() < until) {
    if (!isCarAutopilotActive || maneuverAbort) { haltDrive(); return false; }
    await delay(Math.min(120, until - Date.now()));
  }
  return true;
}

// Turn through `deg` degrees as a smooth car-like arc (never a tank spin).
async function arcTurn(dirSign, deg, opts = {}) {
  const bias = dirSign * (opts.bias || 1.0);   // full lock by default: gentler arcs are for cruise corrections
  const speed = opts.speed || SPD.TURN;
  const rate = yawRateDegPerSec(bias, speed);
  const ms = Math.min(20000, (deg / Math.max(rate, 1)) * 1000);
  const ok = await moveFor(ms, opts.reverse ? -1 : 1, opts.reverse ? -bias : bias, speed);
  haltDrive();
  return ok;
}

// About-face when boxed in. Differential can pivot in place; Ackermann does a
// three-point turn like a real car.
async function uTurn(dirSign) {
  if (driveMode === 'differential') {
    const c = DRIVE_CFG;
    const steps = Math.PI * c.TRACK_WIDTH_MM * (180 / 360) * STEPS_PER_MM;
    const spd = 4;
    motorCmd(c.LEFT, dirSign * steps * (c.INVERT_LEFT ? -1 : 1), spd);
    motorCmd(c.RIGHT, -dirSign * steps * (c.INVERT_RIGHT ? -1 : 1), spd);
    hudSteerBias = dirSign;
    await delay(steps * spd + 250);
    haltDrive();
    return isCarAutopilotActive && !maneuverAbort;
  }
  // Three-point turn: forward-left, reverse-right, forward-left.
  if (!await arcTurn(-dirSign, 70)) return false;
  if (!await arcTurn(dirSign, 70, { reverse: true })) return false;
  return arcTurn(-dirSign, 50);
}

async function reverseMm(mm, speed) {
  const ms = (mm / wheelMmPerSec(speed)) * 1000;
  const ok = await moveFor(ms, -1, 0, speed);
  haltDrive();
  return ok;
}

// --- Road vision: fixed free-space column scan (no learning) ---
// Reference = the surface directly in front of the robot (bottom-center patch).
// Each column is walked upward from the bottom until the color stops looking
// like that surface; the result is a per-column clearance profile of "road".
const SCAN = {
  COLS: 16,
  Y_TOP: 130,          // don't scan above the visual horizon
  Y_BOTTOM: 238,
  REF: { x0: 130, x1: 190, y0: 222, y1: 238 },
  COLOR_THRESH: 58,    // RGB distance where "road" ends
  BLOCKED_NEAR: 0.22,  // clearance below this = wall right in front
  OPEN_SIDE: 0.55,     // side columns clearer than this = open corridor
};
let lastScan = null;
let prevScanData = null;
let frameDiff = 999;   // stuck watchdog signal (safety only, not calibration)

function scanRoad() {
  if (!carVisionActive || carVideo.readyState < 2) return null;
  scanCtx.drawImage(carVideo, 0, 0, 320, 240);
  const img = scanCtx.getImageData(0, 0, 320, 240);
  const d = img.data;

  // Stuck watchdog: mean frame-to-frame change on sparse samples.
  if (prevScanData) {
    let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 16) {
      sum += Math.abs(d[i] - prevScanData[i]) + Math.abs(d[i + 1] - prevScanData[i + 1]);
      n++;
    }
    frameDiff = sum / n;
  }
  if (!prevScanData) prevScanData = new Uint8ClampedArray(d.length);
  prevScanData.set(d);

  // Reference road color: mean of the bottom-center patch.
  let rr = 0, rg = 0, rb = 0, rn = 0;
  for (let y = SCAN.REF.y0; y < SCAN.REF.y1; y += 2) {
    for (let x = SCAN.REF.x0; x < SCAN.REF.x1; x += 4) {
      const i = (y * 320 + x) * 4;
      rr += d[i]; rg += d[i + 1]; rb += d[i + 2]; rn++;
    }
  }
  rr /= rn; rg /= rn; rb /= rn;

  // Per-column clearance: fraction of the scan band that still looks like road.
  const clearance = [];
  const colW = 320 / SCAN.COLS;
  for (let c = 0; c < SCAN.COLS; c++) {
    const x = Math.floor(c * colW + colW / 2);
    let clearPx = 0;
    const total = SCAN.Y_BOTTOM - SCAN.Y_TOP;
    for (let y = SCAN.Y_BOTTOM; y > SCAN.Y_TOP; y -= 2) {
      const i = (y * 320 + x) * 4;
      const dist = Math.abs(d[i] - rr) + Math.abs(d[i + 1] - rg) + Math.abs(d[i + 2] - rb);
      if (dist > SCAN.COLOR_THRESH) break;
      clearPx += 2;
    }
    clearance.push(clearPx / total);
  }

  // Corridor: clearance-weighted centroid of open columns.
  let wSum = 0, cSum = 0;
  clearance.forEach((cl, i) => { wSum += cl; cSum += cl * (i + 0.5) / SCAN.COLS; });
  const corridorCenter = wSum > 0.01 ? (cSum / wSum) * 2 - 1 : 0;  // -1..1
  const mid = clearance.slice(5, 11);
  const aheadClear = mid.reduce((a, b) => a + b, 0) / mid.length;
  const leftClear = clearance.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const rightClear = clearance.slice(12).reduce((a, b) => a + b, 0) / 4;

  lastScan = {
    clearance, corridorCenter,
    aheadClear,
    aheadBlocked: aheadClear < SCAN.BLOCKED_NEAR,
    aheadNarrowing: aheadClear < 0.45,
    sideOpen: { left: leftClear > SCAN.OPEN_SIDE, right: rightClear > SCAN.OPEN_SIDE },
  };
  return lastScan;
}

// --- TensorFlow.js COCO-SSD object detection (unchanged pipeline) ---
let objectDetector = null;
let detectedObjects = [];
let carVisionActive = false;
let carVisionStream = null;

async function loadObjectDetector() {
  if (objectDetector) return;
  logCarConsole("Loading TensorFlow.js COCO-SSD model...");
  try {
    objectDetector = await cocoSsd.load({ modelUrl: 'models/model.json' });
    logCarConsole("Model loaded! Ready for autonomy.");
    btnCarAuto.disabled = false;
    btnCarPark.disabled = false;
  } catch (err) {
    // The AI model isn't hosted on the robot's own Wi-Fi -- it's cached by
    // the browser from the online PWA install (see README "Offline AI
    // Autonomy"). Running straight off the robot's captive portal without
    // that install will always land here; point the user at the fix.
    logCarConsole("Error loading model: " + err.message);
    logCarConsole("AI Autonomy needs the app installed from the online demo first: " +
      "visit https://sloev.github.io/robo/ on your phone's normal internet connection, " +
      "\"Install\" it to your homescreen, then switch Wi-Fi to the robot and reopen the installed app.");
  }
}

async function detectObjects() {
  if (carVisionActive && objectDetector) {
    try {
      detectedObjects = await objectDetector.detect(carVideo);
      feedVisionSensor();
    } catch (e) {
      console.error(e);
    }
  }
  if (carVisionActive) requestAnimationFrame(detectObjects);
}

// Feed the Blockly "If Vision detects target" sensor from the best detection.
let lastVisionSent = 'none';
let lastVisionSentAt = 0;
function feedVisionSensor() {
  const now = Date.now();
  if (now - lastVisionSentAt < 400) return;
  let best = null;
  detectedObjects.forEach(o => { if (o.score > 0.6 && (!best || o.score > best.score)) best = o; });
  let result = 'none';
  if (best) {
    const cx = best.bbox[0] + best.bbox[2] / 2;
    result = cx < 320 * 0.35 ? 'left' : cx > 320 * 0.65 ? 'right' : 'center';
  }
  if (result === lastVisionSent) return;
  lastVisionSent = result;
  lastVisionSentAt = now;
  fetch(API_BASE + '/api/sensors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vision: result })
  }).catch(() => {});
}

// --- Car-behavior state machine ---
let isCarAutopilotActive = false;
let carState = 'IDLE';
let stateSince = 0;
let signal = 'none';            // 'left' | 'right' | 'hazard' | 'none'
let maneuverRunning = false;    // an async maneuver script owns the motors
let nextIntentAt = 0;           // when the "driver" next does something spontaneous
let stopSignIgnoreUntil = 0;    // don't re-stop for the same sign immediately
let stuckSince = 0;
let pendingPark = false;
let carAutoTimer = null;

function setState(name, note) {
  if (carState !== name) {
    carState = name;
    stateSince = Date.now();
    if (note) logCarConsole(note);
  }
}

function armIntentTimer() {
  nextIntentAt = Date.now() + 20000 + Math.random() * 25000;
}

// Situation analysis shared by every tick.
function assessDetections() {
  const out = { stopSign: false, pedestrian: false, obstacle: false, obstacleSide: 0 };
  detectedObjects.forEach(obj => {
    if (obj.score <= 0.6) return;
    const [x, y, w, h] = obj.bbox;
    const big = w > 320 * 0.4 || h > 240 * 0.4;
    const cx = x + w / 2;
    if (obj.class === 'stop sign' && (w > 320 * 0.12 || h > 240 * 0.12)) out.stopSign = true;
    if (obj.class === 'person' && big) out.pedestrian = true;
    if (big && obj.class !== 'person' && obj.class !== 'stop sign') {
      out.obstacle = true;
      out.obstacleSide = cx < 160 ? -1 : 1;
    }
  });
  return out;
}

async function autopilotTick() {
  if (!isCarAutopilotActive) return;
  const scan = scanRoad();
  const seen = assessDetections();
  const now = Date.now();

  // Emergencies interrupt even scripted maneuvers.
  if (maneuverRunning) {
    if (seen.pedestrian) {
      maneuverAbort = true;
      setState('PEDESTRIAN_WAIT', "🚶 Pedestrian! Braking mid-maneuver.");
    }
  } else {
    switch (carState) {
      case 'CRUISE': {
        if (seen.pedestrian) { haltDrive(); setState('PEDESTRIAN_WAIT', "🚶 Pedestrian ahead — waiting for them to cross."); break; }
        if (seen.stopSign && now > stopSignIgnoreUntil) { haltDrive(); setState('STOP_SIGN_WAIT', "🛑 Stop sign. Coming to a full stop."); break; }
        if (seen.obstacle) { haltDrive(); setState('OBSTACLE_AVOID', "📦 Obstacle ahead — going around it."); break; }
        if (scan && scan.aheadBlocked) { haltDrive(); setState('JUNCTION_WAIT', "🛑 Road ends ahead — stopping to look both ways."); break; }

        // Stuck watchdog: we're commanding motion but the world isn't moving.
        if (frameDiff < 1.2) {
          if (!stuckSince) stuckSince = now;
          if (now - stuckSince > 2500) { stuckSince = 0; setState('STUCK_RECOVERY', "😬 We seem stuck — backing out."); break; }
        } else stuckSince = 0;

        // Spontaneous driver intent: signaled turns and parking, for show.
        if (pendingPark || now > nextIntentAt) {
          const roll = Math.random();
          if (pendingPark || roll < 0.3) {
            pendingPark = false;
            armIntentTimer();
            setState('PARKING', "🅿️ Looking for a spot to park...");
            break;
          }
          if (roll < 0.75) {
            armIntentTimer();
            signal = Math.random() < 0.6 ? 'right' : 'left';
            setState('SIGNAL_TURN', `🚦 Signaling ${signal} for a turn.`);
            break;
          }
          armIntentTimer();
        }

        // Lane keeping: steer toward the open corridor, biased right.
        if (scan) {
          const target = scan.corridorCenter + 0.22;              // right-lane bias
          const bias = Math.max(-0.6, Math.min(0.6, target));
          setMotion(1, bias, scan.aheadNarrowing ? SPD.SLOW : SPD.CRUISE);
        } else {
          setMotion(1, 0.05, SPD.SLOW);
        }
        break;
      }

      case 'SIGNAL_TURN': {
        setMotion(1, 0, SPD.SLOW);   // slow down while blinking
        if (now - stateSince > 1300) {
          setState('TURNING', `↪️ Turning ${signal}.`);
          runManeuver(async () => {
            await arcTurn(signal === 'right' ? 1 : -1, 80 + Math.random() * 20);
          });
        }
        break;
      }

      case 'JUNCTION_WAIT': {
        if (now - stateSince < 1600) break;   // look both ways
        const left = lastScan ? lastScan.sideOpen.left : true;
        const right = lastScan ? lastScan.sideOpen.right : true;
        let dir;
        if (right && (!left || Math.random() < 0.7)) dir = 'right';
        else if (left) dir = 'left';
        else dir = 'uturn';
        if (dir === 'uturn') {
          signal = 'left';
          setState('TURNING', "🔄 Dead end — turning around.");
          runManeuver(async () => { await uTurn(-1); });
        } else {
          signal = dir;
          setState('TURNING', `${dir === 'right' ? '➡️' : '⬅️'} Clear ${dir} — turning ${dir}.`);
          runManeuver(async () => {
            await arcTurn(dir === 'right' ? 1 : -1, 90, { bias: 1.0, speed: SPD.TURN });
          });
        }
        break;
      }

      case 'STOP_SIGN_WAIT': {
        if (now - stateSince > 3000) {
          stopSignIgnoreUntil = now + 8000;
          setState('CRUISE', "✅ Stop complete. Proceeding.");
        }
        break;
      }

      case 'PEDESTRIAN_WAIT': {
        if (!seen.pedestrian && now - stateSince > 1200) {
          setState('CRUISE', "✅ Pedestrian clear. Driving on.");
        }
        break;
      }

      case 'OBSTACLE_AVOID': {
        const side = seen.obstacleSide || (lastScan && lastScan.sideOpen.left && !lastScan.sideOpen.right ? 1 : -1);
        signal = side > 0 ? 'left' : 'right';   // steer away from the obstacle
        setState('TURNING', "↩️ Backing up and steering around.");
        runManeuver(async () => {
          if (!await reverseMm(100, SPD.PARK)) return;
          await arcTurn(side > 0 ? -1 : 1, 55);
        });
        break;
      }

      case 'STUCK_RECOVERY': {
        signal = 'hazard';
        setState('TURNING', "🔧 Recovery: reversing and picking a new line.");
        runManeuver(async () => {
          if (!await reverseMm(120, SPD.PARK)) return;
          await arcTurn(Math.random() < 0.5 ? 1 : -1, 60);
        });
        break;
      }

      case 'PARKING': {
        runParkingManeuver();
        break;
      }

      case 'PARKED': {
        signal = 'hazard';
        haltDrive();
        if (now - stateSince > 6000) {
          signal = 'left';
          setState('TURNING', "🚗 Pulling out of the spot.");
          runManeuver(async () => {
            if (!await reverseMm(50, SPD.PARK)) return;
            await arcTurn(-1, 45);
          });
        }
        break;
      }

      case 'TURNING':
      case 'IDLE':
        break;
    }
  }

  if (isCarAutopilotActive) carAutoTimer = setTimeout(autopilotTick, 300);
}

// Run an async maneuver script that owns the motors until it resolves.
function runManeuver(script) {
  maneuverRunning = true;
  maneuverAbort = false;
  script().catch(err => logCarConsole("Maneuver error: " + err.message)).finally(() => {
    maneuverRunning = false;
    haltDrive();
    if (isCarAutopilotActive && carState !== 'PEDESTRIAN_WAIT' && carState !== 'PARKED') {
      signal = 'none';
      setState('CRUISE');
    }
  });
}

// Three scripted parking styles, all pure declared-kinematics choreography.
function runParkingManeuver() {
  const style = ['parallel', 'reverse-bay', 'nose-in'][Math.floor(Math.random() * 3)];
  signal = 'right';
  runManeuver(async () => {
    if (style === 'parallel') {
      logCarConsole("🅿️ Parallel parking on the right.");
      if (!await moveFor(1100, 1, 0.05, SPD.SLOW)) return;   // pull up past the spot
      haltDrive(); await delay(500);
      if (!await arcTurn(1, 40, { reverse: true, bias: 0.95, speed: SPD.PARK })) return; // reverse-right
      if (!await arcTurn(-1, 40, { reverse: true, bias: 0.95, speed: SPD.PARK })) return; // counter-steer
      if (!await moveFor(450, 1, 0, SPD.CREEP)) return;      // straighten up
    } else if (style === 'reverse-bay') {
      logCarConsole("🅿️ Reversing into a bay.");
      if (!await moveFor(700, 1, 0.02, SPD.SLOW)) return;
      haltDrive(); await delay(500);
      if (!await arcTurn(-1, 60, { speed: SPD.PARK })) return;   // swing nose away
      if (!await arcTurn(1, 55, { reverse: true, bias: 0.9, speed: SPD.PARK })) return; // back in
      if (!await reverseMm(90, SPD.CREEP)) return;
    } else {
      logCarConsole("🅿️ Nose-in parking.");
      const until = Date.now() + 4000;
      setMotion(1, 0.5, SPD.CREEP);   // creep toward the right edge
      while (Date.now() < until) {
        if (!isCarAutopilotActive || maneuverAbort) { haltDrive(); return; }
        if (lastScan && lastScan.aheadBlocked) break;   // stop before touching
        await delay(120);
      }
    }
    haltDrive();
    if (driveMode === 'ackermann') steerTo(0);
    signal = 'hazard';
    setState('PARKED', "✅ Parked. Hazards on.");
  });
}

// --- HUD (drawn over the live video every frame) ---
function drawHud() {
  const W = 320, H = 240;

  // Free-space scan bars along the bottom.
  if (lastScan) {
    const colW = W / SCAN.COLS;
    lastScan.clearance.forEach((cl, i) => {
      const barH = 6 + cl * 34;
      carCtx.fillStyle = cl > 0.45 ? 'rgba(60,220,120,0.55)' : cl > 0.22 ? 'rgba(250,200,60,0.55)' : 'rgba(240,70,70,0.6)';
      carCtx.fillRect(i * colW + 2, H - barH, colW - 4, barH);
    });
  }

  // Steering needle.
  carCtx.save();
  carCtx.translate(W / 2, H - 14);
  carCtx.rotate(hudSteerBias * 0.9);
  carCtx.strokeStyle = '#ffffff';
  carCtx.lineWidth = 3;
  carCtx.beginPath(); carCtx.moveTo(0, 6); carCtx.lineTo(0, -26); carCtx.stroke();
  carCtx.restore();

  // Turn signals / hazards (blink at ~1.25 Hz).
  const blinkOn = Math.floor(Date.now() / 400) % 2 === 0;
  if (signal !== 'none' && blinkOn) {
    carCtx.fillStyle = '#ffb300';
    if (signal === 'left' || signal === 'hazard') {
      carCtx.beginPath(); carCtx.moveTo(26, 120); carCtx.lineTo(52, 104); carCtx.lineTo(52, 136); carCtx.fill();
    }
    if (signal === 'right' || signal === 'hazard') {
      carCtx.beginPath(); carCtx.moveTo(294, 120); carCtx.lineTo(268, 104); carCtx.lineTo(268, 136); carCtx.fill();
    }
  }

  // State banner.
  const labels = {
    IDLE: 'AUTOPILOT OFF', CRUISE: 'LANE KEEPING', SIGNAL_TURN: `SIGNALING ${String(signal).toUpperCase()}`,
    TURNING: 'TURNING', JUNCTION_WAIT: 'JUNCTION — LOOKING BOTH WAYS', STOP_SIGN_WAIT: 'STOP SIGN — WAITING',
    PEDESTRIAN_WAIT: 'WAITING FOR PEDESTRIAN', OBSTACLE_AVOID: 'AVOIDING OBSTACLE',
    STUCK_RECOVERY: 'RECOVERING', PARKING: 'PARKING', PARKED: 'PARKED — HAZARDS ON',
  };
  const label = (labels[carState] || carState) + (lastCmdFailed ? '  ·  DEMO (no robot)' : '');
  carCtx.fillStyle = 'rgba(0,0,0,0.65)';
  carCtx.fillRect(6, 6, 12 + label.length * 6.3, 20);
  carCtx.fillStyle = isCarAutopilotActive ? '#4dd2ff' : '#999999';
  carCtx.font = 'bold 10px monospace';
  carCtx.fillText(label, 12, 20);
}

function processCarFrame() {
  if (!carVisionActive) return;
  try {
    carCtx.drawImage(carVideo, 0, 0, carCanvas.width, carCanvas.height);

    // Detected objects.
    if (detectedObjects && detectedObjects.length > 0) {
      detectedObjects.forEach(obj => {
        if (obj.score > 0.6) {
          const [x, y, width, height] = obj.bbox;
          carCtx.strokeStyle = 'var(--cyan-accent)';
          carCtx.lineWidth = 2;
          carCtx.strokeRect(x, y, width, height);
          carCtx.fillStyle = 'var(--cyan-accent)';
          carCtx.fillRect(x, y - 16, width, 16);
          carCtx.fillStyle = '#000000';
          carCtx.font = '10px monospace';
          carCtx.fillText(`${obj.class} ${Math.round(obj.score * 100)}%`, x + 2, y - 4);
        }
      });
    }

    drawHud();

    if (!window.detectionLoopStarted && objectDetector) {
      window.detectionLoopStarted = true;
      detectObjects();
    }
  } catch (err) {
    console.error("Car frame process error:", err);
  }
  requestAnimationFrame(processCarFrame);
}

// --- Camera feed + autopilot controls ---
btnCarStartVision.addEventListener('click', async () => {
  if (carVisionActive) return;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API not supported. If accessing via local HTTP, mobile browsers block the camera. Use localhost, HTTPS, or a desktop browser.");
    }
    carVisionStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 320, height: 240 }
    });
    carVideo.srcObject = carVisionStream;
    carVideo.style.display = 'block';
    carCanvas.style.display = 'block';
    carPlaceholder.style.display = 'none';
    carVisionActive = true;
    requestAnimationFrame(processCarFrame);
    loadObjectDetector();
  } catch (err) {
    alert("Could not access camera: " + err.message);
  }
});

function stopAutopilot(reason) {
  isCarAutopilotActive = false;
  maneuverAbort = true;
  signal = 'none';
  if (carAutoTimer) { clearTimeout(carAutoTimer); carAutoTimer = null; }
  btnCarAuto.innerText = "🤖 AUTOPILOT: OFF";
  btnCarAuto.classList.remove('btn-stop');
  btnCarAuto.classList.add('btn-clear');
  setState('IDLE', reason || "Autopilot stopped.");
  stopAll();
}

btnCarStopVision.addEventListener('click', () => {
  if (!carVisionActive) return;
  stopAutopilot("Camera feed stopped.");
  carVisionActive = false;
  window.detectionLoopStarted = false;
  detectedObjects = [];
  lastScan = null;
  prevScanData = null;
  if (carVisionStream) {
    carVisionStream.getTracks().forEach(track => track.stop());
    carVisionStream = null;
  }
  carVideo.srcObject = null;
  carVideo.style.display = 'none';
  carCanvas.style.display = 'none';
  carPlaceholder.style.display = 'flex';
});

btnCarAuto.addEventListener('click', () => {
  if (isCarAutopilotActive) {
    stopAutopilot();
  } else {
    if (!carVisionActive) { alert("Camera feed must be active first!"); return; }
    isCarAutopilotActive = true;
    steerPosSteps = 0;   // ackermann: wheels assumed centered at engage time
    stuckSince = 0;
    frameDiff = 999;
    armIntentTimer();
    btnCarAuto.innerText = "⏹ STOP AUTOPILOT";
    btnCarAuto.classList.remove('btn-clear');
    btnCarAuto.classList.add('btn-stop');
    logCarConsole(`Autopilot engaged (${driveMode} drive). Keeping right, watching the road.`);
    setState('CRUISE');
    autopilotTick();
  }
});

btnCarPark.addEventListener('click', () => {
  if (!isCarAutopilotActive) { alert("Start the autopilot first — parking is an autopilot maneuver."); return; }
  pendingPark = true;
  logCarConsole("🅿️ Park requested — finding a spot.");
});

// Drive-type toggle (differential tank vs Ackermann steer). A declared user
// choice, persisted locally — never inferred from motion.
document.querySelectorAll('input[name="drive-mode"]').forEach(radio => {
  radio.checked = radio.value === driveMode;
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    driveMode = radio.value;
    localStorage.setItem('drive_mode', driveMode);
    steerPosSteps = 0;
    logCarConsole(`Drive type set to ${driveMode === 'ackermann' ? 'Ackermann (A drives, B steers)' : 'Differential (A left, B right)'}.`);
    if (isCarAutopilotActive) { haltDrive(); setState('CRUISE'); }
  });
});

// --- 📱 WEB DEVICE SENSORS (TILT, SHAKE, COMPASS) ---
let currentTilt = 'flat';
let isShaken = 'still';
let currentCompass = 'none';

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {
    let tilt = 'flat';
    if (event.beta < -20) tilt = 'forward';
    else if (event.beta > 20) tilt = 'backward';
    else if (event.gamma < -20) tilt = 'left';
    else if (event.gamma > 20) tilt = 'right';
    currentTilt = tilt;
    
    if (event.alpha !== null) {
      let a = event.alpha;
      let comp = 'none';
      if (a >= 315 || a < 45) comp = 'north';
      else if (a >= 45 && a < 135) comp = 'west';
      else if (a >= 135 && a < 225) comp = 'south';
      else if (a >= 225 && a < 315) comp = 'east';
      currentCompass = comp;
    }
  });
}

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', (event) => {
    const acc = event.accelerationIncludingGravity;
    if (acc) {
      const mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
      if (mag > 15) { // Earth gravity is 9.8
        isShaken = 'shaken';
        setTimeout(() => { isShaken = 'still'; }, 1000);
      }
    }
  });
}

let lastSentWebSensors = {};
setInterval(async () => {
  const current = { tilt: currentTilt, shake: isShaken, compass: currentCompass };
  if (current.tilt !== lastSentWebSensors.tilt || 
      current.shake !== lastSentWebSensors.shake || 
      current.compass !== lastSentWebSensors.compass) {
      
      lastSentWebSensors = { ...current };
      try {
        await fetch(API_BASE + '/api/sensors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        });
      } catch(e) {}
  }
}, 300);
