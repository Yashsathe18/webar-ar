let camera, scene, renderer;
let reticle;
let controller;
let model = null;
const statusText = document.getElementById("status");

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // WebXR AR Button
  document.body.appendChild(
    THREE.ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    })
  );

  // Lighting
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 5);
  scene.add(directionalLight);

  // Reticle (surface indicator)
  const ringGeometry = new THREE.RingGeometry(0.05, 0.06, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  reticle = new THREE.Mesh(ringGeometry, ringMaterial);
  reticle.rotation.x = -Math.PI / 2;
  reticle.visible = false;
  scene.add(reticle);

  // Controller (tap to place)
  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  // Load 3D model
  loadModel();

  renderer.setAnimationLoop(render);

  window.addEventListener("resize", onWindowResize);
}

function loadModel() {
  statusText.innerText = "Loading 3D Model...";

  const loader = new THREE.GLTFLoader();

  loader.load(
    "assets/model.glb",
    function (gltf) {
      model = gltf.scene;

      // Normalize model size for AR
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.5 / maxDim;
      model.scale.setScalar(scale);

      model.visible = false;
      scene.add(model);

      statusText.innerText = "Model Loaded. Tap to place.";
    },
    undefined,
    function (error) {
      console.error("Model load error:", error);
      statusText.innerText = "Error loading model.";
    }
  );
}

function onSelect() {
  if (reticle.visible && model) {
    model.position.setFromMatrixPosition(reticle.matrix);
    model.visible = true;
  }
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (session) {
      const viewerPose = frame.getViewerPose(referenceSpace);

      if (viewerPose) {
        const hitTestSource = session.requestHitTestSource
          ? session.requestHitTestSource({
              space: viewerPose.views[0].transform
            })
          : null;

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(referenceSpace);
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
            statusText.innerText = "Surface detected. Tap to place.";
          }
        }
      }
    }
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
    }
