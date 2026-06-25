// State management for Prompt X 2.0 Photo Frame Creator
const state = {
  templateImg: null,
  uploadedImg: null,
  fileName: '',
  
  // Photo positioning & scaling
  zoom: 1.0,
  baseScale: 1.0,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  
  // Image adjustments
  brightness: 100,
  contrast: 100,
  saturation: 100,
  
  // Text
  teamName: 'Team name goes here',
  
  // Dragging state
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  offsetStart: { x: 0, y: 0 }
};

// Canvas coordinates and dimensions
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1200;
const FRAME_X = 120;
const FRAME_Y = 209;
const FRAME_WIDTH = 1360;
const FRAME_HEIGHT = 800;
const FRAME_CENTER_X = 800;
const FRAME_CENTER_Y = 609; // 209 + 800/2

// DOM Elements
let canvas, ctx;
let fileInput, uploadZone, fileInfoContainer, fileNameElement, btnRemovePhoto;
let inputTeamName, sliderZoom, sliderBrightness, sliderContrast, sliderSaturation;
let valZoom, valBrightness, valContrast, valSaturation;
let btnReset, btnDownload;
let captionBody1, captionBody2, captionBody3;
let btnCopy1, btnCopy2, btnCopy3;

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initCanvas();
  loadTemplate();
  setupEventListeners();
  updateCaptions();
});

function initDOMElements() {
  canvas = document.getElementById('frameCanvas');
  ctx = canvas.getContext('2d');
  
  fileInput = document.getElementById('fileInput');
  uploadZone = document.getElementById('uploadZone');
  fileInfoContainer = document.getElementById('fileInfoContainer');
  fileNameElement = document.getElementById('fileName');
  btnRemovePhoto = document.getElementById('btnRemovePhoto');
  
  inputTeamName = document.getElementById('inputTeamName');
  
  sliderZoom = document.getElementById('sliderZoom');
  sliderBrightness = document.getElementById('sliderBrightness');
  sliderContrast = document.getElementById('sliderContrast');
  sliderSaturation = document.getElementById('sliderSaturation');
  
  valZoom = document.getElementById('valZoom');
  valBrightness = document.getElementById('valBrightness');
  valContrast = document.getElementById('valContrast');
  valSaturation = document.getElementById('valSaturation');
  
  btnReset = document.getElementById('btnReset');
  btnDownload = document.getElementById('btnDownload');
  
  captionBody1 = document.getElementById('captionBody1');
  captionBody2 = document.getElementById('captionBody2');
  captionBody3 = document.getElementById('captionBody3');
  
  btnCopy1 = document.getElementById('btnCopy1');
  btnCopy2 = document.getElementById('btnCopy2');
  btnCopy3 = document.getElementById('btnCopy3');
}

