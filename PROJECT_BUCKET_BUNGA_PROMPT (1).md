# 🌸 PROJECT: WEBSITE BUCKET BUNGA INTERAKTIF

## 📌 PROJECT OVERVIEW

Develop an interactive web application that allows users to design custom flower buckets with visual preview and downloadable output. Users can select bucket size, wrapper paper type, flowers, and add custom text/messages. The final result can be downloaded as PNG or JPG image.

**Purpose:** MVP (Minimal Viable Product) - Design preview tool for custom flower buckets. Future monetization potential through premium features and product sales.

**Target User:** Anyone who wants to create custom, personalized flower bucket designs for gifts, events, or personal use.

**Monetization Path:** Free MVP → Premium features (Phase 2-3) → E-commerce integration (Phase 3+)

---

## 🏗️ WEBSITE ARCHITECTURE

### Overall Flow
```
Landing Page (Homepage)
    ↓
├─ Navigation: Flowers | Shop | Occasions | Corporate | About Us
├─ Hero Section: Call-to-action "Design Your Bucket"
├─ Product Showcase
└─ Footer: Contact, Social, Company Info
    ↓
[User clicks "Design Your Bucket"]
    ↓
Bucket Designer Page (6-Step Interactive)
    ├─ Step 1: Select Size
    ├─ Step 2: Select Wrapper
    ├─ Step 3: Select Flowers
    ├─ Step 4: Preview Bucket
    ├─ Step 5: Add Text/Ucapan
    └─ Step 6: Download PNG/JPG
    ↓
Download & Share
```

### Page Structure

**Page 1: Landing/Home (`/` or `/index`)**
- Navigation bar (sticky/fixed)
- Hero section (tagline + CTA)
- Featured showcase
- Footer

**Page 2: Bucket Designer (`/designer` atau `/create`)**
- 6-step wizard layout
- Left panel: Step-by-step form
- Right panel: Live preview canvas
- Progress indicator
- Navigation buttons (Next/Back/Download)

**Page 3 (Future): Shop (`/shop`)**
- Product listings
- Cart integration
- Checkout

**Page 4 (Future): Gallery (`/gallery`)**
- User designs showcase
- Testimonials
- Before/After

---

## 🎯 USER FLOW (DETAILED - WITH ADAPTIVE BUCKETS)

```
┌─ START ─────────────────────────────────────────┐
│                                                  │
├─ STEP 1: Select Bucket Template                 │ ← NEW!
│  (Classic Trapezoid, Elegant Cylinder,         │
│   Romantic Bowl, Modern Square)                 │
│  → Determines arrangement algorithm             │
│                                                  │
├─ STEP 2: Select Bucket Size                     │
│  (Small/Medium/Large/XL)                        │
│  → Scales bucket + flower capacity              │
│                                                  │
├─ STEP 3: Select Wrapper Paper Type              │
│  (Kraft, Tissue, Glossy, Matte, Crinkle, etc)  │
│  → Changes wrapper color/texture                │
│                                                  │
├─ STEP 4: Select & Arrange Flowers (30 options)  │
│  (User can click multiple times to add flowers) │
│  → Adaptive positioning based on bucket type    │
│                                                  │
├─ STEP 5: Preview Bucket (2D Display)            │
│  (Real-time visual preview)                     │
│  → Shows final arrangement result               │
│                                                  │
├─ STEP 6: Customize Text/Ucapan                  │
│  (Input text, font, size, color, position)     │
│                                                  │
├─ STEP 7: Download as PNG/JPG                    │
│  (Generate high-quality image)                  │
│                                                  │
└─ END ──────────────────────────────────────────┘
```

**Updated Step Structure (7 steps instead of 6):**
1. Template selection (visual cards)
2. Size selection (S/M/L/XL)
3. Wrapper paper selection
4. Flower selection & arrangement
5. Preview/confirm arrangement
6. Text customization
7. Download

---

## 🎨 LANDING PAGE DESIGN SPECIFICATION

### Design Direction
- **Inspiration:** Hasform, luxury flower brands
- **Color Scheme:** Warm brown gradient (terracotta, taupe, cream)
- **Aesthetic:** Minimalist, elegant, sophisticated
- **Typography:** Modern sans-serif (Montserrat, Poppins) + serif accents (optional)
- **Mood:** Premium, thoughtful, nature-inspired

### Landing Page Sections

#### 1. Navigation Bar
```
Layout: Sticky/Fixed at top
├─ Logo: "Bucketbunga" (left, elegant script or modern sans)
├─ Navigation Menu (center):
│  ├─ FLOWERS
│  ├─ SHOP
│  ├─ OCCASIONS
│  ├─ CORPORATE
│  └─ ABOUT US
└─ Right Icons:
   ├─ Search (icon)
   ├─ User Account (icon)
   └─ Cart (icon)

Colors:
├─ Background: rgba(139, 90, 60, 0.95) with backdrop blur
├─ Text: #F5DEB3 (wheat/cream)
└─ Hover: Opacity 0.7
```

#### 2. Hero Section
```
Layout: Grid (2 columns - Text left, Image right)
├─ LEFT COLUMN:
│  ├─ Main Title: "BIGGER. BRIGHTER. BETTER."
│  │  └─ Style: UPPERCASE, font-size 56px, font-weight 700
│  │  └─ Color: #FFFFFF
│  │  └─ Line-height: 1.2 (tight)
│  │
│  ├─ Subtitle: "Thoughtfully designed flowers and gifts 
│  │  that celebrate life's nature and every meaningful moment"
│  │  └─ Style: font-size 16px, line-height 1.6
│  │  └─ Color: #F5DEB3
│  │
│  └─ CTA Button: "DESIGN YOUR BUCKET"
│     └─ Style: White bg, brown text, uppercase
│     └─ Hover: Background #F5DEB3, translate right 5px
│     └─ Icon: Right arrow
│
└─ RIGHT COLUMN:
   └─ Flower Container Card:
      ├─ Background: rgba(255, 255, 255, 0.95)
      ├─ Border-radius: 12px
      ├─ Shadow: 0 20px 60px rgba(0, 0, 0, 0.2)
      ├─ Padding: 20px
      ├─ Animation: Floating (float 3s ease-in-out infinite)
      └─ Content:
         ├─ Placeholder: Flower image/emoji (280x320px)
         ├─ Label: "BucketBunga"
         └─ Sublabel: "Design & Delivery"

Background Gradient:
└─ linear-gradient(135deg, #8B5A3C 0%, #A0684C 100%)
```

#### 3. Color Palette

**Primary Colors:**
```
├─ Brown/Terracotta: #8B5A3C (main)
├─ Brown/Burnt: #A0684C (gradient)
├─ Cream/Wheat: #F5DEB3 (accent)
├─ White: #FFFFFF (content)
└─ Dark Brown: #704214 (text on light bg)
```

**Secondary Colors:**
```
├─ Soft Pink: #FFB6D9 (flower accents)
├─ Blush: #FFC0CB (lighter flower)
├─ Light Pink: #FFE4E1 (palest)
└─ Gold: #B8860B (highlights)
```

#### 4. Typography

**Font Family:**
```
├─ Primary: Montserrat / Poppins (sans-serif, geometric)
├─ Logo: Playfair Display or elegant script (optional)
└─ Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI'
```

**Font Sizes & Weights:**
```
├─ Logo: 24px, font-weight 300, letter-spacing 2px
├─ Nav Links: 13px, font-weight 400, text-transform uppercase, letter-spacing 1px
├─ Main Title: 56px, font-weight 700, letter-spacing 1px
├─ Subtitle: 16px, font-weight 400, line-height 1.6
├─ Button: 13px, font-weight 600, uppercase, letter-spacing 1px
├─ Card Label: 18px, font-weight 600
└─ Card Sub-label: 12px, font-weight 400
```

#### 5. Responsive Design

**Desktop (>1024px):**
```
└─ Hero: 2 columns side-by-side
   └─ Left: 50%, Right: 50%
   └─ Flower container: 350x450px
   └─ Gap: 60px
```

**Tablet (768px - 1024px):**
```
└─ Hero: 2 columns maintained
   └─ Padding reduced, gap reduced
   └─ Flower container: 300x400px
```

**Mobile (<768px):**
```
├─ Nav: Logo + hamburger menu (nav-center hidden)
├─ Hero: 1 column stacked
│  ├─ Text section full width
│  └─ Flower container full width, max-width 300px
├─ Font sizes: Title 36px (down from 56px)
└─ Padding: 20px (down from 40px)
```

#### 6. Interactive Elements

**Button Hover States:**
```
├─ Default:
│  ├─ Background: #FFFFFF
│  ├─ Color: #8B5A3C
│  └─ Border: none
│
├─ Hover:
│  ├─ Background: #F5DEB3
│  ├─ Transform: translateX(5px)
│  └─ Cursor: pointer
│
└─ Active:
   └─ Transform: scale(0.98) (subtle click feedback)
```

**Floating Animation (Flower Container):**
```
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
Duration: 3s
Timing: ease-in-out
Iteration: infinite
```

**Navigation Hover:**
```
├─ Default opacity: 1
├─ Hover opacity: 0.7
└─ Transition: 0.3s
```

---

## 📦 DATA STRUCTURE

### 1. BUCKET TEMPLATES & SIZES

**System Architecture:**
- User terlebih dahulu pilih **Bucket Template** (tipe/style)
- Kemudian pilih **Size** (Small/Medium/Large/XL)
- Sistem otomatis menyesuaikan **arrangement algorithm** berdasarkan template

