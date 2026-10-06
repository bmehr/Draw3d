import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';

let scene, camera, renderer, controls;
let brushSize = 0.15;
let brushColor = "#ff0000";
let strokes = [];

let drawMode = false;   // NEW: draw mode toggle
let isDrawing = false;

const canvas = document.getElementById("drawCanvas");

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(3, 3, 3);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    window.addEventListener("resize", onResize);

    // UI controls
    document.getElementById("brushSize").addEventListener("input", e => {
        brushSize = parseFloat(e.target.value);
    });

    document.getElementById("brushColor").addEventListener("input", e => {
        brushColor = e.target.value;
    });

    document.getElementById("undoBtn").addEventListener("click", undoStroke);
    document.getElementById("clearBtn").addEventListener("click", clearCanvas);

    // NEW: Draw mode toggle
    document.getElementById("toggleDrawBtn").addEventListener("click", () => {
        drawMode = !drawMode;

        document.getElementById("toggleDrawBtn").innerText =
            drawMode ? "Draw Mode: On" : "Draw Mode: Off";

        controls.enabled = !drawMode;  // disable orbit controls while drawing
    });

    // Drawing events
    renderer.domElement.addEventListener("pointerdown", startDrawing);
    renderer.domElement.addEventListener("pointermove", draw);
    renderer.domElement.addEventListener("pointerup", stopDrawing);
}

function startDrawing(e) {
    if (!drawMode) return;
    isDrawing = true;
    addPoint(e);
}

function draw(e) {
    if (!drawMode || !isDrawing) return;
    addPoint(e);
}

function stopDrawing() {
    isDrawing = false;
}

function addPoint(e) {
    const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Project point 3 units out from camera
    const point = raycaster.ray.at(3, new THREE.Vector3());

    const geometry = new THREE.SphereGeometry(brushSize, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: brushColor });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.copy(point);
    scene.add(sphere);

    strokes.push(sphere);
}

function undoStroke() {
    const last = strokes.pop();
    if (last) scene.remove(last);
}

function clearCanvas() {
    strokes.forEach(s => scene.remove(s));
    strokes = [];
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}


