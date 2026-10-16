# Lenticular Photo Card Maker — Product Requirements Document

## Overview

A browser-based tool that lets users upload up to 3 images and generates an interactive lenticular photo card. The card responds to cursor movement within a demarcated preview zone, simulating the tilt-shift effect of a physical lenticular print — revealing different images as the viewing angle changes.

Built with Next.js, Three.js (WebGL), shadcn/ui, and Tailwind CSS.

---

## Core Concept

The user uploads 2–3 photos. The app interlaces them into a single lenticular texture mapped onto a 3D card mesh with micro-ridge geometry (simulating physical lenticular lens grooves). When the user moves their cursor across the preview zone, the card tilts in response, causing the WebGL material's viewing angle to shift — revealing different images through the interlaced strips. This replicates the optical behavior of a real lenticular print.

---

## Architecture

### Rendering Pipeline

```
Images (2-3) → Canvas Interlacing → Three.js Texture
                                          ↓
Cursor Position → Tilt Angles → Camera/Light Update → WebGL Render
                                          ↓
                              BoxGeometry + Zigzag Surface
                              + MeshPhysicalMaterial (metalness, iridescence)
```

### Technical Approach (derived from ArtBIT/lenticular-sticker)

1. **Geometry**: `THREE.BoxGeometry` with high X-segment count (granularity ~200). Front face vertices displaced into a zigzag pattern simulating lens ridges. Rounded corners via arc-based vertex displacement.

2. **Interlacing**: Images composited side-by-side on a hidden canvas (for 2 images) or in thirds (for 3 images). UV coordinates on alternating geometry segments map to different image regions — the interlacing that makes the lenticular effect work.

3. **Material**: `MeshPhysicalMaterial` with:
   - `roughness: 0.8` — matte-ish surface
   - `metalness: 1.2` — reflective sheen
   - `iridescence: 0.3` — subtle rainbow shimmer (characteristic of real lenticular prints)

4. **Lighting**: 3-point directional light setup. Key light from front (intensity 4), two fill lights from left/right (intensity 1 each).

5. **Interaction**: Cursor position within the preview zone maps to camera orbit angles (azimuth/polar). Damped interpolation for smooth transitions. Touch support via touch-move events.