```json
{
  "bucketTemplates": [
    {
      "id": "classic_trapezoid",
      "name": "Classic Trapezoid",
      "description": "Traditional trapezoid bucket dengan wrapper lembut",
      "shape": "trapezoid",
      "image": "/images/buckets/classic_trapezoid.svg",
      
      "dimensions": {
        "small": {
          "mouthWidth": 180,
          "mouthHeight": 80,
          "bottomWidth": 100,
          "bucketHeight": 150,
          "capacity": 12,
          "arrangemnetStyle": "semi-sphere"
        },
        "medium": {
          "mouthWidth": 260,
          "mouthHeight": 100,
          "bottomWidth": 140,
          "bucketHeight": 180,
          "capacity": 20,
          "arrangementStyle": "semi-sphere"
        },
        "large": {
          "mouthWidth": 340,
          "mouthHeight": 120,
          "bottomWidth": 180,
          "bucketHeight": 220,
          "capacity": 30,
          "arrangementStyle": "semi-sphere"
        },
        "xl": {
          "mouthWidth": 420,
          "mouthHeight": 140,
          "bottomWidth": 220,
          "bucketHeight": 260,
          "capacity": 45,
          "arrangementStyle": "semi-sphere"
        }
      },
      
      "arrangementRules": {
        "flowerLayers": 3,
        "backLayerPercent": 25,
        "middleLayerPercent": 50,
        "frontLayerPercent": 25,
        "overlapFactor": 0.7,
        "packingDensity": "dense",
        "verticalSpread": 0.6
      }
    },
    
    {
      "id": "cylinder_elegant",
      "name": "Elegant Cylinder",
      "description": "Silinder bucket dengan opening lebar, cocok untuk arrangement geometric",
      "shape": "cylinder",
      "image": "/images/buckets/cylinder_elegant.svg",
      
      "dimensions": {
        "small": {
          "diameter": 140,
          "height": 160,
          "capacity": 10,
          "arrangementStyle": "dome"
        },
        "medium": {
          "diameter": 200,
          "height": 200,
          "capacity": 18,
          "arrangementStyle": "dome"
        },
        "large": {
          "diameter": 280,
          "height": 250,
          "capacity": 28,
          "arrangementStyle": "dome"
        },
        "xl": {
          "diameter": 360,
          "height": 300,
          "capacity": 42,
          "arrangementStyle": "dome"
        }
      },
      
      "arrangementRules": {
        "flowerLayers": 4,
        "backLayerPercent": 20,
        "middleLayerPercent": 35,
        "frontLayerPercent": 35,
        "frontEdgePercent": 10,
        "overlapFactor": 0.65,
        "packingDensity": "medium",
        "verticalSpread": 0.5
      }
    },
    
    {
      "id": "bowl_romantic",
      "name": "Romantic Bowl",
      "description": "Bowl-shaped bucket dengan opening lebih wide, perfect untuk romantic arrangements",
      "shape": "bowl",
      "image": "/images/buckets/bowl_romantic.svg",
      
      "dimensions": {
        "small": {
          "mouthWidth": 200,
          "mouthHeight": 100,
          "bottomWidth": 80,
          "bucketHeight": 120,
          "capacity": 15,
          "arrangementStyle": "dome"
        },
        "medium": {
          "mouthWidth": 300,
          "mouthHeight": 120,
          "bottomWidth": 120,
          "bucketHeight": 160,
          "capacity": 25,
          "arrangementStyle": "dome"
        },
        "large": {
          "mouthWidth": 400,
          "mouthHeight": 150,
          "bottomWidth": 160,
          "bucketHeight": 200,
          "capacity": 35,
          "arrangementStyle": "dome"
        },
        "xl": {
          "mouthWidth": 500,
          "mouthHeight": 180,
          "bottomWidth": 200,
          "bucketHeight": 240,
          "capacity": 50,
          "arrangementStyle": "dome"
        }
      },
      
      "arrangementRules": {
        "flowerLayers": 3,
        "backLayerPercent": 20,
        "middleLayerPercent": 45,
        "frontLayerPercent": 35,
        "overlapFactor": 0.8,
        "packingDensity": "very-dense",
        "verticalSpread": 0.4
      }
    },
    
    {
      "id": "square_modern",
      "name": "Modern Square",
      "description": "Kotak bucket dengan design contemporary, cocok untuk style minimalis",
      "shape": "square",
      "image": "/images/buckets/square_modern.svg",
      
      "dimensions": {
        "small": {
          "width": 140,
          "height": 140,
          "capacity": 9,
          "arrangementStyle": "geometric"
        },
        "medium": {
          "width": 200,
          "height": 180,
          "capacity": 16,
          "arrangementStyle": "geometric"
        },
        "large": {
          "width": 280,
          "height": 240,
          "capacity": 25,
          "arrangementStyle": "geometric"
        },
        "xl": {
          "width": 360,
          "height": 300,
          "capacity": 40,
          "arrangementStyle": "geometric"
        }
      },
      
      "arrangementRules": {
        "flowerLayers": 2,
        "backLayerPercent": 30,
        "frontLayerPercent": 70,
        "overlapFactor": 0.5,
        "packingDensity": "sparse",
        "verticalSpread": 0.7,
        "gridAlignment": true
      }
    }
  ]
}
```

**Explanation:**
- **Trapezoid (Classic):** Traditional style, terlihat seperti foto Anda - semi-sphere arrangement yang padat
- **Cylinder (Elegant):** Modern look, perfect untuk tall arrangements
- **Bowl (Romantic):** Lebar, cocok untuk super dense/full arrangements
- **Square (Modern):** Contemporary, minimal aesthetic

### 2. WRAPPER PAPER TYPES
```json
{
  "wrappers": [
    {
      "id": "kraft",
      "label": "Kraft Paper",
      "color": "#D2B48C",
      "texture": "rough",
      "price_modifier": 0
    },
    {
      "id": "tissue_white",
      "label": "Tissue White",
      "color": "#FFFFFF",
      "texture": "smooth",
      "price_modifier": 0.5
    },
    {
      "id": "tissue_pink",
      "label": "Tissue Pink",
      "color": "#FFB6C1",
      "texture": "smooth",
      "price_modifier": 0.5
    },
    {
      "id": "glossy",
      "label": "Glossy",
      "color": "#F5F5F5",
      "texture": "shiny",
      "price_modifier": 1
    },
    {
      "id": "matte",
      "label": "Matte",
      "color": "#E8E8E8",
      "texture": "dull",
      "price_modifier": 1
    },
    {
      "id": "crinkle",
      "label": "Crinkle Paper",
      "color": "#FFD700",
      "texture": "crinkled",
      "price_modifier": 1.5
    }
  ]
}
```

### 3. FLOWERS DATABASE (30 OPTIONS)
```json
{
  "flowers": [
    {
      "id": "rose_red",
      "name": "Mawar Merah",
      "image_url": "/images/flowers/rose_red.png",
      "category": "rose",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "rose_pink",
      "name": "Mawar Pink",
      "image_url": "/images/flowers/rose_pink.png",
      "category": "rose",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "rose_white",
      "name": "Mawar Putih",
      "image_url": "/images/flowers/rose_white.png",
      "category": "rose",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "tulip_red",
      "name": "Tulip Merah",
      "image_url": "/images/flowers/tulip_red.png",
      "category": "tulip",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "tulip_yellow",
      "name": "Tulip Kuning",
      "image_url": "/images/flowers/tulip_yellow.png",
      "category": "tulip",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "lily_white",
      "name": "Lili Putih",
      "image_url": "/images/flowers/lily_white.png",
      "category": "lily",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "sunflower",
      "name": "Bunga Matahari",
      "image_url": "/images/flowers/sunflower.png",
      "category": "sunflower",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "hydrangea_blue",
      "name": "Hydrangea Biru",
      "image_url": "/images/flowers/hydrangea_blue.png",
      "category": "hydrangea",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "carnation_red",
      "name": "Carnation Merah",
      "image_url": "/images/flowers/carnation_red.png",
      "category": "carnation",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "dahlia_orange",
      "name": "Dahlia Orange",
      "image_url": "/images/flowers/dahlia_orange.png",
      "category": "dahlia",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    {
      "id": "peony_pink",
      "name": "Peony Pink",
      "image_url": "/images/flowers/peony_pink.png",
      "category": "peony",
      "specifications": {
        "format": "PNG with transparent background",
        "dimensions": "auto width x 500px height (approx)",
        "includes": ["flower head", "stem", "leaves (2-4 pieces)"],
        "anchor_point": "bottom of stem",
        "style": "realistic / botanical illustration"
      }
    },
    // ... (20 more flowers to complete 30 total)
    // Suggestions: Chrysanthemum, Iris, Lavender, Orchid, 
    // Gerbera, Ranunculus, Protea, Baby's Breath, Calla Lily,
    // Foxglove, Daffodil, Freesia, Gladiolus, Hibiscus, Zinnia, dll
  ]
}
```

### 4. DESIGN STATE (User's Current Design)
```json
{
  "design": {
    "bucketSize": "medium",
    "wrapperType": "kraft",
    "selectedFlowers": [
      {
        "id": "flower_1",
        "flower_id": "rose_red",
        "flower_url": "/images/flowers/rose_red.png",
        "order": 1,
        "zIndex": 1,
        "position": {
          "angle": 0,
          "radius": 70
        },
        "rotation": 0.15,
        "stemVariation": -0.05
      },
      {
        "id": "flower_2",
        "flower_id": "rose_pink",
        "flower_url": "/images/flowers/rose_pink.png",
        "order": 2,
        "zIndex": 2,
        "position": {
          "angle": 1.57,
          "radius": 70
        },
        "rotation": -0.10,
        "stemVariation": 0.03
      },
      {
        "id": "flower_3",
        "flower_id": "tulip_yellow",
        "flower_url": "/images/flowers/tulip_yellow.png",
        "order": 3,
        "zIndex": 3,
        "position": {
          "angle": 3.14,
          "radius": 80
        },
        "rotation": 0.08,
        "stemVariation": -0.02
      },
      {
        "id": "flower_4",
        "flower_id": "lily_white",
        "flower_url": "/images/flowers/lily_white.png",
        "order": 4,
        "zIndex": 4,
        "position": {
          "angle": 4.71,
          "radius": 65
        },
        "rotation": -0.12,
        "stemVariation": 0.07
      }
      // ... more flowers
    ],
    "text": {
      "content": "Happy Birthday!",
      "font": "Montserrat",
      "size": 32,
      "color": "#000000",
      "position": "bottom", // top, center, bottom
      "weight": "normal", // normal, bold
      "opacity": 1,
      "offsetY": 50 // Distance from bucket
    },
    "bucketMouthPosition": {
      "x": 400,
      "y": 280
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Explanation:**
- `flower_url`: Path ke image PNG bunga dengan stem
- `angle`: Position dalam circular distribution (radians, 0-2π)
- `radius`: Distance dari center bucket mouth (pixels)
- `rotation`: Random rotation untuk natural look (radians)
- `stemVariation`: Variation dalam stem angle untuk diversity
- `zIndex`: Layering order (higher zIndex = di depan / on top)

---

## 🎨 TECHNICAL SPECIFICATIONS

### Frontend Stack
- **Framework:** React.js atau Next.js
- **UI Library:** React Components + CSS/Tailwind
- **Canvas/Drawing:** HTML5 Canvas API atau Fabric.js
- **State Management:** React Context atau Zustand
- **Download:** html2canvas + jsPDF untuk export

### Backend (Optional for MVP)
- **API:** Node.js + Express / Python Flask
- **Database:** MongoDB / PostgreSQL (jika ada user accounts)
- **Storage:** Cloudinary / AWS S3 (untuk bunga images)

### Key Libraries
```
- react / next.js
- fabric.js (untuk canvas manipulation)
- html2canvas (untuk screenshot)
- axios (HTTP requests)
- zustand atau context-api (state management)
- tailwindcss (styling)
```

---

## 🖼️ PREVIEW & RENDERING

### Canvas/Preview Area
- **Dimensions:** 800x800px (canvas size)
- **Display:** Centered bucket with flowers arranged inside
- **Rendering Method:** HTML5 Canvas atau SVG
- **Real-time:** Update saat user menambah/mengurangi flower
- **Flower Positioning:** Bunga bertangkai berdiri dari mulut bucket ke atas

### Preview Logic
```
1. Draw bucket background based on size + wrapper color
2. Draw wrapper paper texture/pattern
3. Layer flowers with stems (from back to front)
   - Each flower positioned from bottom anchor point (bucket mouth)
   - Natural clustering dengan slight overlap
   - Auto-spacing untuk mencegah collision
