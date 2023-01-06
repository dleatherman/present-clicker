import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import * as dat from 'dat.gui'

// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Raycast
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Objects
// const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);

// // Materials

// const material = new THREE.MeshBasicMaterial()
// material.color = new THREE.Color(0xff0000)

// // Mesh
// const sphere = new THREE.Mesh(geometry, material)
// scene.add(sphere)

// Lights

// const pointLight = new THREE.PointLight(0xffffff, .5)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)

const ambientLight = new THREE.HemisphereLight(0xffffff, 0x313131, 1);
ambientLight.name = 'World Light'
scene.add(ambientLight)

const keyLight = new THREE.DirectionalLight(0xffffff, .8)
keyLight.name = 'Key Light'
keyLight.castShadow = true
keyLight.shadow.camera.far = 15
keyLight.shadow.bias = -0.00001
keyLight.shadow.mapSize.width = 1024 * 6
keyLight.shadow.mapSize.height = 1024 * 6
keyLight.position.set(6, 9, 12)
keyLight.target.position.set(0, 0, 0)
scene.add(keyLight)

// Models
const loader = new GLTFLoader();
let gift = new THREE.Object3D()

loader.load('present.gltf', function (gltf) {

  gltf.scene.traverse((child) => {
    child.receiveShadow = true
    child.castShadow = true
  })

  const children = [...gltf.scene.children]
  children.forEach((child) => {
    child.scale.set(sizes.scale, sizes.scale, sizes.scale);
    gift.add(child)
  })
  scene.add(gift)

}, undefined, function (error) {

  console.error(error);

});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  scale: .75
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 2
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3.5;


// Game variables
let score = 0;
let clicks = 0;

// Handle clicks on the gift
function onDocumentMouseDown(event) {
  event.preventDefault();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([gift]);
  if (intersects.length > 0) {
    score++;
    clicks++;
    updateScore(score)
  } else {
    clicks++;
  }
}
document.addEventListener("mousedown", onDocumentMouseDown, false);

const updateScore = (score) => {
  if (!score) return
  document.getElementById("score").textContent = score;
}

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

  const elapsedTime = clock.getElapsedTime()

  // Update objects
  gift.rotation.y = .5 * elapsedTime
  // Update Orbital Controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  raycaster.setFromCamera(pointer, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()