function initCanvas() {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

// Load background Template.png using Base64 data URI to prevent canvas taints
function loadTemplate() {
  state.templateImg = new Image();
  state.templateImg.onload = () => {
    drawCanvas();
  };
  state.templateImg.onerror = () => {
    alert('Error loading template background data.');
  };
  state.templateImg.src = TEMPLATE_BASE64;
}

// Set up UI and drag event listeners
function setupEventListeners() {
  // File Upload
  uploadZone.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });
  fileInput.addEventListener('click', () => {
    fileInput.value = '';
  });
  fileInput.addEventListener('change', handleFileSelect);
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });
  
  btnRemovePhoto.addEventListener('click', removePhoto);
  
  // Team Name
  inputTeamName.addEventListener('input', (e) => {
    state.teamName = e.target.value || '';
    drawCanvas();
    updateCaptions();
  });
  
  // Sliders
  sliderZoom.addEventListener('input', (e) => {
    state.zoom = parseFloat(e.target.value);
    valZoom.textContent = state.zoom.toFixed(1) + 'x';
    drawCanvas();
  });
  

  sliderBrightness.addEventListener('input', (e) => {
    state.brightness = parseInt(e.target.value);
    valBrightness.textContent = state.brightness + '%';
    drawCanvas();
  });
  
  sliderContrast.addEventListener('input', (e) => {
    state.contrast = parseInt(e.target.value);
    valContrast.textContent = state.contrast + '%';
    drawCanvas();
  });
  
  sliderSaturation.addEventListener('input', (e) => {
    state.saturation = parseInt(e.target.value);
    valSaturation.textContent = state.saturation + '%';
    drawCanvas();
  });
  
  // Action Buttons
  btnReset.addEventListener('click', resetControls);
  btnDownload.addEventListener('click', downloadFrame);
  
  // Pointer Dragging events on canvas wrapper
  const canvasWrapper = document.querySelector('.canvas-wrapper');
  
  canvasWrapper.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', endDrag);
  
  canvasWrapper.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', drag, { passive: false });
  window.addEventListener('touchend', endDrag);
  
  // Drag & drop file upload on canvas wrapper
  canvasWrapper.addEventListener('dragover', (e) => {
    if (state.uploadedImg) return;
    e.preventDefault();
    canvasWrapper.classList.add('dragover');
  });
  canvasWrapper.addEventListener('dragleave', () => {
    canvasWrapper.classList.remove('dragover');
  });
  canvasWrapper.addEventListener('drop', (e) => {
    if (state.uploadedImg) return;
    e.preventDefault();
    canvasWrapper.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });
  
  // Copy Prompts
  btnCopy1.addEventListener('click', () => copyToClipboard(captionBody1.textContent, btnCopy1));
  btnCopy2.addEventListener('click', () => copyToClipboard(captionBody2.textContent, btnCopy2));
  btnCopy3.addEventListener('click', () => copyToClipboard(captionBody3.textContent, btnCopy3));
}

// File Processing
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    processFile(e.target.files[0]);
  }
}

function processFile(file) {
  if (!file.type.match('image.*')) {
    alert('Please upload an image file (PNG, JPG, JPEG).');
    return;
  }
  
  state.fileName = file.name;
  fileNameElement.textContent = file.name;
  uploadZone.style.display = 'none';
  fileInfoContainer.style.display = 'flex';
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.uploadedImg = img;
      
      // Calculate fit cover scale
      const coverScale = Math.max(FRAME_WIDTH / img.width, FRAME_HEIGHT / img.height);
      state.baseScale = coverScale;
      
      // Reset position state and photo adjustments
      state.zoom = 1.0;
      state.rotation = 0;
      state.offsetX = 0;
      state.offsetY = 0;
      state.brightness = 100;
      state.contrast = 100;
      state.saturation = 100;
      
      // Update UI elements
      sliderZoom.value = 1.0;
      valZoom.textContent = '1.0x';
      sliderBrightness.value = 100;
      valBrightness.textContent = '100%';
      sliderContrast.value = 100;
      valContrast.textContent = '100%';
      sliderSaturation.value = 100;
      valSaturation.textContent = '100%';
      
      sliderZoom.disabled = false;
      sliderBrightness.disabled = false;
      sliderContrast.disabled = false;
      sliderSaturation.disabled = false;
      btnDownload.disabled = false;
      
      // Add cursor state
      document.querySelector('.canvas-wrapper').classList.add('grab');
      
      drawCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  state.uploadedImg = null;
  state.fileName = '';
  fileInput.value = '';
  
  uploadZone.style.display = 'flex';
  fileInfoContainer.style.display = 'none';
  
  // Disable controls
  sliderZoom.disabled = true;
  sliderBrightness.disabled = true;
  sliderContrast.disabled = true;
  sliderSaturation.disabled = true;
  btnDownload.disabled = true;
  
  document.querySelector('.canvas-wrapper').classList.remove('grab', 'grabbing');
  
  drawCanvas();
}