4. Overlay text/ucapan on top
5. Generate final image on download
```

### Flower Rendering Technical Details

**Flower Image Specifications:**
- Format: PNG dengan transparent background
- Ukuran: ~500px height (width auto sesuai aspect ratio)
- Komponen: Kepala bunga + tangkai + daun-daun (2-4 pieces)
- Anchor Point: Bagian bawah tangkai (anchor di bucket mouth)
- Style: Realistic / botanical illustration

### ADAPTIVE ARRANGEMENT ALGORITHM

**Core Concept:** Arrangement menyesuaikan berdasarkan bucket template yang dipilih

```javascript
// Main render function - ADAPTIVE based on bucket template
const renderBucketAdaptive = (design, bucketTemplate) => {
  const canvas = document.getElementById('bucketCanvas');
  const ctx = canvas.getContext('2d');
  
  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. Get template-specific dimensions & rules
  const templateConfig = bucketTemplate.dimensions[design.bucketSize];
  const arrangementRules = bucketTemplate.arrangementRules;
  
  // 3. Draw bucket (shape adapts based on template)
  drawBucketShape(ctx, bucketTemplate.shape, templateConfig);
  
  // 4. Draw wrapper paper
  drawWrapperPaper(ctx, design.wrapperType, templateConfig);
  
  // 5. Calculate bucket mouth position & available space
  const bucketMouthConfig = calculateBucketMouth(bucketTemplate.shape, templateConfig);
  
  // 6. Arrange flowers based on arrangement style
  const arrangedFlowers = arrangeFlowersAdaptive(
    design.selectedFlowers,
    bucketMouthConfig,
    arrangementRules,
    bucketTemplate.shape
  );
  
  // 7. Render arranged flowers (layered)
  renderFlowersLayered(ctx, arrangedFlowers, bucketMouthConfig);
  
  // 8. Draw text overlay
  drawText(ctx, design.text);
};

// Adaptive arrangement - berbeda per bucket template
const arrangeFlowersAdaptive = (flowers, mouthConfig, rules, bucketShape) => {
  const arrangementStyle = rules.arrangementStyle || 'semi-sphere';
  
  switch(bucketShape) {
    case 'trapezoid':
      return arrangeSemiSphere(flowers, mouthConfig, rules);
    
    case 'cylinder':
      return arrangeDome(flowers, mouthConfig, rules);
    
    case 'bowl':
      return arrangeHemisphere(flowers, mouthConfig, rules);
    
    case 'square':
      return arrangeGeometric(flowers, mouthConfig, rules);
    
    default:
      return arrangeSemiSphere(flowers, mouthConfig, rules);
  }
};

// SEMI-SPHERE arrangement (untuk Trapezoid bucket)
const arrangeSemiSphere = (flowers, mouthConfig, rules) => {
  const layers = [];
  const totalFlowers = flowers.length;
  
  // Calculate flowers per layer
  const backLayerCount = Math.ceil(totalFlowers * (rules.backLayerPercent / 100));
  const middleLayerCount = Math.ceil(totalFlowers * (rules.middleLayerPercent / 100));
  const frontLayerCount = totalFlowers - backLayerCount - middleLayerCount;
  
  // BACK LAYER (background, slightly faded)
  layers.push({
    flowers: flowers.slice(0, backLayerCount),
    layer: 'back',
    heightOffset: -150,
    opacity: 0.7,
    scale: 0.8,
    radiusMultiplier: 0.5
  });
  
  // MIDDLE LAYER (visible, fully opaque)
  layers.push({
    flowers: flowers.slice(backLayerCount, backLayerCount + middleLayerCount),
    layer: 'middle',
    heightOffset: -80,
    opacity: 1,
    scale: 1,
    radiusMultiplier: 0.8
  });
  
  // FRONT LAYER (prominent, close-up)
  layers.push({
    flowers: flowers.slice(backLayerCount + middleLayerCount),
    layer: 'front',
    heightOffset: 0,
    opacity: 1,
    scale: 1.1,
    radiusMultiplier: 1
  });
  
  // Position flowers dalam tiap layer
  const result = [];
  layers.forEach((layer) => {
    const layerRadius = mouthConfig.radius * layer.radiusMultiplier;
    
    layer.flowers.forEach((flower, index) => {
      const angle = (index / layer.flowers.length) * Math.PI * 2;
      const randomAngleVariation = (Math.random() - 0.5) * 0.4;
      
      result.push({
        ...flower,
        position: {
          x: mouthConfig.centerX + Math.cos(angle + randomAngleVariation) * layerRadius,
          y: mouthConfig.centerY + layer.heightOffset,
          angle: angle,
          randomAngleVar: randomAngleVariation
        },
        rendering: {
          opacity: layer.opacity,
          scale: layer.scale,
          rotation: (Math.random() - 0.5) * 0.4,
          zIndex: layers.indexOf(layer) * 10 + index
        }
      });
    });
  });
  
  return result;
};

// DOME arrangement (untuk Cylinder bucket)
const arrangeDome = (flowers, mouthConfig, rules) => {
  // Similar ke semi-sphere tapi dengan 4 layers
  // More vertical spread, dense packing
  const layers = [];
  const totalFlowers = flowers.length;
  
  const layer1 = Math.ceil(totalFlowers * (rules.backLayerPercent / 100));
  const layer2 = Math.ceil(totalFlowers * (rules.middleLayerPercent / 100 * 0.5));
  const layer3 = Math.ceil(totalFlowers * (rules.middleLayerPercent / 100 * 0.5));
  const layer4 = totalFlowers - layer1 - layer2 - layer3;
  
  const layerConfigs = [
    { heightOffset: -180, opacitiy: 0.6, radiusMultiplier: 0.4, scale: 0.7 },
    { heightOffset: -100, opacity: 0.85, radiusMultiplier: 0.7, scale: 0.9 },
    { heightOffset: -30, opacity: 1, radiusMultiplier: 1, scale: 1 },
    { heightOffset: 30, opacity: 1, radiusMultiplier: 1.1, scale: 1.1 }
  ];
  
  // ... similar positioning logic
};

// HEMISPHERE arrangement (untuk Bowl bucket - paling dense)
const arrangeHemisphere = (flowers, mouthConfig, rules) => {
  // Paling dense, banyak overlap
  // Perfect untuk "full look" seperti foto reference
};

// GEOMETRIC arrangement (untuk Square bucket)
const arrangeGeometric = (flowers, mouthConfig, rules) => {
  // Grid-based positioning
  // More structured, less organic
};

// Render flowers dengan layer-by-layer
const renderFlowersLayered = (ctx, arrangedFlowers, mouthConfig) => {
  // Sort by zIndex untuk proper layering
  const sorted = arrangedFlowers.sort((a, b) => a.rendering.zIndex - b.rendering.zIndex);
  
  sorted.forEach((flowerData) => {
    const flowerImage = new Image();
    flowerImage.src = flowerData.flower_url;
    
    flowerImage.onload = () => {
      ctx.save();
      
      // Apply transformations
      ctx.globalAlpha = flowerData.rendering.opacity;
      ctx.translate(flowerData.position.x, flowerData.position.y);
      ctx.rotate(flowerData.rendering.rotation);
      ctx.scale(flowerData.rendering.scale, flowerData.rendering.scale);
      
      // Draw flower
      const displayHeight = 280 * flowerData.rendering.scale;
      const displayWidth = (flowerImage.width / flowerImage.height) * displayHeight;
      
      ctx.drawImage(
        flowerImage,
        -displayWidth / 2,
        -displayHeight,
        displayWidth,
        displayHeight
      );
      
      ctx.restore();
    };
  });
};

// Helper: Calculate bucket mouth based on shape
const calculateBucketMouth = (shape, config) => {
  const centerX = 400; // Canvas width / 2
  const centerY = 280;
  
  switch(shape) {
    case 'trapezoid':
      return {
        centerX,
        centerY,
        radius: config.mouthWidth / 2 - 20,
        width: config.mouthWidth,
        height: config.mouthHeight
      };
    case 'cylinder':
      return {
        centerX,
        centerY,
        radius: config.diameter / 2 - 20,
        width: config.diameter,
        height: config.diameter
      };
    case 'bowl':
      return {
        centerX,
        centerY: centerY + 50, // Bowl opens wider
        radius: config.mouthWidth / 2 - 15,
        width: config.mouthWidth,
        height: config.mouthHeight
      };
    case 'square':
      return {
        centerX,
        centerY,
        radius: (config.width / Math.sqrt(2)) / 2 - 20,
        width: config.width,
        height: config.width
      };
  }
};
```

**Flower Positioning Strategy per Bucket Template:**

```
TRAPEZOID (Classic):
        🌺 🌺 🌺
      🌺   🌺   🌺
    🌺           🌺
  ╔════════════╗  ← Semi-sphere
  ║            ║
  ║   BUCKET   ║
  ║            ║
  ╚════════════╝

CYLINDER (Elegant):
      🌺 🌺 🌺 🌺
     🌺   🌺   🌺
    🌺  🌺 🌺  🌺
    ║ CYLINDER ║  ← Dome/taller
    ╚════════════╝

BOWL (Romantic):
  🌺 🌺 🌺 🌺 🌺 🌺
  🌺 🌺 🌺 🌺 🌺 🌺
  🌺 🌺 🌺 🌺 🌺 🌺  ← Hemisphere (paling dense)
   ╲        ╱
    ╚══════╝

