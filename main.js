import WindowManager from './utils/WindowManager.js'

const t = THREE;
const windowManager = new WindowManager();
let initialized = false;

let camera, scene, renderer, world;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let triangles = [];
let sceneOffsetTarget = {x: 0, y: 0};
let sceneOffset = {x: 0, y: 0};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

function getTime() {
  return (new Date().getTime() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear")) {
  localStorage.clear();
}
else {
  // Circumvents that some browsers preload the content of some pages before you actually hit the url
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState != 'hidden' && !initialized) {
      init();
    }
  });

  window.onload = () => {
    if (document.visibilityState != 'hidden') {
      init();
    }
  };

  function init() {
    initialized = true;

    // Short timeout because window.offsetX reports wrong values before a short period 
    setTimeout(() => {
      setupScene();
      setupWindowManager();
      resize();
      updateWindowShape(false);
      render();
      window.addEventListener('resize', resize);
    }, 500)	
  }

  function setupScene() {
    camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);  
    camera.position.z = 2.5;
    scene = new t.Scene();
    scene.background = new t.Color(0.0);
    scene.add( camera );
    renderer = new t.WebGLRenderer({antialias: true, depthBuffer: true});
    renderer.setPixelRatio(pixR);
    world = new t.Object3D();
    scene.add(world);
    renderer.domElement.setAttribute("id", "scene");
    document.body.appendChild( renderer.domElement );
  }

  function setupWindowManager() {
    windowManager.setWinShapeChangeCallback(updateWindowShape);
    windowManager.setWinChangeCallback(windowsUpdated);
    windowManager.init({ type: "triangle" }); // Add your custom metadata to each windows instance
    windowsUpdated();
  }

  function windowsUpdated() {
    updateNumberOftriangles();
  }

  function fillWithPoints(geometry, count) {
    const dummyTarget = new t.Vector3(); // Prevents logging of warnings from ray.at() method
    const ray = new t.Ray()
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const points = [];
    const dir = new t.Vector3(1, 1, 1).normalize();
    let counter = 0;

    while(counter < count) {
      let v = new t.Vector3(
        t.Math.randFloat(bbox.min.x, bbox.max.x),
        t.Math.randFloat(bbox.min.y, bbox.max.y),
        t.Math.randFloat(bbox.min.z, bbox.max.z)
      );
      if (isInside(v)) {
        points.push(v);
        counter += 1;
      }
    }
    
    function isInside(v) {
      ray.set(v, dir);
      let counter = 0;
      let pos = geometry.attributes.position;
      let faces = pos.count / 3;
      let vA = new t.Vector3(), vB = new t.Vector3(), vC = new t.Vector3();
      for(let i = 0; i < faces; i += 1) {
        vA.fromBufferAttribute(pos, i * 3 + 0);
        vB.fromBufferAttribute(pos, i * 3 + 1);
        vC.fromBufferAttribute(pos, i * 3 + 2);
        if (ray.intersectTriangle(vA, vB, vC, false, dummyTarget)) {
          counter += 1;
        }
      }
      return counter % 2 == 1;
    }
    return new t.BufferGeometry().setFromPoints(points);
  }

  function updateNumberOftriangles() {
    let wins = windowManager.getWindows();
    // Removes all triangles
    triangles.forEach((c) => {
      world.remove(c);
    })
    triangles = [];

    // Add new triangles based on the current window setup
    for (let i = 0; i < wins.length; i += 1) {
      const color = new t.Color();
      color.setHSL(i * .1, 1.0, .5);
      const geometry = new t.BufferGeometry();
      const material = new t.MeshNormalMaterial({ color });
      const positions = [
        50, 0, 0,  // v1
        0, 50, 0,  // v2
        0, 50, 50  // v3
      ];
      geometry.setAttribute('position', new t.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
      const mesh = new t.Mesh(geometry, material);
      const pointsGeom = fillWithPoints(geometry, 10000);
      const pointsMat = new t.PointsMaterial({color, size: 0.25});
      const points = new t.Points(pointsGeom, pointsMat);
      mesh.add(points);
      world.add(mesh);
      triangles.push(mesh);
    }
  }

  function updateWindowShape(easing = true) {
    // Storing the actual offset in a proxy that we update against in the render function
    sceneOffsetTarget = {x: -window.screenX, y: -window.screenY};
    if (!easing) {
      sceneOffset = sceneOffsetTarget;
    }
  }

  function render() {
    let t = getTime();
    windowManager.update();
    // Calculate the new position based on the delta between current offset and new offset times a falloff value (to create the nice smoothing effect)
    let falloff = .05;
    sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
    sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);
    // Set the world position to the offset
    world.position.x = sceneOffset.x;
    world.position.y = sceneOffset.y;
    let wins = windowManager.getWindows();
    // Loop through all our triangles and update their positions based on current window positions
    for (let i = 0; i < triangles.length; i += 1) {
      let cube = triangles[i];
      let win = wins[i];
      let _t = t; // + i * .2;
      let posTarget = {x: win.shape.x + (win.shape.w * .5), y: win.shape.y + (win.shape.h * .5)}
      cube.position.x = cube.position.x + (posTarget.x - cube.position.x) * falloff;
      cube.position.y = cube.position.y + (posTarget.y - cube.position.y) * falloff;
      cube.rotation.x = _t * .5 * (i + 1);
      cube.rotation.y = _t * .3 * (i + 1);
    };

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // Resize the renderer to fit the window size
  function resize () {
    const width = window.innerWidth;
    const height = window.innerHeight
    camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
  }
}