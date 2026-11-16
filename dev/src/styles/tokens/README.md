# 🎨 Design Tokens 3.0
Atomic, multi‑tier token architecture for the UI Design System.

This directory defines the **entire design language** of the application.
It is structured into **four independent layers**, each with a clear responsibility:

```
primitives → semantic → component‑tokens → runtime
```

Each layer is deterministic, non‑cyclic, and aligned with the principles of
**Atomic Layout Engine** and **Multi‑Tier Token Systems**.

---

# 🧱 1. PRIMITIVES
**Raw, immutable values.**
The lowest layer — no context, no component knowledge.

```
src/styles/tokens/primitives/
```

Includes:

- `_colors.scss` — raw color palette
- `_spacing.scss` — spacing scale
- `_radius.scss` — border radius scale
- `_opacity.scss` — opacity scale
- `_breakpoints.scss` — viewport breakpoints
- `_typography.scss` — font families, sizes, weights
- `_shadows.scss` — elevation shadows
- `_zindex.scss` — stacking context

Primitives contain **only pure values**, no aliases, no CSS variables.

---

# 🗺 1.1 PRIMITIVE MAPS
SCSS maps used for **automatic CSS variable generation**.

```
src/styles/tokens/primitives/maps/
```

Includes:

- `_colors-map.scss`
- `_spacing-map.scss`
- `_radius-map.scss`
- `_opacity-map.scss`
- `_breakpoints-map.scss`
- `_typography-map.scss`
- `_shadows-map.scss`
- `_zindex-map.scss`

Maps are the **single source of truth** for the runtime layer.

---

# 🏷 2. SEMANTIC TOKENS
**Contextual aliases** — give meaning to primitive values.

```
src/styles/tokens/semantic/
```

Includes:

- `_colors.scss` — background, text, surface, accent roles
- `_sections.scss` — section background roles
- `_text.scss` — heading/body/label roles
- `_surface.scss` — surface roles
- `_states.scss` — success/warning/error/info roles

Semantic tokens **never contain raw values** — only aliases.

---

# 🧩 3. COMPONENT TOKENS (Level 2.5)
The **most important layer** — connects semantic tokens with component logic.

```
src/styles/tokens/component-tokens/
```

Includes:

- `_layout.scss` — container, section, vertical rhythm
- `_grid.scss` — grid gaps and min column widths
- `_buttons.scss` — padding, radius, colors, typography
- `_cards.scss` — padding, radius, shadows, surfaces
- `_cta.scss` — CTA layout and colors
- `_sidebar.scss` — sidebar layout and colors
- `_transition.scss` — durations and easing curves
- `_typography.scss` — heading/body/label roles

Component tokens **eliminate magic numbers** and ensure system‑wide consistency.

Changing a single token (e.g., `$container-padding-x`) updates the entire system.

---

# 🌐 4. RUNTIME (CSS Variables Bridge)
The **only layer** that generates CSS variables.

```
src/styles/tokens/runtime/_root.scss
```

Exports:

- `--color-*`
- `--space-*`
- `--radius-*`
- `--opacity-*`
- `--bp-*`
- `--shadow-*`
- `--z-*`
- `--font-size-*`, `--font-weight-*`, etc.

Runtime **does not affect primitives**.
It is a **bridge** for theming (e.g., dark mode).

---

# 📦 5. INDEX
Main aggregator:

```
src/styles/tokens/index.scss
```

Forwards:

- primitives
- semantic
- component‑tokens
- runtime

Allowing any module to simply:

```scss
@use 'src/styles/tokens' as *;
```

---

# 🔁 Dependency Flow

```
primitives
   ↓
semantic
   ↓
component-tokens
   ↓
primitives layer (Stack, Grid, Inline)
   ↓
layout (BEM)
   ↓
components
```

Runtime works **in parallel**, generating CSS variables:

```
primitives/maps → runtime/_root.scss → CSS variables
```

No cycles. No ambiguity. No magic numbers.

---

# 🧠 Why this architecture?

✔ Single Source of Truth
✔ Predictable scaling
✔ Zero magic numbers
✔ Perfect for multi-theme
✔ Perfect for design → dev alignment
✔ Perfect for primitives 3.0
✔ Enterprise-grade maintainability
✔ Compatible with Angular, React, Vue
✔ Fully aligned with Atomic Layout Engine

---

# 🏁 Summary

This is the **final, production‑ready architecture** for Tokens 3.0, aligned with:

- your system design vision
- Atomic Layout Engine
- multi‑tier token systems
- primitives 3.0

Use this README as the official documentation for the token subsystem.
