const canvas = document.querySelector('#myCanvas');
const gui = new dat.GUI();
let w = window.innerWidth,
    h = window.innerHeight;
let renderer, scene, camera, light;
let control;
let sphereObjects = [];
let donateBox;
let CamLookAt=new THREE.Vector3();
class AxisGridHelper {
    constructor(node, units = 10) {
        const axes = new THREE.AxesHelper();
        axes.material.depthTest = false;
        axes.renderOrder = 2;
        node.add(axes);

        const grid = new THREE.GridHelper(units, units);
        grid.material.depthTest = false;
        grid.renderOrder = 1;
        node.add(grid);
        this.grid = grid;
        this.axes = axes;
        this.visible = false;
    }
    get visible() {
        return this._visible;
    }
    set visible(v) {
        this._visible = v;
        this.grid.visible = v;
        this.axes.visible = v;
    }
}

loadGLTF();
init();
//reateSphere();
animate();

function init() {
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor( 0xC5C5C3 );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set( 1, -1, 0);
    //camera.up.set(0, 1, 0);
    camera.lookAt(CamLookAt);
    scene.add(camera);

    const color = 0xFFFFFF;
    const intensity = 3;
    light = new THREE.AmbientLight(color, intensity);
    //light.position.set(-1, 2, 4);
    scene.add(light);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
}
function loadGLTF(){
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('../js/saisen.glb', (glb) => {
        const root = glb.scene;
        scene.add(root);
        console.log(dumpObject(root).join('\n'));
        root.position.set(0,0,0);
        root.rotation.set(0,0,-.5);
        CamLookAt=root.position;
        const box= new THREE.Box3().setFromObject(root);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter=box.getCenter(new THREE.Vector3());
        // set the camera to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();
    });
    
    
}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
function createSphere() {
    const radius = 1,
        widthSegment = 64,
        heightSegment = 64;
    const sphereGeo = new THREE.SphereBufferGeometry(radius, widthSegment, heightSegment);

    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    sphereObjects.push(solarSystem);

    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
    const sunMesh = new THREE.Mesh(sphereGeo, sunMaterial);
    sunMesh.scale.set(5, 5, 5);
    solarSystem.add(sunMesh);
    sphereObjects.push(sunMesh);

    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    solarSystem.add(earthOrbit);
    sphereObjects.push(earthOrbit);

    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff, emissive: 0x112244 });
    const earthMesh = new THREE.Mesh(sphereGeo, earthMaterial);
    earthOrbit.add(earthMesh);
    sphereObjects.push(earthMesh);

    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit);

    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
    const moonMesh = new THREE.Mesh(sphereGeo, moonMaterial);
    moonMesh.scale.set(.5, .5, .5);
    moonOrbit.add(moonMesh);
    sphereObjects.push(moonMesh);

    makeAxisGrid(solarSystem, 'solarSystem', 25);
    makeAxisGrid(sunMesh, 'sunMesh');
    makeAxisGrid(earthOrbit, 'earthOrbit');
    makeAxisGrid(earthMesh, 'earthMesh');
    makeAxisGrid(moonMesh, 'moonMesh');
}

function resizeRenderer(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const w = canvas.clientWidth * pixelRatio;
    const h = canvas.clientHeight * pixelRatio;
    const needResize = canvas.width !== w || canvas.height !== h;
    if (needResize) {
        renderer.setSize(w, h, false);
    }
    return needResize;
}

function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
}



function animate(time) {
    time *= 0.001
    if (resizeRenderer(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    
    //donateBox.rotation.y=time;
    // sphereObjects.forEach((obj) => {
    //     obj.rotation.y = time;
    // });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