// Drag & Drop Photo Position Logic
function startDrag(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Translate client coordinates to logical canvas coordinates
  const clickX = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
  const clickY = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
  
  // Check if click was inside the photo frame boundaries
  if (clickX >= FRAME_X && clickX <= FRAME_X + FRAME_WIDTH &&
      clickY >= FRAME_Y && clickY <= FRAME_Y + FRAME_HEIGHT) {
    if (!state.uploadedImg) {
      e.preventDefault();
      fileInput.click();
      return;
    }
  }

  if (!state.uploadedImg) return;
  e.preventDefault();
  
  state.isDragging = true;
  document.querySelector('.canvas-wrapper').classList.remove('grab');
  document.querySelector('.canvas-wrapper').classList.add('grabbing');
  
  state.dragStart = { x: clientX, y: clientY };
  state.offsetStart = { x: state.offsetX, y: state.offsetY };
}

function drag(e) {
  if (!state.isDragging) return;
  e.preventDefault();
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Display coordinate translation
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  
  const dx = (clientX - state.dragStart.x) * scaleX;
  const dy = (clientY - state.dragStart.y) * scaleY;
  
  state.offsetX = state.offsetStart.x + dx;
  state.offsetY = state.offsetStart.y + dy;
  
  drawCanvas();
}

function endDrag() {
  if (!state.isDragging) return;
  state.isDragging = false;
  document.querySelector('.canvas-wrapper').classList.remove('grabbing');
  document.querySelector('.canvas-wrapper').classList.add('grab');
}

// Clamp offset positions so the photo frame is always 100% filled
function clampOffsets() {
  if (!state.uploadedImg) return;
  const w = state.uploadedImg.width * state.baseScale * state.zoom;
  const h = state.uploadedImg.height * state.baseScale * state.zoom;
  
  const maxOffsetX = Math.max(0, (w - FRAME_WIDTH) / 2);
  const maxOffsetY = Math.max(0, (h - FRAME_HEIGHT) / 2);
  
  state.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, state.offsetX));
  state.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, state.offsetY));
}

