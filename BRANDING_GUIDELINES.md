# Greenlit Brand Guidelines
*The Studio System is Broken. Build Your Own.*

---

## 🎬 Brand Overview

**Greenlit** is a revolutionary AI showrunner platform that empowers professional actors to take control of their creative destiny. We're building the new Hollywood where talent owns their IP and controls their narrative.

### Core Mission
- **Empower actors** to become their own showrunners
- **Eliminate gatekeepers** and studio bureaucracy  
- **Guarantee ownership** with 70% revenue share
- **Democratize production** through AI collaboration

---

## 🎨 Visual Identity

### Color Palette

#### Primary Colors
- **Studio Black**: `#121212` - Primary background, sophisticated base
- **Action Green**: `#00FF99` - Primary accent, CTAs, highlights, success states

#### Secondary Colors
- **Pure White**: `#FFFFFF` - Headlines, primary text
- **Light Gray**: `#E7E7E7` - Secondary text, subtle elements
- **Dark Gray**: `#36393F` - Borders, dividers, subtle backgrounds

#### Usage Guidelines
- **Studio Black**: Use for main backgrounds, cards, and containers
- **Action Green**: Use for CTAs, progress indicators, success states, and key highlights
- **White**: Use for headlines, important text, and contrast elements
- **Gray tones**: Use for secondary information and subtle UI elements

### Typography

#### Primary Fonts
- **Headlines**: `Orbitron` (400, 700, 900) - Futuristic, bold, commanding
- **Subheadlines**: `Cinzel` (400, 600) - Elegant, sophisticated, premium
- **Body Text**: `Rajdhani` (300, 400, 500, 600, 700) - Clean, modern, readable
- **UI Elements**: `Space Grotesk` (300, 400, 500, 600, 700) - Technical, precise

#### Typography Hierarchy
```css
/* Headlines */
.hero-headline {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.1;
}

/* Section Headlines */
.section-headline {
    font-family: 'Cinzel', serif;
    font-weight: 600;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.2;
}

/* Body Text */
.body-text {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 400;
    font-size: 1.1rem;
    line-height: 1.6;
}

/* UI Elements */
.ui-text {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.4;
}
```

---

## 🎭 Brand Voice & Messaging

### Tone of Voice
- **Authoritative**: Confident, no-nonsense, direct
- **Empowering**: Inspiring actors to take control
- **Exclusive**: Premium, selective, meritocratic
- **Revolutionary**: Challenging the status quo
- **Professional**: Serious about the craft, not gimmicky

### Key Messaging Pillars

#### 1. **"Stop Waiting for the Call. Make the Show."**
- **Core Message**: Take control of your career
- **Emotional Hook**: Frustration with waiting for opportunities
- **Action**: Empowerment to create your own content

#### 2. **"You are the director and the AI acts as your 1st AD"**
- **Core Message**: Human leadership with AI support
- **Emotional Hook**: Creative control and vision
- **Action**: Collaboration, not replacement

#### 3. **"70% revenue share, guaranteed"**
- **Core Message**: Fair compensation and ownership
- **Emotional Hook**: Financial security and control
- **Action**: Transparent, actor-friendly terms

#### 4. **"The Studio System is Broken. Build Your Own."**
- **Core Message**: System disruption and empowerment
- **Emotional Hook**: Frustration with current system
- **Action**: Alternative creation and ownership

### Messaging Hierarchy

#### Primary Headlines
- "Stop Waiting for the Call. Make the Show."
- "You're Already Greenlit."
- "Be Your Own Showrunner"

#### Secondary Headlines
- "The Studio System is Broken. Build Your Own."
- "Launch your series in a fraction of the time"
- "Own your IP and monetize from Day 1"

#### Supporting Copy
- "We built an AI Showrunner for professional actors ready to take control"
- "You bring the talent and the audience; we handle the production grind"
- "You lead with vision, the AI follows"

---

## 🎨 Design System

### Layout Principles

