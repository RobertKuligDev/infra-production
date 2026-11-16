# 🧱 Design System — Primitives Layer
Foundation styling layer of the design system.

Primitives are the **lowest, atomic layer** of the Design System.
They define the fundamental building blocks used by:

- layout primitives
- UI components
- utilities
- page‑level structures

They ensure:

- visual consistency
- predictable behavior
- zero duplication
- full token‑driven control
- long‑term maintainability

Everything in the UI is built on top of these primitives.

---

## 📁 Folder Structure

```
src/styles/primitives/
│
├── index.scss
│
├── _badge.scss
├── _chip.scss
├── _pill.scss
├── _label.scss
├── _divider.scss
├── _code-block.scss
├── _table-row.scss
├── _status-dot.scss
├── _kbd.scss
├── _metric.scss
├── _stat-block.scss
│
├── _container.scss
├── _section.scss
├── _stack.scss
├── _inline.scss
├── _grid.scss
├── _effects.scss
├── _responsives.scss
├── _spacer.scss
│
└── layout/
    ├── _stack.scss
    ├── _section.scss
    ├── _grid.scss
    ├── _inline.scss
    ├── _container.scss
    ├── _cluster.scss
    ├── _content-block.scss
    ├── _sidebar-layout.scss
    ├── _split.scss
    ├── _surface-layout.scss
    ├── _table.scss
    ├── _wrapper.scss
    └── index.scss
```

---

## 🧩 Architecture Overview

Primitives are divided into **three layers**, each with a clear responsibility.

---

### 1️⃣ Foundation Primitives
Pure mixins — **no classes**.
They define the smallest atomic behaviors:

- spacing
- alignment
- flex/grid behavior
- text roles
- surface roles
- section structure
- responsive helpers

Examples:

- `stack-base`, `stack-gap-md`
- `inline-base`, `inline-gap-sm`
- `surface-base`, `surface-elevation-2`
- `badge-base`, `badge-variant($color)`
- `section-base`, `section-padding`

These are used by layout primitives and components.

---

### 2️⃣ Layout Primitives
BEM utility classes mapping foundation mixins to ready‑to‑use classes.

Examples:

- `.stack`, `.stack--lg`
- `.inline`, `.inline--sm`
- `.grid--cols-3`
- `.section--wide`
- `.sidebar-layout`
- `.wrapper--wide`
- `.content-block--narrow`

Used in page layouts and structural blocks.

---

### 3️⃣ Atom Primitives
Smallest UI atoms:

- badge
- chip
- pill
- label
- status-dot
- metric
- table-row
- code-block

Used by UI components.

---

## 🎨 Design Rules (DS 3.0)

### ✔ 1. Every primitive is token‑driven
No magic numbers.
All spacing, radius, colors, typography come from tokens.

### ✔ 2. Foundation primitives contain **only mixins**
No classes allowed.

### ✔ 3. Layout primitives may expose BEM classes
They map mixins to reusable utilities.

### ✔ 4. Responsive behavior uses `respond-*` mixins
Example:

```scss
@include respond-md {
  grid-template-columns: 1fr;
}
```

### ✔ 5. Width tiers are shared
Wrapper and content‑block use:

- narrow (48rem)
- base (64rem)
- wide (80rem)

### ✔ 6. No CSS variables in primitives
Only SCSS tokens.

### ✔ 7. One mixin = one responsibility
Atomic, predictable, composable.

---

## 🧱 Usage Examples

### Stack

```scss
.my-card {
  @include stack-base;
  @include stack-gap-md;
}
```

### Inline

```scss
.actions {
  @include inline-base;
  @include inline-gap-sm;
  @include inline-align-center;
}
```

### Badge

```scss
.status {
  @include badge-base;
  @include badge-variant($color-accent-primary);
}
```

### Section

```scss
.hero {
  @include section-base($section-bg-hero);
  @include section-padding($section-padding-wide);
}
```

### Grid

```scss
.products {
  @include grid-template(repeat(3, 1fr), $space-6);
}
```

### Wrapper

```scss
.wrapper--narrow {
  @include wrapper-narrow;
}
```

### Content Block

```scss
.content-block--wide {
  @include content-block-wide;
}
```

---

## 🧱 Importing Primitives

All primitives are aggregated in:

```
src/styles/primitives/index.scss
```

Global import:

```scss
@use 'src/styles/primitives' as *;
```

Selective import:

```scss
@use 'src/styles/primitives/stack' as stack;
```

---

## 🚀 Summary

The primitives layer is the **foundation of the entire Design System**.
It ensures:

- consistency
- scalability
- maintainability
- predictable behavior
- clean component code
- zero duplication

Everything else — layout, components, pages — is built on top of this layer.

