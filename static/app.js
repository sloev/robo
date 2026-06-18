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
    if (targetId !== 'view-ai' && typeof visionActive !== 'undefined' && visionActive) {
      stopVisionFeed();
    }
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
      const resp = await fetch('/api/run', {
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API not supported. If accessing via local HTTP, mobile browsers block the camera. Use localhost, HTTPS, or a desktop browser.");
    }
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


// --- 🚗 CAR MAPPER & AUTONOMOUS NAVIGATOR ---

const carVideo = document.getElementById('car-video');
const carCanvas = document.getElementById('car-canvas');
const carPlaceholder = document.getElementById('car-placeholder');
const btnCarStartVision = document.getElementById('btn-car-start-vision');
const btnCarCalibrateBg = document.getElementById('btn-car-calibrate-bg');
const btnCarClearMap = document.getElementById('btn-car-clear-map');
const btnCarStopVision = document.getElementById('btn-car-stop-vision');

const btnCarMapStart = document.getElementById('btn-car-map-start');
const btnCarAuto = document.getElementById('btn-car-auto');
const carConsole = document.getElementById('car-console');

let carVisionActive = false;
let carVisionStream = null;
let carBgFrameData = null;
let carGrid = Array(15).fill(null).map(() => Array(20).fill(0));
try {
  const savedCarGrid = localStorage.getItem('car_map_grid');
  if (savedCarGrid) {
    carGrid = JSON.parse(savedCarGrid);
  }
} catch (e) {}
let isMappingActive = false;
let isCarAutopilotActive = false;
let carCentroid = { x: 160, y: 120, detected: false };
let carLastFrameData = null;
let carFrameDiff = 0;
let carMotionThreshold = 40;
let carDriveState = 'STILL';

const carCtx = carCanvas.getContext('2d');
carCanvas.width = 320;
carCanvas.height = 240;

function logCarConsole(msg) {
  carConsole.innerText += `\n> ${msg}`;
  carConsole.scrollTop = carConsole.scrollHeight;
}

// Copy current camera frame into background reference
function captureCarBackground() {
  if (!carVisionActive) return;
  try {
    carCtx.drawImage(carVideo, 0, 0, carCanvas.width, carCanvas.height);
    const imgData = carCtx.getImageData(0, 0, carCanvas.width, carCanvas.height);
    if (!carBgFrameData || carBgFrameData.length !== imgData.data.length) {
      carBgFrameData = new Uint8ClampedArray(imgData.data.length);
    }
    carBgFrameData.set(imgData.data);
    console.log("Car background captured successfully!");
  } catch (err) {
    console.error("Failed to capture car background:", err);
  }
}

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
    btnCarCalibrateBg.disabled = false;
    
    carVisionActive = true;
    requestAnimationFrame(processCarFrame);
    
    setTimeout(() => {
      captureCarBackground();
      logCarConsole("Initial background captured.");
    }, 1200);
  } catch (err) {
    alert("Could not access camera: " + err.message);
  }
});

btnCarStopVision.addEventListener('click', () => {
  if (!carVisionActive) return;
  carVisionActive = false;
  isMappingActive = false;
  isCarAutopilotActive = false;
  carCentroid.detected = false;
  carLastFrameData = null;
  carBgFrameData = null;
  btnCarCalibrateBg.disabled = true;
  btnCarMapStart.innerText = "🗺️ START MAPPING";
  btnCarMapStart.classList.add('btn-run');
  btnCarMapStart.classList.remove('btn-stop');
  btnCarAuto.disabled = true;
  btnCarAuto.innerText = "🤖 AUTOPILOT: OFF";
  
  if (carMappingTimer) {
    clearTimeout(carMappingTimer);
    carMappingTimer = null;
  }
  if (carAutoTimer) {
    clearTimeout(carAutoTimer);
    carAutoTimer = null;
  }
  
  if (carVisionStream) {
    carVisionStream.getTracks().forEach(track => track.stop());
    carVisionStream = null;
  }
  carVideo.srcObject = null;
  carVideo.style.display = 'none';
  carCanvas.style.display = 'none';
  carPlaceholder.style.display = 'flex';
  logCarConsole("Camera feed stopped.");
  stopAll();
  carDriveState = 'STILL';
});

btnCarCalibrateBg.addEventListener('click', () => {
  captureCarBackground();
  logCarConsole("Background recalibrated.");
});

btnCarClearMap.addEventListener('click', () => {
  carGrid = Array(15).fill(null).map(() => Array(20).fill(0));
  localStorage.setItem('car_map_grid', JSON.stringify(carGrid));
  logCarConsole("Obstacle map cleared.");
});

