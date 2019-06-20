const canvas = document.querySelector('#myCanvas');
let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    //camera.rotation.y = Math.PI / 4;
    camera.position.set(6,4.7, 0);

    controls=new THREE.OrbitControls(camera);
    controls.addEventListener('change',renderer);

    // hlight = new THREE.AmbientLight(0x404040, 10);
    // scene.add(hlight);

    // directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    // directionalLight.position.set(0, 1, 0);
    // directionalLight.castShadow = true;
    // scene.add(directionalLight);

    light2 = new THREE.PointLight(0xc4c4c4, 5);
    light2.position.set(0, 300, 500);
    scene.add(light2);

    light3 = new THREE.PointLight(0xc4c4c4, 5);
    light3.position.set(500, 100, 0);
    scene.add(light3);

    light4 = new THREE.PointLight(0xc4c4c4, 1);
    light4.position.set(0, 100, -500);
    scene.add(light4);

    light5 = new THREE.PointLight(0xc4c4c4, 1);
    light5.position.set(-500, 300, 0);
    scene.add(light5);


    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    let loader = new THREE.GLTFLoader();
    loader.load('js/saisen_v0.3.gltf', function (gltf) {
        thing = gltf.scene;
        //thing.scale.set(.5, .5, .5);
        thing.position.y=-1;
        scene.add(gltf.scene);
        animate();
    });
    function animate() {
        thing.rotation.y+=.005;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
}
init();