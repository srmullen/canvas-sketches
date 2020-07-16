const dat = require('dat.gui');

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = (opts) => {
  const { context, viewportWidth, viewportHeight } = opts;
  // Create a renderer

  const gui = new dat.GUI();

  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  const frustumSize = 100;
  const width = viewportWidth;
  const height = viewportHeight;
  const aspect = viewportWidth / viewportHeight;

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  // const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.01, 1000);
  camera.position.set(0, 0, -50);
  camera.lookAt(new THREE.Vector3());
  window.camera = camera;

  const positionFolder = gui.addFolder('position');
  positionFolder.add(camera.position, 'x', undefined, undefined, 0.1);
  positionFolder.add(camera.position, 'y', undefined, undefined, 0.1);
  positionFolder.add(camera.position, 'z', undefined, undefined, 0.1);

  const rotationFolder = gui.addFolder('rotation');
  rotationFolder.add(camera.rotation, 'x', undefined, undefined, 0.1);
  rotationFolder.add(camera.rotation, 'y', undefined, undefined, 0.1);
  rotationFolder.add(camera.rotation, 'z', undefined, undefined, 0.1);

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    wireframe: true
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // mesh.rotation.x = Math.PI / 3;
  // mesh.rotation.z = Math.PI / 4;

  const mesh2 = new THREE.Mesh(geometry, material);
  scene.add(mesh2);

  // mesh2.rotation.x = Math.PI / 3;
  // mesh2.rotation.z = Math.PI / 4;

  const pos = Math.sqrt(200);
  // mesh2.position.x = pos / 2;
  // mesh2.position.y = pos / 2;
  // mesh2.position.y = -4;

  mesh2.position.y = 10;
  
  console.log(mesh2);
  

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      controls.update();
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
