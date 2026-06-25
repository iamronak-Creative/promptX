# Prompt X 2.0 - Photo Frame Creator

A lightweight, responsive, client-side web application designed to help **Prompt X 2.0 Hackathon** participants create, customize, and export their team photo frames in less than a minute.

---

## Features

- **Responsive Theme**: Modern dark theme with vibrant orange accents matching the Commerce Pundit branding.
- **Dynamic Preview**: real-time rendering on a standard HTML5 Canvas. The preview matches the final exported image exactly.
- **Interactive Controls**:
  - Drag and drop to reposition the photo directly in the live preview.
  - Slide to adjust Zoom scale, rotation, brightness, contrast, and saturation.
  - Text input to edit the team name, featuring an **auto-fit algorithm** that scales down long names to prevent layout breaking.
  - **4px gold-orange border** automatically overlayed on top of the image boundary.
- **High-Quality Export**: Single-click export as an uncompressed, high-quality PNG preserving the original **1600x1200 px** template resolution.
- **LinkedIn Caption Prompts**: 3 customizable prompts (Professional, energetic Hackathon Vibe, and Team Spirit) that auto-insert the user's team name. Features one-click copy buttons with checkmark visual feedback.
- **Zero Dependencies**: Built entirely using standard HTML5, CSS3, and modern client-side JavaScript. No `npm install` or backend server required.

---

## How to Run Locally

### Method 1: Direct File Opening (Fastest)
Simply double-click the [index.html](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/index.html) file or drag it into any modern web browser (Chrome, Safari, Firefox, Edge).

### Method 2: Simple Local HTTP Server (Recommended)
Running a local server prevents any browser security exceptions (CORS) when loading local files:

**Using Python:**
```bash
python3 -m http.server 8000
```
Then, open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

**Using Node.js:**
```bash
npx http-server -p 8000
```
Then, open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

---

## File Structure

- [index.html](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/index.html): Page markup and structure.
- [style.css](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/style.css): Custom design system, layout grid, and slider formatting.
- [app.js](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/app.js): Canvas calculations, dragging translations, and dynamic caption updates.
- [Template.png](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/Template.png): Fixed high-resolution background asset.
- [Sample.png](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/Sample.png): Visual design reference.
- [PromptX.svg](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/PromptX.svg) & [CP_FullLogo-Black.svg](file:///Users/cp/Ronak/CP/Prompt%20X/2.0/CP_FullLogo-Black.svg): SVG branding assets.
