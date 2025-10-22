import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { showReplay } from './replay.jsx';

const container = document.getElementById('container');
const canvas = document.getElementById('game-canvas');
const scoreElement = document.getElementById('score');
const instructionsElement = document.getElementById('instructions');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const replayButton = document.getElementById('replay-button');

let camera, scene, renderer;
let world; // Physics world
let stack = [];
let overhangs = [];
let activeBlock;
let replayData = [];

const BLOCK_HEIGHT = 0.25;
const ORIGINAL_BLOCK_SIZE = 1;

let gameState = 'loading'; // loading, playing, gameover
let defaultMaterial; // Add material reference at module scope

function init() {
    // Scene setup
    scene = new THREE.Scene();

    // Physics world setup
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.solver.iterations = 20;
    world.allowSleep = true;

    // Add contact material to reduce sticking
    defaultMaterial = new CANNON.Material('default');
    const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8
    });
    world.addContactMaterial(contactMaterial);
    world.defaultContactMaterial = contactMaterial;

    // Base block
    addBlock(0, 0, ORIGINAL_BLOCK_SIZE, ORIGINAL_BLOCK_SIZE, 'base');

    // First moving block
    spawnNewBlock();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 0);
    scene.add(dirLight);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 4;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 100);
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    
    // Start game
    gameState = 'playing';

    // UI Listeners
    restartButton.addEventListener('click', () => {
        // Reset logic
        overhangs.forEach(overhang => {
            scene.remove(overhang.mesh);
            overhang.mesh.geometry.dispose();
            overhang.mesh.material.dispose();
            world.removeBody(overhang.body);
        });
        stack.forEach(block => {
            scene.remove(block.mesh);
            block.mesh.geometry.dispose();
            block.mesh.material.dispose();
        });
        if (activeBlock) {
            scene.remove(activeBlock);
            activeBlock.geometry.dispose();
            activeBlock.material.dispose();
            activeBlock = null;
        }

        stack = [];
        overhangs = [];
        replayData = [];

        scoreElement.innerText = '0';
        gameOverElement.classList.add('hidden');
        instructionsElement.classList.remove('hidden');

        addBlock(0, 0, ORIGINAL_BLOCK_SIZE, ORIGINAL_BLOCK_SIZE, 'base');
        spawnNewBlock();
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);

        gameState = 'playing';
    });

    replayButton.addEventListener('click', () => {
        if (replayData.length > 0) {
            showReplay(replayData);
        }
    });

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 4;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('pointerdown', () => {
    if (gameState === 'playing') {
        if (instructionsElement) instructionsElement.classList.add('hidden');
        placeBlock();
    }
});

function addBlock(x, z, width, depth, type) {
    const y = BLOCK_HEIGHT * stack.length;
    const geometry = new THREE.BoxGeometry(width, BLOCK_HEIGHT, depth);
    
    const color = new THREE.Color(`hsl(${stack.length * 8}, 70%, 50%)`);
    const material = new THREE.MeshLambertMaterial({ color });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    if (type === 'active') {
        activeBlock = mesh;
    } else {
        const blockData = { mesh, width, depth };
        
        // Add physics body for placed blocks
        if (type === 'stacked') {
            const shape = new CANNON.Box(new CANNON.Vec3(width / 2, BLOCK_HEIGHT / 2, depth / 2));
            const body = new CANNON.Body({
                mass: 0, // Static body
                shape: shape,
                position: new CANNON.Vec3(x, y, z)
            });
            world.addBody(body);
            blockData.body = body;
        }
        
        stack.push(blockData);
    }
}

function spawnNewBlock() {
    if(stack.length === 0) return;
    const prevBlock = stack[stack.length - 1];
    
    const direction = stack.length % 2 === 0 ? 'z' : 'x';
    const newWidth = prevBlock.width;
    const newDepth = prevBlock.depth;
    
    const x = direction === 'x' ? -2 : prevBlock.mesh.position.x;
    const z = direction === 'z' ? -2 : prevBlock.mesh.position.z;

    addBlock(x, z, newWidth, newDepth, 'active');
    activeBlock.userData.direction = direction;
    activeBlock.userData.speed = 0.02 + stack.length * 0.001;
}