---

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Lenticular Card Maker"                                │
├────────────────────────────────────┬─────────────────────────────┤
│                                    │                             │
│                                    │   CONTROLS PANEL            │
│                                    │                             │
│     PREVIEW ZONE                   │   ┌─────────────────────┐  │
│     (demarcated area,              │   │ Image Slots (1-3)   │  │
│      cursor-reactive,              │   │ Upload / Replace     │  │
│      WebGL canvas)                 │   │ Reorder via drag     │  │
│                                    │   └─────────────────────┘  │
│     ┌────────────────────────┐     │                             │
│     │                        │     │   Card Settings             │
│     │    Lenticular Card     │     │   ─────────────────────     │
│     │    (3D rendered)       │     │   Aspect Ratio              │
│     │                        │     │   Corner Radius             │
│     │                        │     │   Card Depth                │
│     └────────────────────────┘     │   Granularity (lens density)│
│                                    │                             │
│     Cursor tilt indicator          │   Effect Settings            │
│     (subtle crosshair showing     │   ─────────────────────     │
│      current tilt angle)           │   Roughness                 │
│                                    │   Metalness                 │
│                                    │   Iridescence               │
│                                    │   Tilt Sensitivity          │
│                                    │   Tilt Range                │
│                                    │                             │
│                                    │   Export                    │
│                                    │   ─────────────────────     │
│                                    │   [Download as Image]       │
│                                    │   [Download as GIF]         │
│                                    │   [Copy Embed Code]         │
│                                    │                             │
├────────────────────────────────────┴─────────────────────────────┤
│  Footer (minimal)                                                │
└──────────────────────────────────────────────────────────────────┘
```

**Preview zone**: ~60% of viewport width. Visible border/outline to demarcate the interactive area. Cursor entering this zone activates tilt tracking. Cursor leaving resets card to neutral position (animated spring-back).

**Controls panel**: ~40% width. Scrollable. Grouped into collapsible sections.

---

## Feature Specification

### 1. Image Upload (Priority: P0)

| Detail | Spec |
|--------|------|
| Slots | 2–3 image slots. Minimum 2 required to generate the effect. |
| Upload method | Click-to-upload or drag-and-drop per slot. Accept `.jpg`, `.png`, `.webp`. |
| Preview | Thumbnail shown in each slot after upload. |
| Reorder | Drag-to-reorder slots. Order determines interlacing sequence (left-to-right maps to tilt-left-to-right). |
| Replace/Remove | Each slot has replace and remove buttons. Removing drops to fewer images; below 2 disables preview. |
| Crop/Fit | Auto-fit images to card aspect ratio (cover mode). Optional: manual crop offset via drag within thumbnail. |
| Max size | Client-side resize to max 2048px on longest edge before processing (performance). |

### 2. Interactive Preview (Priority: P0)

| Detail | Spec |
|--------|------|
| Trigger zone | Demarcated rectangular area. Visible border with subtle label "Move cursor to interact". |
| Tilt mapping | Cursor X position → azimuth rotation. Cursor Y position → polar rotation. |
| Tilt range | Default ±15° azimuth, ±8° polar. Configurable via sliders. |
| Damping | Smooth interpolation (lerp factor ~0.08) so the card doesn't snap. |
| Reset | Card animates back to center when cursor leaves the zone. Spring easing. |
| Touch | Touch-move within zone maps the same way. Touch-end triggers reset. |
| Gyroscope (stretch) | On mobile, device orientation can drive tilt instead of touch. |

### 3. Card Settings (Priority: P0)

| Control | Type | Default | Range | Purpose |
|---------|------|---------|-------|---------|
| Aspect Ratio | Dropdown + custom | 3:2 | Presets: 1:1, 4:3, 3:2, 16:9, Custom | Card proportions |
| Corner Radius | Slider | 0.1 | 0 – 0.3 | Rounded corners on the 3D mesh |
| Card Depth | Slider | 0.05 | 0.01 – 0.15 | Thickness of the card in 3D |
| Granularity | Slider | 200 | 50 – 500 | Number of lens segments. Higher = finer interlacing, heavier render. |

### 4. Effect Settings (Priority: P1)

| Control | Type | Default | Range | Purpose |
|---------|------|---------|-------|---------|
| Roughness | Slider | 0.8 | 0 – 1 | Surface matte-ness |
| Metalness | Slider | 1.2 | 0 – 2 | Reflective quality |
| Iridescence | Slider | 0.3 | 0 – 1 | Rainbow shimmer intensity |
| Tilt Sensitivity | Slider | 1.0 | 0.2 – 3.0 | How much cursor movement maps to tilt |
| Tilt Range (Azimuth) | Slider | 15° | 5° – 45° | Max horizontal rotation |
| Tilt Range (Polar) | Slider | 8° | 2° – 25° | Max vertical rotation |
| Background Color | Color picker | `#0B0D0E` | Any | Scene background behind the card |

### 5. Export (Priority: P1)

| Export type | Details |
|-------------|---------|
| **Static Image** | Renders current view as PNG at 2x resolution. Downloads immediately. |
| **Animated GIF** | Programmatically sweeps the tilt from left-to-right over ~2 seconds, captures frames, encodes GIF client-side (using gif.js or similar). User can set duration and frame count. |
| **Embed Code** | Generates a self-contained HTML snippet (inline Three.js + interlaced canvas) that can be embedded. Copies to clipboard. |

### 6. Presets (Priority: P2)

Quick-apply preset combinations:

| Preset | Description |
|--------|-------------|
| **Classic** | Standard lenticular look. Default values. |
| **Holographic** | High iridescence (0.8), high metalness (1.8), low roughness (0.3). |
| **Matte Print** | No iridescence, low metalness (0.4), high roughness (1.0). |
| **Aggressive** | High granularity (400), wide tilt range, high sensitivity. Sharp transitions between images. |

---

## UI Components (shadcn/ui)

| Component | Usage |
|-----------|-------|
| `Card` | Control panel sections |
| `Button` | Upload, export actions |
| `Slider` | All numeric range controls |
| `Select` | Aspect ratio dropdown |
| `Tabs` | Group control sections (Images / Card / Effect / Export) |
| `Tooltip` | Explain what each control does on hover |
| `Dialog` | Crop/adjust modal if implemented |
| `DropdownMenu` | Export format options |
| `Badge` | Image slot numbering |
| `Separator` | Visual dividers between control groups |
| `Switch` | Toggle auto-rotate, gyroscope, etc. |
| `Label` | Form labels for all controls |
| `Input` | Custom aspect ratio numeric input |
| `ColorPicker` | Background color (custom component or radix-based) |

---

## State Management

Single Zustand store (or React context — lean towards Zustand for simplicity):

