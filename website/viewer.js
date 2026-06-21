// viewer.js
// Interactive 3D Exploded View for BlockBot
(function () {

const container = document.getElementById('assembly-viewer');
if (!container) return;

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 150, 250);

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true, failIfMajorPerformanceCaveat: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
} catch (e) {
    // No WebGL available (e.g. hardware acceleration disabled). Fall back to the
    // static render and stop -- do NOT rethrow (that left an uncaught error).
    container.innerHTML = `<div style="color:#ddd;padding:16px;text-align:center;font-family:sans-serif;">
        <p>The 3D viewer needs WebGL (enable hardware acceleration in your browser). Static render:</p>
        <img src="screenshots/vehicle_render.png" alt="BlockBot assembly" style="max-width:100%;border-radius:12px;">
    </div>`;
    return;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 40, 0);
controls.update();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);

// Materials using exact hex colors
const matBase = new THREE.MeshStandardMaterial({ color: 0x5b9bd5, roughness: 0.6, metalness: 0.1 });
const matLid = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.6, metalness: 0.1 });
const matClamp = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6, metalness: 0.1 });
const matCoupler = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.6, metalness: 0.1 });
// Non-printed components shown for realism
const matMotor = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.4, metalness: 0.5 });
const matBoard = new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.6, metalness: 0.1 });

const parts = {};
let isExploded = false;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const speed = 5.0;
    
    for (const key in parts) {
        const p = parts[key];
        if (p && p.mesh && p.targetPos) {
            p.mesh.position.lerp(p.targetPos, speed * dt);
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

const loader = new THREE.STLLoader();

// Helper to load an STL. OpenSCAD coordinates: Z is up.
// We rotate the entire group -90 on X so that ThreeJS Y is up.
function loadPart(url, material, assembledPos, explodedPos, name, assembledRot) {
    loader.load(url, (geometry) => {
        // STLLoader yields a BufferGeometry; wrap it in a Mesh with the part material.
        const obj = new THREE.Mesh(geometry, material);

        const wrapper = new THREE.Group();
        wrapper.add(obj);
        
        // Convert OpenSCAD's Z-up to Three.js Y-up
        wrapper.rotation.x = -Math.PI / 2;
        
        // Apply assembled rotation if specified
        if (assembledRot) {
            // Apply it after the -90 degree X rotation by nesting
            const outerWrapper = new THREE.Group();
            outerWrapper.add(wrapper);
            outerWrapper.rotation.set(...assembledRot);
            scene.add(outerWrapper);
            
            parts[name] = {
                mesh: outerWrapper,
                assembledPos: new THREE.Vector3(...assembledPos),
                explodedPos: new THREE.Vector3(...explodedPos),
                targetPos: new THREE.Vector3(...assembledPos)
            };
            outerWrapper.position.copy(parts[name].targetPos);
        } else {
            scene.add(wrapper);
            parts[name] = {
                mesh: wrapper,
                assembledPos: new THREE.Vector3(...assembledPos),
                explodedPos: new THREE.Vector3(...explodedPos),
                targetPos: new THREE.Vector3(...assembledPos)
            };
            wrapper.position.copy(parts[name].targetPos);
        }
    });
}

// In OpenSCAD coordinate system (which is what assembledPos/explodedPos use since they are applied before the -90 rot):
// The wrapper's position is actually in ThreeJS coordinates!
// Wait. If wrapper is rotated -90 on X, then local Z is global -Y. Local Y is global Z.
// Let's just apply positions in THREE.js space (Y is up).
// OpenSCAD space: [x, y, z]. ThreeJS space: [x, z, -y].

// 1. Base is generated at origin in OpenSCAD.
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_base.stl', matBase, 
    [0, 0, 0],    // Assembled
    [0, 0, 0],    // Exploded (base stays as the reference; everything else moves off it)
    'base'
);

// 2. Lid is generated at origin. In assembled it is at Z = 48.
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_lid.stl', matLid,
    [0, 0, 0],    // Assembled (lid SCAD is generated already at its in-place Z, so it seats flush)
    [0, 105, 0],  // Exploded (lifts straight up off the chassis, highest part)
    'lid'
);

// 3. Phone clamp is naturally generated fully assembled! (Z=65 to 130).
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_phone_clamp.stl', matClamp, 
    [0, 0, 0],      // Assembled (Already in place)
    [-60, 30, 0],   // Exploded (the moving jaw slides out of its rail to the left + lifts)
    'clamp'
);

// 4. Couplers. We load the same model twice (left and right).
// Left coupler: D-socket faces +X (towards motor). The model's default orientation points D-socket to +X.
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_couplers.stl', matCoupler, 
    [-46, 33.6, -26],   // Assembled (captive in the left wall pocket: Ø12 ring trapped, axle socket out)
    [-105, 33.6, -26],  // Exploded (slides straight out the left wall)
    'couplerLeft'
);

// Right coupler: D-socket must face -X. So we rotate it 180 degrees around Y!
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_couplers.stl', matCoupler, 
    [46, 33.6, -26],    // Assembled (captive in the right wall pocket: Ø12 ring trapped, axle socket out)
    [105, 33.6, -26],   // Exploded (slides straight out the right wall)
    'couplerRight',
    [0, Math.PI, 0]     // Assembled Rotation (will be applied to wrapper)
);

