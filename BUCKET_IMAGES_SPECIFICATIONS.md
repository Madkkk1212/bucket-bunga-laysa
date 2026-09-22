# 🪣 BUCKET IMAGES - COMPLETE SPECIFICATIONS

## 📐 TECHNICAL SPECIFICATIONS

### Format & File Type
```
Format: SVG (Scalable Vector Graphics) atau PNG High-Res
├─ SVG: Recommended untuk shapes/vector bucket
├─ PNG: Alternative untuk photo-based bucket
└─ Never: JPG (lossy compression)

Color Mode: RGB (not CMYK)
Background: TRANSPARENT (no white/solid background)
Compression: Optimized (use TinyPNG for PNG files)
```

### Dimensions & Resolution

**For Template Selection Grid Display:**
```
Canvas Size: 300px × 400px (fixed aspect ratio)
DPI: 72 DPI (for web)
File Size: < 200KB per image
Safe Margin: 20px padding around bucket
```

**For Canvas Rendering (in-app):**
```
Canvas Size: 800px × 800px
Rendering Size: Varies per bucket size (S/M/L/XL)
Scalability: Must scale smoothly without quality loss
```

### Color System

**Bucket Fill Color:**
```
Primary Brown: #8B5A3C (main bucket body)
Dark Brown: #704214 (shadows/edges)
Light Brown: #A0684C (highlights/gradients)
Alternative: #D2B48C (kraft paper look)
```

**Wrapper/Paper:**
```
Kraft: #D2B48C
White: #FFFFFF
Pink: #FFB6C1
Glossy: #F5F5F5
Matte: #E8E8E8
Gold: #FFD700
```

**Stroke/Border:**
```
Stroke Color: #704214 (dark brown)
Stroke Width: 2-3px
Stroke Style: Solid
```

**Shadows & Depth:**
```
Drop Shadow: offset (0, 4), blur (8), opacity (0.2)
Inner Shadow: subtle, for depth
Gradient: optional, for 3D effect
```

### Bucket Shape Specifics

#### 1️⃣ CLASSIC TRAPEZOID
```
Shape: Trapezoid (wider at top, narrower at bottom)
Top Edge: 280px (mouth width)
Bottom Edge: 140px (base width)
Height: 200px (bucket height)

Visual Elements:
├─ Trapezoid body (main bucket)
├─ Wrapper paper wrapped around (semi-transparent overlay)
├─ Bottom edge with subtle fold
├─ Shadow on left/right edges for 3D effect
└─ Ribbon/bow at bottom center

File Name: classic_trapezoid.svg or .png
```

#### 2️⃣ ELEGANT CYLINDER
```
Shape: Cylinder (uniform diameter)
Diameter: 220px
Height: 250px (taller than trapezoid)

Visual Elements:
├─ Cylindrical body (perfect circles top/bottom)
├─ Smooth paper wrapper
├─ Subtle side shadows for roundness
├─ Top rim/edge detail
└─ Ribbon at base

File Name: elegant_cylinder.svg or .png
```

#### 3️⃣ ROMANTIC BOWL
```
Shape: Bowl/Curved bucket (wider at top, curved sides)
Top Diameter: 320px
Bottom Diameter: 120px
Height: 160px (shorter, wider opening)

Visual Elements:
├─ Bowl-shaped container
├─ Paper wrapper on sides
├─ Curved/organic shape
├─ Gentle shadow inside (to show depth)
└─ Ribbon at base

File Name: romantic_bowl.svg or .png
```

#### 4️⃣ MODERN SQUARE
```
Shape: Square/Rectangular box
Width: 200px
Height: 200px (or 240px for slight rectangle)

Visual Elements:
├─ Clean square/rectangular shape
├─ Paper wrapper on all sides visible
├─ Sharp corners with subtle rounded edge (2-4px)
├─ Minimal shadows (modern look)
└─ Centered ribbon at base

File Name: square_modern.svg or .png
```

---

## 🎨 VISUAL ELEMENTS (All Templates)

