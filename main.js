import * as THREE from "three";

/** Background image URL */
const BACKGROUND_IMAGE_URL = "background.png";

/** Plane width */
const PLANE_WIDTH = 256;
/** Number of slides (will be updated based on data) */
let numSlides = 0;
/** Plane height */
const PLANE_HEIGHT = 256;
/** Current slide index */
let currentSlideIndex = 0;
/** Spacing between planes on the X-axis */
const SLIDE_SPACING_X = 80;

/**
 * Array to hold the slide objects
 * @type {SlideCard[]}
 */
const slides = [];
/**
 * Array to hold album data
 * @type {object[]}
 */
let albumData = [];

// Create 3D scene
const scene = new THREE.Scene();

// Create Camera
const camera = new THREE.PerspectiveCamera(30);
scene.add(camera);

// Create Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);

// Add Renderer element to the DOM
document.body.appendChild(renderer.domElement);

// Input element control (Slider)
const elementInput = document.querySelector("input#rangeSlider");
elementInput.addEventListener("input", onSliderChange); // Use the renamed function
// elementInput.focus(); // Focusing is fine, but commented out as it wasn't suitable for ICS MEDIA iframe embedding

// Mouse wheel support
window.addEventListener(
  "wheel",
  (event) => {
    // Adjust slider value based on wheel delta
    // The multiplier (0.0005) controls sensitivity, adjust as needed
    elementInput.valueAsNumber += event.deltaY * 0.0005;
    onSliderChange(); // Trigger slide movement
    event.preventDefault(); // Prevent default page scroll
  },
  { passive: false }
);

// --- Drag/Swipe Functionality ---
let isDragging = false;
let startX = 0;
let currentScrollLeft = 0; // Using this to simulate scroll position based on drag

// Add event listeners for mouse dragging
renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp); // Listen on window to catch mouseup outside the canvas

// Add event listeners for touch dragging
renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true }); // Use passive: true where possible
renderer.domElement.addEventListener('touchmove', onPointerMove, { passive: false }); // Need passive: false to preventDefault scroll
renderer.domElement.addEventListener('touchend', onPointerUp);
renderer.domElement.addEventListener('touchcancel', onPointerUp); // Handle cancellations

function onPointerDown(event) {
  isDragging = true;
  // Use clientX for mouse, touches[0].clientX for touch
  startX = event.clientX ?? event.touches[0].clientX;
  // Store the slider's current value at the start of the drag
  currentScrollLeft = elementInput.valueAsNumber;
  renderer.domElement.style.cursor = 'grabbing'; // Change cursor
  // Prevent text selection during drag
  event.preventDefault();
}

function onPointerMove(event) {
  if (!isDragging) return;

  // Prevent default scrolling behavior during horizontal drag
  event.preventDefault();

  const currentX = event.clientX ?? event.touches[0].clientX;
  const deltaX = currentX - startX;

  // Adjust sensitivity: How much drag affects the slider value.
  // Smaller number = more sensitive drag.
  const sensitivity = window.innerWidth * 2; // Adjust this factor as needed
  const scrollAmount = deltaX / sensitivity;

  // Update slider value based on drag, clamping between 0 and 1
  elementInput.valueAsNumber = Math.max(0, Math.min(1, currentScrollLeft - scrollAmount));

  // Trigger the slider change handler to update the cover flow
  onSliderChange();
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;
  renderer.domElement.style.cursor = 'grab'; // Restore cursor
}

// Initial cursor style
renderer.domElement.style.cursor = 'grab';


/**
 * Cover Flow Example (Three.js version)
 * @author IKEDA Yasunobu (Updated by Cline & Addy Osmani)
 */
async function init() {
  // Light
  const pointLight = new THREE.PointLight(0xffffff, 4, 1000);
  pointLight.position.set(0, 0, 500);
  scene.add(pointLight);

  // Load album data
  try {
    const response = await fetch('./albums.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    albumData = await response.json();
    numSlides = albumData.length; // Update slide count based on data
  } catch (error) {
    console.error("Failed to load album data:", error);
    // Optionally, display an error message to the user
    return; // Stop initialization if data loading fails
  }

  // Create Slides
  for (let i = 0; i < numSlides; i++) {
    // Create a slide card using album data
    const slide = new SlideCard(albumData[i]);

    // Add to the 3D scene
    scene.add(slide);

    // Store reference in the array
    slides[i] = slide;
  }

  // Camera position
  camera.position.z = 900;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Create Background
  const backgroundTexture = new THREE.TextureLoader().load(BACKGROUND_IMAGE_URL);
  const backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 1000),
    new THREE.MeshBasicMaterial({ map: backgroundTexture })
  );
  backgroundMesh.position.z = -500;
  scene.add(backgroundMesh);

  // Initial slide display (center)
  moveSlide(Math.floor(numSlides / 2)); // Use Math.floor for potentially odd numbers

  // Resize handling
  window.addEventListener("resize", onResize);
  onResize(); // Fit to window size initially

  // Start rendering loop
  tick();
}