#### **Dark Mode Cinema Aesthetic**
- **Base**: Studio Black (#121212) backgrounds
- **Accent**: Action Green (#00FF99) highlights
- **Contrast**: High contrast for readability
- **Depth**: Layered backgrounds and overlays

#### **Cinematic Elements**
- **Parallax scrolling** for depth and immersion
- **Floating particles** and ambient animations
- **Geometric shapes** for modern, technical feel
- **Glow effects** on CTAs and key elements

### Component Styles

#### **Buttons**
```css
/* Primary CTA */
.cta-primary {
    background: linear-gradient(135deg, #00FF99, #00CC7A);
    color: #121212;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 20px rgba(0, 255, 153, 0.3);
    transition: all 0.3s ease;
}

.cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 255, 153, 0.4);
}

/* Secondary CTA */
.cta-secondary {
    background: transparent;
    border: 2px solid #00FF99;
    color: #00FF99;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.3s ease;
}

.cta-secondary:hover {
    background: #00FF99;
    color: #121212;
    transform: translateY(-2px);
}
```

#### **Cards**
```css
.card {
    background: rgba(18, 18, 18, 0.8);
    border: 1px solid rgba(0, 255, 153, 0.2);
    border-radius: 12px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.card:hover {
    border-color: rgba(0, 255, 153, 0.4);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 255, 153, 0.1);
}
```

#### **Typography Styles**
```css
/* Hero Headlines */
.hero-headline {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.1;
    color: #FFFFFF;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* Section Headlines */
.section-headline {
    font-family: 'Cinzel', serif;
    font-weight: 600;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.2;
    color: #FFFFFF;
    text-align: center;
    margin-bottom: 3rem;
}

/* Body Text */
.body-text {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 400;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #E7E7E7;
}

/* Parallax Text */
.parallax-text {
    font-family: 'Cinzel', serif;
    font-weight: 600;
    font-size: clamp(2rem, 4vw, 3.5rem);
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 
        3px 3px 6px rgba(0, 0, 0, 0.9),
        0 0 30px rgba(255, 255, 255, 0.4),
        0 0 60px rgba(255, 255, 255, 0.2);
}
```

### Animation Guidelines

#### **Hover Effects**
- **Buttons**: Lift 2-4px, increase glow
- **Cards**: Lift 4-8px, enhance border glow
- **Links**: Color transition to Action Green

#### **Scroll Animations**
- **Staggered reveals**: 150ms delay between elements
- **Fade in**: Opacity 0 to 1 with transform
- **Slide up**: TranslateY 30px to 0

#### **Loading States**
- **Pulse animation** for loading indicators
- **Glow effects** for active states
- **Smooth transitions** (0.3s ease)

---

## 🎯 Content Guidelines

### Headlines That Work

#### **Hero Headlines**
- "Stop Waiting for the Call. Make the Show."
- "You're Already Greenlit."
- "Be Your Own Showrunner"

#### **Section Headlines**
- "The Studio System is Broken. Build Your Own."
- "How We Build the New Hollywood"
- "The Greenlit Fund"

#### **CTA Headlines**
- "Apply to the Producer Program →"
- "Try the Demo"
- "Join the Development Slate"

### Key Messages by Section

#### **Hero Section**
- **Headline**: "Stop Waiting for the Call. Make the Show."
- **Subheadline**: "We built an AI Showrunner for professional actors ready to take control. You bring the talent and the audience; we handle the production grind. Launch your series, own your IP."
- **CTA**: "Apply to the Producer Program →" + "Try the Demo"

#### **Problem Section**
- **Headline**: "The Studio System is Broken. Build Your Own."
- **Message**: Highlight frustrations with current system, gatekeepers, and lack of control

#### **Solution Section**
- **Headline**: "How We Build the New Hollywood"
- **Message**: 6-step process emphasizing human leadership and AI collaboration

#### **Value Proposition**
- **Headline**: "The Greenlit Fund"
- **Message**: "We don't just provide the tools; we invest in the talent. Successful applicants from the Producer Program are eligible for Pilot Grants (up to $20k) to level up production."

#### **Final CTA**
- **Headline**: "You're Already Greenlit."
- **Message**: "Your moment is now"
- **CTA**: "Try the Demo →"

### FAQ Messaging

#### **Key Questions to Address**
1. "What is the IP deal and revenue split?"
   - **Answer**: "Simple. You own the IP. Period. The revenue split is 70% to the creators, 30% to Greenlit. We only win when you do."

2. "How does the AI collaboration work?"
   - **Answer**: "You are the director and the AI acts as your 1st AD, providing guidance to ensure quality. You lead with vision, the AI follows."

3. "What are the entry criteria?"
   - **Answer**: "2 out of 3: Chops (talent), Clout (audience), or Cash (funding). We prioritize talent and vision over traditional metrics."

---

## 🚀 Implementation Guidelines

### **Chat Interface Design**

#### **Color Scheme**
- **Background**: Studio Black (#121212)
- **Messages**: White text on dark backgrounds
- **User messages**: Action Green accent (#00FF99)
- **AI responses**: White text with subtle green highlights
- **CTAs**: Action Green buttons with glow effects

#### **Typography**
- **Chat interface**: Space Grotesk for readability
- **Headlines**: Orbitron for impact
- **Body text**: Rajdhani for comfort

#### **Interactive Elements**
- **Buttons**: Action Green with glow effects
- **Input fields**: Dark with green borders
- **Progress indicators**: Action Green
- **Success states**: Action Green with checkmarks

### **Content Strategy**

#### **Opening Message**
"Welcome to Greenlit. You're already greenlit. Let's build your show."

#### **Key Conversation Points**
1. **Talent assessment**: "Tell me about your acting experience"
2. **Vision alignment**: "What story do you want to tell?"
3. **Audience connection**: "Who is your target audience?"
4. **Production goals**: "What's your timeline for launch?"

#### **Success Indicators**
- **Green checkmarks** for completed steps
- **Progress bars** with Action Green fill
- **Celebration animations** for milestones
- **Next step prompts** with clear CTAs

---

## 📱 Responsive Guidelines

### **Mobile Design**
- **Typography**: Scale down by 20-30%
- **Spacing**: Reduce padding by 25%
- **Buttons**: Full-width on mobile
- **Parallax**: Disabled on mobile (performance)

### **Tablet Design**
- **Typography**: Scale down by 10-15%
- **Spacing**: Reduce padding by 15%
- **Grid layouts**: 2 columns instead of 3
- **Parallax**: Reduced intensity

### **Desktop Design**
- **Full experience**: All animations and effects
- **Maximum impact**: Cinematic backgrounds
- **Hover states**: Full interactive experience

---

## 🎬 Brand Applications

### **Logo Usage**
- **Primary**: Greenlit logo with "Greenlit" text
- **Icon only**: For small spaces and favicons
- **Full brand**: Logo + tagline for formal contexts

### **Social Media**
- **Profile images**: Action Green accent
- **Post backgrounds**: Studio Black with green highlights
- **Typography**: Consistent with brand fonts

### **Email Marketing**
- **Background**: Studio Black
- **Headers**: Orbitron font
- **Body**: Rajdhani font
- **CTAs**: Action Green buttons

### **Documentation**
- **Headers**: Cinzel serif
- **Body**: Rajdhani sans-serif
- **Code**: Space Grotesk monospace
- **Accents**: Action Green highlights

---

## 🔧 Technical Implementation

### **CSS Variables**
```css
:root {
    --studio-black: #121212;
    --action-green: #00FF99;
    --pure-white: #FFFFFF;
    --light-gray: #E7E7E7;
    --dark-gray: #36393F;
    
    --font-headline: 'Orbitron', sans-serif;
    --font-subheadline: 'Cinzel', serif;
    --font-body: 'Rajdhani', sans-serif;
    --font-ui: 'Space Grotesk', sans-serif;
}
```

### **Animation Classes**
```css
.glow-effect {
    box-shadow: 0 0 20px rgba(0, 255, 153, 0.3);
    transition: all 0.3s ease;
}

.float-animation {
    animation: float 3s ease-in-out infinite;
}

.slide-up {
    animation: slideUp 0.6s ease-out;
}
```

### **Component Library**
- **Buttons**: Primary, Secondary, Ghost
- **Cards**: Default, Hover, Active
- **Inputs**: Text, Textarea, Select
- **Modals**: Lightbox, Alert, Confirm
- **Navigation**: Header, Footer, Sidebar

---

## 📊 Brand Metrics

### **Success Indicators**
- **Engagement**: Time on page, scroll depth
- **Conversion**: CTA clicks, form submissions
- **Retention**: Return visits, session duration
- **Brand recognition**: Logo recognition, message recall

### **A/B Testing**
- **Headlines**: Test different emotional hooks
- **CTAs**: Test action-oriented vs. benefit-focused
- **Colors**: Test Action Green vs. alternative accents
- **Layout**: Test single vs. multi-column layouts

---

## 🎯 Brand Evolution

### **Future Considerations**
- **Seasonal themes**: Maintain core colors, adjust accents
- **Platform expansion**: Adapt for different channels
- **Audience growth**: Scale messaging for broader appeal
- **Feature updates**: Maintain consistency with new products

### **Brand Maintenance**
- **Regular audits**: Quarterly brand consistency reviews
- **Team training**: Ensure all team members understand guidelines
- **Asset updates**: Keep all materials current and consistent
- **Feedback loops**: Collect and incorporate user feedback

---

*This document should be treated as a living guide that evolves with the brand while maintaining core identity and values.*