### Wrapper Paper
```
Visible Wrapping:
├─ Paper starts at bucket mouth
├─ Wraps around sides
├─ Ends 3/4 down the bucket
├─ Folded edges visible on sides
├─ Color based on user selection

Texture (optional):
├─ Kraft: slight paper texture (wrinkle pattern)
├─ Tissue: smooth, subtle folds
├─ Glossy: reflective highlights
└─ Matte: flat appearance

Transparency:
├─ Wrapper should show bucket behind (not solid)
├─ Layer effect visible
└─ Depth perception important
```

### Ribbon/Bow
```
Position: At bucket base, just below wrapper
Style: Classic bow

Elements:
├─ Ribbon bow (center)
├─ Left tail (angled down)
├─ Right tail (angled down)
├─ Center knot/buckle

Colors:
├─ Default: Striped black/white (#000000 + #FFFFFF)
├─ Or solid color options
└─ Pattern: Horizontal stripes (5-6mm width)

Size:
├─ Bow width: 120-150px
├─ Bow height: 80-100px
├─ Tail length: 80-120px
└─ Proportional to bucket size
```

### Shadow & Depth
```
Drop Shadow (Bucket):
├─ Offset X: 0px
├─ Offset Y: 8px
├─ Blur Radius: 16px
├─ Spread: 0px
├─ Opacity: 15-20%
└─ Color: #000000

Inner Shadow (Optional, for 3D):
├─ Subtle shading on sides
├─ Creates depth illusion
└─ Opacity: 5-10%

Reflection (Optional):
├─ Slight highlight on glossy buckets
├─ Adds premium look
└─ Use with glossy/metallic wrappers only
```

---

## 📁 FILE ORGANIZATION

### Directory Structure
```
/public/images/buckets/
├── classic_trapezoid.svg
├── elegant_cylinder.svg
├── romantic_bowl.svg
├── square_modern.svg
└── README.md (file ini)
```

### File Naming Convention
```
Format: {style}_{shape}.svg

Examples:
├─ classic_trapezoid.svg
├─ elegant_cylinder.svg
├─ romantic_bowl.svg
└─ square_modern.svg

Rules:
├─ Lowercase only
├─ No spaces (use underscore)
├─ No version numbers (use versioning in git)
└─ Descriptive names for clarity
```

---

## ✅ QUALITY CHECKLIST

### Before Uploading, Verify:

