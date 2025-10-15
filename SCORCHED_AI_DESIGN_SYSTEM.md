# 🔥 Scorched AI - Design System Documentation

## **Brand Overview**
**Scorched AI** is an AI showrunner platform that empowers actors with 60% content ownership. The brand embodies **rebellion against Hollywood bureaucracy** while maintaining **premium, cinematic quality**.

---

## **🎨 Color Palette**

### **Primary Colors**
- **Pitch Black** `#000000` - Main background, creates cinematic depth
- **Gold** `#e2c376` - Primary accent, represents premium quality and fire
- **Ember Red** `#D62828` - Secondary accent, represents rebellion and intensity
- **Molten Orange** `#FF6B00` - Tertiary accent, represents fire and energy

### **Semantic Colors**
- **Success/Positive** `#e2c376` (Gold)
- **Warning/Attention** `#FF6B00` (Molten Orange)
- **Error/Danger** `#D62828` (Ember Red)
- **Text Primary** `#FFFFFF` (White)
- **Text Secondary** `#E5E7EB` (Light Gray)
- **Text Tertiary** `#9CA3AF` (Medium Gray)

---

## **🔤 Typography**

### **Primary Font: League Spartan**
- **Font Family**: `League Spartan, sans-serif`
- **Weights Used**: 300, 400, 500, 600, 700, 800, 900
- **Characteristics**: Bold, geometric, commanding, premium feel

### **Typography Scale**
```css
/* Hero Headlines */
.elegant-fire {
  font-weight: 800;
  letter-spacing: 0.5px;
}

/* Text Hierarchy */
h1: 7xl-8xl (font-black) - Main brand name
h2: 4xl-6xl (font-black) - Section headlines  
h3: 6xl-7xl (font-black) - Subsection headlines
h4: 2xl-3xl (font-bold) - Card headlines
body: text-lg-xl (font-medium) - Main content
caption: text-sm (font-medium) - Supporting text
```

---

## **🎬 Visual Elements**

### **Fire Video Background**
- **File**: `public/fire_background.mp4`
- **Position**: Fixed, full viewport
- **Opacity**: 50% (`opacity: 0.5`)
- **Z-index**: -10 (behind all content)
- **Purpose**: Creates authentic cinematic atmosphere

### **Fire Gradient Text**
```css
.fire-gradient {
  background: linear-gradient(45deg, #D62828 0%, #FF6B00 25%, #e2c376 50%, #FF6B00 75%, #D62828 100%);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fireGlow 4s ease-in-out infinite;
}
```

### **Flame Text Effects**
```css
.flame-text {
  text-shadow: 0 0 12px rgba(226, 195, 118, 0.4), 0 0 24px rgba(255, 107, 0, 0.2);
}
```

---

## **🎯 Component Library**

### **Navigation Bar**
```css
nav {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur-xl;
  border-bottom: 1px solid rgba(255, 107, 0, 0.3);
}
```

### **Primary Buttons**
```css
.burn-button {
  background: linear-gradient(135deg, #D62828 0%, #FF6B00 50%, #e2c376 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.burn-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(214, 40, 40, 0.3);
}
```

### **Content Cards**
```css
.rebellious-card {
  background: linear-gradient(135deg, rgba(214, 40, 40, 0.08) 0%, rgba(46, 46, 46, 0.6) 100%);
  border: 1px solid rgba(226, 195, 118, 0.2);
  border-radius: 0.75rem;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}

.rebellious-card:hover {
  border-color: #e2c376;
  box-shadow: 0 8px 25px rgba(226, 195, 118, 0.15);
  transform: translateY(-3px);
}
```

---

## **📱 Layout & Spacing**

### **Container System**
- **Max Width**: `max-w-7xl` (80rem / 1280px)
- **Padding**: `px-6` (1.5rem horizontal)
- **Section Spacing**: `py-24` (6rem vertical)

### **Grid System**
- **Hero**: Full-width centered content
- **Cards**: `grid lg:grid-cols-2` or `grid lg:grid-cols-3`
- **Stats**: `grid md:grid-cols-3` for key metrics

### **Responsive Breakpoints**
- **Mobile**: `< 640px` - Single column, reduced spacing
- **Tablet**: `640px - 1024px` - Adjusted grids
- **Desktop**: `> 1024px` - Full layout with side-by-side content

---

## **🎭 Content Strategy**

### **Brand Voice**
- **Tone**: Rebellious, empowering, premium
- **Language**: Direct, bold, cinematic
- **Key Messages**: 
  - "Burn Hollywood. Ignite Your Empire."
  - "Empowerment, not replacement"
  - "60% actor ownership"

### **Content Hierarchy**
1. **Hero**: Brand name + tagline + primary CTA
2. **Problem**: Industry pain points with statistics
3. **Solution**: Platform benefits and features
4. **Process**: 4-step workflow explanation
5. **Team**: Founder credibility and story
6. **CTA**: Final conversion opportunity

---

## **🚀 Animation & Interactions**

### **Page Transitions**
```css
/* Framer Motion animations */
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
```

### **Hover Effects**
- **Cards**: Lift + glow effect
- **Buttons**: Scale + shadow enhancement
- **Links**: Color transitions
- **Navigation**: Smooth backdrop blur

### **Loading States**
- **Hero**: Fade in from bottom
- **Sections**: Staggered reveal on scroll
- **Cards**: Individual fade-in with delays

---

## **🔧 Technical Implementation**

### **Framework**
- **Next.js 14** with App Router
- **React 18** with hooks
- **Framer Motion** for animations
- **Tailwind CSS** for styling

### **Performance**
- **Video**: `preload="auto"` for immediate playback
- **Fonts**: Google Fonts with `display: swap`
- **Images**: Next.js Image optimization
- **Animations**: Hardware-accelerated transforms

### **Accessibility**
- **Color Contrast**: WCAG AA compliant
- **Focus States**: Visible focus indicators
- **Screen Readers**: Semantic HTML structure
- **Keyboard Navigation**: Full keyboard support

---

## **📋 Design Tokens**

### **Spacing Scale**
```css
/* Tailwind spacing system */
p-2: 0.5rem (8px)
p-4: 1rem (16px)  
p-6: 1.5rem (24px)
p-8: 2rem (32px)
p-12: 3rem (48px)
p-16: 4rem (64px)
p-24: 6rem (96px)
```

### **Border Radius**
```css
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
```

### **Shadows**
```css
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## **🎨 Future Design Considerations**

### **Potential Enhancements**
1. **Interactive Fire Effects**: Particle systems, flame physics
2. **3D Elements**: Depth, parallax, immersive experiences
3. **Custom Illustrations**: Brand-specific fire/rebellion graphics
4. **Micro-interactions**: Button states, loading animations
5. **Dark/Light Themes**: User preference options

### **Brand Evolution**
- **Logo Development**: Custom fire + AI iconography
- **Pattern Library**: Fire-inspired geometric patterns
- **Illustration Style**: Cinematic, rebellious artwork
- **Motion Language**: Fire-inspired animations

---

## **📚 Resources & Assets**

### **Required Files**
- `public/fire_background.mp4` - Background video
- `League Spartan` font family
- Brand color palette values
- Component code examples

### **Design Tools**
- **Figma/Sketch**: Component library
- **Lottie**: Animated elements
- **Storybook**: Component documentation
- **Design Tokens**: CSS custom properties

---

*This design system represents the foundation for Scorched AI's visual identity. All future design decisions should reference and build upon these established patterns.*