function placeBlock() {
    if (!activeBlock) return;
    
    const prevBlock = stack[stack.length - 1];
    const direction = activeBlock.userData.direction;

    let overlap, overhang;
    let newWidth, newDepth;

    if (direction === 'x') {
        overlap = prevBlock.width - Math.abs(activeBlock.position.x - prevBlock.mesh.position.x);
        overhang = activeBlock.position.x > prevBlock.mesh.position.x ? 1 : -1;
        newWidth = overlap;
        newDepth = prevBlock.depth;
    } else { // direction === 'z'
        overlap = prevBlock.depth - Math.abs(activeBlock.position.z - prevBlock.mesh.position.z);
        overhang = activeBlock.position.z > prevBlock.mesh.position.z ? 1 : -1;
        newWidth = prevBlock.width;
        newDepth = overlap;
    }
    
    if (overlap <= 0) {
        gameOver();
        return;
    }

    // Chopped block
    const newX = direction === 'x' ? (activeBlock.position.x + prevBlock.mesh.position.x) / 2 : prevBlock.mesh.position.x;
    const newZ = direction === 'z' ? (activeBlock.position.z + prevBlock.mesh.position.z) / 2 : prevBlock.mesh.position.z;

    const activeColor = activeBlock.material.color.clone();
    scene.remove(activeBlock);
    addBlock(newX, newZ, newWidth, newDepth, 'stacked');

    const lastPlacedBlock = stack[stack.length - 1].mesh;
    
    // Capture frame data for replay
    captureReplayFrame();

    // Overhang piece with physics - FIXED: ensure shape matches mesh dimensions exactly
    const overhangWidth = direction === 'x' ? Math.abs(prevBlock.width - overlap) : prevBlock.width;
    const overhangDepth = direction === 'z' ? Math.abs(prevBlock.depth - overlap) : prevBlock.depth;

    if (overhangWidth > 0.01 && overhangDepth > 0.01) {
        const overhangX = direction === 'x' ? newX + (overlap / 2 * overhang) + (overhangWidth / 2 * overhang) : newX;
        const overhangZ = direction === 'z' ? newZ + (overlap / 2 * overhang) + (overhangDepth / 2 * overhang) : newZ;
        
        const overhangGeometry = new THREE.BoxGeometry(overhangWidth, BLOCK_HEIGHT, overhangDepth);
        const overhangMaterial = new THREE.MeshLambertMaterial({ color: activeColor });
        const overhangMesh = new THREE.Mesh(overhangGeometry, overhangMaterial);
        overhangMesh.position.set(overhangX, activeBlock.position.y, overhangZ);
        scene.add(overhangMesh);
        
        // Create physics body for overhang - shape now exactly matches mesh dimensions
        const shape = new CANNON.Box(new CANNON.Vec3(overhangWidth / 2, BLOCK_HEIGHT / 2, overhangDepth / 2));
        const body = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(overhangX, activeBlock.position.y, overhangZ),
            linearDamping: 0.1,
            angularDamping: 0.2,
            collisionFilterGroup: 1,
            collisionFilterMask: 1,
            sleepSpeedLimit: 0.01,
            sleepTimeLimit: 2,
            material: defaultMaterial
        });
        body.allowSleep = false; // Prevent sleep entirely
        body.wakeUp(); // Ensure it's awake
        world.addBody(body);
        
        // Add initial velocity and immediate downward impulse
        const lateralSpeed = activeBlock.userData.speed * 40;
        if (direction === 'x') {
            body.velocity.set(lateralSpeed * overhang, -1, 0);
            body.angularVelocity.set(0, 0, activeBlock.userData.speed * 10);
        } else {
            body.velocity.set(0, -1, lateralSpeed * overhang);
            body.angularVelocity.set(activeBlock.userData.speed * 10, 0, 0);
        }
        
        // Apply immediate downward impulse to ensure falling starts
        body.applyImpulse(new CANNON.Vec3(0, -0.5, 0), body.position);
        
        overhangs.push({ 
            mesh: overhangMesh, 
            body: body, 
            stuckCounter: 0,
            originalColor: overhangMaterial.color.clone()
        });
    }
    
    activeBlock = null;

    scoreElement.innerText = stack.length - 1;

    // Camera position update
    const cameraY = BLOCK_HEIGHT * stack.length + 4;
    camera.position.y = cameraY;

    spawnNewBlock();
}

function captureReplayFrame() {
    const frame = {
        cameraPosition: camera.position.clone(),
        cameraTarget: new THREE.Vector3(0, stack.length * BLOCK_HEIGHT * 0.5, 0),
        stack: stack.map(block => ({
            position: block.mesh.position.clone(),
            scale: new THREE.Vector3(
                block.mesh.geometry.parameters.width,
                block.mesh.geometry.parameters.height,
                block.mesh.geometry.parameters.depth
            ),
            color: block.mesh.material.color.getHex(),
            quaternion: block.mesh.quaternion.clone()
        })),
        overhangs: overhangs.filter(o => !o.life).map(overhang => ({
            position: overhang.mesh.position.clone(),
            scale: new THREE.Vector3(
                overhang.mesh.geometry.parameters.width,
                overhang.mesh.geometry.parameters.height,
                overhang.mesh.geometry.parameters.depth
            ),
            color: (overhang.originalColor || overhang.mesh.material.color).getHex(),
            quaternion: overhang.mesh.quaternion.clone()
        }))
    };
    replayData.push(frame);
}

function gameOver() {
    gameState = 'gameover';
    // The active block is the one that fell
    if (activeBlock) {
        const width = activeBlock.geometry.parameters.width;
        const depth = activeBlock.geometry.parameters.depth;

        replayData.push({
            placed: null,
            overhang: {
                x: activeBlock.position.x,
                y: activeBlock.position.y,
                z: activeBlock.position.z,
                width: width,
                depth: depth,
                color: activeBlock.material.color.getHexString(),
            }
        });

        // Create physics body for the falling active block
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, BLOCK_HEIGHT / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(activeBlock.position.x, activeBlock.position.y, activeBlock.position.z),
            linearDamping: 0.3,
            angularDamping: 0.3
        });
        body.velocity.x = activeBlock.userData.speed * 50;
        world.addBody(body);
        
        overhangs.push({ mesh: activeBlock, body: body });
        activeBlock = null;
    }
    finalScoreElement.innerText = stack.length - 1;
    gameOverElement.classList.remove('hidden');
}