// Core Drawing Engine
function drawCanvas() {
  if (!ctx) return;
  
  // Clamp offsets to keep the frame auto-filled
  clampOffsets();
  
  // 1. Clear Canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // 2. Draw Fixed Template Background
  if (state.templateImg) {
    ctx.drawImage(state.templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  
  // 3. Draw User's Team Photo
  if (state.uploadedImg) {
    const w = state.uploadedImg.width * state.baseScale * state.zoom;
    const h = state.uploadedImg.height * state.baseScale * state.zoom;
    
    // --- PHOTO DRAWING ---
    ctx.save();
    
    // Clip drawing region to photo frame box
    ctx.beginPath();
    ctx.rect(FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT);
    ctx.clip();
    
    // Apply image adjustments (filters)
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
    
    // Translate, rotate, and scale context
    ctx.translate(FRAME_CENTER_X + state.offsetX, FRAME_CENTER_Y + state.offsetY);
    ctx.rotate((state.rotation * Math.PI) / 180);
    
    ctx.drawImage(state.uploadedImg, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else {
    // If no photo, draw a friendly guidance overlay in the preview (semi-transparent)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 90, 31, 0.05)';
    ctx.fillRect(FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Please upload team photo', FRAME_CENTER_X, FRAME_CENTER_Y);
    ctx.restore();
  }
  
  // 4. Draw 8px Frame Border (color #FFB148 - RGB: 255, 177, 72)
  ctx.fillStyle = '#ffb148';
  ctx.fillRect(FRAME_X, FRAME_Y, 8, FRAME_HEIGHT); // Left
  ctx.fillRect(FRAME_X + FRAME_WIDTH - 8, FRAME_Y, 8, FRAME_HEIGHT); // Right
  ctx.fillRect(FRAME_X, FRAME_Y, FRAME_WIDTH, 8); // Top
  ctx.fillRect(FRAME_X, FRAME_Y + FRAME_HEIGHT - 8, FRAME_WIDTH, 8); // Bottom
  
  // 5. Draw Team Name Text (White, Italic, Bold)
  if (state.teamName) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px';
    
    const maxTextWidth = 1140; // 1480 (right bound) - 340 (left bound)
    let fontSize = 52;
    
    // Set font style
    ctx.font = `italic 700 ${fontSize}px Inter, Poppins, sans-serif`;
    
    // Measure width and scale down if it exceeds the boundary
    let measuredWidth = ctx.measureText(state.teamName).width;
    if (measuredWidth > maxTextWidth) {
      const scaleFactor = maxTextWidth / measuredWidth;
      fontSize = Math.max(24, Math.floor(52 * scaleFactor));
      ctx.font = `italic 700 ${fontSize}px Inter, Poppins, sans-serif`;
    }
    
    // Draw the text (aligned right after 'TEAM :' colon at x=340, y=1101.5)
    ctx.fillText(state.teamName, 340, 1101.5);
    ctx.restore();
  }
}

// Reset Controls
function resetControls() {
  state.zoom = 1.0;
  state.rotation = 0;
  state.offsetX = 0;
  state.offsetY = 0;
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  
  // Update sliders
  sliderZoom.value = 1.0;
  sliderBrightness.value = 100;
  sliderContrast.value = 100;
  sliderSaturation.value = 100;
  
  // Update labels
  valZoom.textContent = '1.0x';
  valBrightness.textContent = '100%';
  valContrast.textContent = '100%';
  valSaturation.textContent = '100%';
  
  drawCanvas();
}

// Download final composition as PNG
function downloadFrame() {
  if (!state.uploadedImg) {
    alert('Please upload a photo before downloading.');
    return;
  }
  
  // Redraw canvas to make sure everything is crisp
  drawCanvas();
  
  // Convert canvas to high-quality PNG without compression artifacts
  try {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    // Format filename (sanitize illegal characters to prevent OS download issues)
    const formattedTeamName = state.teamName.trim().replace(/[\\/:*?\"<>|]/g, '') || 'team';
    link.download = `${formattedTeamName}.png`;
    
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
    alert('Could not export image. Canvas might be tainted due to local file issues. Try running a simple server.');
  }
}

// Dynamic LinkedIn Caption Prompts Generator
function updateCaptions() {
  const team = state.teamName.trim() || '[Your Team Name]';
  
  // Prompt 1: Professional
  captionBody1.textContent = `Write a professional LinkedIn post about participating in the Commerce Pundit Prompt X 2.0 Hackathon. Focus on innovation, problem-solving, and how generative AI is reshaping product development. Mention our team '${team}' and how we built a solution that bridges the gap from prompt to product. Include the hashtags: #CPPromptX #VibeCoding #PromptsInProductsOut #AIHackathon #PromptEngineering #BuildWithAI #AIFirst #AIInnovation #CommercePundit #LifeatCP`;
  
  // Prompt 2: Energetic
  captionBody2.textContent = `Create an energetic, high-vibes LinkedIn caption celebrating our experience at the Prompt X 2.0 Hackathon! Focus on the adrenaline, building under pressure, late-night coding, and the excitement of vibe coding. Mention our team '${team}' and our journey of building products from simple prompts. Include these hashtags: #CPPromptX #VibeCoding #PromptsInProductsOut #AIHackathon #PromptEngineering #BuildWithAI #AIFirst #AIInnovation #CommercePundit #LifeatCP`;
  
  // Prompt 3: Team-focused
  captionBody3.textContent = `Write a team-focused LinkedIn post highlighting the collaboration, synergy, and collective effort of team '${team}' at the Commerce Pundit Prompt X 2.0 Hackathon. Emphasize team bonding, learning from each other, and pushing the boundaries of AI together. Include these hashtags: #CPPromptX #VibeCoding #PromptsInProductsOut #AIHackathon #PromptEngineering #BuildWithAI #AIFirst #AIInnovation #CommercePundit #LifeatCP`;
}

// Copy prompt text to clipboard
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnElement.innerHTML;
    btnElement.classList.add('copied');
    btnElement.innerHTML = `✓ Copied!`;
    
    setTimeout(() => {
      btnElement.classList.remove('copied');
      btnElement.innerHTML = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Could not copy text: ', err);
    alert('Failed to copy. Please select the text manually.');
  });
}

// Initial update of captions happens inside DOMContentLoaded listener
