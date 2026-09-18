---
name: motion-framer
description: >-
  Comprehensive guide and design standards for Framer Motion and Motion library animations
  in React 19, Next.js 16, and Tailwind CSS. Use whenever building UI transitions, card stagger
  entrances, modal dialog overlays, smooth tab layout transitions (layoutId), button micro-interactions,
  and page reveals.
---

# Framer Motion & Motion Library Design Standards

This skill provides mandatory guidelines and reusable patterns for high-performance, polished UI animations using `motion` (Framer Motion v13+ / `motion/react`).

---

## 🚀 Key Rules & Import Conventions

1. **Import Path for React 19 / Next.js**:
   Use `motion/react` as the primary import path:
   ```tsx
   import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
   ```

2. **Performance First**:
   - **Only animate GPU-accelerated properties**: `opacity`, `transform` (`x`, `y`, `scale`, `rotate`).
   - **Never animate layout dimensions directly** (`width`, `height`, `margin`, `top`, `left`). Use Framer Motion's automatic layout engine via `layout` or `layoutId` props instead.

3. **Motion Physics & Feel**:
   - Avoid slow, floaty, or bouncy animations.
   - Micro-interactions (hovers/taps): **150ms–200ms**.
   - Entrances and reveals: **200ms–300ms** using cubic-bezier curves or light spring dampening.
   - **Default Easing**: `ease: [0.22, 1, 0.36, 1]` (custom sleek out-quart).
   - **Default Spring**: `{ type: "spring", stiffness: 400, damping: 30 }`.

4. **Accessibility (`prefers-reduced-motion`)**:
   Always respect user accessibility preferences:
   ```tsx
   import { useReducedMotion } from 'motion/react'
   const shouldReduceMotion = useReducedMotion()
   ```

---

## 📦 Reusable Animation Snippets

### 1. Staggered Container & Child Items
Ideal for dashboard KPI grids, list tables, and card grids.

```tsx
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants} className="bg-white p-4 rounded-xl border">
      {item.title}
    </motion.div>
  ))}
</motion.div>
```

---

### 2. Smooth Modal / Dialog Overlay
Prevents jarring dialog pop-ins with backdrop fade and crisp scale transition.

```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* Content Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative z-10 w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl"
      >
        {children}
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

---

### 3. Active Tab Indicator with `layoutId`
Creates smooth pill morphing when switching active navigation tabs or filter views.

```tsx
<div className="flex bg-slate-100 p-1 rounded-xl gap-1">
  {tabs.map((tab) => {
    const isActive = activeTab === tab.id
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className="relative px-4 py-2 text-xs font-bold transition-colors z-10 text-slate-700"
      >
        {isActive && (
          <motion.div
            layoutId="activeTabPill"
            className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
        {tab.label}
      </button>
    )
  })}
</div>
```

---

### 4. Interactive Card / Button Hover
Elevates cards subtly on hover without layout reflows.

```tsx
<motion.button
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs hover:shadow-md"
>
  Click Action
</motion.button>
```

---

## 🎨 Avoiding "Vibe-Coded" Aesthetic

- **Avoid Excessive Rotation / Wobble**: Don't use `rotate: [-5, 5, 0]` or exaggerated springs. UI controls should feel tactile, fast, and weight-balanced.
- **Synchronize Exit Animations**: Always wrap conditionally rendered popups or toast notifications in `<AnimatePresence>` so they animate smoothly on remove.
- **Combine CSS Grid/Flexbox with `motion.div`**: Use CSS for layout positioning and `motion` purely for visual transform & opacity state transitions.