function shatterBlock(overhang) {
    const particleCount = 20;
    const particles = [];
    const color = overhang.originalColor || overhang.mesh.material.color;
    
    // Create small cube fragments
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 0.08 + 0.04;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const particleMesh = new THREE.Mesh(geometry, material);
        
        // Start at overhang position
        particleMesh.position.copy(overhang.mesh.position);
        scene.add(particleMesh);
        
        // Create physics body for particle - NO COLLISION with other objects
        const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
        const body = new CANNON.Body({
            mass: 0.1,
            shape: shape,
            position: new CANNON.Vec3(
                overhang.mesh.position.x,
                overhang.mesh.position.y,
                overhang.mesh.position.z
            ),
            linearDamping: 0.3,
            angularDamping: 0.3,
            collisionFilterGroup: 2, // Different group
            collisionFilterMask: 0 // Don't collide with anything
        });
        
        // Explosive outward velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        body.velocity.set(
            Math.cos(angle) * speed,
            Math.random() * 2 + 1,
            Math.sin(angle) * speed
        );
        body.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        
        world.addBody(body);
        
        particles.push({ 
            mesh: particleMesh, 
            body: body,
            life: 120 // frames before removal
        });
    }
    
    // Remove original overhang
    scene.remove(overhang.mesh);
    overhang.mesh.geometry.dispose();
    overhang.mesh.material.dispose();
    world.removeBody(overhang.body);
    
    return particles;
}

function animate() {
    // Step physics world
    world.step(1 / 60);
    
    // Update overhangs with physics
    const newOverhangs = [];
    const stackHeight = BLOCK_HEIGHT * stack.length;
    
    for (const overhang of overhangs) {
        // Initialize spawn time if not set
        if (overhang.spawnTime === undefined) {
            overhang.spawnTime = Date.now();
        }
        
        // Check if block hasn't fallen after time limit (2 seconds)
        const timeSinceSpawn = Date.now() - overhang.spawnTime;
        const hasntFallen = overhang.body.position.y >= overhang.mesh.position.y - 0.3;
        
        if (timeSinceSpawn > 2000 && hasntFallen && overhang.life === undefined) {
            const particles = shatterBlock(overhang);
            overhangs.push(...particles);
            continue;
        }
        
        // Check for stuck/floating blocks
        const velocity = overhang.body.velocity.length();
        const angularVelocity = overhang.body.angularVelocity.length();
        const isNearStack = overhang.body.position.y > stackHeight - 0.5 && 
                           overhang.body.position.y < stackHeight + 0.5;
        
        // More aggressive stuck detection
        if (velocity < 0.5 && angularVelocity < 0.5 && isNearStack && !overhang.body.sleepState && overhang.life === undefined) {
            overhang.stuckCounter = (overhang.stuckCounter || 0) + 1;
            
            // After being stuck for multiple frames, shatter the block
            if (overhang.stuckCounter > 20) {
                const particles = shatterBlock(overhang);
                overhangs.push(...particles);
                continue; // Skip adding this overhang back
            }
        } else {
            overhang.stuckCounter = 0;
        }
        
        // Sync mesh with physics body
        overhang.mesh.position.copy(overhang.body.position);
        overhang.mesh.quaternion.copy(overhang.body.quaternion);
        
        // Handle particle lifetime
        if (overhang.life !== undefined) {
            overhang.life--;
            if (overhang.life <= 0 || overhang.mesh.position.y < -10) {
                scene.remove(overhang.mesh);
                overhang.mesh.geometry.dispose();
                overhang.mesh.material.dispose();
                world.removeBody(overhang.body);
                continue;
            }
        } else if (overhang.mesh.position.y < -10) {
            scene.remove(overhang.mesh);
            overhang.mesh.geometry.dispose();
            overhang.mesh.material.dispose();
            world.removeBody(overhang.body);
            continue;
        }
        
        newOverhangs.push(overhang);
    }
    overhangs = newOverhangs;

    if (gameState === 'playing' && activeBlock) {
        const speed = activeBlock.userData.speed;
        const direction = activeBlock.userData.direction;

        if (direction === 'x') {
            activeBlock.position.x += speed;
            if (activeBlock.position.x > 2 || activeBlock.position.x < -2) {
                activeBlock.userData.speed *= -1;
            }
        } else { // direction === 'z'
            activeBlock.position.z += speed;
            if (activeBlock.position.z > 2 || activeBlock.position.z < -2) {
                activeBlock.userData.speed *= -1;
            }
        }

        // Smooth camera follow
        const targetCameraY = BLOCK_HEIGHT * stack.length + 4;
        camera.position.y += (targetCameraY - camera.position.y) * 0.1;
        camera.lookAt(0, stack.length * BLOCK_HEIGHT * 0.5, 0); // Look at middle of stack
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}


init();