```typescript
interface LenticularStore {
  // Images
  images: (File | null)[];          // Up to 3 slots
  imageOrder: number[];             // Reorder mapping

  // Card settings
  aspectRatio: string;              // "3:2", "1:1", etc.
  customAspectRatio: [number, number];
  cornerRadius: number;
  cardDepth: number;
  granularity: number;

  // Effect settings
  roughness: number;
  metalness: number;
  iridescence: number;
  tiltSensitivity: number;
  tiltRangeAzimuth: number;
  tiltRangePolar: number;
  backgroundColor: string;

  // UI state
  activePreset: string | null;
  isExporting: boolean;
}
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx                    # Main layout: preview + controls
├── components/
│   ├── preview/
│   │   ├── preview-zone.tsx        # Demarcated cursor-tracking area
│   │   ├── lenticular-canvas.tsx   # Three.js WebGL canvas
│   │   ├── tilt-indicator.tsx      # Visual crosshair overlay
│   │   └── use-tilt.ts            # Hook: cursor → tilt angles
│   ├── controls/
│   │   ├── control-panel.tsx       # Tabbed sidebar container
│   │   ├── image-upload.tsx        # Upload slots with drag-reorder
│   │   ├── card-settings.tsx       # Aspect, radius, depth, granularity
│   │   ├── effect-settings.tsx     # Material + tilt controls
│   │   ├── export-controls.tsx     # Download / embed actions
│   │   └── preset-selector.tsx     # Quick-apply presets
│   └── ui/                         # shadcn components
├── lib/
│   ├── lenticular/
│   │   ├── create-geometry.ts      # BoxGeometry + zigzag + rounded corners
│   │   ├── interlace-images.ts     # Canvas side-by-side / thirds composition
│   │   ├── create-material.ts      # MeshPhysicalMaterial setup
│   │   ├── create-scene.ts         # Scene, camera, lights, renderer
│   │   └── export.ts              # PNG snapshot, GIF generation, embed code
│   └── store.ts                    # Zustand store
└── hooks/
    ├── use-lenticular.ts           # Orchestrates Three.js lifecycle
    └── use-image-loader.ts         # File → Image element loading
```

---

## Performance Considerations

- **Granularity**: At 200 segments, the geometry has ~2400 vertices. At 500 it's ~6000. Both are well within WebGL limits but should cap at 500 to avoid diminishing returns.
- **Texture size**: Interlaced canvas should not exceed 4096×4096 (WebGL max texture on most devices). Client-side image downscaling enforces this.
- **Render loop**: Only re-render when tilt changes (dirty flag), not on every frame. Saves GPU when idle.
- **Dispose**: Properly dispose Three.js geometries, materials, and textures on unmount and image swap to avoid memory leaks.

---

## Edge Cases

| Case | Handling |
|------|----------|
| Only 1 image uploaded | Show static card preview (no interlacing). Prompt to add more. |
| Images with very different aspect ratios | Cover-fit both to the card ratio. Show warning if severe crop. |
| Very large images (>10MB) | Client-side compress before processing. Show progress. |
| WebGL not available | Show fallback message. No graceful CSS fallback — the effect requires WebGL. |
| Mobile / small screens | Stack layout (preview on top, controls below). Touch interaction. |
| Window resize | Resize renderer and camera aspect on `resize` event. Debounced. |

---

## Implementation Phases

### Phase 1 — Core (MVP)
- [x] Project setup (Next.js + shadcn + Tailwind + Three.js)
- [ ] Image upload (2 slots)
- [ ] Canvas interlacing (2 images, side-by-side)
- [ ] Three.js lenticular geometry (zigzag surface, rounded corners)
- [ ] Cursor-driven tilt within preview zone
- [ ] Basic controls: aspect ratio, corner radius

### Phase 2 — Polish
- [ ] 3rd image slot + triple interlacing
- [ ] All card and effect sliders
- [ ] Presets
- [ ] Drag-to-reorder image slots
- [ ] Tilt indicator overlay
- [ ] Spring-back animation on cursor leave
- [ ] Touch support

### Phase 3 — Export & Extras
- [ ] PNG export
- [ ] Animated GIF export
- [ ] Embed code generation
- [ ] Gyroscope support (mobile)
- [ ] Image crop/offset controls

---

## Non-Goals (out of scope)

- Server-side rendering or processing — everything runs client-side.
- User accounts, saving, or sharing via URL.
- Print-ready lenticular file generation (that requires specialized software).
- Video/animation frames as input (images only).
- More than 3 images (physical lenticular prints rarely exceed 3 views).