SQUARE (Modern):
  🌺  .  🌺  .  🌺
  .   🌺  .  🌺  .
  🌺  .  🌺  .  🌺  ← Geometric grid
  ┌─────────────┐
  │   SQUARE    │
  └─────────────┘
```

---

## 📝 TEXT/UCAPAN CUSTOMIZATION

### Text Input Specifications
- **Max Characters:** 200 characters
- **Font Options:** 
  - Arial
  - Georgia
  - Brush Script
  - Comic Sans
  - Times New Roman
  - Montserrat
  - Playfair Display
  
- **Font Size:** 16px - 72px (slider)
- **Font Color:** Color picker
- **Text Position:** 
  - Top (30px from top)
  - Center (middle of canvas)
  - Bottom (30px from bottom)
  
- **Font Weight:** Normal / Bold
- **Opacity:** 0 - 100%

---

## 💾 DOWNLOAD FEATURE

### Export Specifications
- **Format:** PNG / JPG
- **Resolution:** 1920x1920px (high quality)
- **Background:** Transparent (PNG) / White (JPG)
- **File Naming:** `bucket_design_[timestamp].png` atau `.jpg`
- **Method:** html2canvas + trigger download

### Download Flow
```
User clicks "Download PNG/JPG"
  ↓
Select format (PNG or JPG)
  ↓
Render canvas at high resolution
  ↓
Generate image blob
  ↓
Trigger browser download
  ↓
Success message / completion
```

---

## 🪣 BUCKET TEMPLATE ASSETS

### Bucket SVG/Images Required

Each bucket template needs visual assets for UI display:

```
/public/images/buckets/
├── classic_trapezoid.svg
│  └─ Preview image untuk template selection (300x400px)
│  └─ Show empty bucket dengan wrapper default
│
├── elegant_cylinder.svg
│  └─ Preview image untuk template selection
│
├── romantic_bowl.svg
│  └─ Preview image untuk template selection
│
└── square_modern.svg
   └─ Preview image untuk template selection