function processCarFrame() {
  if (!carVisionActive) return;
  
  try {
    // 1. Draw live feed
    carCtx.drawImage(carVideo, 0, 0, carCanvas.width, carCanvas.height);
    const imgData = carCtx.getImageData(0, 0, carCanvas.width, carCanvas.height);
    const data = imgData.data;
    
    // Calculate motion difference
    if (carLastFrameData) {
      let diffSum = 0;
      let pixelStep = 8;
      let sampleCount = 0;
      for (let i = 0; i < data.length; i += 4 * pixelStep) {
        diffSum += Math.abs(data[i] - carLastFrameData[i]) +
                   Math.abs(data[i+1] - carLastFrameData[i+1]) +
                   Math.abs(data[i+2] - carLastFrameData[i+2]);
        sampleCount++;
      }
      carFrameDiff = diffSum / sampleCount;
    }
    
    if (!carLastFrameData || carLastFrameData.length !== data.length) {
      carLastFrameData = new Uint8ClampedArray(data.length);
    }
    carLastFrameData.set(data);
    
    // 2. Track car centroid using background differencing
    let sumX = 0, sumY = 0, matchCount = 0;
    if (carBgFrameData) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const bg_r = carBgFrameData[i], bg_g = carBgFrameData[i+1], bg_b = carBgFrameData[i+2];
        
        const dist = Math.sqrt((r-bg_r)**2 + (g-bg_g)**2 + (b-bg_b)**2);
        if (dist > carMotionThreshold) {
          const idx = i / 4;
          const x = idx % carCanvas.width;
          const y = Math.floor(idx / carCanvas.width);
          sumX += x;
          sumY += y;
          matchCount++;
        }
      }
    }
    
    // Draw 2D grid overlay
    const cellW = 320 / 20; // 16 pixels
    const cellH = 240 / 15; // 16 pixels
    
    // We draw grid lines faintly
    carCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    carCtx.lineWidth = 1;
    for (let c = 0; c <= 20; c++) {
      carCtx.beginPath();
      carCtx.moveTo(c * cellW, 0); carCtx.lineTo(c * cellW, 240);
      carCtx.stroke();
    }
    for (let r = 0; r <= 15; r++) {
      carCtx.beginPath();
      carCtx.moveTo(0, r * cellH); carCtx.lineTo(320, r * cellH);
      carCtx.stroke();
    }
    
    // Resolve car centroid position
    if (matchCount > 150) {
      carCentroid.x = sumX / matchCount;
      carCentroid.y = sumY / matchCount;
      carCentroid.detected = true;
      
      // Highlight car centroid
      carCtx.strokeStyle = 'var(--purple-accent)';
      carCtx.lineWidth = 2;
      carCtx.beginPath();
      carCtx.arc(carCentroid.x, carCentroid.y, 12, 0, 2*Math.PI);
      carCtx.stroke();
      carCtx.fillStyle = 'var(--purple-accent)';
      carCtx.font = 'bold 9px monospace';
      carCtx.fillText(`CAR (${Math.floor(carCentroid.x)}, ${Math.floor(carCentroid.y)})`, carCentroid.x + 15, carCentroid.y - 5);
      
      // Update cell mapping if mapping is active and car is driving
      if (isMappingActive && carDriveState !== 'STILL') {
        const gridCol = Math.floor(carCentroid.x / cellW);
        const gridRow = Math.floor(carCentroid.y / cellH);
        
        if (gridCol >= 0 && gridCol < 20 && gridRow >= 0 && gridRow < 15) {
          const oldVal = carGrid[gridRow][gridCol];
          // If motors are wiggling but pixel frame diff is very low, it means we are stuck!
          if (carFrameDiff < 0.8) {
            carGrid[gridRow][gridCol] = 2; // Stuck / Red
          } else {
            carGrid[gridRow][gridCol] = 1; // Safe / Green
          }
          if (oldVal !== carGrid[gridRow][gridCol]) {
            localStorage.setItem('car_map_grid', JSON.stringify(carGrid));
          }
        }
      }
    } else {
      carCentroid.detected = false;
    }
    
    // Draw cells
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 20; c++) {
        const state = carGrid[r][c];
        if (state === 1) { // Safe
          carCtx.fillStyle = 'rgba(15, 189, 140, 0.25)'; // Light Green
          carCtx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        } else if (state === 2) { // Blocked
          carCtx.fillStyle = 'rgba(255, 0, 85, 0.4)'; // Transparent Red
          carCtx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        }
      }
    }
    
  } catch (err) {
    console.error("Car frame process error:", err);
  }
  
  requestAnimationFrame(processCarFrame);
}

