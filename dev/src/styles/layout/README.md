# 🧱 Design System — Layout Primitives
High‑level structural layer built on top of foundation primitives.

Layout primitives provide:

- predictable page‑level structure
- consistent spacing and alignment
- responsive behavior
- BEM‑style utility classes
- zero duplication of logic
- full token‑driven control

They map foundation primitives (pure mixins) into ready‑to‑use layout utilities.

---

## 📁 Folder Structure

```
src/styles/primitives/layout/
│
├── _container.scss
├── _section.scss
├── _grid.scss
├── _stack.scss
├── _inline.scss
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

## 🧩 Architecture

Layout primitives sit between:

```
foundation primitives  →  layout primitives  →  components / pages
```

- **Foundation primitives** = pure mixins (`stack-base`, `grid-template`, `section-base`)
- **Layout primitives** = BEM utilities (`.stack`, `.grid--cols-3`, `.section--wide`)
- **Components** = use layout primitives for structure

---

## 🎨 Design Rules (DS 3.0)

### ✔ 1. No magic numbers
All spacing, widths, paddings come from tokens.

### ✔ 2. Layout primitives may expose classes
Unlike foundation primitives, layout primitives *can* define BEM classes.

### ✔ 3. Responsive behavior uses `respond-*` mixins
Example:

```scss
@include respond-md {
  grid-template-columns: 1fr;
}
```

### ✔ 4. Width tiers are shared
Wrapper and content‑block use the same width tiers:

- narrow (48rem)
- base (64rem)
- wide (80rem)

### ✔ 5. Layout primitives never use CSS variables
Only SCSS tokens.

---

## 🧱 Usage Examples

### Container

```scss
.container {
  @include container-base;
}
```

### Section

```scss
.section--wide {
  @include section($section-bg-default, $section-padding-wide);
}
```

### Grid

```scss
.grid--cols-3 {
  @include grid-template(repeat(3, 1fr));
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

## 🚀 Summary

Layout primitives provide a **clean, scalable, token‑driven structural layer** for the entire UI.
They ensure consistency across pages, sections, and components while keeping the system flexible and maintainable.