```

### Creation Guidelines

**Bucket SVG Specifications:**
- **Dimensions:** 300x400px (square canvas, center bucket)
- **Format:** SVG (scalable, lightweight)
- **Style:** Flat or 3D minimal style (match landing page aesthetic)
- **Colors:** 
  - Use brown/cream palette from design system
  - Fill: #8B5A3C (primary) or #D2B48C (kraft)
  - Stroke: #704214 (dark brown)
  - Wrapper: Light taupe/brown
- **Elements to show:**
  - Bucket shape silhouette
  - Wrapper paper wrapped around
  - Ribbon/bow at bottom
  - Optional: 2-3 sample flowers to show arrangement style

### Rendering in Canvas

When drawing bucket in canvas during design:

```javascript
const drawBucketShape = (ctx, shape, dimensions) => {
  ctx.fillStyle = '#8B5A3C';
  ctx.strokeStyle = '#704214';
  ctx.lineWidth = 2;
  
  switch(shape) {
    case 'trapezoid':
      // Wider at top, narrower at bottom
      ctx.beginPath();
      ctx.moveTo(
        canvas.width/2 - dimensions.mouthWidth/2,
        250 - dimensions.mouthHeight/2
      );
      ctx.lineTo(
        canvas.width/2 + dimensions.mouthWidth/2,
        250 - dimensions.mouthHeight/2
      );
      ctx.lineTo(
        canvas.width/2 + dimensions.bottomWidth/2,
        250 + dimensions.bucketHeight/2
      );
      ctx.lineTo(
        canvas.width/2 - dimensions.bottomWidth/2,
        250 + dimensions.bucketHeight/2
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
      
    case 'cylinder':
      // Circular shape
      const radius = dimensions.diameter / 2;
      ctx.fillRect(
        canvas.width/2 - radius,
        250 - dimensions.height/2,
        dimensions.diameter,
        dimensions.height
      );
      break;
      
    case 'bowl':
      // Curved bowl shape
      ctx.beginPath();
      ctx.arc(canvas.width/2, 250, dimensions.mouthWidth/2, Math.PI, 0);
      ctx.lineTo(
        canvas.width/2 + dimensions.bottomWidth/2,
        250 + dimensions.bucketHeight
      );
      ctx.lineTo(
        canvas.width/2 - dimensions.bottomWidth/2,
        250 + dimensions.bucketHeight
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
      
    case 'square':
      // Square/rectangular shape
      ctx.fillRect(
        canvas.width/2 - dimensions.width/2,
        250 - dimensions.height/2,
        dimensions.width,
        dimensions.height
      );
      break;
  }
};
```

---

## 🌺 FLOWER IMAGE ACQUISITION & PREPARATION

### Image Source Options

#### Option 1: Free Stock Photo Sites (Recommended)
- **Unsplash** (unsplash.com)
  - Search: "flower with stem", "rose stem leaves"
  - High quality, no attribution required
  
- **Pexels** (pexels.com)
  - Search: "botanical flower", "cut flower stem"
  - Free, high-res images
  
- **Pixabay** (pixabay.com)
  - Search: "flower bouquet stem"
  - Diverse flower types available
  
- **Freepik** (freepik.com)
  - Search: "flower with stem illustration"
  - Both realistic & artistic styles

#### Option 2: Edit/Process Photos
1. Download high-quality flower image
2. Use remove.bg (remove.bg API) untuk remove background
3. Convert ke PNG format
4. Crop & standardize dimensions (~500px height)
5. Save ke `/public/images/flowers/`

#### Option 3: AI Generated Images (For Consistency)
**Midjourney Prompt Template:**
```
watercolor flower with long green stem and leaves, 
botanical illustration, isolated on transparent background, 
high resolution, detailed, PNG format
--style: {style_preference}
--no: background, watermark
```

**DALL-E 3 Prompt Template:**
```
Realistic botanical illustration of a [FLOWER_NAME] with 
long green stem and 3-4 leaves, transparent background, 
PNG format, white petals/[COLOR], professional quality
```

### Image Processing Workflow

```
1. Collect 30 flowers (various types & colors)
   ├── 6-7 rose variations (red, pink, white, orange, peach, etc)
   ├── 3-4 tulip variations
   ├── 2-3 lily variations
   ├── 2-3 hydrangea variations
   ├── Sunflower, Chrysanthemum, Iris, Lavender, Orchid
   ├── Gerbera, Ranunculus, Protea, Baby's Breath, Calla Lily
   └── Foxglove, Daffodil, Freesia, Gladiolus, Hibiscus, Zinnia, etc

2. Background Removal
   ├── Use remove.bg online tool (simple one-click)
   ├── Or Photoshop > Select Subject > Delete background
   └── Ensure clean transparent PNG

3. Standardization
   ├── Resize height to ~500px (maintain aspect ratio)
   ├── Center flower horizontally
   ├── Position stem anchor at bottom center
   └── Verify transparent background (check on dark BG)

4. Export & Organize
   ├── Format: PNG with transparency
   ├── Naming: `{flower_type}_{color}_{variant}.png`
   ├── Save to: `/public/images/flowers/`
   └── Example: `rose_red_01.png`, `tulip_yellow_02.png`

5. Quality Check
   ├── No artifacts at edges
   ├── Stem centered at bottom
   ├── Leaves visible & clear
   ├── Consistent lighting/style across all images
   └── No watermarks or branding
```

### Recommended 30 Flowers List

| No | Flower Type | Color | Image Filename |
|----|-------------|-------|-----------------|
| 1 | Rose | Red | rose_red.png |
| 2 | Rose | Pink | rose_pink.png |
| 3 | Rose | White | rose_white.png |
| 4 | Rose | Peach | rose_peach.png |
| 5 | Rose | Orange | rose_orange.png |
| 6 | Rose | Yellow | rose_yellow.png |
| 7 | Rose | Cream | rose_cream.png |
| 8 | Tulip | Red | tulip_red.png |
| 9 | Tulip | Yellow | tulip_yellow.png |
| 10 | Tulip | Pink | tulip_pink.png |
| 11 | Tulip | Purple | tulip_purple.png |
| 12 | Lily | White | lily_white.png |
| 13 | Lily | Pink | lily_pink.png |
| 14 | Lily | Orange | lily_orange.png |
| 15 | Hydrangea | Blue | hydrangea_blue.png |
| 16 | Hydrangea | Pink | hydrangea_pink.png |
| 17 | Hydrangea | Purple | hydrangea_purple.png |
| 18 | Sunflower | Yellow | sunflower.png |
| 19 | Chrysanthemum | White | chrysanthemum_white.png |
| 20 | Chrysanthemum | Yellow | chrysanthemum_yellow.png |
| 21 | Iris | Purple | iris_purple.png |
| 22 | Lavender | Purple | lavender.png |
| 23 | Orchid | Pink | orchid_pink.png |
| 24 | Gerbera | Red | gerbera_red.png |
| 25 | Ranunculus | Pink | ranunculus_pink.png |
| 26 | Protea | Pink | protea_pink.png |
| 27 | Baby's Breath | White | babysbreath_white.png |
| 28 | Calla Lily | White | calla_white.png |
| 29 | Foxglove | Purple | foxglove.png |
| 30 | Dahlia | Orange | dahlia_orange.png |

---

## 🏗️ PROJECT PHASES

### PHASE 1: MVP (2-3 weeks)
- ✅ Step 1-2: Size & Wrapper selection
- ✅ Step 3: Flower gallery + selection
- ✅ Step 4: 2D Preview (Canvas)
- ✅ Step 5: Text customization (basic)
- ✅ Step 6: PNG download

### PHASE 2: Enhancement (1-2 weeks)
- ✅ JPG download option
- ✅ Reset/Clear design button
- ✅ Pre-made bucket templates
- ✅ More flower options (50+)
- ✅ Undo/Redo functionality

### PHASE 3: Advanced (Future)
- ⭕ 3D Preview (Three.js)
- ⭕ User accounts / Save designs
- ⭕ Share design via link
- ⭕ AI-powered recommendations
- ⭕ E-commerce integration
- ⭕ Payment gateway
- ⭕ Order management

---

## 📁 PROJECT STRUCTURE

```
bucket-bunga-app/
├── public/
│   └── images/
│       └── flowers/
│           ├── rose_red.png
│           ├── rose_pink.png
│           ├── tulip_red.png
│           └── ... (30 flower images)
│
├── src/
│   ├── components/
│   │   ├── StepSize.jsx
│   │   ├── StepWrapper.jsx
│   │   ├── StepFlowers.jsx
│   │   ├── StepPreview.jsx
│   │   ├── StepText.jsx
│   │   ├── BucketCanvas.jsx
│   │   └── DownloadModal.jsx
│   │
│   ├── data/
│   │   ├── buckets.js
│   │   ├── wrappers.js
│   │   └── flowers.js
│   │
│   ├── hooks/
│   │   ├── useDesignState.js
│   │   └── useCanvasRender.js
│   │
│   ├── utils/
│   │   ├── canvasUtils.js
│   │   ├── downloadUtils.js
│   │   └── imageUtils.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   │
│   ├── App.jsx
│   └── index.js
│
├── package.json
└── README.md
```

---

## 🎯 UI/UX REQUIREMENTS & DESIGN SYSTEM

### Overall Design Direction
- **Aesthetic:** Luxury, minimalist, elegant, nature-inspired
- **Inspiration:** Hasform, premium flower brands
- **Mood:** Sophisticated, thoughtful, premium feel

### Color System

**Primary Palette (from Landing Page):**
```
Brown/Terracotta:
├─ Main: #8B5A3C (primary action, hover states)
├─ Dark: #704214 (text on light backgrounds)
├─ Light: #A0684C (gradients, accents)
└─ Usage: Primary UI, buttons, links

Cream/Warm Accent:
├─ Wheat: #F5DEB3 (text on brown, highlights)
├─ Off-white: #FFFFFF (content backgrounds, text)
└─ Usage: Contrast, readability, accents

Flower/Soft Colors:
├─ Soft Pink: #FFB6D9 (secondary elements)
├─ Blush: #FFC0CB (highlights, subtle backgrounds)
├─ Gold: #B8860B (small accents, metadata)
└─ Usage: Flower elements, delicate accents

Neutral Gray (Designer Page):
├─ Light Gray: #F5F5F5 (left panel background)
├─ Medium Gray: #E0E0E0 (borders, disabled)
├─ Dark Gray: #666666 (secondary text)
└─ Usage: Form backgrounds, borders, helper text
```

**Semantic Colors:**
```
Success: #4CAF50 (download complete, confirmations)
Warning: #FF9800 (max flowers reached, limits)
Error: #F44336 (invalid input, failures)
Info: #2196F3 (help text, tips)
```

### Typography System

**Font Stack:**
```
Primary: Montserrat, Poppins, Segoe UI, sans-serif
Secondary: Georgia, Playfair Display (luxury headings - optional)
Mono: 'Courier New', monospace (code, technical text)
Fallback: -apple-system, BlinkMacSystemFont, system-ui
```

**Font Scale:**
```
Hero Title:     56px, weight 700, letter-spacing 1px
Main Heading:   32px, weight 600, letter-spacing 0.5px
Section Head:   24px, weight 600
Subheading:     18px, weight 500
Body Text:      16px, weight 400, line-height 1.6
Small Text:     14px, weight 400
Caption:        12px, weight 400, color secondary
```

**Font Weights:**
```
├─ 400: Regular body text
├─ 500: Subheadings, labels
├─ 600: Headings, strong emphasis
└─ 700: Hero/main titles
```

### Spacing & Layout

**Spacing Scale (8px base):**
```
xs:   4px   (micro)
sm:   8px   (small)
md:   16px  (default)
lg:   24px  (medium)
xl:   32px  (large)
2xl:  48px  (extra large)
3xl:  64px  (section spacing)
```

**Border Radius:**
```
sm:    4px   (small elements, cards)
md:    8px   (standard elements)
lg:    12px  (large cards, containers)
full:  9999px (circles, pills)
```

**Shadow Elevation:**
```
sm:    0 1px 2px rgba(0,0,0,0.05)
md:    0 4px 6px rgba(0,0,0,0.1)
lg:    0 10px 20px rgba(0,0,0,0.15)
xl:    0 20px 40px rgba(0,0,0,0.2)
```

### Component Library

**Button Styles:**
```
Primary (CTA):
├─ Background: #8B5A3C
├─ Text: #FFFFFF
├─ Padding: 14px 32px
├─ Font: 13px, weight 600, uppercase, letter-spacing 1px
├─ Border-radius: 4px
├─ Hover: Background #A0684C, translate 2px right
└─ Active: scale(0.98)

Secondary (Alternative):
├─ Background: #F5F5F5
├─ Text: #8B5A3C
├─ Border: 1px solid #D0D0D0
├─ Padding: 12px 24px
├─ Hover: Background #F0F0F0
└─ Active: scale(0.98)

Ghost (Tertiary):
├─ Background: transparent
├─ Text: #8B5A3C
├─ Border: 1px solid #8B5A3C
├─ Hover: Background rgba(139,90,60,0.05)
└─ Active: Background rgba(139,90,60,0.1)

Disabled (Any style):
├─ Opacity: 0.5
├─ Cursor: not-allowed
└─ Pointer-events: none
```

**Input Fields:**
```
Text Input / Textarea:
├─ Background: #FFFFFF
├─ Border: 1px solid #D0D0D0
├─ Border-radius: 4px
├─ Padding: 12px 16px
├─ Font: 14px
├─ Focus: Border-color #8B5A3C, box-shadow 0 0 0 2px rgba(139,90,60,0.1)
├─ Placeholder: Color #999999, opacity 0.6
└─ Height: 44px (form elements, touch-friendly)

Select Dropdown:
├─ Same as text input
├─ Padding-right: 32px (for dropdown arrow)
└─ Arrow icon: Right side, color #666

Color Picker:
├─ 12x12px swatch indicator
├─ Border: 1px solid #D0D0D0
└─ Click to open browser color picker

Slider/Range:
├─ Track: Height 4px, background #D0D0D0
├─ Thumb: 18px diameter, background #8B5A3C, border none
├─ Filled track: Background #8B5A3C
└─ Focus: Thumb scale(1.1)
```

**Cards & Containers:**
```
Card (elevated):
├─ Background: #FFFFFF
├─ Border: 1px solid #E0E0E0
├─ Border-radius: 8px
├─ Padding: 16px
├─ Box-shadow: md (0 4px 6px rgba(0,0,0,0.1))
└─ Hover: Shadow lg

Container (panel):
├─ Background: #F5F5F5
├─ Border: none
├─ Border-radius: 0
├─ Padding: 20px
└─ Responsive: Padding reduced on mobile

Badge/Tag:
├─ Background: rgba(139,90,60,0.1)
├─ Text: #8B5A3C, weight 500
├─ Border-radius: 12px
├─ Padding: 4px 8px
├─ Font-size: 12px
└─ Removable: ✕ icon on right
```

**Forms & Groups:**
```
Form Group:
├─ Margin-bottom: 16px
├─ Layout: Label on top, input below

Label:
├─ Font-size: 13px
├─ Weight: 500
├─ Color: #333333
├─ Margin-bottom: 6px
├─ Required indicator: * in red

Radio/Checkbox:
├─ Size: 18x18px
├─ Checked: Background #8B5A3C
├─ Border: 2px solid #D0D0D0
├─ Focus: Ring 2px solid #8B5A3C
└─ Margin-right: 8px

Error State:
├─ Border-color: #F44336
├─ Helper text: Color #F44336, font-size 12px
├─ Icon: ⚠ warning icon
└─ Margin-top: 4px
```

**Grid Layouts:**
```
Flower Grid (Step 3):
├─ Desktop: 4-5 columns
├─ Tablet: 3 columns
├─ Mobile: 2 columns
├─ Gap: 12px
└─ Item aspect ratio: 1:1 (square)

Form Grid (Designer page):
├─ Left panel: 1 column (always)
├─ Right panel: 1 column (canvas centered)
└─ Gap: 20-30px
```

### Key UI Elements
1. **Progress Indicator:** Step dots or numbered stepper (1/6)
2. **Next/Back Buttons:** Navigation between steps
3. **Preview Canvas:** Live preview of bucket (800x800px centered)
4. **Flower Grid:** 30 flowers in clickable grid
5. **Text Editor Panel:** Form for text customization
6. **Download Button:** Prominent CTA button
7. **Sticky Navigation:** Top bar (landing + designer)
8. **Responsive Layout:** 2-column desktop, 1-column mobile

### Accessibility

**WCAG 2.1 AA Compliance:**
- ✅ Keyboard navigation support (Tab, Enter, Arrow keys)
- ✅ ARIA labels for interactive elements
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Alt text for all flower images & icons
- ✅ Focus indicators visible (ring style)
- ✅ Error messages descriptive & associated with inputs
- ✅ Form labels properly associated with inputs
- ✅ Skip navigation links
- ✅ Semantic HTML structure (button, input, label, etc)
- ✅ No auto-playing audio/video
- ✅ Readable font sizes (min 12px, ideally 14px+)
- ✅ Sufficient line-height (1.4-1.7)

---

## 💡 IMPLEMENTATION NOTES

### Canvas Rendering Tips
```javascript
// Main render function with flower stems
const renderBucket = (design) => {
  const canvas = document.getElementById('bucketCanvas');
  const ctx = canvas.getContext('2d');
  
  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. Draw bucket shape (based on size)
  drawBucketShape(ctx, design.bucketSize);
  
  // 3. Draw wrapper paper (with color/texture)
  drawWrapperPaper(ctx, design.wrapperType);
  
  // 4. Calculate bucket mouth position (top center of bucket)
  const bucketMouthX = canvas.width / 2;
  const bucketMouthY = 280; // Adjust based on bucket rendering
  
  // 5. Draw flowers with stems (from back to front - layering)
  // Sort by z-index untuk proper layering effect
  const sortedFlowers = design.selectedFlowers
    .sort((a, b) => a.zIndex - b.zIndex);
  
  sortedFlowers.forEach((flowerData, index) => {
    drawFlowerWithStem(
      ctx, 
      flowerData, 
      bucketMouthX, 
      bucketMouthY,
      index,
      sortedFlowers.length
    );
  });
  
  // 6. Draw text overlay (on top of everything)
  drawText(ctx, design.text);
};

// Dedicated flower rendering dengan stem
const drawFlowerWithStem = (ctx, flowerData, centerX, centerY, index, total) => {
  // Load flower image
  const flowerImage = new Image();
  flowerImage.src = flowerData.flower_url;
  
  flowerImage.onload = () => {
    // Circular distribution untuk natural bouquet arrangement
    const angle = (index / total) * Math.PI * 2; // 360 degree spread
    const radius = 70; // Distance dari center (mouth of bucket)
    
    // Calculate individual flower position
    const flowerX = centerX + Math.cos(angle) * radius;
    const flowerY = centerY;
    
    // Random slight rotation untuk natural look (±15 degrees)
    const randomRotation = (Math.random() - 0.5) * 0.3;
    
    // Random slight variations dalam stem angle
    const stemVariation = (Math.random() - 0.5) * 0.2;
    
    ctx.save();
    
    // Transform ke position
    ctx.translate(flowerX, flowerY);
    ctx.rotate(randomRotation + stemVariation);
    
    // Draw flower image (anchor dari bottom of stem ke position)
    // Image height = stem length, so flower head appears at top
    const displayHeight = 300; // Scaled height untuk display
    const displayWidth = (flowerImage.width / flowerImage.height) * displayHeight;
    
    ctx.drawImage(
      flowerImage,
      -displayWidth / 2,    // Center horizontally
      -displayHeight,       // Anchor dari bottom (stem base at 0,0)
      displayWidth,
      displayHeight
    );
    
    ctx.restore();
  };
};

// Bucket shape drawing
const drawBucketShape = (ctx, size) => {
  const bucketWidth = { small: 120, medium: 180, large: 240, xl: 300 }[size];
  const bucketHeight = { small: 140, medium: 200, large: 260, xl: 320 }[size];
  const centerX = ctx.canvas.width / 2;
  const centerY = 350;
  
  // Bucket trapezoid shape (wider at top, narrower at bottom)
  ctx.fillStyle = '#E8E8E8'; // Light gray bucket
  ctx.beginPath();
  
  // Top edge (wider)
  ctx.lineTo(centerX - bucketWidth/2, centerY - bucketHeight);
  // Right edge
  ctx.lineTo(centerX + bucketWidth/2, centerY - bucketHeight);
  // Bottom right (narrower)
  ctx.lineTo(centerX + bucketWidth/2.5, centerY);
  // Bottom left (narrower)
  ctx.lineTo(centerX - bucketWidth/2.5, centerY);
  
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.stroke();
};

// Wrapper paper texture/pattern
const drawWrapperPaper = (ctx, wrapperType) => {
  // Draw semi-transparent layer untuk paper effect
  const wrapperColors = {
    kraft: '#D2B48C',
    tissue_white: '#FFFFFF',
    tissue_pink: '#FFB6C1',
    glossy: '#F5F5F5',
    matte: '#E8E8E8',
    crinkle: '#FFD700'
  };
  
  ctx.fillStyle = wrapperColors[wrapperType];
  ctx.globalAlpha = 0.3; // Semi-transparent
  ctx.fillRect(ctx.canvas.width/2 - 120, 280 - 140, 240, 140);
  ctx.globalAlpha = 1; // Reset
};
```

### Image Export
```javascript
// Using html2canvas
const downloadDesign = async (format = 'png') => {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    backgroundColor: format === 'jpg' ? '#FFFFFF' : null
  });
  
  const link = document.createElement('a');
  link.href = canvas.toDataURL(`image/${format}`);
  link.download = `bucket_design_${Date.now()}.${format}`;
  link.click();
};
```

---

## 🔄 STATE MANAGEMENT FLOW

```
App (Global State via Zustand/Context)
├── bucketSize
├── wrapperType
├── selectedFlowers []
├── textContent
│   ├── content
│   ├── font
│   ├── size
│   ├── color
│   └── position
└── currentStep (1-6)

