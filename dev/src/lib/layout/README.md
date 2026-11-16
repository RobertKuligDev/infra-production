# 📘 **Design System 2.5 — Layout Primitives Documentation**

> **Purpose:**
> Layout Primitives define the structural foundation of the application.
> They provide predictable, constraint‑based building blocks for composing any layout without relying on ad‑hoc CSS, margins, or arbitrary spacing.

---

# 🧱 **1. Philosophy**

Layout Primitives follow these principles:

- **Composition over customization** — layouts are built by combining primitives, not by styling components directly.
- **Constraint‑based API** — only predefined token values are allowed (no magic numbers).
- **Separation of concerns** — layout primitives never apply UI styling (backgrounds, borders, shadows).
- **Predictable spacing** — all spacing comes from semantic tokens.
- **SSR‑safe, hydration‑safe** — Angular Signals + OnPush.
- **Composable** — primitives can be nested to create complex layouts.
- **Token‑driven** — primitives map semantic tokens → component tokens → CSS variables → SCSS primitives.

---

# 🧩 **2. Available Layout Primitives**

| Primitive | Purpose | Typical Use Cases |
|----------|---------|-------------------|
| **Stack** | Vertical rhythm | Sections, forms, article content |
| **Inline** | Horizontal alignment | Buttons row, icon+text, inline groups |
| **Cluster** | Horizontal grouping with wrapping | Tags, badges, avatars, meta info |
| **Split** | Two‑column layouts | Image + text, product detail, hero |
| **Content Block** | Readable text blocks | Article body, descriptions |
| **Section** | Vertical layout boundaries | Page sections, grouped content |
| **Container** | Max‑width + horizontal padding | Page width constraints |
| **Sidebar Layout** | Sidebar + content | Dashboard, product page |

---

# 🎛 **3. Constraint‑Based API**

Every primitive exposes a **strict API** using semantic tokens:

- `gap="md"`
- `padding="base"`
- `ratio="1-2"`
- `width="lg"`
- `maxWidth="wide"`
- `justify="between"`
- `align="center"`

**No arbitrary values** like `"13px"` or `"420px"` are allowed.

This ensures:

- consistency,
- predictable spacing,
- theming compatibility,
- responsive behavior,
- maintainability.

---

# 🎨 **4. Component‑Level Tokens (Level 2.5)**

Each primitive maps:

```
semantic token → component token → CSS variable → SCSS primitive
```

Example:

```
gap="md"
→ maps to var(--space-5)
→ injected as --stack-gap
→ used by @include stack(var(--stack-gap))
```

This allows:

- theming,
- runtime overrides,
- design consistency,
- future-proofing.

---

# 🧱 **5. Composition Patterns**

## **5.1 Hero Layout**

```
<ds-section padding="wide">
  <ds-container>
    <ds-split ratio="1-2">
      <div sidebar>...</div>
      <div content>...</div>
    </ds-split>
  </ds-container>
</ds-section>
```

## **5.2 Product Page**

```
<ds-section>
  <ds-container>
    <ds-sidebar-layout width="lg">
      <div sidebar>filters</div>
      <div content>
        <ds-cluster gap="lg">...</ds-cluster>
      </div>
    </ds-sidebar-layout>
  </ds-container>
</ds-section>
```

## **5.3 Article Layout**

```
<ds-section>
  <ds-container>
    <ds-content-block maxWidth="wide">
      <ds-stack gap="lg">...</ds-stack>
    </ds-content-block>
  </ds-container>
</ds-section>
```

---

# 🚫 **6. Anti‑Patterns**

| Anti‑Pattern | Why it's wrong | Correct approach |
|--------------|----------------|------------------|
| Using margins for spacing | breaks rhythm | use `gap` |
| Using custom CSS | breaks consistency | use primitives |
| Nesting UI components inside UI components | layout leakage | wrap with primitives |
| Using Grid everywhere | overkill | use stack/inline/cluster |

---

# 🔗 **7. Integration with UI Components**

Layout primitives wrap UI components:

```
<ds-section>
  <ds-container>
    <app-section-header ... />
    <ds-stack gap="lg">
      <app-card-list ... />
    </ds-stack>
  </ds-container>
</ds-section>
```

UI components **never** define layout.
Layout primitives **never** define UI.

---

# 📐 **8. Responsive Behavior**

All primitives rely on:

- `@include respond-md`
- `@include respond-lg`
- `@include respond-xl`

Examples:

- `split` stacks on mobile
- `sidebar-layout` stacks on mobile
- `cluster` wraps automatically
- `stack` remains vertical

---

# 🧭 **9. When to Use Which Primitive**

| Goal | Primitive |
|------|-----------|
| Vertical spacing | Stack |
| Horizontal alignment | Inline |
| Grouped items | Cluster |
| Two‑column layout | Split |
| Readable text block | Content Block |
| Page section | Section |
| Max width | Container |
| Sidebar + content | Sidebar Layout |

---

# 🏁 **10. Summary**

Layout Primitives form the **structural backbone** of your Design System.
They ensure:

- consistency,
- predictability,
- composability,
- maintainability,
- and a clean separation between layout and UI.
