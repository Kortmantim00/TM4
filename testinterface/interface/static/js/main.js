document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-algo');
    runBtn.addEventListener('click', () => {
        // TODO: verzamel bestanden, stuur naar backend via fetch/AJAX
        console.log('Run algorithm button clicked');
    });
    
    // TODO init Three.js or VTK.js in viewer
});

function addLog(message) {
    const logList = document.getElementById('log-list');
    const entry = document.createElement('li');
    const timestamp = new Date().toLocaleTimeString();

    entry.textContent = "[${timestamp}] ${message}";
    logList.appendChild(entry);
    
    // Scroll automatisch naar beneden
    logList.scrollTop = logList.scrollHeight;
}

// Voorbeeld: log wanneer knop wordt geklikt
document.addEventListener('DOMContentLoaded', function () {
    const runButton = document.getElementById('run-algo');
    if (runButton) {
        runButton.addEventListener('click', function () {
            addLog("Algoritme gestart.");
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('viewer');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5); // zet camera diagonaal voor beter zicht
    camera.lookAt(0, 0, 0);

    // Licht
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Grid toevoegen
    const size = 10;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    // Assen toevoegen (optioneel)
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Kubus maken
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0x156289 });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(2, 2, 2);
    scene.add(cube);

    // Animatie loop
    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    animate();
});