Selectors:
├── getBucketDimensions()
├── getWrapperColor()
├── getTotalFlowersCount()
└── getDesignPreview()
```

---

## 📐 BUCKET DESIGNER PAGE LAYOUT

### Overall Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ NAVIGATION BAR (Same as Landing)                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ STEP PANEL   │          PREVIEW CANVAS AREA                 │
│ (Left)       │          (Right - Main)                      │
│              │                                              │
│ ┌──────────┐ │ ┌────────────────────────────────────┐      │
│ │ Progress │ │ │                                    │      │
│ │ Indicator│ │ │                                    │      │
│ │          │ │ │      Live Preview                 │      │
│ │ Step 1/6 │ │ │      Canvas Area                  │      │
│ │          │ │ │      (800x800px)                  │      │
│ ├──────────┤ │ │                                    │      │
│ │          │ │ │      • Bucket background          │      │
│ │ [Form]   │ │ │      • Wrapper paper texture      │      │
│ │ Size     │ │ │      • Flower arrangement         │      │
│ │ Wrapper  │ │ │      • Text overlay               │      │
│ │ Flowers  │ │ │                                    │      │
│ │ Text     │ │ │                                    │      │
│ │          │ │ └────────────────────────────────────┘      │
│ │ [Buttons]│ │                                              │
│ │ Back Next│ │                                              │
│ └──────────┘ │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Left Panel - Step Form

**Width:** 300-350px (fixed or 25% flex)
**Background:** Light gray or white (#F5F5F5 or #FFFFFF)
**Padding:** 20px
**Overflow:** Scroll if needed

**Components Per Step:**

```
Step 1: Bucket Template Selection (NEW!)
├─ Title: "Choose Your Bucket Style"
├─ Description: "Select a bucket template that fits your vision"
├─ Grid (2x2) of bucket templates with preview images:
│  ├─ [Classic Trapezoid] 
│  │  └─ "Traditional, semi-sphere arrangement"
│  ├─ [Elegant Cylinder]
│  │  └─ "Modern, tall dome arrangement"
│  ├─ [Romantic Bowl]
│  │  └─ "Wide, super dense hemisphere"
│  └─ [Modern Square]
│     └─ "Contemporary, geometric arrangement"
└─ Bottom: [Next →]

Step 2: Bucket Size
├─ Title: "Choose Bucket Size"
├─ Description: "Select the size that fits your occasion"
├─ Radio Buttons / Cards (4 columns):
│  ├─ ○ Small (S)
│  ├─ ○ Medium (M) [default selected]
│  ├─ ○ Large (L)
│  └─ ○ XL
├─ Size preview: Show capacity ("20-25 flowers")
└─ Bottom: [← Back] [Next →]

Step 3: Wrapper Paper
├─ Title: "Choose Wrapper Paper"
├─ Description: "Select your preferred wrapper style"
├─ Grid (2-3 columns) of paper types with color preview:
│  ├─ [Kraft preview] Kraft Paper
│  ├─ [White preview] Tissue White
│  ├─ [Pink preview] Tissue Pink
│  ├─ [Glossy preview] Glossy
│  ├─ [Matte preview] Matte
│  └─ [Gold preview] Crinkle Paper
├─ Ribbon Style (Optional):
│  └─ Dropdown: [Striped (Default) ▼] or [Solid, Polka Dot, Plain]
└─ Bottom: [← Back] [Next →]

Step 4: Select Flowers
├─ Title: "Choose Flowers"
├─ Subtitle: "Flowers ({current}/{max} selected)"
│           └─ Max based on template + size
├─ Search/Filter: [🔍 Search by name or color]
├─ Grid (3-4 columns) of 30 flowers:
│  └─ [Flower thumbnail] Flower Name
│     └─ Click to add, + to increase qty
├─ Added flowers list (left side or summary):
│  ├─ Rose Red (×3) [- ][+] [✕]
│  ├─ Tulip Yellow (×2) [- ][+] [✕]
│  └─ etc.
├─ Capacity indicator:
│  └─ "20/25 flowers selected - Good density!"
└─ Bottom: [← Back] [Next →]

Step 5: Preview Bucket
├─ Title: "Preview Your Design"
├─ Message: "Your bucket looks amazing! ✨"
├─ Live Canvas:
│  └─ Full preview dengan semua elemen
├─ Adjustment buttons (in preview):
│  ├─ [⟲ Rotate view] (optional)
│  └─ [↻ Re-arrange] (shuffles flower positions)
├─ Tips:
│  └─ "Like it? Proceed to add text or download!"
└─ Bottom: [← Back] [Add Text] [Skip to Download]

