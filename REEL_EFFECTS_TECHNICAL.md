# 🔧 Reel Effects System - Technical Documentation

## Architecture Overview

The reel effects system is built using React state management, HTML5 Canvas, and WebM video encoding. The system allows users to create customized video reels with multiple visual effects applied in real-time during video generation.

## State Management

### Effects State Structure

```javascript
const [reelEffects, setReelEffects] = useState({
  transition: "fade", // Type of transition between photos
  duration: 3, // Seconds per image (1-10)
  filter: "none", // Color/tone filter effect
  music: "upbeat", // Background audio selection
  textStyle: "modern", // Title text styling
});
```

## Effect Implementations

### 1. Transition Effects

#### Fade

- Uses canvas `globalAlpha` property
- Progress from 0 (transparent) to 1 (opaque)
- Creates smooth cross-fade between images

```javascript
case 'fade':
  ctx.globalAlpha = progress;
  break;
```

#### Slide Left

- Translates canvas to the left as image fades in
- Creates illusion of image sliding from right edge
- Uses 2D transform translation

```javascript
case 'slideLeft':
  ctx.translate(-w * (1 - progress), 0);
  break;
```

#### Slide Right

- Opposite of slide left
- Image appears to slide from left edge

```javascript
case 'slideRight':
  ctx.translate(w * (1 - progress), 0);
  break;
```

#### Zoom

- Scales image by factor of 0.8 to 1.0
- Creates ken-burns effect (zoom in during photo display)
- Centers scaling around image center point

```javascript
case 'zoom':
  const zoomScale = 0.8 + 0.2 * progress;
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-w / 2, -h / 2);
  break;
```

#### Rotate

- Rotates image 0 to ~108 degrees (0.3 \* 2π)
- Creates playful spinning effect
- Centers rotation on image center

```javascript
case 'rotate':
  ctx.translate(w / 2, h / 2);
  ctx.rotate((Math.PI * 2 * progress) * 0.3);
  ctx.translate(-w / 2, -h / 2);
  break;
```

#### Blur

- Dynamic blur filter from 20px to 0px
- Creates blur-in effect as image sharpens
- Uses canvas filter property

```javascript
case 'blur':
  ctx.filter = `blur(${20 * (1 - progress)}px)`;
  break;
```

### 2. Filter Effects

Applied using canvas `filter` property (CSS filters):

#### Sepia

```javascript
case 'sepia':
  ctx.filter = 'sepia(100%)';
  break;
```

#### Vintage

```javascript
case 'vintage':
  ctx.filter = 'saturate(1.2) contrast(0.9) brightness(1.1)';
  break;
```

#### Vibrant

```javascript
case 'vibrant':
  ctx.filter = 'saturate(1.5) contrast(1.2)';
  break;
```

#### Cool Blue

```javascript
case 'coolBlue':
  ctx.filter = 'hue-rotate(200deg) saturate(1.2)';
  break;
```

#### Warm Orange

```javascript
case 'warmOrange':
  ctx.filter = 'hue-rotate(-15deg) saturate(1.3) brightness(1.05)';
  break;
```

### 3. Text Styling

Text rendering with different visual styles:

#### Modern