// --- Non-printed internals for realism (grey motors, purple boards) ---
// Placed using OpenSCAD coordinates [x, y, z] (same convention as the base,
// which is generated at the origin). OpenSCAD space maps to Three.js as
// [x, z, -y]. They explode straight down with the base so the "guts" stay
// nested inside the chassis as the lid lifts off.
let internalCount = 0;
function addInternal(geometry, material, oscadPos, rot, explodeOffset = [0, 55, 0]) {
    const mesh = new THREE.Mesh(geometry, material);
    if (rot) mesh.rotation.set(...rot);
    const assembled = new THREE.Vector3(oscadPos[0], oscadPos[2], -oscadPos[1]);
    const exploded = assembled.clone().add(new THREE.Vector3(...explodeOffset));
    scene.add(mesh);
    parts['internal_' + (internalCount++)] = {
        mesh: mesh,
        assembledPos: assembled,
        explodedPos: exploded,
        targetPos: assembled.clone()
    };
    mesh.position.copy(assembled);
}

// Detailed 28BYJ-48 stepper: body can, offset flat-D shaft + boss, two mount
// ears with Ø4 holes (35mm apart), and the cable connector + 5 wires. Single
// grey colour. Local frame: body axis X, "up" +Y, shaft exits +X offset +8 in Y.
function makeMotor() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 19, 36), matMotor);
    body.rotation.z = Math.PI / 2; g.add(body);
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 1.5, 24), matMotor);
    boss.rotation.z = Math.PI / 2; boss.position.set(10.25, 8, 0); g.add(boss);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 9, 16), matMotor);
    shaft.rotation.z = Math.PI / 2; shaft.position.set(15.5, 8, 0); g.add(shaft);
    // Mount ears: disc tab with a Ø4 hole, at the front face, 35mm apart along Z.
    const earShape = new THREE.Shape(); earShape.absarc(0, 0, 3.5, 0, Math.PI * 2, false);
    const earHole = new THREE.Path(); earHole.absarc(0, 0, 2, 0, Math.PI * 2, true);
    earShape.holes.push(earHole);
    const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.8, bevelEnabled: false });
    for (const dz of [-17.5, 17.5]) {
        const ear = new THREE.Mesh(earGeo, matMotor);
        ear.rotation.y = Math.PI / 2; ear.position.set(9, 0, dz); g.add(ear);
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 4), matMotor);
        bridge.position.set(9, 0, dz - Math.sign(dz) * 1.75); g.add(bridge);
    }
    // Cable connector housing + 5 wire stubs (exit upward/inward).
    const conn = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 14.6), matMotor);
    conn.position.set(-2, 13, 0); g.add(conn);
    for (const wz of [-4, -2, 0, 2, 4]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5, 8), matMotor);
        w.position.set(-2, 17.5, wz); g.add(w);
    }
    return g;
}
for (const m of [{ x: -30.5, flip: true }, { x: 30.5, flip: false }]) {
    const motor = makeMotor();
    if (m.flip) motor.rotation.y = Math.PI;   // shaft toward the opposite wall
    const assembled = new THREE.Vector3(m.x, 25.6, -26);   // OpenSCAD (±30.5, 30, 25.6)
    const exploded = assembled.clone().add(new THREE.Vector3(m.x > 0 ? 18 : -18, 65, 0)); // lift out + fan apart
    motor.position.copy(assembled);
    scene.add(motor);
    parts['motor_' + (internalCount++)] = { mesh: motor, assembledPos: assembled, explodedPos: exploded, targetPos: assembled.clone() };
}
// Two ULN2003 driver boards (35 x 31.5mm) standing vertically on the inner side
// walls. BoxGeometry here is in Three.js axes: x=thickness, y=height, z=length.
for (const sx of [-36, 36])
    addInternal(new THREE.BoxGeometry(1.6, 31.5, 35), matBoard, [sx, -10, 20], null,
        [sx > 0 ? -18 : 18, 70, 0]);   // lift up off the wall rails
// ESP32-S2 Mini (34.3 x 25.4mm) flat on the floor at the back, USB-C to the wall.
addInternal(new THREE.BoxGeometry(25.4, 1.6, 34.3), matBoard, [0, -29, 7], null, [0, 45, 0]);

// Rubber band of the phone clamp: hooked on the fixed band post and the moving
// jaw's peg, BEHIND the front wall in the cavity gap, at rail height (OpenSCAD
// y=44, z=26 -> Three.js z=-44, y=26). It pulls the moving jaw toward the fixed
// one, in-line with the slide so the jaw can't cock and jam.
const matBand = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
{
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 80, 12), matBand);
    band.rotation.z = Math.PI / 2;          // lay the cylinder along X
    band.position.set(0, 26, -44);          // spans x -40..40 between the two pegs
    scene.add(band);
}

// Button logic
const explodeBtn = document.getElementById('explode-btn');
if (explodeBtn) explodeBtn.addEventListener('click', () => {
    isExploded = !isExploded;
    for (const key in parts) {
        parts[key].targetPos = isExploded ? parts[key].explodedPos : parts[key].assembledPos;
    }
});

})();