// Wander mapping timer & controller
let carMappingTimer = null;
btnCarMapStart.addEventListener('click', () => {
  if (!carVisionActive) {
    alert("Camera feed must be active first!");
    return;
  }
  
  if (isMappingActive) {
    // Stop mapping
    isMappingActive = false;
    btnCarMapStart.innerText = "🗺️ START MAPPING";
    btnCarMapStart.classList.add('btn-run');
    btnCarMapStart.classList.remove('btn-stop');
    btnCarAuto.disabled = false;
    if (carMappingTimer) {
      clearTimeout(carMappingTimer);
      carMappingTimer = null;
    }
    logCarConsole("Mapping paused.");
    stopAll();
    carDriveState = 'STILL';
  } else {
    // Start mapping
    isMappingActive = true;
    btnCarMapStart.innerText = "⏹ STOP MAPPING";
    btnCarMapStart.classList.remove('btn-run');
    btnCarMapStart.classList.add('btn-stop');
    btnCarAuto.disabled = true;
    logCarConsole("Mapping started. Car will wander safely...");
    
    // Start recursive wander loop
    runWanderStep();
  }
});

async function runWanderStep() {
  if (!isMappingActive) return;
  
  // If stuck, reverse and turn
  if (carCentroid.detected && carFrameDiff < 0.8 && carDriveState !== 'STILL') {
    logCarConsole("Stuck detected! Reversing...");
    carDriveState = 'STILL';
    // Back up both motors (Motor A and B backward)
    await triggerCalibMove('A', -400);
    await triggerCalibMove('B', -400);
    await delay(1600);
    
    logCarConsole("Turning away...");
    // Turn (Motor A forward, Motor B backward)
    await triggerCalibMove('A', 350);
    await triggerCalibMove('B', -350);
    await delay(1200);
    
    carDriveState = 'FORWARD';
    logCarConsole("Driving forward...");
    await triggerCalibMove('A', 400);
    await triggerCalibMove('B', 400);
  } else {
    carDriveState = 'FORWARD';
    logCarConsole("Exploring forward...");
    await triggerCalibMove('A', 400);
    await triggerCalibMove('B', 400);
  }
  
  if (isMappingActive) {
    carMappingTimer = setTimeout(runWanderStep, 1800);
  }
}

// Self-driving autopilot logic
let carAutoTimer = null;
btnCarAuto.addEventListener('click', () => {
  if (isCarAutopilotActive) {
    isCarAutopilotActive = false;
    btnCarAuto.innerText = "🤖 AUTOPILOT: OFF";
    btnCarAuto.classList.remove('btn-stop');
    btnCarAuto.classList.add('btn-clear');
    if (carAutoTimer) {
      clearTimeout(carAutoTimer);
      carAutoTimer = null;
    }
    logCarConsole("Autopilot stopped.");
    stopAll();
    carDriveState = 'STILL';
  } else {
    isCarAutopilotActive = true;
    btnCarAuto.innerText = "⏹ STOP AUTOPILOT";
    btnCarAuto.classList.remove('btn-clear');
    btnCarAuto.classList.add('btn-stop');
    logCarConsole("Autopilot started! Running autonomous obstacle avoidance...");
    
    runAutopilotStep();
  }
});

async function runAutopilotStep() {
  if (!isCarAutopilotActive) return;
  
  const cellW = 320 / 20;
  const cellH = 240 / 15;
  const gridCol = Math.floor(carCentroid.x / cellW);
  const gridRow = Math.floor(carCentroid.y / cellH);
  
  // Obstacle checks in front
  // Look 2 cells ahead of the current coordinate
  let obstacleAhead = false;
  
  if (gridCol >= 0 && gridCol < 20 && gridRow >= 0 && gridRow < 15) {
    // Check local neighborhood (within 2 cells)
    for (let r = Math.max(0, gridRow - 2); r <= Math.min(14, gridRow + 2); r++) {
      for (let c = Math.max(0, gridCol - 2); c <= Math.min(19, gridCol + 2); c++) {
        if (carGrid[r][c] === 2) { // Obstacle
          obstacleAhead = true;
          break;
        }
      }
    }
  }
  
  // Waving hand/moving obstacles: if sudden high motion diff is detected near the car
  // but it's not due to its own motion command, it means an external obstacle is present!
  if (carFrameDiff > 5.0 && carDriveState === 'STILL') {
    obstacleAhead = true;
    logCarConsole("Moving obstacle detected!");
  }
  
  if (obstacleAhead) {
    logCarConsole("Obstacle nearby! Steering away...");
    carDriveState = 'STILL';
    // Back up
    await triggerCalibMove('A', -350);
    await triggerCalibMove('B', -350);
    await delay(1400);
    // Spin turn
    await triggerCalibMove('A', 350);
    await triggerCalibMove('B', -350);
    await delay(1200);
    
    carDriveState = 'FORWARD';
    await triggerCalibMove('A', 400);
    await triggerCalibMove('B', 400);
  } else {
    carDriveState = 'FORWARD';
    logCarConsole("Safe path. Driving forward...");
    await triggerCalibMove('A', 400);
    await triggerCalibMove('B', 400);
  }
  
  if (isCarAutopilotActive) {
    carAutoTimer = setTimeout(runAutopilotStep, 1500);
  }
}

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
        await fetch('/api/sensors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        });
      } catch(e) {}
  }
}, 300);