- White color (#ffffff)
- Subtle shadow
- Arial font, bold

#### Retro

- Yellow color (#ffff00)
- Strong black shadow offset
- Courier (monospace) font for authentic look

#### Neon

- Cyan color (#00ffff)
- Glowing blue shadow effect
- Arial font, bold

#### Shadow

- White color (#ffffff)
- Deep shadow with offset and blur
- Dramatic appearance
- Arial font, bold

## Video Generation Process

### 1. Canvas Setup

```javascript
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");
```

### 2. Stream Capture

```javascript
const stream = canvas.captureStream(30); // 30fps
const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
```

### 3. Frame Animation Loop

```javascript
let frameCount = 0;
const framesPerImage = reelEffects.duration * 30; // Seconds to frames
const totalFrames = framesPerImage * images.length;

const animateFrame = () => {
  // Calculate current image and progress
  const imageIndex = Math.floor(frameCount / framesPerImage) % images.length;
  const frameProgress = (frameCount % framesPerImage) / framesPerImage;

  // Render frame with effects
  // Update frameCount
  // Request next frame
  requestAnimationFrame(animateFrame);
};
```

### 4. Frame Rendering

For each frame:

1. Clear canvas with background color
2. Save context state for transformations
3. Apply filter effect
4. Draw image with transition transformation
5. Restore context state
6. Draw title background
7. Draw title text with selected style

## Performance Considerations

### Optimization Strategies

1. **Image Pre-loading**: All images loaded before video generation starts
2. **Canvas Context Reuse**: Single canvas context for all rendering
3. **Filter Efficiency**: CSS filters optimized by browser's GPU
4. **Frame Limiting**: 30fps balances quality with file size

### Frame Rate

- **30fps**: Good balance between quality and file size
- Calculation: `framesPerImage = duration * 30`
- For 3-second duration per image: 90 frames per image

### Memory Usage

- Canvas: 800×600 pixels = ~1.8MB per frame
- Stored in browser's WebGL/Canvas buffer
- Total depends on video length and browser capabilities

## UI Component Structure

### Effects Section in Reel Maker Modal

```
┌─ Effects Panel ─────────────────────────┐
│                                         │
│ ┌─ Transitions ──┐ ┌─ Duration ──────┐│
│ │ Dropdown       │ │ Slider 1-10s    ││
│ │ Description    │ │ Total time calc ││
│ └────────────────┘ └─────────────────┘│
│                                         │
│ ┌─ Filter ───────┐ ┌─ Music ────────┐ │
│ │ Dropdown       │ │ Dropdown       │ │
│ │ Description    │ │ Description    │ │
│ └────────────────┘ └────────────────┘ │
│                                         │
│ ┌─ Text Styles ──────────────────────┐ │
│ │ [Modern] [Retro] [Neon] [Shadow]  │ │
│ │ Description                        │ │
│ └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Preview Section

- Shows first image with selected filter applied
- Displays selected title with text style applied
- Shows complete effects summary
- Total reel duration calculated

## Canvas Drawing Order

For each frame:

```
1. Clear canvas (background)
2. ctx.save()
3. Apply filter effect
4. Apply transition transformation
5. Draw current image (centered, scaled)
6. ctx.restore()
7. Draw title background rectangle
8. Draw title text with style
```

## Supported File Formats

### Input Images

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Maximum: 5MB per image
- Minimum: recommended 800×600px or larger

### Output Video

- Format: WebM (VP8/VP9 codec)
- Resolution: 800×600
- Frame Rate: 30fps
- Audio: Optional (selectable, not actually embedded in current version)

## Browser API Requirements

### Required APIs

- CanvasRenderingContext2D
- MediaRecorder API
- Blob API
- Canvas.captureStream()

### Optional APIs (for enhancement)

- Web Audio API (for music playback)
- File API (for future features)

## Code Files Modified

### Main Implementation File

- `client/src/pages/MemoryReelPage.jsx`

### Lines of Code Added

- Effect state definition: ~10 lines
- Filter application function: ~20 lines
- Transition drawing function: ~40 lines
- Text styling function: ~40 lines
- Effects UI section: ~150 lines
- Preview enhancement: ~40 lines
- Custom animation logic: ~30 lines

**Total: ~330 lines of effect-related code**

## Testing Checklist

- [ ] All 6 transition effects render correctly
- [ ] All 5 filter effects apply color changes
- [ ] All 4 text styles display properly
- [ ] Duration slider affects video length
- [ ] Effect preview updates in real-time
- [ ] Video exports with correct effects applied
- [ ] Mobile responsive UI
- [ ] All selectors properly styled
- [ ] Performance acceptable on low-end devices

## Future Enhancement Opportunities

1. **Advanced Transitions**
   - 3D transforms using WebGL
   - Custom bezier curve timing

2. **Real-time Preview**
   - Live canvas rendering as mouse moves
   - Actual audio playback during preview

3. **Custom Effects**
   - User-defined filter presets
   - Color curve adjustment

4. **Particle Effects**
   - Falling confetti
   - Sparkling transitions

5. **Advanced Audio**
   - Background music mixing
   - Sound effect layers

6. **Batch Processing**
   - Create multiple reels at once
   - Template system

---

**Last Updated:** 2025  
**Status:** Initial Implementation Complete