Step 6: Add Text/Ucapan (Optional)
├─ Title: "Add Your Message"
├─ Toggle: [✓ Add text message] [Don't add]
├─ If toggled ON:
│  ├─ Input Field: [Text area - 200 char max]
│  │  └─ Character count: "120/200"
│  ├─ Font Selection:
│  │  ├─ Label: "Font"
│  │  └─ Dropdown: [Montserrat ▼]
│  ├─ Font Size:
│  │  ├─ Label: "Size"
│  │  └─ Slider: [■──────●] 32px
│  ├─ Font Weight:
│  │  ├─ Label: "Weight"
│  │  └─ Toggle: [○ Normal ● Bold]
│  ├─ Color:
│  │  ├─ Label: "Color"
│  │  └─ Color Picker + Quick palettes
│  ├─ Position:
│  │  ├─ Label: "Position"
│  │  └─ Radio: ○ Top  ○ Center  ● Bottom
│  └─ Opacity:
│     ├─ Label: "Opacity"
│     └─ Slider: [■──────●] 100%
└─ Bottom: [← Back] [Preview] [Download]

Step 7: Download
├─ Title: "Download Your Design"
├─ Preview: Mini preview of final design
├─ Format Selection:
│  ├─ ● PNG (Transparent background - recommended)
│  └─ ○ JPG (White background)
├─ File Details:
│  ├─ Filename: "bucket_design_2024_01_15.png"
│  ├─ Resolution: "1920x1920px"
│  └─ Quality: "High Quality"
├─ Action Buttons:
│  ├─ [⟲ Back to Edit]
│  ├─ [⬇ Download PNG] (Primary CTA)
│  ├─ [Share Design] (Secondary)
│  └─ [Start Over] (Tertiary)
└─ Success Message:
   └─ "✓ Downloading..." → "✓ Download Complete! Enjoy! 🎉"
```

### Right Panel - Preview Canvas

**Width:** Flex 1 / remaining space (min 400px)
**Height:** Full height (minus nav)
**Background:** #F0F0F0 or gradient (light)
**Content Area:** 800x800px centered white canvas

**Canvas Rendering:**
```
White Background (800x800px)
├─ Bucket Shape
│  ├─ Trapezoid form (wider at top)
│  ├─ Wrapper color fill
│  └─ Subtle shadow
├─ Flowers Layer
│  ├─ Arranged in circular pattern
│  ├─ Natural stem variations
│  ├─ Layered (z-index depth)
│  └─ Slight rotations for organic look
└─ Text Overlay
   ├─ Positioned based on selection
   ├─ Font/size/color as configured
   └─ Opacity overlay effect
```

**Real-time Updates:**
```
User changes:
├─ Size → Canvas updates (larger/smaller bucket)
├─ Wrapper → Bucket color changes
├─ Add flower → Flower appears instantly
├─ Font/color → Text updates live
└─ Position → Text moves on canvas
```

### Progress Indicator

**Type:** Step dots or numbered stepper
```
Option 1 - Dots (at top of left panel):
  ● ○ ○ ○ ○ ○
  1 2 3 4 5 6

Option 2 - Numbered (above title):
  Step 1 of 6

Option 3 - Visual bar:
  [████░░░░░░░░░░░░░░░░] 16% (1/6 Complete)
```

### Navigation Buttons

**Position:** Bottom of left panel (sticky)
```
Layout: Flexbox with space-between
├─ [← Back]           (Secondary button)
└─ [Next →]           (Primary button / CTA)

On Step 1:
├─ [← Back] (disabled/hidden)
└─ [Next →]

On Step 6 (Download):
├─ [← Back to Edit]
├─ [Download PNG]     (Primary)
└─ [Share Design]     (Secondary)
```

### Responsive Design

**Desktop (>1200px):**
```
├─ Left Panel: 320px fixed
├─ Canvas Area: Flexible, min 600px
└─ Gap: 30px padding
```

**Tablet (768px - 1200px):**
```
├─ Left Panel: 280px fixed
├─ Canvas: min 500px
└─ Gap: 20px
```

**Mobile (<768px):**
```
├─ Layout: Stacked vertically
├─ Left Panel: Full width, expandable section
├─ Canvas: Full width (800x800 or responsive fit)
├─ Step Indicator: Horizontal scrollable tabs
└─ Buttons: Full width stacked
```

---

## 📊 SUCCESS METRICS

- ✅ All 6 steps functional
- ✅ Real-time preview updates smoothly
- ✅ Download generates high-quality image
- ✅ Responsive on mobile/tablet
- ✅ Load time < 3 seconds
- ✅ No console errors

---

## 🎨 FLOWER ARRANGEMENT BEST PRACTICES

### Visual Principles for Beautiful Bouquets

**1. Circular Distribution Pattern**
```
User dapat menambah bunga satu-satu, dan sistem auto-arrange dalam circular pattern:
- Bunga pertama: Center (angle 0)
- Bunga kedua: 180° berlawanan (angle π)
- Bunga ketiga: Atas (angle -π/2)
- Dst: Tersebar merata dalam 360°
```

**2. Layering Strategy (Z-Index)**
```
Flowers added later = appears on top (higher zIndex)
Ini memberikan depth dan natural look
Contoh: Jika user add 5 bunga:
  Flower 1 → zIndex 1 (di belakang)
  Flower 2 → zIndex 2
  Flower 3 → zIndex 3
  Flower 4 → zIndex 4
  Flower 5 → zIndex 5 (di depan)
```

**3. Natural Variation**
```javascript
// Setiap bunga dapat:
- Random rotation: ±15 degrees untuk tidak terlihat rigid
- Stem variation: ±10 degrees untuk stem angle diversity
- Radius variation: ±10% dari radius untuk depth effect
- Opacity variation: Optional, untuk behind-flowers look slightly faded
```

**4. Optimal Packing**
```
Small bucket:   Max 10-15 flowers
Medium bucket:  Max 20-25 flowers
Large bucket:   Max 30-40 flowers
XL bucket:      Max 40-50 flowers

Terlalu banyak = terlihat berantakan
Terlalu sedikit = kosong/sparse
```

**5. Color Harmony Tips** (Optional UI Guidance)
```
Recommended combinations:
- Monochromatic: Semua shade dari 1 warna (semua red roses)
- Analogous: Warna-warna yang berdekatan (red + pink + orange)
- Complementary: Warna berlawanan (pink + yellow)
- Triadic: 3 warna berbeda dengan spacing baik (red + yellow + purple)
```

### User Interaction Guidelines

**Flower Selection**
```
User dapat:
1. Click bunga berkali-kali untuk add multiple dari tipe yang sama
2. Drag ke preview area untuk instant preview
3. Double-click untuk remove yang terakhir ditambahkan
4. Reset design untuk mulai baru
5. Lihat total flower count di preview
```

**Real-time Feedback**
```
Saat user menambah bunga:
- Preview update instant (React state change)
- Show flower count: "5/25 flowers"
- Show warning jika sudah max capacity
- Auto-highlight newest flower
```

---

## 🚀 DEPLOYMENT

### Hosting Options
- **Vercel** (recommended for Next.js)
- **Netlify** (for React + static hosting)
- **Heroku** (if backend needed)

### Environment Variables
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_IMAGE_CDN=https://cdn.example.com
```

---

## 📝 NOTES & FUTURE CONSIDERATIONS

### Implementation Notes

1. **Flower Images Specifications:**
   - Format: PNG dengan transparent background
   - Height: ~500px (width auto maintain aspect ratio)
   - Includes: Flower head + green stem + 2-4 leaves
   - Quality: High-res, clear, realistic/botanical illustration style
   - Optimization: Use ImageOptim atau TinyPNG untuk minimize file size
   - CDN: Consider lazy-loading atau progressive image loading

2. **Performance Optimization:**
   - Pre-load flower images on page start
   - Debounce canvas renders (max 60fps)
   - Implement RequestAnimationFrame untuk smooth animations
   - Cache rendered canvas untuk export process
   - Limit concurrent image loads (max 3-4 simultaneous)

3. **Browser Compatibility:**
   - Chrome 90+ (recommended)
   - Firefox 88+
   - Safari 14+
   - Edge 90+
   - Mobile: iOS Safari, Chrome Mobile
   - Fallback: Show static preview jika canvas tidak support

4. **Accessibility:**
   - ARIA labels untuk flower selection buttons
   - Keyboard navigation (Tab, Enter, Arrow keys)
   - Color-blind friendly: Use icons/labels in addition to colors
   - Alt text untuk semua flower images
   - Text contrast minimum WCAG AA standard

5. **Data Validation:**
   - Max flowers per bucket (sesuai size)
   - Validate flower_id sebelum render
   - Sanitize text input (prevent XSS)
   - Validate download format (PNG/JPG only)

### Quality Assurance Checklist

- [ ] All 30 flowers display correctly dengan stem terlihat
- [ ] Bucket shape akurat sesuai size selection
- [ ] Wrapper paper color/texture visible
- [ ] Text overlay readable di atas bunga
- [ ] Download PNG/JPG high-quality (1920x1920px)
- [ ] Mobile responsive (tablet & phone)
- [ ] Canvas rendering smooth (60fps)
- [ ] No console errors/warnings
- [ ] Load time < 3 detik

### Future Enhancements (Phase 2-3)

1. **3D Preview** (Three.js integration)
   - 360° rotating view
   - Realistic lighting
   - Shadow effects
   - Better depth perception

2. **User Accounts**
   - Save designs untuk diakses nanti
   - Share design via shareable link
   - Favorites/bookmark favorites flowers
   - Design history

3. **AI Features**
   - Auto-recommend flower combination
   - Color harmony checker
   - Generate complementary designs
   - Style suggestions (romantic, festive, elegant, etc)

4. **E-Commerce Integration**
   - Add to cart (tangkai bunga actual products)
   - Calculate actual cost
   - Checkout integration
   - Order tracking

5. **Advanced Customization**
   - Flower color variation (setiap flower beda shade)
   - Stem length adjustment
   - Custom wrapper sizes
   - Ribbon/decoration options
   - Add baby's breath filler flowers

6. **Social & Sharing**
   - Share design ke Instagram/Facebook
   - Create invite cards (design + personal message)
   - Gift certificate generation
   - Recommend to friends feature

### Monetization Strategy (Future)

```
Free Features (MVP):
- Design 30 flowers basic bouquet
- Download PNG
- Basic text customization

Premium Features (Phase 2):
+ Premium flower packs (50+ additional flowers)
+ Advanced text customization (50+ fonts)
+ 3D preview
+ Save & restore designs
+ Share designs publicly
+ Download high-res JPG

Pro/Business Features (Phase 3):
+ Print-on-demand integration
+ E-commerce product catalog
+ Subscription monthly/yearly
+ API access untuk partner florists
+ White-label solution
```

---

## 🔄 ADAPTIVE BUCKET SYSTEM - HOW IT WORKS

### End-to-End Flow

```
User Interaction Sequence:

STEP 1: TEMPLATE SELECTION
├─ User sees 4 bucket template options with preview images
├─ Each template shows:
│  ├─ Template name
│  ├─ Visual preview (SVG image)
│  ├─ Description (arrangement style)
│  └─ Icon (trapezoid, cylinder, bowl, square)
├─ User clicks one template → Template ID stored in state
└─ System loads arrangement rules for selected template

STEP 2: SIZE SELECTION
├─ Based on selected template, show available sizes
├─ Each size shows:
│  ├─ Size label (S/M/L/XL)
│  ├─ Dimensions in cm
│  ├─ Capacity (number of flowers)
│  └─ Visual preview of size difference
├─ User selects size → Size stored + dimensions loaded
└─ Canvas updates with new bucket size

STEP 3: WRAPPER SELECTION
├─ Wrapper options remain same for all templates
├─ User selects wrapper type
├─ Preview updates with wrapper color
└─ Arrangement not affected by wrapper (only visual)

STEP 4: FLOWER SELECTION
├─ System shows flower grid (same 30 flowers for all)
├─ User can add flowers (click + to increase qty)
├─ Real-time validation:
│  ├─ Check if flower count < max capacity
│  ├─ Warn if approaching max
│  ├─ Prevent adding beyond max
├─ Each flower click triggers:
│  └─ Canvas re-renders with adaptive arrangement
└─ Arrangement automatically positions based on:
    ├─ Template shape (trapezoid/cylinder/bowl/square)
    ├─ Template arrangement rules (layers, overlap, density)
    ├─ Size dimensions (mouth width/height, bucket height)
    └─ Total flower count & their order

STEP 5: PREVIEW
├─ Show final arrangement without text
├─ Button to re-shuffle arrangement (re-randomizes positions)
└─ User can go back to adjust flowers if desired

STEP 6: TEXT CUSTOMIZATION (Optional)
├─ User can add message
├─ Customize font, size, color, position
├─ Live preview updates with text overlay
└─ Or skip to download without text

STEP 7: DOWNLOAD
├─ User selects PNG or JPG format
├─ System generates high-res image (1920x1920px)
├─ Image includes:
│  ├─ Bucket with flowers arranged
│  ├─ Text overlay (if added)
│  ├─ Wrapper & ribbon
│  └─ Background (transparent for PNG, white for JPG)
└─ Download triggered with auto-filename

Result: User gets beautifully arranged bucket matching their template!
```

### State Management

```javascript
// Global design state
{
  bucketTemplate: {
    id: "classic_trapezoid",
    name: "Classic Trapezoid",
    shape: "trapezoid",
    arrangementRules: {...}
  },
  
  bucketSize: {
    id: "medium",
    dimensions: {
      mouthWidth: 260,
      mouthHeight: 100,
      bottomWidth: 140,
      bucketHeight: 180,
      capacity: 20
    }
  },
  
  wrapperType: {
    id: "kraft",
    color: "#D2B48C"
  },
  
  selectedFlowers: [
    { id: "rose_red", qty: 3, positions: {...} },
    { id: "tulip_yellow", qty: 2, positions: {...} },
    ...
  ],
  
  text: {
    content: "Happy Birthday!",
    font: "Montserrat",
    size: 32,
    color: "#000000",
    position: "bottom"
  }
}

// When any state changes → Canvas re-renders using:
// 1. bucketTemplate.arrangementRules (how to arrange)
// 2. bucketSize.dimensions (space available)
// 3. selectedFlowers (what to arrange)
```

### Rendering Pipeline

```
State Change
    ↓
Validate input (flower count < capacity)
    ↓
Calculate positions using template algorithm
    ↓
Sort flowers by z-index (layering)
    ↓
Render on canvas:
  1. Draw bucket shape (based on template.shape & size.dimensions)
  2. Draw wrapper paper (based on wrapper.color)
  3. Draw flowers (using arrangement positions from step above)
  4. Draw text overlay (if present)
    ↓
Display on screen (real-time preview)
```

---

## 🎯 INTEGRATION SUMMARY

### What This Spec Includes

This comprehensive specification document covers:

✅ **Landing Page Design**
- Complete mockup with hero section
- Navigation structure
- Color palette & typography
- Responsive breakpoints
- Interactive elements & animations

✅ **Bucket Designer Application**
- 6-step wizard flow
- Left panel form layout
- Right panel live preview canvas
- Real-time rendering specifications
- Full data structure definitions

✅ **Visual Design System**
- Complete color system (primary, secondary, semantic)
- Typography scale & font stack
- Spacing & layout system
- Component library (buttons, inputs, cards, etc)
- Accessibility standards

✅ **Technical Implementation**
- Backend data models (bucket sizes, wrappers, flowers)
- Frontend state management structure
- Canvas rendering algorithms (code examples)
- Image processing workflow
- Download/export functionality

✅ **Flower Management**
- 30 flower database schema
- Image acquisition guide (free sources + AI generation)
- Image processing workflow
- Storage organization

✅ **Project Architecture**
- Page structure & routing
- Component organization
- File structure template
- Technology stack recommendations

✅ **Quality Assurance**
- Testing checklist
- Performance metrics
- Accessibility compliance (WCAG 2.1 AA)
- Browser compatibility

✅ **Future Roadmap**
- Phase 2 enhancements (3D, accounts, AI)
- Phase 3+ features (e-commerce, API)
- Monetization strategy

### How to Use This Document

**For Frontend Developer:**
1. Start with WEBSITE ARCHITECTURE
2. Review LANDING PAGE DESIGN SPECIFICATION
3. Study BUCKET DESIGNER PAGE LAYOUT
4. Implement components using COMPONENT LIBRARY section
5. Follow CANVAS RENDERING TIPS for preview logic

**For Backend Developer:**
1. Review DATA STRUCTURE (sections 1-4)
2. Implement flower database & APIs
3. Set up image serving (CDN/storage)
4. Build export/download endpoints

**For Designer:**
1. Use COLOR SYSTEM and TYPOGRAPHY as design tokens
2. Reference LANDING PAGE DESIGN for visual direction
3. Use COMPONENT LIBRARY for UI kit
4. Follow RESPONSIVE DESIGN breakpoints

**For Project Manager:**
1. Review WEBSITE ARCHITECTURE for overview
2. Check PROJECT PHASES for timeline
3. Use SUCCESS METRICS for acceptance criteria
4. Reference QUALITY ASSURANCE CHECKLIST for testing

### Next Steps After Approval

1. **Setup Project Repository**
   ```bash
   git init bucket-bunga-app
   npm create vite@latest . -- --template react
   npm install
   ```

2. **Acquire Flower Images**
   - Use recommended sources (Unsplash, Pexels, etc)
   - Or generate with AI (Midjourney/DALL-E)
   - Process images (remove bg, standardize)
   - Organize in `/public/images/flowers/`

3. **Build Component Library**
   - Create folder structure as per specification
   - Build reusable components
   - Implement design tokens (CSS variables)

4. **Develop Landing Page**
   - Hero section
   - Navigation
   - Feature showcase
   - Footer

5. **Develop Bucket Designer**
   - 6-step form flow
   - Canvas rendering engine
   - Text customization
   - Download functionality

6. **Testing & QA**
   - Unit tests for components
   - Integration tests for flow
   - E2E tests for full user journey
   - Accessibility audit
   - Performance testing

7. **Deployment**
   - Setup hosting (Vercel/Netlify)
   - Configure domain
   - Setup CDN for images
   - Monitor performance

---

## 📊 FILE STRUCTURE (COMPLETE)

```
bucket-bunga-app/
├── public/
│   ├── images/
│   │   ├── flowers/
│   │   │   ├── rose_red.png
│   │   │   ├── rose_pink.png
│   │   │   ├── rose_white.png
│   │   │   ├── tulip_red.png
│   │   │   ├── tulip_yellow.png
│   │   │   ├── lily_white.png
│   │   │   ├── lily_pink.png
│   │   │   ├── sunflower.png
│   │   │   ├── hydrangea_blue.png
│   │   │   ├── hydrangea_pink.png
│   │   │   ├── carnation_red.png
│   │   │   ├── chrysanthemum_white.png
│   │   │   ├── chrysanthemum_yellow.png
│   │   │   ├── iris_purple.png
│   │   │   ├── lavender.png
│   │   │   ├── orchid_pink.png
│   │   │   ├── gerbera_red.png
│   │   │   ├── ranunculus_pink.png
│   │   │   ├── protea_pink.png
│   │   │   ├── babysbreath_white.png
│   │   │   ├── calla_white.png
│   │   │   ├── dahlia_orange.png
│   │   │   ├── foxglove_purple.png
│   │   │   ├── peony_pink.png
│   │   │   ├── daffodil_yellow.png
│   │   │   ├── freesia.png
│   │   │   ├── gladiolus_pink.png
│   │   │   ├── hibiscus_red.png
│   │   │   └── zinnia_orange.png
│   │   └── icons/
│   │       └── [favicon, logos]
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── Landing/
│   │   │   ├── Hero.jsx
│   │   │   ├── Showcase.jsx
│   │   │   └── CTA.jsx
│   │   │
│   │   ├── Designer/
│   │   │   ├── DesignerLayout.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── NavigationButtons.jsx
│   │   │   └── PreviewCanvas.jsx
│   │   │
│   │   ├── Steps/
│   │   │   ├── StepSize.jsx
│   │   │   ├── StepWrapper.jsx
│   │   │   ├── StepFlowers.jsx
│   │   │   ├── StepPreview.jsx
│   │   │   ├── StepText.jsx
│   │   │   └─ StepDownload.jsx
│   │   │
│   │   ├── UI/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Grid.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── ColorPicker.jsx
│   │   │   ├── Slider.jsx
│   │   │   └── FormGroup.jsx
│   │   │
│   │   └── Common/
│   │       ├── FlowerGrid.jsx
│   │       ├── FlowerCard.jsx
│   │       ├── WrapperPreview.jsx
│   │       └── TextEditor.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx        (Landing page)
│   │   ├── Designer.jsx    (Main designer page)
│   │   └── NotFound.jsx
│   │
│   ├── data/
│   │   ├── bucketTemplates.js  (4 bucket templates: Trapezoid, Cylinder, Bowl, Square)
│   │   ├── bucketSizes.js      (Size definitions per template)
│   │   ├── wrappers.js         (Wrapper paper types)
│   │   ├── flowers.js          (30 flower database)
│   │   ├── fonts.js            (Font options)
│   │   ├── ribbonStyles.js     (Ribbon/bow styles)
│   │   └── colors.js           (Design system colors)
│   │
│   ├── hooks/
│   │   ├── useDesignState.js
│   │   ├── useCanvasRender.js
│   │   ├── useFlowerArrangement.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   ├── canvasUtils.js  (Drawing functions)
│   │   ├── downloadUtils.js (Export functions)
│   │   ├── imageUtils.js   (Image loading/processing)
│   │   ├── validationUtils.js
│   │   └── helpers.js      (General utilities)
│   │
│   ├── styles/
│   │   ├── globals.css     (Reset, variables)
│   │   ├── design-tokens.css (Color system)
│   │   ├── typography.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   └── responsive.css
│   │
│   ├── context/
│   │   ├── DesignContext.jsx (State management)
│   │   └── DesignProvider.jsx
│   │
│   ├── App.jsx
│   └── index.jsx
│
├── tests/
│   ├── components/
│   │   ├── Designer.test.jsx
│   │   └── Steps.test.jsx
│   ├── utils/
│   │   └── canvasUtils.test.js
│   └── integration/
│       └── userFlow.test.jsx
│
├── docs/
│   ├── PROJECT_BUCKET_BUNGA_PROMPT.md (This file)
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## 📞 QUESTIONS FOR CLARIFICATION

Before starting development, confirm:
1. **Framework:** React with Vite or Next.js?
2. **State Management:** Context API, Zustand, atau Redux?
3. **Styling:** Tailwind CSS, CSS Modules, atau CSS-in-JS?
4. **Flower Images:** Ready to source, atau user provides?
5. **User Accounts:** Needed for MVP, atau later phase?
6. **Save Designs:** Database storage atau client-side only?
7. **Deployment:** Preferred hosting platform?
8. **Timeline:** When needed? (Weeks/months)
9. **Team Size:** How many developers?
10. **Budget:** Any constraints on tools/services?

---

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Ready for Development - Complete Specification**

This is a **COMPLETE, PRODUCTION-READY SPECIFICATION** that includes:
- ✅ Landing page design mockup
- ✅ 6-step bucket designer flow
- ✅ Complete design system (colors, typography, components)
- ✅ Technical implementation details
- ✅ Data structures & algorithms
- ✅ Project architecture & file structure
- ✅ Flower database & image workflow
- ✅ Quality assurance & testing
- ✅ Future roadmap & monetization
- ✅ Deployment & integration guide
