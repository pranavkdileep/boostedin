---
name: Boostedin Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414752'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#727783'
  outline-variant: '#c1c6d4'
  surface-tint: '#005eb5'
  primary: '#004e99'
  on-primary: '#ffffff'
  primary-container: '#0a66c2'
  on-primary-container: '#dbe6ff'
  inverse-primary: '#a8c8ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#704600'
  on-tertiary: '#ffffff'
  tertiary-container: '#915b00'
  on-tertiary-container: '#ffe1c2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a8c8ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468a'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered to project authority, intelligence, and high-velocity growth. It targets professional creators and B2B founders who demand a tool that feels as sophisticated as their own personal brands. 

The aesthetic is **Corporate Modern with Glassmorphic accents**, blending the reliability of traditional professional networks with the forward-leaning energy of generative AI. The interface relies on expansive white space, precision typography, and subtle depth through translucent layers to create a "premium SaaS" experience. Every interaction should feel effortless and high-end, mirroring the "boost" in performance the platform provides.

## Colors
The palette is rooted in **LinkedIn Blue (#0A66C2)** to maintain a semantic connection to the platform, but it is elevated by a **Secondary Purple Gradient** that signifies the "AI magic" and creative expansion. 

- **Primary:** Used for core navigation, primary actions, and brand recognition.
- **Secondary Gradient:** Used for AI-driven features, premium badges, and "boost" states.
- **Accent (Soft Orange):** Reserved strictly for high-conversion CTAs and urgent notifications to ensure maximum visual contrast.
- **Background:** A crisp, high-key light blue tint (#F8FBFF) that reduces eye strain compared to pure white while maintaining a clean, medical-grade professional feel.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian, and modern feel. The hierarchy relies on heavy weights for headlines to create a strong visual "anchor" on the page. 

Line heights are intentionally generous (1.5x for body text) to optimize for readability during long-form content creation. For display text, tighter letter-spacing is applied to maintain a cohesive, "locked-in" look common in high-end startup landing pages.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on generous internal padding. 

- **Mobile:** 4-column grid with 16px margins. Content is stacked vertically to prioritize the feed and editor experience.
- **Desktop:** 12-column grid with a max-width of 1440px. Use sidebars for navigation and secondary tools, keeping the central workspace focused.
- **Rhythm:** All spacing must be a multiple of 4px. Use `lg` (40px) and `xl` (64px) for vertical section breathing room to maintain the premium, "un-cluttered" aesthetic.

## Elevation & Depth
Depth is communicated through **Glassmorphism and Ambient Shadows**. 

1.  **The Base Layer:** The #F8FBFF background is the lowest level.
2.  **Cards & Containers:** Pure white (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(10, 102, 194, 0.05)).
3.  **Floating Elements (Modals/Dropdowns):** Utilize a backdrop-filter blur (12px) with 80% opacity white fill to create a glass effect. This keeps the user grounded in their previous context.
4.  **Interactive States:** On hover, cards should slightly lift (increase shadow spread) rather than change color, maintaining the clean visual language.

## Shapes
The shape language is friendly yet structured. This design system uses **large corner radii** to differentiate itself from the more "boxed" traditional LinkedIn UI.

- **Standard Buttons & Inputs:** 0.5rem (8px).
- **Cards & Content Containers:** 1rem to 1.5rem (16px to 24px) depending on the scale of the container.
- **AI-Feature Tags/Chips:** Full pill-shape to distinguish them from standard functional UI.

## Components

- **Buttons:** Primary buttons use a solid LinkedIn Blue. "Boost" buttons utilize the Purple Gradient with a subtle glow effect on hover. All buttons have a minimum height of 48px for mobile accessibility.
- **Input Fields:** Minimalist style with a 1px border (#E2E8F0). Focus state uses a 2px Primary Blue border with a soft glow.
- **Cards:** White background, 24px padding, and 20px rounded corners. Use glassmorphic headers for cards that contain "active" or "live" AI data.
- **Chips/Badges:** Used for "Engagement Score" or "Post Category." These should be low-contrast (light blue background with darker blue text) unless they represent an AI action, in which case they use the purple gradient.
- **Lists:** High-density lists (like post drafts) should use subtle 1px dividers with 16px vertical padding to ensure readability without looking cramped.
- **The "Boost" Button:** A unique component—larger than standard buttons, using the secondary gradient, a glassmorphic sheen, and a small "sparkle" icon.