//////////////////////////////////////////////////////////////////
// Initialize scene, camera, and renderer
//////////////////////////////////////////////////////////////////
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById("canvas-container").appendChild(renderer.domElement);

//////////////////////////////////////////////////////////////////
// Orbit Controls
//////////////////////////////////////////////////////////////////
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//////////////////////////////////////////////////////////////////
// Lighting Setup
//////////////////////////////////////////////////////////////////
const ambientLight = new THREE.AmbientLight(0xffffff, 4.5);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 5.0);
// directionalLight.position.set(0, 5, 5);
// directionalLight.castShadow = true;
// scene.add(directionalLight);

//////////////////////////////////////////////////////////////////
// Reflection Lights ("dots") with increased intensity
//////////////////////////////////////////////////////////////////
const reflectionParams = { intensity: 2.0, distance: 8 };
const reflectionLights = [];

// Top
reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(0, 5, 6);

// Bottom
reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(0, 1, 6);

// Left
reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(-3, 3, 6);

// Right
reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(3, 3, 6);

// Diagonals: Top-Left, Top-Right, Bottom-Left, Bottom-Right
reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(-2, 5, 6);

reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(2, 5, 6);

reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(-2, 1, 6);

reflectionLights.push(
    new THREE.PointLight(
        0xffffff,
        reflectionParams.intensity,
        reflectionParams.distance
    )
);
reflectionLights[reflectionLights.length - 1].position.set(2, 1, 6);

reflectionLights.forEach((light) => scene.add(light));

//////////////////////////////////////////////////////////////////
// Soft fill light
//////////////////////////////////////////////////////////////////
const fillLight = new THREE.PointLight(0xffffff, 2.5, 8);
fillLight.position.set(-3, 3, 3);
scene.add(fillLight);

//////////////////////////////////////////////////////////////////
// Create Wall with an image unaffected by lighting
//////////////////////////////////////////////////////////////////
const wallGeometry = new THREE.PlaneGeometry(10, 6);
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load(
    'http://127.0.0.1:8080/3d-rendering-minimalist-interior-with-copy-space.jpg'
);
const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(0, 0, -1);
scene.add(wall);

//////////////////////////////////////////////////////////////////
// Create 15mm Thick Painting using BoxGeometry (bright + glossy)
//////////////////////////////////////////////////////////////////
const paintingWidth = 4.5;
const paintingHeight = 3;
const paintingThickness = 0.015;
const paintingGeometry = new THREE.BoxGeometry(
    paintingWidth,
    paintingHeight,
    paintingThickness
);
const paintingMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.3,
    reflectivity: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1.0
});
const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
painting.position.set(1.2, 0.8, -1 + 0.2 + paintingThickness / 2);
scene.add(painting);

//////////////////////////////////////////////////////////////////
// Handle Image Upload and Maintain Aspect Ratio
//////////////////////////////////////////////////////////////////
document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
            const imageAspect = image.width / image.height;
            const canvasAspect = paintingWidth / paintingHeight;
            let scaleX, scaleY;

            if (imageAspect > canvasAspect) {
                scaleX = 1;
                scaleY = canvasAspect / imageAspect;
            } else {
                scaleX = imageAspect / canvasAspect;
                scaleY = 1;
            }

            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                e.target.result,
                function (texture) {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.encoding = THREE.sRGBEncoding;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.minFilter = THREE.LinearMipMapLinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    paintingMaterial.map = texture;
                    paintingMaterial.needsUpdate = true;
                    painting.scale.set(scaleX, scaleY, 1);
                    console.log("✅ Image uploaded successfully");
                },
                undefined,
                function (error) {
                    console.error("❌ Error loading texture:", error);
                }
            );
        };
    };
    reader.readAsDataURL(file);
});

//////////////////////////////////////////////////////////////////
// Handle Window Resize
//////////////////////////////////////////////////////////////////
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
});

//////////////////////////////////////////////////////////////////
// Animation Loop
//////////////////////////////////////////////////////////////////
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
