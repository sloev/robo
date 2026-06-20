// viewer.js
// Interactive 3D Exploded View for BlockBot

const container = document.getElementById('assembly-viewer');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 150, 250);

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
} catch (e) {
    container.innerHTML = `<div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
        <h3>3D Viewer Error</h3>
        <p>Could not initialize WebGL: ${e.message}</p>
        <p>Please ensure hardware acceleration is enabled in your browser.</p>
    </div>`;
    throw e; // Stop execution of the rest of the script
}

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
const matBase = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6, metalness: 0.1 });
const matLid = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.6, metalness: 0.1 });
const matClamp = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6, metalness: 0.1 });
const matCoupler = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.6, metalness: 0.1 });

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
    [0, -50, 0], // Exploded
    'base'
);

// 2. Lid is generated at origin. In assembled it is at Z = 48.
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_lid.stl', matLid,
    [0, 0, 0],    // Assembled (lid SCAD is generated already at its in-place Z, so it seats flush)
    [0, 60, 0],   // Exploded (lifted straight up off the chassis)
    'lid'
);

// 3. Phone clamp is naturally generated fully assembled! (Z=65 to 130).
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_phone_clamp.stl', matClamp, 
    [0, 0, 0],   // Assembled (Already in place)
    [0, 50, 50], // Exploded (lifted and moved forward)
    'clamp'
);

// 4. Couplers. We load the same model twice (left and right).
// Left coupler: D-socket faces +X (towards motor). The model's default orientation points D-socket to +X.
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_couplers.stl', matCoupler, 
    [-50, 33.6, -44],   // Assembled (on the shaft, just outside the left wall)
    [-85, 33.6, -44],   // Exploded
    'couplerLeft'
);

// Right coupler: D-socket must face -X. So we rotate it 180 degrees around Y!
loadPart('https://raw.githubusercontent.com/sloev/robo/master/vehicle_couplers.stl', matCoupler, 
    [50, 33.6, -44],    // Assembled (on the shaft, just outside the right wall)
    [85, 33.6, -44],    // Exploded
    'couplerRight',
    [0, Math.PI, 0]     // Assembled Rotation (will be applied to wrapper)
);

// Button logic
document.getElementById('explode-btn').addEventListener('click', () => {
    isExploded = !isExploded;
    for (const key in parts) {
        parts[key].targetPos = isExploded ? parts[key].explodedPos : parts[key].assembledPos;
    }
});