**Visual Quality:**
- [ ] Bucket shape is clear and recognizable
- [ ] Wrapper paper clearly visible and wrapped
- [ ] Ribbon/bow is centered and proportional
- [ ] Colors match design system (brown #8B5A3C, etc)
- [ ] Shadows and depth effects are subtle and professional
- [ ] No pixelation or quality loss when scaled

**Technical Requirements:**
- [ ] Background is transparent (not white/solid)
- [ ] File size < 200KB
- [ ] SVG code is optimized (minimal unnecessary elements)
- [ ] PNG has proper compression (if using PNG)
- [ ] Dimensions are exactly 300×400px (or as specified)
- [ ] All text/elements are properly grouped in SVG

**Design Consistency:**
- [ ] Consistent with landing page aesthetic
- [ ] Matches design system color palette
- [ ] Professional appearance (not cartoonish)
- [ ] Similar style across all 4 templates
- [ ] Proportions look natural (not stretched/distorted)

**Functionality:**
- [ ] Can be scaled 1x to 3x without quality loss
- [ ] Works on light and dark backgrounds
- [ ] Renders correctly in browsers
- [ ] Compatible with Canvas rendering

---

## 🎯 DESIGN REFERENCE

### Style Guidelines
```
Overall Aesthetic: Luxury, Minimalist, Elegant
Inspiration: Premium flower brands, modern lifestyle
Mood: Sophisticated, Natural, Premium

Color Harmony:
├─ Primary: Brown (#8B5A3C)
├─ Accent: Cream (#F5DEB3)
├─ Secondary: Gold/Kraft
└─ Result: Warm, elegant palette

Typography: N/A (buckets have no text)
Shadows: Subtle, not harsh
Gradients: Optional, if used keep minimal

Finish: Semi-realistic, modern illustration
Not: Overly cartoonish, too detailed, flat
```

### Do's ✅
- ✅ Use clean, smooth lines
- ✅ Show depth with shadows
- ✅ Match design system colors
- ✅ Make wrapper obviously wrapped
- ✅ Ensure ribbon is centered and proportional
- ✅ Keep file size optimized
- ✅ Use transparent background
- ✅ Test at different scales

### Don'ts ❌
- ❌ Use white/opaque backgrounds
- ❌ Make bucket too detailed/busy
- ❌ Use colors outside design system
- ❌ Forget ribbon/bow element
- ❌ Make shadows too dark/harsh
- ❌ Use lossy compression (JPG)
- ❌ Create non-scalable raster images
- ❌ Distort proportions

---

## 🔍 VALIDATION STEPS

### Step 1: Visual Inspection
```
Open bucket image and check:
1. Shape is clear and obvious
2. Colors are correct (not off)
3. Wrapper paper is visible
4. Ribbon/bow is present and centered
5. Shadows look natural
6. No artifacts or quality issues
```

### Step 2: Technical Validation
```
Check file properties:
1. Format: SVG or PNG (not JPG)
2. Dimensions: 300×400px
3. Size: < 200KB
4. Background: Transparent
5. Colors: RGB (not CMYK)
```

### Step 3: Browser Testing
```
1. Upload to /public/images/buckets/
2. Display in grid (300×400px)
3. Display in canvas (800×800px scaled)
4. Check in light mode
5. Check in dark mode
6. Verify on mobile device
7. Test zoom/scale functionality
```

### Step 4: Design Validation
```
1. Compare with design system colors
2. Check consistency with other buckets
3. Verify alignment with landing page style
4. Confirm proportion/balance looks right
5. Assess premium/luxury perception
```

---

## 📝 EXPORT INSTRUCTIONS

### From Design Software (Figma/Illustrator)

**For SVG Export:**
```
1. Select all bucket elements
2. File → Export → Format: SVG
3. Settings:
   ├─ Optimize SVG: Yes
   ├─ Cleanup IDs: Yes
   ├─ Prefix IDs: No
   ├─ Remove hidden layers: Yes
   └─ Text to paths: No (if has text)
4. Save as: {template}_{shape}.svg
5. Verify transparent background
```

**For PNG Export (if using PNG):**
```
1. Select bucket artboard/canvas
2. File → Export → Format: PNG
3. Settings:
   ├─ Resolution: 300px width (300% for retina)
   ├─ Compression: High
   ├─ Background: Transparent
   └─ Format: PNG-24 (with transparency)
4. Save as: {template}_{shape}.png
5. Compress with TinyPNG tool
```

---

## 🚀 DEPLOYMENT

### Upload Process
```
1. Verify all 4 bucket images pass quality checklist
2. Optimize file sizes (< 200KB each)
3. Upload to: /public/images/buckets/
4. Update bucket configuration with correct paths:
   ├─ classic_trapezoid → /images/buckets/classic_trapezoid.svg
   ├─ elegant_cylinder → /images/buckets/elegant_cylinder.svg
   ├─ romantic_bowl → /images/buckets/romantic_bowl.svg
   └─ square_modern → /images/buckets/square_modern.svg
5. Test in application
6. Deploy to production
```

### Backup & Version Control
```
git add /public/images/buckets/
git commit -m "Add bucket template images"
git push
```

---

## 📞 SUPPORT & REVISIONS

If bucket images need adjustments:

1. **Color Issues:** Adjust fill/stroke colors in design software
2. **Proportion Issues:** Verify against spec dimensions
3. **Quality Issues:** Re-export with proper settings
4. **Size Issues:** Compress with TinyPNG or ImageOptim

Keep original design files (Figma, Illustrator) for future edits.

---

**This specification ensures bucket images are perfect, consistent, and production-ready for the BucketBunga application.**

Version: 1.0  
Last Updated: January 2025