/**
 * Event handler for slider input change.
 */
function onSliderChange() {
  const sliderValue = elementInput.valueAsNumber;
  // Calculate the target slide index from the slider value
  const nextIndex = Math.round(sliderValue * (numSlides - 1));
  // Move to the calculated slide
  moveSlide(nextIndex);
}

/**
 * Moves the slides to the target index.
 * @param {number} targetIndex - The index of the slide to center.
 */
function moveSlide(targetIndex) {
  // If the target index is the same as the current one, do nothing.
  if (currentSlideIndex === targetIndex) {
    return;
  }

  for (let i = 0; i < numSlides; i++) {
    // Initialize target position and rotation values
    let targetX = SLIDE_SPACING_X * (i - targetIndex); // Calculate base X position
    let targetZ = 0;
    let targetRotationY = 0;

    // Slides to the left of the target slide
    if (i < targetIndex) {
      targetX -= PLANE_WIDTH * 0.6; // Adjust X for spacing
      targetZ = PLANE_WIDTH; // Move back in Z
      targetRotationY = +45 * (Math.PI / 180); // Rotate
    }
    // Slides to the right of the target slide
    else if (i > targetIndex) {
      targetX += PLANE_WIDTH * 0.6; // Adjust X for spacing
      targetZ = PLANE_WIDTH; // Move back in Z
      targetRotationY = -45 * (Math.PI / 180); // Rotate
    }
    // The target slide itself
    else {
      targetX = 0; // Center X
      targetZ = 0; // Center Z
      targetRotationY = 0; // No rotation
    }

    // Get the reference to the current slide card
    const slide = slides[i];

    // Animate position using GSAP
    gsap.to(slide.position, {
      x: targetX,
      z: -1 * targetZ, // Invert Z for Three.js coordinate system
      duration: 1.8, // Animation duration in seconds
      ease: "expo.out", // Easing function
      overwrite: true, // Allow overwriting previous animations
    });

    // Animate rotation using GSAP
    gsap.to(slide.rotation, {
      y: targetRotationY,
      duration: 0.9, // Animation duration in seconds
      ease: "expo.out", // Easing function
      overwrite: true, // Allow overwriting previous animations
    });
  }

  currentSlideIndex = targetIndex; // Update the current index
}

/** Layout handling (also handles resize) */
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

/** Frame update loop (Enter frame event) */
function tick() {
  // Render the scene
  renderer.render(scene, camera);
  // Request the next frame
  requestAnimationFrame(tick);
}

/**
 * Represents a single card/slide in the cover flow.
 */
class SlideCard extends THREE.Object3D {
  /**
   * @param {object} album - The album data object from albums.json.
   */
  constructor(album) {
    super();

    // Use CORS proxy if images are on different domains and cause issues
    // Example: const imageUrl = `https://cors-anywhere.herokuapp.com/${album.image_url}`;
    const imageUrl = album.image_url; // Assuming direct loading works

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
        imageUrl,
        undefined, // onLoad callback (optional)
        undefined, // onProgress callback (optional)
        (error) => { // onError callback
            console.error(`Failed to load texture for ${album.title}:`, error);
            // Optionally load a placeholder texture
            // const placeholderTexture = textureLoader.load('./imgs/placeholder.jpg');
            // topMaterial.map = placeholderTexture;
            // reflectionMaterial.map = placeholderTexture;
            // topMaterial.needsUpdate = true;
            // reflectionMaterial.needsUpdate = true;
        }
    );

    // Top plane (main image)
    const topMaterial = new THREE.MeshLambertMaterial({
      map: texture,
    });

    const topPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT),
      topMaterial
    );
    this.add(topPlane);

    // Reflection plane
    const reflectionMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide, // Render the back side for reflection
      opacity: 0.2,
    });

    const reflectionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT),
      reflectionMaterial
    );
    // Flip the reflection vertically and position it below the main plane
    reflectionPlane.rotation.x = Math.PI; // Rotate 180 degrees around X-axis
    reflectionPlane.position.y = -PLANE_HEIGHT - 1; // Position below with a small gap
    this.add(reflectionPlane);
  }
}

// Execute the initialization code
init();
