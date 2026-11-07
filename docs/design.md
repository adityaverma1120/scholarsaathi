# MASTER UI/UX DESIGN SYSTEM SPECIFICATION & ARCHITECTURAL HANDBOOK
**The Unified Single Source of Truth (SSOT) for Next-Generation Digital Products, Dashboards, SaaS Platforms, AI Applications, and Inclusive Web Systems**

---

## Table of Contents
1. [Section 1: Executive Summary](#section-1-executive-summary)
   - [1.1 Document Purpose & System Scope](#11-document-purpose--system-scope)
   - [1.2 Synthesis of Core Uploaded Resources](#12-synthesis-of-core-uploaded-resources)
   - [1.3 Multi-Platform Architectural Cohesion](#13-multi-platform-architectural-cohesion)
   - [1.4 System Invariants & Non-Negotiables](#14-system-invariants--non-negotiables)
2. [Section 2: Resource Analysis](#section-2-resource-analysis)
   - [2.1 daisyui-master (v5.7.50) Deep Dive](#21-daisyui-master-v5750-deep-dive)
   - [2.2 lucide-main Vector Iconography System Deep Dive](#22-lucide-main-vector-iconography-system-deep-dive)
   - [2.3 mantine-master (v9.7.4) Enterprise Framework Deep Dive](#23-mantine-master-v974-enterprise-framework-deep-dive)
   - [2.4 react-dropzone-master Headless File Ingestion Deep Dive](#24-react-dropzone-master-headless-file-ingestion-deep-dive)
   - [2.5 tremor-main (Tremor Raw / v3) Analytics System Deep Dive](#25-tremor-main-tremor-raw--v3-analytics-system-deep-dive)
   - [2.6 Wajah Product Design Specification (design.md) Deep Dive](#26-wajah-product-design-specification-designmd-deep-dive)
   - [2.7 Parent Workspace: ui ux Architectural Synthesis](#27-parent-workspace-ui-ux-architectural-synthesis)
3. [Section 3: Comparative Evaluation](#section-3-comparative-evaluation)
   - [3.1 Comprehensive 10-Dimension Evaluation Matrix](#31-comprehensive-10-dimension-evaluation-matrix)
   - [3.2 Detailed Adoption, Modification, and Rejection Strategy](#32-detailed-adoption-modification-and-rejection-strategy)
   - [3.3 Pattern Redundancy & Harmonization Map](#33-pattern-redundancy--harmonization-map)
4. [Section 4: Master Design Philosophy](#section-4-master-design-philosophy)
   - [4.1 The Ten Core Design Principles](#41-the-ten-core-design-principles)
   - [4.2 Visual Hierarchy & Cognitive Load Architecture](#42-visual-hierarchy--cognitive-load-architecture)
   - [4.3 Color Philosophy (OKLCH Perception & Functional Roles)](#43-color-philosophy-oklch-perception--functional-roles)
   - [4.4 Typography Philosophy (Editorial Clarity & Bilingual Parity)](#44-typography-philosophy-editorial-clarity--bilingual-parity)
   - [4.5 Spacing & Spatial Cadence (The 4px Base Rhythm)](#45-spacing--spatial-cadence-the-4px-base-rhythm)
   - [4.6 Layout Philosophy (Intrinsic & Container-Driven)](#46-layout-philosophy-intrinsic--container-driven)
   - [4.7 Component Design Principles (Separation of State & Style)](#47-component-design-principles-separation-of-state--style)
   - [4.8 Accessibility Principles (Radical Inclusion & Non-Color Cues)](#48-accessibility-principles-radical-inclusion--non-color-cues)
   - [4.9 Interaction Principles (Physicality, Predictability, & Delight)](#49-interaction-principles-physicality-predictability--delight)
   - [4.10 Responsive Design Principles (320px Hardening to Ultrawide)](#410-responsive-design-principles-320px-hardening-to-ultrawide)
5. [Section 5: Complete Design Token Reference](#section-5-complete-design-token-reference)
6. [Section 6: Typography System](#section-6-typography-system)
7. [Section 7: Color System](#section-7-color-system)
8. [Section 8: Layout and Grid System](#section-8-layout-and-grid-system)
9. [Section 9: Complete Component Library](#section-9-complete-component-library)
10. [Section 10: Interaction and Animation Standards](#section-10-interaction-and-animation-standards)
11. [Section 11: Responsive Design Standards](#section-11-responsive-design-standards)
12. [Section 12: Design Pattern Library](#section-12-design-pattern-library)
13. [Section 13: Dashboard Design Standards](#section-13-dashboard-design-standards)
14. [Section 14: Landing Page Design Standards](#section-14-landing-page-design-standards)
15. [Section 15: Data Visualization Standards](#section-15-data-visualization-standards)
16. [Section 16: Iconography Standards](#section-16-iconography-standards)
17. [Section 17: Accessibility Standards](#section-17-accessibility-standards)
18. [Section 18: Technical Implementation Guide](#section-18-technical-implementation-guide)
19. [Section 19: Reusable Code Examples](#section-19-reusable-code-examples)
20. [Section 20: Design Quality Checklist](#section-20-design-quality-checklist)
21. [Section 21: Final Recommendations](#section-21-final-recommendations)

---

## Section 1: Executive Summary

### 1.1 Document Purpose & System Scope
This Master UI/UX Specification establishes the definitive, unified design system and architectural standard for modern digital engineering. Built through exhaustive, forensic analysis of six foundational repositories and specifications—**DaisyUI 5.7.50**, **Lucide Icons**, **Mantine 9.7.4**, **React Dropzone**, **Tremor Raw / v3**, and the **Wajah Inclusive Design Specification (`design.md`)**—this handbook bridges the gap between high-level visual design theory, strict accessibility requirements, and production-grade software engineering.

The modern digital landscape is fragmented: teams repeatedly oscillate between zero-runtime CSS utility speed and rich React component functionality, between sleek executive data dashboards and accessible, resilient low-bandwidth public portals. This master specification resolves that friction permanently. It defines an integrated design language and code architecture that scales seamlessly across:
- **Enterprise B2B SaaS Platforms**: High-density workflows, complex state management, data grids, and keyboard-first power tools.
- **Executive & Operational Dashboards**: High-impact metrics, sparkline trends, interactive chart drill-downs, and SLA telemetry.
- **High-Conversion Landing Pages**: Distinct typography, brand storytelling, conversion hooks, and responsive pricing grids.
- **AI-Powered Applications & Chat Interfaces**: Streaming token feedback, candidate selection cards, safety review overlays, and prompt affordances.
- **File Ingestion & Document Workspaces**: Cross-browser drag-and-drop mechanics, multi-file validation, and preview workflows.
- **Inclusive Public & Bilingual Services**: Mobile-first 360px viewport resilience, zero web-font dependencies, Hindi/English typography parity, and multi-attribute semantic fault cueing.

### 1.2 Synthesis of Core Uploaded Resources
The master design system synthesizes the specific, verified strengths of the analyzed resources:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               MASTER UI/UX DESIGN SYSTEM ARCHITECTURE                            │
├────────────────────────────────┬────────────────────────────────┬────────────────────────────────┤
│       VISUAL FOUNDATION        │      INTERACTION & STATE       │      DOMAIN & METRICS          │
│  DaisyUI 5 + Lucide Icons      │ Mantine Core + React Dropzone  │ Tremor Raw + Wajah (design.md) │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ • OKLCH Perceptual Colors      │ • 100+ Accessible Primitives   │ • Financial & KPI Visuals      │
│ • Tailwind v4 @theme Engine    │ • WAI-ARIA FocusTrap & Dialogs │ • Recharts SVG Modern Styling  │
│ • Pure CSS Semantic Classes    │ • Headless useDropzone Hook    │ • Multi-Attribute Fault Cues   │
│ • 24x24 2px Vector System      │ • Form Validation & State      │ • Radical Trust Safeguards     │
│ • 35 Semantic Themes           │ • Roving TabIndex & Hotkeys    │ • 360px Low-Bandwidth Resilience│
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

1. **DaisyUI 5.7.50** (`daisyui-master`): Provides the CSS-first, zero-JS presentation layer. It brings native Tailwind CSS v4 `@theme` integration, semantic CSS class abstraction (`btn`, `card`, `modal`, `badge`), and an OKLCH color engine delivering 35 distinct themes without runtime calculation.
2. **Lucide Icons** (`lucide-main`): Provides a unified 24x24 vector grid with a 2px stroke weight, round caps and joins, and schema-enforced metadata across 1,500+ icons. It ensures optical harmony across all UI controls.
3. **Mantine 9.7.4** (`mantine-master`): Delivers the enterprise React foundation: zero-runtime CSS modules, full WAI-ARIA compliance, focus trapping, keyboard-driven popovers, comboboxes, tree navigation, and the `@mantine/hooks` and `@mantine/form` engines.
4. **React Dropzone** (`react-dropzone-master`): Provides the headless drag-and-drop state machine, normalizing HTML5 File API behavior, MIME validation, and rejection handling.
5. **Tremor Raw / v3** (`tremor-main`): Supplies the executive analytics layer, featuring Tailwind CSS v4-styled Recharts components, SparkCharts, Trackers, BarLists, and CategoryBars tailored for high-density business intelligence.
6. **Wajah Product Design Specification** (`design.md`): Supplies the ethical, accessible, and resilient design foundation. It provides multi-attribute non-color semantic cueing (pairing color with icons, border styles, and plain language), absolute transparency invariants, active PII sanitization review, and 360px low-bandwidth mobile hardening.

### 1.3 Multi-Platform Architectural Cohesion
Rather than choosing one library and discarding the rest, this specification establishes an architectural protocol where each library operates strictly in its optimal domain:
- **Styling Architecture**: Tailwind CSS v4 handles atomic layout and utility tokens; DaisyUI provides semantic class aliases; Mantine CSS modules are namespaced via CSS `@layer mantine` to eliminate specificity collisions.
- **Component Layering**: High-interaction, keyboard-complex components (Comboboxes, Modals, Menus, MultiSelect, Tree views) utilize Mantine or Radix headless primitives. Lightweight visual elements (Badges, Buttons, Dividers, Avatars) leverage DaisyUI pure CSS. Analytics and charts use Tremor Raw. File inputs use React Dropzone.
- **Iconography**: Every component across all libraries consumes Lucide SVG icons strictly mapped to 16px, 20px, 24px, 32px, or 48px sizes with a uniform 2px stroke.

### 1.4 System Invariants & Non-Negotiables
To maintain long-term integrity, every product implementing this design system must uphold eight invariants:
1. **Never Rely on Color Alone**: Every semantic status (Error, Success, Warning, Responsibility/Fault) must feature at least three independent cues: color, an icon, a distinctive border style (solid, dashed, double, dotted), and explicit text.
2. **True 360px Mobile First**: Every screen, form, and table must render flawlessly on a 360px viewport with zero horizontal window scrolling (`overflow-x: clip`).
3. **No False Certainty**: Prohibit fake AI percentage confidences (e.g., "98% confident"). Always surface candidate choices, explicit provenance dates, and clear "Not sure yet" fallbacks.
4. **Permanent Independence & Trust Transparency**: Affiliations, unverified drafts, and external redirects must be visibly declared at all times.
5. **Zero Web-Font Dependency for Core Content**: Primary interfaces must render immediately using system font stacks without waiting for remote web font network downloads.
6. **Privacy by Default**: Never store or transmit unmasked user secrets, Aadhaar/SSN numbers, OTPs, or passwords.
7. **Strict Touch Ergonomics**: Minimum interactive target size is 48x48px with 8px spatial separation. Primary action buttons must measure at least 56px in height.
8. **Unified Token Source**: Color values, radiuses, shadows, and spacings must reference CSS variables defined in `@theme` and `MantineProvider`.

---

## Section 2: Resource Analysis

### 2.1 daisyui-master (v5.7.50) Deep Dive
- **Source Location**: `c:\Users\Aditya verma\Desktop\ui ux\daisyui-master`
- **Core Package**: `packages/daisyui` (Version: 5.7.50)
- **Key Architectures**:
  - `packages/daisyui/src/base/`: CSS reset, property definitions, and root color registries (`rootcolor.css`, `properties.css`, `reset.css`).
  - `packages/daisyui/src/components/`: Pure CSS component stylesheets including `button.css`, `card.css`, `modal.css`, `drawer.css`, `dropdown.css`, `tabs.css`, `chat.css`, `timeline.css`, `dock.css`, `diff.css`, `calendar.css`, `fab.css`, `validator.css`.
  - `packages/daisyui/src/themes/`: 35 discrete theme files using CSS color variables in OKLCH (`light.css`, `dark.css`, `corporate.css`, `abyss.css`, `caramellatte.css`, `silk.css`, `nord.css`, `synthwave.css`).
- **Architectural Findings**:
  - *Color Space Transition*: DaisyUI 5 has migrated completely to the **OKLCH color model** (`oklch(L C H)`), ensuring uniform perceptual lightness across color variants. For example, in `light.css`, `--color-primary: oklch(45% 0.24 277.023)` and `--color-primary-content: oklch(93% 0.034 272.788)`. This eliminates contrast drift across different hues.
  - *Tailwind CSS v4 Native Plugin*: Configured via `@plugin "daisyui"`, DaisyUI 5 natively injects into CSS `@layer utilities` and `@layer components`, minimizing specificity wars.
  - *Component Scope*: Introduces cutting-edge CSS-only components such as `diff` (image/content comparison sliders), `dock` (macOS-style floating docks), `chat` (speech bubble layouts), `countdown` (animated counter ticks using CSS variables), and `validator` (native HTML5 form validation pseudo-class hooks).
- **Strengths**:
  - Zero JavaScript runtime overhead. CSS-only footprint ensures lightning-fast hydration and first contentful paint (FCP).
  - Framework agnostic: seamlessly usable in React, Next.js, Vue, Svelte, Astro, HTMX, and plain HTML.
  - Concise semantic class naming (`btn btn-primary btn-sm`, `card bg-base-100 shadow-xl`) drastically reduces class clutter compared to raw Tailwind utility strings.
- **Weaknesses & Outdated Practices**:
  - *Checkbox Hack Anti-Patterns*: Several interactive components (e.g., `drawer`, `collapse`, legacy dropdowns) utilize invisible `<input type="checkbox">` elements. While functional without JS, this pattern breaks screen reader focus management, violates ARIA combobox specs, and fails roving tabindex standards.
  - *Lack of Accessible Focus Management*: DaisyUI modals rely either on native HTML `<dialog>` (good) or CSS `:target` / checkbox states (bad). Without companion JavaScript, they do not trap focus, restore focus upon dismissal, or announce dialog boundaries to screen readers.

### 2.2 lucide-main Vector Iconography System Deep Dive
- **Source Location**: `c:\Users\Aditya verma\Desktop\ui ux\lucide-main\lucide-main`
- **Core Specifications**:
  - Base Grid: Exactly 24x24 pixels.
  - Stroke Weight: Uniform 2.0px (`stroke-width="2"`).
  - Terminal Geometry: `stroke-linecap="round"` and `stroke-linejoin="round"`.
  - Color Binding: `stroke="currentColor"` and `fill="none"`.
- **Key Architectures**:
  - `icon.schema.json`: Strict JSON schema governing icon definitions, aliases, categories, tags, and contributors.
  - `category.schema.json` & `categories/`: 40+ rigorous functional categories (`accessibility.json`, `arrows.json`, `charts.json`, `communication.json`, `devices.json`, `finance.json`, `layout.json`, `security.json`).
  - `packages/`: Multi-target build pipelines producing `lucide-react`, `lucide-vue-next`, `lucide-svelte`, `lucide-solid`, and `lucide-static`.
  - `brand-stopwords.json`: Curated filter blocking trademarked commercial logos to protect open-source compliance.
- **Architectural Findings**:
  - *Optical Balancing*: Icons are designed with optical centering rather than geometric bounding-box centering. Asymmetric glyphs (such as `play` or `send`) feature deliberate pixel offsets to ensure visual balance when placed adjacent to text.
  - *Consistent Corner Radiuses*: Internal vector corners use consistent 2px internal fillet radiuses, ensuring harmonious aesthetic unity across all 1,500+ icons.
- **Strengths**:
  - Pristine aesthetic consistency across every domain (navigation, data, finance, media).
  - Multi-framework component wrappers support automatic dynamic sizing (`size={20}`), custom stroke weights (`strokeWidth={1.5}`), and color inheritance.
  - Complete TypeScript definitions with autocomplete for all icon identifiers.
- **Weaknesses & Implementation Risks**:
  - Risk of bundle bloat if imported via barrel files (`import { Icon } from 'lucide-react'`) without bundler tree-shaking support.
  - Missing built-in accessibility: SVGs default to lacking `aria-hidden="true"`, requiring developers to manually provide accessibility attributes.

### 2.3 mantine-master (v9.7.4) Enterprise Framework Deep Dive
- **Source Location**: `c:\Users\Aditya verma\Desktop\ui ux\mantine-master\mantine-master`
- **Core Packages**: `@mantine/core` (Version: 9.7.4), `@mantine/hooks`, `@mantine/form`, `@mantine/dates`, `@mantine/charts`, `@mantine/notifications`, `@mantine/modals`, `@mantine/spotlight`, `@mantine/dropzone`.
- **Key Architectures**:
  - `packages/@mantine/core/src/core/MantineProvider/`: Centralized theme provider, color-scheme management (light, dark, auto), and CSS variable generation (`default-css-variables.css`, `default-theme.ts`).
  - `packages/@mantine/core/src/components/`: Over 100 enterprise components including new v9 primitives: `Cascader`, `Tree`, `TreeSelect`, `EmptyState`, `Splitter`, `Scroller`, `RollingNumber`, `AngleSlider`, `Toolbar`, `Tour`, `DataList`, `AppShell`, `Combobox`, `TableOfContents`.
  - CSS Architecture: Zero-runtime CSS Modules powered by `postcss-preset-mantine` supporting `rem()` unit conversions and `light-dark()` color calculations.
- **Architectural Findings**:
  - *10-Shade Color Scale*: Every color palette defines exactly 10 indexed shades (`0` to `9`). In light mode, shade `6` serves as the primary fill; in dark mode, shade `8` or `9` is used for deep backgrounds while shade `4` or `5` provides high-contrast text.
  - *Headless + Styled Separation*: Components like `Combobox` provide headless building blocks (`Combobox.Target`, `Combobox.Dropdown`, `Combobox.Options`, `Combobox.Option`) enabling arbitrary layout customization without sacrificing ARIA compliance or keyboard navigation.
  - *Enterprise Hook Library*: `@mantine/hooks` contains dozens of battle-tested hooks (`useDisclosure`, `useHotkeys`, `useMediaQuery`, `useDebouncedValue`, `useClickOutside`, `useFocusTrap`, `useIdle`, `useNetwork`).
- **Strengths**:
  - Gold-standard accessibility: strict keyboard navigation, ARIA live regions, focus trapping, and screen-reader testing.
  - Complete enterprise feature set: built-in notifications manager, spotlight command palettes, and complex form state validation (`@mantine/form`).
  - Zero-runtime CSS prevents runtime CSS-in-JS style injection bottlenecks.
- **Weaknesses & Architectural Constraints**:
  - Strictly coupled to React 18/19. Cannot be shared with non-React micro-frontends.
  - Requires dedicated PostCSS build configuration, creating friction when paired with pure Tailwind CSS v4 projects unless explicitly bridged via CSS `@layer`.

### 2.4 react-dropzone-master Headless File Ingestion Deep Dive
- **Source Location**: `c:\Users\Aditya verma\Desktop\ui ux\react-dropzone-master\react-dropzone-master`
- **Core Implementation**: `src/index.tsx`, `src/utils/`
- **Architectural Findings**:
  - *Headless State Machine*: Exposes the `useDropzone` React hook and `<Dropzone>` wrapper. Generates state flags: `isFocused`, `isDragActive`, `isDragAccept`, `isDragReject`, `isFileDialogActive`.
  - *Event Normalization*: Accurately manages erratic HTML5 Drag and Drop events (`dragenter`, `dragover`, `dragleave`, `drop`) across Chrome, Safari, Firefox, and mobile web views.
  - *Validation Engine*: Enforces strict constraints on MIME types (`accept`), file size (`minSize`, `maxSize`), and count limits (`maxFiles`), returning structured rejection codes:
    - `file-invalid-type`: File type does not match specified MIME/extension filter.
    - `file-too-large`: File size exceeds `maxSize`.
    - `file-too-small`: File size is below `minSize`.
    - `too-many-files`: Ingested file count exceeds `maxFiles`.
  - *Accessibility Mechanics*: Injects `role="presentation"` on the drop container, connects a hidden `<input type="file">` with `tabIndex={0}`, and supports full keyboard triggers (`Enter` and `Space`).
- **Strengths**:
  - The industry benchmark for web file ingestion. Rock-solid cross-browser reliability.
  - 100% headless: imposes zero styling restrictions, allowing complete visual customization.
- **Weaknesses & Missing Capabilities**:
  - Pure headless: provides no visual UI, progress bars, image preview generation, or chunked upload handling out of the box.

### 2.5 tremor-main (Tremor Raw / v3) Analytics System Deep Dive
- **Source Location**: `c:\Users\Aditya verma\Desktop\ui ux\tremor-main\tremor-main`
- **Core Architecture**:
  - Modern Tremor Raw paradigm: direct copy-and-paste Tailwind CSS v4 `@theme` components integrated with Radix UI headless primitives and Recharts SVG graphics.
  - `src/globals.css`: Defines native Tailwind v4 `@theme` keyframes (`accordionOpen`, `slideDownAndFade`, `dialogOverlayShow`, `drawerSlideLeftAndFade`) and spring easings (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - `src/components/`: Analytical components including `AreaChart`, `BarChart`, `BarList`, `CategoryBar`, `ComboChart`, `DonutChart`, `LineChart`, `SparkChart`, `ProgressCircle`, `ProgressBar`, `Tracker`, `RadioCardGroup`, `Badge`, `Callout`, `Card`, `Table`.
- **Architectural Findings**:
  - *Minimal Cognitive Load*: Tremor's design philosophy prioritizes clean executive readability: muted background gridlines, understated axis ticks, high-contrast hover crosshairs, and custom SVG tooltips.
  - *Specialized Analytical Primitives*:
    - `SparkChart`: Zero-axis, compact micro-charts designed for dense metric cards.
    - `BarList`: Proportional horizontal bar rows for ranked categorical data (e.g., top referral channels).
    - `CategoryBar`: Segmented horizontal threshold bars for quotas, risk tiers, and health scores.
    - `Tracker`: Chronological block-segment strips for uptime, service health, and CI/CD pipelines.
- **Strengths**:
  - Unrivaled executive aesthetic for B2B analytics, SaaS metrics, and financial intelligence.
  - Native integration with Tailwind CSS v4 utility classes and Radix UI primitives.
- **Weaknesses & Production Gotchas**:
  - Recharts dependency relies on SVG rendering that requires client-side rendering (CSR) guards (`'use client'` or dynamic imports with `ssr: false`) to avoid Next.js hydration mismatches.
  - Fixed chart types: not suited for specialized 3D geometries, geospatial mapping, or real-time sub-millisecond canvas streaming.

### 2.6 Wajah Product Design Specification (design.md) Deep Dive
- **Source Location**: `design.md` (Product: Wajah — Rejection Decoder v1.0)
- **Core Philosophy**: Extreme resilience, radical transparency, bilingual English/Hindi parity, and ethical, non-exploitative public digital service design.
- **Key Architectural Findings**:
  - *Mobile-First 360px Baseline*: Engineered for budget Android smartphones on throttled 2G/3G/Slow 4G connections. Content is optimized for 360px viewports, functional down to 320px with zero horizontal scroll, and constrained to a maximum 640px reading column on desktop.
  - *Multi-Attribute Non-Color Semantic Cueing*: The Wajah specification explicitly prohibits color-only status differentiation. Every responsibility/fault category is communicated through four synchronized cues:
    1. **Color Fill/Text**: Teal (`#0E7C86`), Blue (`#1F5FA8`), Brown-Orange (`#A8530A`), or Slate Grey (`#5B6770`).
    2. **Iconography**: Specific Lucide icons (`User`, `Building`, `Landmark`, `HelpCircle`).
    3. **Border Geometry**: Distinct CSS border styles (Solid, Dashed, Double, or Dotted).
    4. **Explicit Plain-Language Copy**: Mandatory descriptive sentence declaring who must act.
  - *Banning False Certainty*: Strictly prohibits probabilistic percentages (e.g., "94% match"). If an exact match is uncertain, it surfaces candidate selection cards and an explicit "Not sure yet" action.
  - *Radical Trust Safeguards*: Mandatory non-dismissible Independence Ribbon ("Independent prototype. Not a government service. Not affiliated with NSP"); explicit source metadata with verification dates; draft notices for unverified content.
  - *Active Privacy Sanitization*: Implements pre-submission masking reviews for sensitive patterns (passwords, OTPs, Aadhaar numbers, bank accounts) before processing.
  - *Low-Bandwidth Budget*: Target bundle size under 100KB for offline core logic; under 150KB initial JS; zero remote English web font dependencies; high-contrast black-and-white print stylesheet.
- **Strengths**:
  - Represents the gold standard for accessible, ethical, and resilient design for high-stakes public digital products.
  - Solves the critical real-world problem of bilingual typography (Hindi Devanagari + English Latin) without visual degradation.
- **Weaknesses**:
  - Tailored primarily for reading and structured decision journeys; requires extension to support complex data visualization, analytics dashboards, and rich admin CRUD interfaces.

### 2.7 Parent Workspace: ui ux Architectural Synthesis
The `ui ux` parent directory brings these six repositories together into a unified product engineering continuum. By inspecting their interaction points, we discover a complete, symbiotic architecture:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                COMPONENT COMPOSITION CONTINUUM                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│  [ DaisyUI 5 & Tailwind v4 ]  ──> Base Styles, CSS Resets, OKLCH Color Tokens, Semantic Atoms  │
│             │                                                                                  │
│             ▼                                                                                  │
│  [ Lucide Vector Icons ]      ──> 24x24 2px Iconography standard injected across all controls  │
│             │                                                                                  │
│             ▼                                                                                  │
│  [ Mantine 9 Core & Hooks ]   ──> Enterprise Overlays, FocusTrap, Combobox, Form Validation    │
│             │                                                                                  │
│             ▼                                                                                  │
│  [ React Dropzone ]           ──> Headless Drag-and-Drop File Ingestion Machine                │
│             │                                                                                  │
│             ▼                                                                                  │
│  [ Tremor Raw / v3 ]          ──> Executive KPI Cards, Sparklines, BarLists, Analytics Charts  │
│             │                                                                                  │
│             ▼                                                                                  │
│  [ Wajah (design.md) ]        ──> Multi-Attribute Cues, 360px Resilience, Bilingual Trust Rules│
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

This synthesis eliminates library redundancy by assigning each library a dedicated role in the stack:
- **DaisyUI** supplies lightweight, zero-JS CSS classes for base elements.
- **Lucide** provides uniform visual symbols across every component.
- **Mantine** manages complex keyboard interactions, accessible popovers, and form validation.
- **React Dropzone** powers robust file ingestion.
- **Tremor Raw** visualizes analytical data.
- **Wajah** ensures strict accessibility, bilingual typography, and ethical transparency.

---

## Section 3: Comparative Evaluation

### 3.1 Comprehensive 10-Dimension Evaluation Matrix
Each resource has been rigorously evaluated across ten core engineering and design dimensions on a 1–10 scale:

| Evaluation Dimension | DaisyUI 5.7.50 | Lucide Icons | Mantine 9.7.4 | React Dropzone | Tremor Raw / v3 | Wajah (design.md) | Master System Standard |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Visual Quality** | 9 / 10 | 10 / 10 | 9 / 10 | N/A (Headless) | 10 / 10 | 8 / 10 | **10 / 10** |
| **Modernity** | 10 / 10 (Tailwind v4) | 10 / 10 | 10 / 10 (CSS Mods) | 8 / 10 | 10 / 10 (Raw) | 9 / 10 | **10 / 10** |
| **Consistency** | 8 / 10 | 10 / 10 | 10 / 10 | 9 / 10 | 9 / 10 | 10 / 10 | **10 / 10** |
| **Accessibility (a11y)** | 6 / 10 | 7 / 10 | 10 / 10 (WAI-ARIA) | 9 / 10 | 8 / 10 (Radix) | 10 / 10 (WCAG AAA) | **10 / 10** |
| **Responsiveness** | 9 / 10 | 10 / 10 | 9 / 10 | 10 / 10 | 9 / 10 | 10 / 10 (320px-ready) | **10 / 10** |
| **Flexibility** | 9 / 10 | 10 / 10 | 9 / 10 | 10 / 10 | 8 / 10 | 7 / 10 | **10 / 10** |
| **Performance (Bundle/FPS)** | 10 / 10 (Zero-JS) | 9 / 10 | 8 / 10 | 10 / 10 | 8 / 10 (Recharts) | 10 / 10 (<100KB) | **10 / 10** |
| **Scalability** | 8 / 10 | 10 / 10 | 10 / 10 | 9 / 10 | 8 / 10 | 8 / 10 | **10 / 10** |
| **Developer Experience (DX)** | 9 / 10 | 10 / 10 | 10 / 10 | 9 / 10 | 9 / 10 | 9 / 10 | **10 / 10** |
| **Interaction Quality** | 7 / 10 | N/A (Static) | 10 / 10 | 9 / 10 | 9 / 10 | 9 / 10 | **10 / 10** |

### 3.2 Detailed Adoption, Modification, and Rejection Strategy

#### 1. What to ADOPT (Core System Foundations)
- **From DaisyUI 5**:
  - The OKLCH color space architecture: adopt perceptually uniform lightness, chroma, and hue variables for all theme definitions.
  - Pure CSS semantic component utilities (`btn`, `badge`, `card`, `indicator`, `join`, `kbd`, `chat`, `diff`) for high-performance, zero-JS rendering.
  - The 35 built-in themes, standardizing on curated Light, Dark, Corporate, and High-Contrast themes.
- **From Lucide Icons**:
  - The universal 24x24 2.0px stroke vector standard.
  - The complete Lucide React icon library, enforcing strict functional categorization and optical centering rules.
- **From Mantine 9**:
  - The enterprise interactive primitives: `Combobox`, `Modal`, `Drawer`, `Menu`, `Popover`, `Tree`, `Cascader`, `AppShell`, `TableOfContents`, `Splitter`.
  - The comprehensive `@mantine/hooks` suite (`useDisclosure`, `useHotkeys`, `useMediaQuery`, `useFocusTrap`, `useDebouncedValue`).
  - The `@mantine/form` validation system for rock-solid client-side form logic.
- **From React Dropzone**:
  - The headless `useDropzone` drag-and-drop state machine for all file ingestion workflows.
- **From Tremor Raw**:
  - The executive dashboard design language: understated background grids, micro-sparklines, high-contrast tooltips, `BarList`, `CategoryBar`, and `Tracker` components.
  - Radix UI-backed interactive analytics controls with Tailwind CSS v4 `@theme` spring easing curves.
- **From Wajah Specification (`design.md`)**:
  - Multi-attribute non-color semantic cueing: mandatory pairing of color with dedicated icons, distinct border styles (solid, dashed, double, dotted), and plain-language copy.
  - Radical trust rules: non-dismissible affiliation headers, verified document dates, and draft warning labels.
  - Low-bandwidth mobile hardening: 360px viewport baseline, 48x48px touch targets, 56px primary buttons, and zero remote font dependencies.
  - Privacy by default: active pre-submission PII sanitization review.

#### 2. What to MODIFY (Architectural Reconciliations)
- **DaisyUI Modal & Dropdown Behavior**:
  - *Modification*: Never use DaisyUI checkbox hacks for complex overlays. Replace with Mantine's `Modal` or Radix UI `Dialog` primitives, wrapping DaisyUI styles around an accessible container that provides genuine focus trapping, background scroll locking, and Escape key dismissal.
- **Mantine Theme & Styling Integration**:
  - *Modification*: Isolate Mantine's CSS modules inside a dedicated CSS `@layer mantine` so Tailwind CSS v4 utility classes can override Mantine styles without requiring `!important`. Map Mantine's 10-shade color array directly to Tailwind's OKLCH color variables.
- **React Dropzone Presentation**:
  - *Modification*: Wrap the headless `useDropzone` hook with DaisyUI surface styling, Lucide upload iconography, animated progress indicators, and Wajah-style inline error messages.
- **Tremor Recharts SSR Hydration**:
  - *Modification*: Wrap Tremor charts in dynamic client-only loaders (`next/dynamic` or `React.lazy` with skeleton fallbacks) to prevent Next.js / Remix SSR hydration mismatches. Provide fallback accessible data tables for screen readers.

#### 3. What to REJECT (Anti-Patterns & Flaws)
- **REJECT: Checkbox-Based State Hacks**: Reject any interactive component relying on hidden HTML checkboxes for dropdown, drawer, or modal visibility. These patterns lack proper ARIA states and break keyboard navigation.
- **REJECT: Color-Only Status Indicators**: Reject badges or alerts that communicate status solely through color fills. Color-blind users cannot differentiate green and red indicators without accompanying text and icons.
- **REJECT: Probabilistic AI Confidences**: Reject floating percentage indicators (e.g., "AI is 98.4% confident"). These create a false sense of certainty in automated decision systems.
- **REJECT: Remote Font Blocking**: Reject blocking external web fonts on critical rendering paths. Ensure the system font stack renders immediately.
- **REJECT: Unbounded Reading Columns**: Reject text containers that span the full viewport width on desktop. Cap body reading columns at 640px (approximately 75 characters per line).

### 3.3 Pattern Redundancy & Harmonization Map
Where multiple resources provide overlapping components, the master design system resolves the redundancy decisively:

| Component Type | DaisyUI 5 Offering | Mantine 9 Offering | Tremor Raw Offering | Master System Decision & Harmonization Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Button** | `btn btn-primary` (CSS) | `<Button>` (React) | `<Button>` (Radix) | **Harmonized**: Use DaisyUI CSS classes for static/server components; use Mantine `<Button>` when dynamic loading spinners, form-submitting states, or complex keyboard behaviors are required. |
| **Card** | `card bg-base-100` | `<Card>` | `<Card>` (Tailwind) | **Harmonized**: Standardize on Tremor's clean border/shadow tokens for dashboard cards; use DaisyUI `card` classes for content/marketing cards. |
| **Modal / Dialog** | `modal` (Native/CSS) | `<Modal>` (Portal/Trap)| `<Dialog>` (Radix) | **Harmonized**: Standardize on Mantine `<Modal>` / Radix `<Dialog>` for guaranteed WAI-ARIA focus trapping, backdrop blur, and scroll lock. |
| **Badge / Chip** | `badge badge-info` | `<Badge>` | `<Badge>` | **Harmonized**: Use DaisyUI CSS badges with Lucide icons; for interactive filter chips, use Mantine `<Chip>`. |
| **Data Table** | `table table-zebra` | `<Table>` | `<Table>` | **Harmonized**: Use Tremor's clean table formatting for analytics; use Mantine's searchable/sortable `<Table>` with pagination for complex enterprise CRUD. |
| **Dropdown / Menu** | `dropdown` (CSS/Details)| `<Menu>` (FloatingUI)| `<DropdownMenu>` (Radix)| **Harmonized**: Standardize on Mantine `<Menu>` or Radix `<DropdownMenu>` for roving tabindex keyboard navigation. |
| **File Uploader** | `file-input` (Native) | `@mantine/dropzone` | None | **Harmonized**: Combine React Dropzone headless logic with Mantine/Tremor surface styling and Lucide icons. |

---

## Section 4: Master Design Philosophy

### 4.1 The Ten Core Design Principles
1. **Clarity Over Decorative Clutter**: Every pixel, border, and visual token must convey functional meaning. Remove unnecessary gradients, heavy drop shadows, and ornamental graphics.
2. **Trust Through Radical Transparency**: A digital interface must never deceive its user. Always surface source provenance, document verification dates, draft warnings, and prominent non-affiliation notices.
3. **Multi-Attribute Inclusive Accessibility**: Accessibility is not an afterthought. Never communicate state through color alone. Combine color, distinct iconography, varied border geometries (solid, dashed, double, dotted), and explicit plain-language copy.
4. **Resilient Mobile-First Architecture**: Build for the most constrained real-world scenario first: a 360px viewport on a throttled mobile network. Ensure the UI scales gracefully to ultrawide desktop displays.
5. **Deterministic State Feedback**: Every user interaction must produce immediate visual feedback within 100ms. Provide clear indicators for default, hover, focus-visible, active/pressed, disabled, and loading states.
6. **No False Certainty in AI Systems**: Never present probabilistic AI inference as absolute truth. Avoid arbitrary confidence percentages; surface candidate selection cards and an honest "Not sure yet" fallback.
7. **Perceptually Uniform Color Science**: Use the OKLCH color space to guarantee consistent visual lightness, chroma, and contrast across light and dark themes.
8. **Bilingual & Multilingual Typography Parity**: Ensure non-Latin scripts (e.g., Hindi Devanagari) receive equal visual weight, comfortable line heights, and matching optical sizing without being reduced to fit.
9. **Zero-Latency Content Availability**: Prioritize text and essential data over heavy media assets. Essential reading workflows must function completely offline or under degraded network conditions.
10. **Strict Privacy by Default**: Actively sanitize user input. Never store, log, or display unmasked personal secrets, passwords, or government identifiers.

### 4.2 Visual Hierarchy & Cognitive Load Architecture
Visual hierarchy directs user attention to the most important task first:
- **Primary Visual Anchor**: Every view must feature exactly one primary focal point (e.g., a primary call-to-action button, a core KPI metric, or an active fix card).
- **Surface Elevation Hierarchy**: Establish depth using four surface layers:
  - *Layer 0 (Canvas)*: The background page canvas (`--color-base-100`).
  - *Layer 1 (Card/Container)*: Elevated content surfaces (`--color-base-200` or clean white with subtle 1px border).
  - *Layer 2 (Overlays/Popovers)*: Floating dropdowns, tooltips, and flyout menus with subtle elevation shadows.
  - *Layer 3 (Modal/Dialog)*: Full-screen modal overlays featuring a darkened, backdrop-blurred scrim.
- **Reading Measure Constraint**: Body text containers must never exceed 640px in width (approximately 60–75 characters per line). Wide lines cause reading fatigue and decrease comprehension.

### 4.3 Color Philosophy (OKLCH Perception & Functional Roles)
Our color system is built on modern color science:
- **The OKLCH Advantage**: Traditional sRGB and HSL color models suffer from non-uniform perceived brightness (e.g., pure yellow appears far brighter to the human eye than pure blue at the same nominal lightness). OKLCH fixes this by separating perceptual lightness ($L$), chroma ($C$), and hue ($H$). An OKLCH lightness of 70% delivers identical perceived contrast regardless of whether the hue is blue, amber, or green.
- **The 60-30-10 Distribution Rule**:
  - **60% Dominant Base**: Canvas backgrounds and surface cards (neutral grays and whites in light mode; deep slates in dark mode).
  - **30% Structural Secondary**: Typography, borders, icons, and secondary buttons.
  - **10% Intentional Accent**: Primary action triggers, active selection rings, and semantic status indicators.
- **Semantic Color Isolation**: Reserve bright semantic colors (success green, error red, warning amber) exclusively for state feedback. Never use semantic colors for purely decorative background elements.

### 4.4 Typography Philosophy (Editorial Clarity & Bilingual Parity)
- **Scale Ratio**: Uses a **1.250 Major Third** typographic scale, generating clear, harmonious hierarchy from captions to display headlines.
- **System-First Font Stacks**: Avoid blocking remote web font downloads for base text. Leverage native system font stacks (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for instantaneous text rendering.
- **Bilingual Font Parity**: Non-Latin scripts require careful vertical proportioning:
  - Hindi Devanagari text possesses taller ascenders and lower descenders than Latin characters. The line-height must expand from 1.5 to 1.6–1.65 to prevent line collisions.
  - Devanagari text must never be shrunk to match English word lengths. Allow containers to expand naturally.

### 4.5 Spacing & Spatial Cadence (The 4px Base Rhythm)
- **Base Grid**: Strict 4px spatial increment. Every margin, padding, height, width, and gap must be a multiple of 4px (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Component Internal Spacing**:
  - Tight micro-gaps (e.g., icon to label): `4px` or `8px`.
  - Standard input and button padding: `10px` to `16px`.
  - Card internal padding: `16px` (mobile) to `24px` (desktop).
- **Layout Spacing**: Section gaps scale predictably: `24px` on mobile viewports up to `48px`–`64px` on desktop layouts.

### 4.6 Layout Philosophy (Intrinsic & Container-Driven)
- **Intrinsic Responsiveness**: Layouts should adapt naturally using modern CSS features (`flex-wrap`, `grid-template-columns: repeat(auto-fit, minmax(...))`, and `clamp()`) rather than relying solely on rigid breakpoint jumps.
- **AppShell Framework**: Large applications must follow a standardized layout shell featuring:
  - Persistent or collapsible sidebar navigation.
  - Fixed top utility header with search and user controls.
  - Scrollable main canvas with bounded content containers.
- **Reading Viewports**: Structured text journeys (e.g., step-by-step resolution cards) must remain centered and readable across all viewport sizes.

### 4.7 Component Design Principles (Separation of State & Style)
- **Decoupled Architecture**: Separate visual presentation from interactive state logic.
- **Compound Components**: Build complex UI components using compound sub-components (e.g., `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`) to give developers full layout control while preserving keyboard focus and ARIA boundaries.
- **Polymorphic Rendering**: Interactive components must support the `as` / `asChild` polymorphic pattern, allowing a button component to render semantically as an HTML `<a>` tag or Next.js `<Link>` without altering its visual styles.

### 4.8 Accessibility Principles (Radical Inclusion & Non-Color Cues)
- **WCAG 2.1 Level AA & AAA Targets**: Ensure all normal text achieves at least a 4.5:1 contrast ratio against its background, with 7:1 targeted for critical instructional copy. Large text and meaningful icons must achieve at least 3:1.
- **Multi-Attribute Cueing Matrix**:
  - *Student / User Side*: Teal (`#0E7C86`) + User Icon + Solid Border + "Your side".
  - *Institute / Authority Side*: Blue (`#1F5FA8`) + Building Icon + Dashed Border + "Institute side".
  - *Bank / Financial Side*: Orange (`#A8530A`) + Bank Icon + Double Border + "Bank side".
  - *Uncertain State*: Slate Grey (`#5B6770`) + Question Mark Icon + Dotted Border + "Not sure yet".
- **Focus Rings**: Interactive elements must feature an unmistakable, high-contrast focus ring (`2px solid var(--color-primary)` with a `2px` offset) visible under keyboard navigation. Never set `outline: none` without providing an accessible alternative.

### 4.9 Interaction Principles (Physicality, Predictability, & Delight)
- **Physical Feedback**: Interactive components should feel tangible and responsive. Buttons depress slightly on active press (`transform: scale(0.98)` or `translateY(1px)`).
- **Spring Easing Curves**: Avoid stiff, mechanical linear transitions. Standardize on organic spring easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Duration Limits**: Micro-interactions must complete between 100ms and 200ms. Never force a user to wait through slow, gratuitous UI animations.
- **Motion Reduction**: Honor the `prefers-reduced-motion` media query by replacing movement animations with simple, instant opacity transitions.

### 4.10 Responsive Design Principles (320px Hardening to Ultrawide)
- **The 320px Stress Test**: Every screen must remain fully functional on screens as narrow as 320px without layout breaking, content clipping, or horizontal page scrolling.
- **Touch Target Floor**: Interactive controls must provide a minimum touch target area of 48x48px, separated by at least 8px from adjacent controls. Primary action triggers must stand at least 56px tall for effortless mobile interaction.
- **Fluid Desktop Expansion**: On wide displays, increase white space and margins while keeping line lengths constrained to optimal reading widths.
---

## Section 5: Complete Design Token Reference

The Master Design System tokens establish the concrete physical constants across all CSS stylesheets, Tailwind CSS v4 `@theme` configurations, and Mantine `createTheme()` overrides.

### 5.1 Color Tokens: Primary, Secondary, and Neutral Scales
All colors are specified in hex notation alongside their native OKLCH equivalents for perceptual uniformity.

| Token Identifier | Hex Value | OKLCH Equivalence | Functional Role & Contrast Target |
| :--- | :--- | :--- | :--- |
| `--color-brand-950` | `#0D1D2D` | `oklch(22% 0.04 240)` | High-contrast headers, dark canvas background |
| `--color-brand-900` | `#17324D` | `oklch(28% 0.06 240)` | Primary structural text, deep brand elements |
| `--color-brand-800` | `#1A456E` | `oklch(36% 0.09 240)` | Dark navigation bars, brand emphasis |
| `--color-brand-700` | `#1F5FA8` | `oklch(46% 0.14 245)` | Secondary interactive link, Institute label |
| `--color-brand-600` | `#2575CF` | `oklch(56% 0.18 250)` | Primary interactive hover state |
| `--color-brand-500` | `#3B82F6` | `oklch(62% 0.20 255)` | Default primary action, active selection rings |
| `--color-brand-400` | `#60A5FA` | `oklch(72% 0.16 250)` | Dark-mode primary button, interactive accents |
| `--color-brand-100` | `#DBEAFE` | `oklch(93% 0.04 250)` | Selected item background, soft highlight |
| `--color-brand-50`  | `#EFF6FF` | `oklch(97% 0.01 250)` | Subtle table row highlight, active container |
| `--color-action-800`| `#08656E` | `oklch(42% 0.09 195)` | Primary action pressed / active state |
| `--color-action-700`| `#0E7C86` | `oklch(51% 0.11 195)` | Primary call-to-action button, "Your side" |
| `--color-action-600`| `#1499A5` | `oklch(61% 0.12 195)` | Primary call-to-action hover state |
| `--color-action-100`| `#CCFBF1` | `oklch(95% 0.05 185)` | Soft action pill background, active badge |
| `--color-gray-950`  | `#141414` | `oklch(18% 0.00 0)`   | Pure dark-mode canvas, highest-contrast text |
| `--color-gray-900`  | `#212529` | `oklch(24% 0.01 260)` | Primary light-mode body text (WCAG AAA 14.8:1)|
| `--color-gray-800`  | `#343A40` | `oklch(32% 0.01 260)` | Secondary headings, strong borders |
| `--color-gray-700`  | `#495057` | `oklch(41% 0.01 260)` | Form labels, table column headers |
| `--color-gray-600`  | `#6C757D` | `oklch(54% 0.01 260)` | Secondary text, helper copy, icon fills |
| `--color-gray-500`  | `#ADB5BD` | `oklch(75% 0.01 260)` | Disabled button text, placeholder copy |
| `--color-gray-400`  | `#CED4DA` | `oklch(86% 0.01 260)` | Standard input borders, card outlines |
| `--color-gray-300`  | `#DEE2E6` | `oklch(90% 0.01 260)` | Table row dividers, subtle panel borders |
| `--color-gray-200`  | `#E9ECEF` | `oklch(94% 0.01 260)` | Inset input backgrounds, hover fills |
| `--color-gray-100`  | `#F1F3F5` | `oklch(96% 0.01 260)` | Card surface containers, light tags |
| `--color-gray-50`   | `#F8F9FA` | `oklch(98% 0.00 0)`   | Page canvas background, subtle alternation |

### 5.2 Background and Surface Tokens

| Token Identifier | Light Mode Value | Dark Mode Value | Semantic Application |
| :--- | :--- | :--- | :--- |
| `--color-bg-canvas` | `#FFFFFF` | `#0D1117` | The root page canvas background |
| `--color-bg-subtle` | `#F8F9FA` | `#161B22` | Secondary sidebars, app shell containers |
| `--color-surface-card` | `#FFFFFF` | `#1F242C` | Default card surfaces, analytical widgets |
| `--color-surface-raised` | `#FFFFFF` | `#282E38` | Dropdown menus, popovers, flyout sheets |
| `--color-surface-modal` | `#FFFFFF` | `#303642` | Centered modal dialogs, critical alerts |
| `--color-surface-inset` | `#F1F3F5` | `#12151A` | Input fields, search textareas, code blocks |
| `--color-scrim` | `rgba(15, 23, 42, 0.65)` | `rgba(0, 0, 0, 0.80)` | Modal backdrop blur scrim |

### 5.3 Semantic and Multi-Attribute Fault Tokens

| Semantic Role | Hex Value | Border Geometry | Lucide Icon | Multi-Attribute Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#1B8755` | 1px Solid | `CheckCircle2` | Confirmed action, valid form field, payment verified |
| **Warning** | `#B45309` | 1px Solid | `AlertTriangle`| Soft deadline approaching, unverified draft |
| **Danger / Error** | `#D92D20` | 1.5px Solid | `AlertOctagon` | Critical validation failure, transaction rejected |
| **Info** | `#0284C7` | 1px Solid | `Info` | Neutral operational note, informational metadata |
| **Fault: User Side** | `#0E7C86` | 2px Solid | `User` | Action required by applicant / end-user |
| **Fault: Institute**| `#1F5FA8` | 2px Dashed | `Building` | Action required by university or nodal officer |
| **Fault: Financial**| `#A8530A` | 3px Double | `Landmark` | Action required by issuing bank or payment gateway |
| **Fault: Uncertain**| `#5B6770` | 2px Dotted | `HelpCircle` | Unresolved status; candidate selection required |

### 5.4 Typography Scale Tokens
Scale is built on a 1.250 Major Third progression, anchored to a 16px (1rem) root font size.

| Token Identifier | Rem Size | Pixel Equiv | Line Height | Letter Spacing | Ideal Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--font-display-2xl`| `3.00rem` | 48px | `1.15` | `-0.025em` | Marketing landing page main heroes |
| `--font-display-xl` | `2.50rem` | 40px | `1.20` | `-0.020em` | Landing page secondary section heroes |
| `--font-h1` | `2.00rem` | 32px | `1.25` | `-0.015em` | Top-level dashboard & screen titles |
| `--font-h2` | `1.625rem`| 26px | `1.30` | `-0.010em` | Major section headings, card group titles |
| `--font-h3` | `1.375rem`| 22px | `1.35` | `-0.005em` | Card titles, modal headers, fix card actions |
| `--font-h4` | `1.125rem`| 18px | `1.40` | `0.000em` | Sub-section labels, prominent table headers |
| `--font-body-lg` | `1.125rem`| 18px | `1.50` | `0.000em` | High-readability body (Wajah standard) |
| `--font-body-md` | `1.000rem`| 16px | `1.55` | `0.000em` | Standard interface text, forms, tables |
| `--font-body-sm` | `0.875rem`| 14px | `1.45` | `0.005em` | Helper copy, metadata labels, badges |
| `--font-caption` | `0.750rem`| 12px | `1.40` | `0.010em` | Micro-badges, chart axis ticks, timestamps |
| `--font-code` | `0.875rem`| 14px | `1.50` | `0.000em` | Monospace code blocks, secret masking |

### 5.5 Font Weight Tokens

| Token Identifier | Numeric Weight | CSS Value | Application |
| :--- | :--- | :--- | :--- |
| `--font-weight-regular` | `400` | `font-normal` | Standard body paragraphs, form inputs, secondary metadata |
| `--font-weight-medium` | `500` | `font-medium` | Table column headers, button labels, badge text |
| `--font-weight-semibold`| `600` | `font-semibold`| Card headers, section subtitles, active tab indicators |
| `--font-weight-bold` | `700` | `font-bold` | Display headlines, H1/H2 titles, primary action buttons |

### 5.6 Spacing & Sizing Scale Tokens (Strict 4px Cadence)

| Token Identifier | Rem Size | Pixel Value | Structural Application |
| :--- | :--- | :--- | :--- |
| `--spacing-0` | `0.000rem` | 0px | Zero margin / padding reset |
| `--spacing-1` | `0.250rem` | 4px | Micro-spacing: icon-to-label gaps, badge padding |
| `--spacing-2` | `0.500rem` | 8px | Minimum control separation, tight list item gaps |
| `--spacing-3` | `0.750rem` | 12px | Compact component padding, table cell vertical padding |
| `--spacing-4` | `1.000rem` | 16px | Standard component padding, card mobile gutters |
| `--spacing-5` | `1.250rem` | 20px | Form field spacing, medium container padding |
| `--spacing-6` | `1.500rem` | 24px | Section spacing, desktop card padding |
| `--spacing-8` | `2.000rem` | 32px | Major component grouping, dashboard widget gaps |
| `--spacing-10`| `2.500rem` | 40px | Page-level layout separation |
| `--spacing-12`| `3.000rem` | 48px | Minimum mobile touch target height (48px) |
| `--spacing-14`| `3.500rem` | 56px | Mandatory primary CTA button height (56px) |
| `--spacing-16`| `4.000rem` | 64px | Landing page section padding |
| `--spacing-20`| `5.000rem` | 80px | Major landing page hero breathing room |

### 5.7 Border Radius Tokens

| Token Identifier | Rem Size | Pixel Value | Visual Element |
| :--- | :--- | :--- | :--- |
| `--radius-none` | `0.000rem` | 0px | Rectangular tables, square independence banner |
| `--radius-xs` | `0.125rem` | 2px | Micro-indicators, progress bars |
| `--radius-sm` | `0.250rem` | 4px | Small badges, code chips, tooltips |
| `--radius-md` | `0.500rem` | 8px | Form inputs, select dropdowns, secondary buttons |
| `--radius-lg` | `0.625rem` | 10px | Primary CTA buttons, dropdown menus |
| `--radius-xl` | `0.750rem` | 12px | Content cards, fix cards, analytical widgets |
| `--radius-2xl`| `1.000rem` | 16px | Modal dialogs, floating action sheets |
| `--radius-full`| `9999px` | Fully Round | Avatars, circular icon buttons, status pills |

### 5.8 Shadow & Elevation Tokens

| Token Identifier | CSS Box Shadow Value | Perceived Elevation & Usage |
| :--- | :--- | :--- |
| `--shadow-none` | `none` | Flat cards with 1px border outlines |
| `--shadow-xs` | `0 1px 2px 0 rgba(16, 24, 40, 0.05)` | Subtle list items, table hover rows |
| `--shadow-sm` | `0 1px 3px 0 rgba(16, 24, 40, 0.10), 0 1px 2px -1px rgba(16, 24, 40, 0.10)` | Default content cards, standard buttons |
| `--shadow-md` | `0 4px 6px -1px rgba(16, 24, 40, 0.10), 0 2px 4px -2px rgba(16, 24, 40, 0.06)`| Floating popovers, dropdown menus, cards on hover |
| `--shadow-lg` | `0 10px 15px -3px rgba(16, 24, 40, 0.10), 0 4px 6px -4px rgba(16, 24, 40, 0.05)`| Flyout drawers, mobile bottom sheets |
| `--shadow-xl` | `0 20px 25px -5px rgba(16, 24, 40, 0.10), 0 8px 10px -6px rgba(16, 24, 40, 0.04)`| Centered modal dialogs, critical alerts |
| `--shadow-inset`| `inset 0 2px 4px 0 rgba(16, 24, 40, 0.06)` | Inset text inputs, sunken search containers |

### 5.9 Breakpoint Tokens

| Token Identifier | Min Width (em) | Min Width (px) | Targeted Display Hardware |
| :--- | :--- | :--- | :--- |
| `--breakpoint-xs` | `22.50em` | 360px | Budget smartphones (Wajah primary mobile target) |
| `--breakpoint-sm` | `40.00em` | 640px | Large phablets, small portrait tablets |
| `--breakpoint-md` | `48.00em` | 768px | Standard tablets (iPad portrait), split screens |
| `--breakpoint-lg` | `64.00em` | 1024px | Small laptops, desktop browser windows |
| `--breakpoint-xl` | `80.00em` | 1280px | Standard desktop displays, high-density monitors |
| `--breakpoint-2xl`| `96.00em` | 1536px | Ultrawide enterprise workstations |

### 5.10 Z-Index Scale Tokens

| Token Identifier | Value | Layer Boundary |
| :--- | :--- | :--- |
| `--z-deep-hide` | `-1` | Hidden background decor, underlay grids |
| `--z-base` | `0` | Default page canvas and standard content flow |
| `--z-raised` | `10` | Sticky table headers, subtle floating pills |
| `--z-dropdown` | `1000` | Select options, context menus, autocomplete menus |
| `--z-sticky` | `1100` | Sticky navigation headers, top bars |
| `--z-drawer` | `1200` | Off-canvas mobile sidebars, slide-out drawer sheets |
| `--z-scrim` | `1250` | Backdrop scrim behind modals and drawers |
| `--z-modal` | `1300` | Centered modal dialogs, lightbox overlays |
| `--z-popover` | `1400` | Interactive floating popovers, tour tips |
| `--z-toast` | `1500` | High-priority toast notifications |
| `--z-tooltip` | `1600` | Instant informative tooltips (highest visible layer) |

### 5.11 Transitions & Animation Tokens

| Token Identifier | Duration | Easing Function | Best Use Case |
| :--- | :--- | :--- | :--- |
| `--motion-instant` | `75ms` | `linear` | Tooltip reveals, active button tap depressions |
| `--motion-fast` | `150ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dropdown openings, accordion reveals, hover transitions |
| `--motion-normal` | `200ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Drawer slide-outs, modal dialog presentations |
| `--motion-slow` | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Full-screen page transitions, complex tab swaps |

---

## Section 6: Typography System

### 6.1 Font Stacks & Zero-Font-Blocking Strategy
To ensure immediate readability on throttled 2G/3G networks, the master typography system enforces a **Zero-Remote-Font-Blocking** strategy for core interfaces.

```css
/* Primary System Font Stack (Instant Latin Rendering) */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";

/* Bilingual Devanagari Font Stack (Hindi Support) */
--font-devanagari: "Noto Sans Devanagari", -apple-system, BlinkMacSystemFont, 
                   "Segoe UI", Roboto, sans-serif;

/* Monospace Code & Masking Stack */
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 
             "Liberation Mono", "Courier New", monospace;
```

### 6.2 Bilingual Typography Parity (English + Hindi)
Hindi Devanagari characters require distinct vertical and optical accommodations compared to Latin characters:
1. **Vertical Metrics**: Devanagari glyphs incorporate top horizontal headline strokes (Shirorekha) and extensive upper/lower vowel diacritics. If rendered with Latin line-heights (1.4–1.5), diacritics collide with adjacent lines. The master standard enforces a minimum line-height of `1.6` for Devanagari body text.
2. **Optical Sizing Parity**: Never reduce Hindi font size to fit containers designed for shorter English words. A 16px English label must match a 16px or 18px Hindi label. Interfaces must allow natural wrapping and vertical expansion.
3. **Language Tagging**: Always wrap bilingual phrases in semantic HTML with explicit `lang` attributes:
   ```html
   <p lang="en">What this usually means: <span lang="hi">संस्थान की ओर से कार्रवाई आवश्यक है</span></p>
   ```

### 6.3 Fluid Typography Formulas
To eliminate abrupt font-size snapping between mobile and desktop, headings utilize CSS `clamp()`:
```css
/* Fluid H1: Scales smoothly from 24px (at 360px viewport) to 32px (at 1024px viewport) */
--font-fluid-h1: clamp(1.50rem, 1.25rem + 1.1vw, 2.00rem);

/* Fluid H2: Scales smoothly from 20px (at 360px viewport) to 26px (at 1024px viewport) */
--font-fluid-h2: clamp(1.25rem, 1.05rem + 0.9vw, 1.625rem);

/* Fluid Display: Scales smoothly from 32px to 48px */
--font-fluid-display: clamp(2.00rem, 1.50rem + 2.2vw, 3.00rem);
```

### 6.4 Reading Measure & Scannability
- **Optimal Line Length**: Research proves reading comprehension degrades when lines exceed 75 characters. All body paragraphs and fix cards are capped at `max-width: 40rem` (640px).
- **Paragraph Spacing**: Separate paragraphs with `1.25em` margins. Never rely on first-line indents in digital interfaces.

---

## Section 7: Color System

### 7.1 OKLCH Color Mechanics & Contrast Architecture
The Master Color System operates natively in the OKLCH color space. Lightness ($L$), Chroma ($C$), and Hue ($H$) allow us to calibrate mathematically precise contrast boundaries:

```
  oklch( Lightness%   Chroma   Hue )
         │            │        │
         │            │        └─ Angle in degrees (0 to 360)
         │            └────────── Purity/saturation (0.00 to 0.35)
         └─────────────────────── Perceptual brightness (0% to 100%)
```

### 7.2 The Master Semantic Palette

```
  BRAND PRIMARY (Navy / Royal)
  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
  │ 50       │ 100      │ 500      │ 700      │ 900      │ 950      │
  │ #EFF6FF  │ #DBEAFE  │ #3B82F6  │ #1F5FA8  │ #17324D  │ #0D1D2D  │
  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

  PRIMARY ACTION (Teal)
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ 100      │ 600      │ 700      │ 800      │ 900      │
  │ #CCFBF1  │ #1499A5  │ #0E7C86  │ #08656E  │ #044349  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘

  SUCCESS (Emerald)      WARNING (Amber)        DANGER (Crimson)
  ┌──────────┬──────────┐┌──────────┬──────────┐┌──────────┬──────────┐
  │ Light    │ Solid    ││ Light    │ Solid    ││ Light    │ Solid    │
  │ #ECFDF5  │ #1B8755  ││ #FFFBEB  │ #B45309  ││ #FEF2F2  │ #D92D20  │
  └──────────┴──────────┘└──────────┴──────────┘└──────────┴──────────┘
```

### 7.3 Dark Mode Architecture
Dark mode is not an inverted negative of light mode; it is an independent illumination model:
- **Avoid Pure Black**: Canvas backgrounds must use deep slate `#0D1117` or `#141414`, never `#000000`. Pure black causes severe visual halation and eye fatigue against high-contrast text.
- **Surface Elevation by Lightness**: In dark mode, surfaces that are higher in the z-index stack are rendered with slightly lighter background fills:
  - Canvas (Layer 0): `#0D1117`
  - Cards (Layer 1): `#1F242C`
  - Popovers (Layer 2): `#282E38`
  - Modals (Layer 3): `#303642`
- **Desaturated Accents**: Saturated light-mode colors vibrate jarringly on dark backgrounds. Primary action teal drops from Chroma `0.11` to `0.08` in dark mode to maintain eye comfort.

### 7.4 Contrast Compliance Verification Matrix

| Background Surface | Foreground Text / Icon | Measured Contrast | WCAG AA Status | WCAG AAA Status |
| :--- | :--- | :---: | :---: | :---: |
| Canvas Light (`#FFFFFF`) | Brand Navy 900 (`#17324D`) | **13.4 : 1** | PASS | PASS |
| Canvas Light (`#FFFFFF`) | Gray 900 Body (`#212529`) | **14.8 : 1** | PASS | PASS |
| Canvas Light (`#FFFFFF`) | Gray 600 Muted (`#6C757D`) | **4.68 : 1** | PASS | Large Text Only |
| Action Teal (`#0E7C86`) | White Content (`#FFFFFF`) | **4.85 : 1** | PASS | Large Text Only |
| Highlight Pale (`#FFF4D6`)| Highlight Text (`#8A5A00`) | **5.42 : 1** | PASS | Large Text Only |
| Canvas Dark (`#0D1117`) | Gray 50 Body (`#F8F9FA`) | **15.2 : 1** | PASS | PASS |
| Canvas Dark (`#0D1117`) | Brand Light 400 (`#60A5FA`)| **7.12 : 1** | PASS | PASS |
| Card Dark (`#1F242C`) | Gray 300 Text (`#DEE2E6`) | **10.5 : 1** | PASS | PASS |

---

## Section 8: Layout and Grid System

### 8.1 Breakpoint System & Media Queries
The system provides five standard breakpoint intervals, centered around mobile reality:

```css
/* Responsive Breakpoints */
--breakpoint-xs: 360px;   /* Minimum production mobile baseline */
--breakpoint-sm: 640px;   /* Small tablets / wide landscape mobile */
--breakpoint-md: 768px;   /* Standard tablet portrait / split views */
--breakpoint-lg: 1024px;  /* Desktop workstations / laptop displays */
--breakpoint-xl: 1280px;  /* Wide monitors / high-density analytics */
--breakpoint-2xl: 1536px; /* Ultrawide executive workstations */
```

### 8.2 Container Widths & Responsive Gutters

| Container Tier | Max Width | Horizontal Gutters (Mobile) | Horizontal Gutters (Desktop) | Best Application |
| :--- | :--- | :--- | :--- | :--- |
| `container-reading` | `640px` | `16px` | `24px` | Step-by-step fix cards, blog posts, terms |
| `container-form` | `480px` | `16px` | `24px` | Authentication forms, onboarding wizards |
| `container-md` | `768px` | `16px` | `32px` | Account settings, documentation articles |
| `container-lg` | `1024px`| `16px` | `32px` | Standard dashboard canvas, product catalogs |
| `container-xl` | `1280px`| `20px` | `40px` | Executive KPI analytics, complex tables |
| `container-fluid` | `100%` | `16px` | `48px` | Full-width data grids, interactive maps |

### 8.3 12-Column Grid Architecture
The master layout provides an intrinsic 12-column CSS Grid system:
```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-4);
}

@media (min-width: 768px) {
  .grid-12 {
    gap: var(--spacing-6);
  }
}
```

### 8.4 Four Core Architectural Layout Shells

#### 1. Centered Editorial Reading Shell (Wajah Pattern)
```
┌────────────────────────────────────────────────────────────┐
│ Top Bar: Wordmark (Left)             Lang & About (Right)  │
├────────────────────────────────────────────────────────────┤
│ Permanent Independence Ribbon (Non-Dismissible)            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│               Centered Column (Max 640px)                  │
│                                                            │
│   [ ← Back Navigation ]                                    │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Fix Card / Guided Decision Container               │   │
│   │ - Original Portal Wording                          │   │
│   │ - Plain-Language Interpretation                    │   │
│   │ - Multi-Attribute Responsibility Badge             │   │
│   │ - Step-by-Step Action List (Max 5 Steps)           │   │
│   │ - Verified Document Source & Checked Date          │   │
│   └────────────────────────────────────────────────────┘   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Footer: How it works · Sources · Privacy · Report Error   │
└────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Dashboard AppShell (Tremor + Mantine Pattern)
```
┌──────────┬─────────────────────────────────────────────────┐
│ Brand    │ Global Header: Search Bar, Quick Filter, Avatar │
├──────────┼─────────────────────────────────────────────────┤
│ Sidebar  │ Main Analytical Canvas                          │
│ ──────── │ ┌─────────────┬─────────────┬─────────────────┐ │
│ Nav Item │ │ KPI Card 1  │ KPI Card 2  │ KPI Card 3      │ │
│ Nav Item │ │ $128,450    │ 99.98%      │ 1,420 Users     │ │
│ Nav Item │ │ [Sparkline] │ [Progress]  │ [Delta Badge]   │ │
│          │ └─────────────┴─────────────┴─────────────────┘ │
│          │ ┌───────────────────────────┬─────────────────┐ │
│          │ │ Primary Area Chart        │ Top Channels    │ │
│          │ │ (Revenue Over Time)       │ [BarList]       │ │
│          │ └───────────────────────────┴─────────────────┘ │
│          │ ┌─────────────────────────────────────────────┐ │
│          │ │ Full-Width Data Table with Sorting & Filter │ │
│          │ └─────────────────────────────────────────────┘ │
└──────────┴─────────────────────────────────────────────────┘
```

#### 3. Split-Pane Workspace (Admin / IDE / AI Copilot)
```
┌────────────────────────────────────────────────────────────┐
│ Header: Workspace Title, Branch Selector, Save State       │
├──────────────────────────────┬─────────────────────────────┤
│ Left Pane (60% Width):       │ Right Pane (40% Width):     │
│ Primary Document / Code /    │ Contextual AI Assistant /   │
│ Form Builder Canvas          │ Inspector / Live Preview    │
│                              │                             │
│ [ Splitter Divider: Draggable / Resizable via Keyboard ]   │
└──────────────────────────────┴─────────────────────────────┘
```

#### 4. Multi-Step Form Wizard Layout
```
┌────────────────────────────────────────────────────────────┐
│ Stepper Bar: Step 1 (Done) ── Step 2 (Active) ── Step 3    │
├────────────────────────────────────────────────────────────┤
│ Form Canvas (Max 520px Centered):                          │
│                                                            │
│   [ Field 1: Label + Input + Persistent Helper Text ]      │
│   [ Field 2: Label + Combobox Select Menu ]                │
│   [ Field 3: Drag-and-Drop Dropzone Zone ]                 │
│                                                            │
│ Navigation Bar: [ Back Action ]          [ Continue Button]│
└────────────────────────────────────────────────────────────┘
```
---

## Section 9: Complete Component Library

Every component in the Master System is documented with eight rigorous specifications:
1. **Purpose**: The functional objective of the component.
2. **Visual Appearance**: Colors, borders, radiuses, typography, and optical alignment.
3. **Layout & Structure**: Internal padding, gap hierarchy, and slot compositions.
4. **States**: Default, Hover, Focus-Visible, Active/Pressed, Disabled, Loading, and Error/Invalid.
5. **Interactions**: Click, tap, drag, keyboard triggers, and micro-gestures.
6. **Responsive Behaviour**: Adaptation from 360px mobile viewports to desktop.
7. **Accessibility (a11y)**: WAI-ARIA roles, attributes, keyboard navigation matrix, and screen-reader semantics.
8. **Recommended Source Library**: DaisyUI, Mantine, Tremor, Lucide, React Dropzone, or Hybrid.

---

### 9.1 Buttons and Icon Buttons
- **Purpose**: Primary trigger for user intent, form submission, and navigation routing.
- **Visual Appearance**:
  - *Primary Variant*: Solid background in Action Teal (`#0E7C86`) or Brand Navy (`#17324D`), white text, 10px radius (`--radius-lg`), subtle shadow (`--shadow-sm`).
  - *Secondary Variant*: White surface, 1px solid border (`#CED4DA`), text in Gray 800 (`#343A40`), hover background in Gray 100 (`#F1F3F5`).
  - *Ghost / Subdued Variant*: Transparent background, no border, text in Brand 700 (`#1F5FA8`).
  - *Destructive Variant*: Solid Danger Red (`#D92D20`), white text, red focus ring.
- **Layout**:
  - Primary button: Minimum height 56px on mobile, horizontal padding 24px (`--spacing-6`), 8px gap between icon and label.
  - Standard button: Height 44px (touch target floor 48px via invisible padding), horizontal padding 16px.
  - Icon-only button: Exactly 48x48px square container, centering a 20px or 24px Lucide SVG icon.
- **States**:
  - *Hover*: 10% brightness increase, subtle translateY(-1px) elevation shift.
  - *Focus-Visible*: 2px solid primary color with 2px offset ring (`outline: 2px solid var(--color-brand-500); outline-offset: 2px`).
  - *Active / Pressed*: `transform: scale(0.98)` or `translateY(1px)`.
  - *Disabled*: Background `#E9ECEF`, text `#ADB5BD`, `cursor: not-allowed`, `pointer-events: none`, opacity 0.6.
  - *Loading*: Label replaced or prepended with an accessible spinning loader; button disabled to prevent duplicate submissions (`aria-busy="true"`).
- **Interactions**: Instant visual response on `pointerdown`. Triggers on `Enter` and `Space`.
- **Responsive Behaviour**: Full-width (`w-full`) on viewports under 640px; auto-width (`w-auto`) on desktop.
- **Accessibility**: Semantic `<button type="button|submit">`. Icon buttons must declare a clear `aria-label` (e.g., `aria-label="Close dialog"`).
- **Recommended Library**: Hybrid — DaisyUI `btn` CSS classes for static buttons; Mantine `<Button>` / `<ActionIcon>` for loading states and form submissions.

---

### 9.2 Inputs and Textareas
- **Purpose**: Capturing user text, numerical data, search queries, and long-form responses.
- **Visual Appearance**:
  - Background `#FFFFFF` (light) / `#12151A` (dark), 1px solid border (`#CED4DA`), 8px radius (`--radius-md`).
  - Typography: 16px base font size (crucial: avoids automatic iOS Safari zooming on focus).
  - Textarea: Minimum 4 visible rows (min-height 120px) with vertical-only resizing.
- **Layout**: Internal padding 12px vertical, 16px horizontal. Labels always positioned above the field with 8px margin.
- **States**:
  - *Hover*: Border changes to `#ADB5BD`.
  - *Focus-Visible*: Border changes to Brand Teal (`#0E7C86`), 3px soft outer ring (`rgba(14, 124, 134, 0.25)`).
  - *Invalid / Error*: 1.5px solid Danger Red (`#D92D20`) border, red validation message below input with `AlertOctagon` icon.
  - *Disabled*: Background `#F8F9FA`, border `#DEE2E6`, text `#ADB5BD`.
- **Interactions**: Cursor autofocus when requested; clears text via optional suffix clear button.
- **Responsive Behaviour**: Full width across all containers.
- **Accessibility**: Connected `<label for="field-id">` is mandatory; error messages linked via `aria-describedby="error-id"`; invalid state marked with `aria-invalid="true"`.
- **Recommended Library**: Mantine `<TextInput>`, `<Textarea>`, `<PasswordInput>` (provides built-in toggle visibility).

---

### 9.3 Select Menus, Native Select & Cascaders
- **Purpose**: Selecting one or multiple options from bounded lists or hierarchical taxonomies.
- **Visual Appearance**: Matches input field styling; includes a trailing Lucide `ChevronDown` icon (rotated 180° when open).
- **Layout**: Options list rendered in an elevated popover container (`--shadow-md`, radius 8px, max-height 280px with custom scrollbar).
- **States**: Selected option marked with Lucide `Check` icon and soft highlight fill (`--color-brand-50`). Keyboard focus highlighted via `--color-gray-100`.
- **Interactions**: Clicking trigger opens options. Arrow keys navigate items. Typing characters executes quick-jump search.
- **Responsive Behaviour**: Converts to a native mobile picker or bottom sheet drawer on touch devices under 640px for ergonomic thumb reach.
- **Accessibility**: Follows WAI-ARIA Combobox design pattern. Uses `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, and roving `aria-activedescendant`.
- **Recommended Library**: Mantine `<Select>`, `<MultiSelect>`, and `<Cascader>` (for multi-level hierarchical trees).

---

### 9.4 Checkboxes, Radio Groups & Switches
- **Purpose**: Binary toggles, single selection among mutually exclusive choices, and multi-selection sets.
- **Visual Appearance**:
  - *Checkbox*: 20x20px square, 4px radius, checked background Brand Teal (`#0E7C86`) with white Lucide `Check` icon.
  - *Radio*: 20x20px circle, checked state displays an inner solid 8px dot.
  - *Switch*: 44x24px track (pill shape), 20x20px circular white thumb, smooth 150ms sliding transition.
- **Layout**: 12px horizontal gap between control and accompanying label text. Minimum 48px touch target wrapper.
- **States**: Distinct hover borders, high-contrast focus rings, and muted disabled states.
- **Interactions**: Toggles on click or `Space` keypress. Switches animate horizontally with organic spring easing.
- **Responsive Behaviour**: Minimum target size remains 48x48px on mobile devices.
- **Accessibility**: Uses semantic `<input type="checkbox">` and `<input type="radio">`. Radio groups enclosed in `<fieldset>` with `<legend>`.
- **Recommended Library**: Mantine `<Checkbox>`, `<Radio>`, `<Switch>` or Tremor `<Switch>` for dashboards.

---

### 9.5 Badges, Status Chips & Avatars
- **Purpose**: Micro-metadata display, tag categorization, entity identification, and user profiles.
- **Visual Appearance**:
  - *Badges*: Height 24px, 4px or full pill radius, uppercase 12px semibold text (`--font-caption`), paired with 14px Lucide icon.
  - *Avatars*: 32px, 40px, or 48px circular containers, crisp high-res image or 2-letter uppercase initials on neutral background.
- **Layout**: 4px horizontal padding for badges; inline-flex centering.
- **States**: Status badges incorporate multi-attribute border styling (e.g., solid, dashed, or double borders) in accordance with the Wajah specification.
- **Accessibility**: Decorative badges hidden from screen readers or given explanatory `aria-label` text.
- **Recommended Library**: DaisyUI `badge` classes for static badges; Mantine `<Avatar>` / `<Badge>` for dynamic initials and indicators.

---

### 9.6 Tooltips & Popovers
- **Purpose**: Non-critical contextual explanations, keyboard shortcut hints, and rich interactive flyouts.
- **Visual Appearance**:
  - Tooltip: Deep slate background (`#1E293B`), white text, 4px radius, 12px text, 150ms fade transition.
  - Popover: Elevated card container (`--shadow-md`), white surface, 1px border (`#DEE2E6`), 8px radius.
- **Layout**: Dynamic floating positioning with an optical 6px arrow pointer.
- **States**: Appears on hover (after a 250ms delay) or focus; disappears instantly on `Escape` or pointer leave.
- **Accessibility**: Tooltips use `role="tooltip"` linked via `aria-describedby`. Popovers trap focus when containing interactive form controls.
- **Recommended Library**: Mantine `<Tooltip>` / `<Popover>` (backed by Floating UI) or Tremor `<Tooltip>`.

---

### 9.7 Cards & Surface Containers
- **Purpose**: Grouping related information, actions, and media into a unified visual unit.
- **Visual Appearance**: Clean white surface (`#FFFFFF`), 1px solid border (`#E5E7EB`), 12px radius (`--radius-xl`), subtle elevation (`--shadow-sm`).
- **Layout**:
  - Card Header: Title + optional action menu / badge.
  - Card Body: Primary content and media (16px mobile padding, 24px desktop padding).
  - Card Footer: Subdued background (`#F9FAFB`), border-top (`#E5E7EB`), action buttons.
- **Responsive Behaviour**: Cards stack vertically in a single column on mobile viewports; form 2-column or 3-column grids on desktop layouts.
- **Recommended Library**: Tremor `<Card>` for analytics widgets; DaisyUI `card` classes for content showcases; Wajah Fix Card layout for guided public resolution cards.

---

### 9.8 Navigation Bars & App Headers
- **Purpose**: Top-level application identity, primary routing links, search triggers, and account controls.
- **Visual Appearance**: Fixed or sticky height 64px, background white with 80% opacity and `backdrop-filter: blur(8px)`, 1px bottom border (`#E5E7EB`).
- **Layout**:
  - Left Slot: Wordmark/logo + primary product identifier.
  - Center Slot: Global navigation links or global command-search input.
  - Right Slot: Language selector, notifications bell with unread indicator badge, user avatar dropdown.
- **Responsive Behaviour**: On mobile viewports (<768px), horizontal navigation links collapse into a hamburger trigger opening a slide-out drawer or full-screen navigation sheet.
- **Accessibility**: Wrapped in `<nav>` landmark with `aria-label="Main navigation"`.
- **Recommended Library**: Mantine `<AppShell.Header>` + DaisyUI `navbar` classes.

---

### 9.9 Sidebars & Collapsible Navigation
- **Purpose**: Multi-level hierarchical routing for SaaS platforms, dashboards, and admin consoles.
- **Visual Appearance**: Width 260px (expanded) / 72px (icon-only collapsed), background subtle neutral (`#F8F9FA` or `#0D1117`), 1px right border (`#DEE2E6`).
- **Layout**: Top workspace switcher, vertical navigation stack with Lucide icons and text labels, active selection pills, bottom account/help actions.
- **Interactions**: Smooth 200ms width collapse/expand transition. Hotkey trigger (`Ctrl + B` or `Cmd + B`).
- **Responsive Behaviour**: Off-canvas slide-out drawer on viewports under 1024px; persistent fixed column on desktop displays.
- **Accessibility**: Active route item marked with `aria-current="page"`.
- **Recommended Library**: Mantine `<AppShell.Navbar>` with `<NavLink>` components.

---

### 9.10 Headers & Footers
- **Purpose**: Document wayfinding, legal compliance, source provenance, and secondary resource discovery.
- **Visual Appearance**:
  - *Page Header*: Large H1 title, subtitle, breadcrumb trail, and top-right primary action button group.
  - *Global Footer*: Subdued background (`#F8F9FA`), top border (`#DEE2E6`), 14px secondary links, copyright statement, and radical trust source links.
- **Layout**: Multi-column link grouping on desktop; vertical stacking on mobile viewports.
- **Recommended Library**: DaisyUI `footer` classes + custom semantic HTML landmarks.

---

### 9.11 Modals & Confirmation Dialogs
- **Purpose**: High-urgency interruptions requiring user decision, confirmation, or self-contained sub-tasks.
- **Visual Appearance**: Centered elevated surface (`--shadow-xl`), 16px radius (`--radius-2xl`), max-width 520px (standard) / 720px (large), dark scrim backdrop blur (`rgba(15, 23, 42, 0.65)`).
- **Layout**:
  - Header: Dialog title + explicit `CloseButton` (`X`).
  - Body: Scrollable content container (`max-height: 70vh`).
  - Footer: Right-aligned secondary cancel button and primary confirmation button.
- **Interactions**:
  - Opens with scale-fade animation: `translate(-50%, -48%) scale(0.96)` to `translate(-50%, -50%) scale(1)`.
  - Dismissible via `Escape` keypress or backdrop click (unless strict confirmation is required).
  - Background body scroll is immediately locked (`overflow: hidden`).
- **Accessibility**: WAI-ARIA Dialog standard:
  - `role="dialog"` or `role="alertdialog"`.
  - `aria-modal="true"`.
  - `aria-labelledby` points to dialog title ID.
  - Active focus trap: Tab key cycles exclusively within the modal. Focus restores to trigger upon closure.
- **Recommended Library**: Mantine `<Modal>` or Tremor `<Dialog>` (backed by Radix UI Dialog).

---

### 9.12 Drawers & Bottom Sheets
- **Purpose**: Mobile navigation menus, deep filter panels, detail inspectors, and editing panels.
- **Visual Appearance**:
  - Desktop Drawer: Slides from right or left edge; width 380px–480px; 1px border.
  - Mobile Bottom Sheet: Slides from bottom edge; 16px top corner radiuses; drag handle pill indicator at top.
- **Interactions**: Dismissible via touch swipe gesture, `Escape` key, or close button.
- **Accessibility**: Same focus-trapping and ARIA role specifications as modal dialogs.
- **Recommended Library**: Mantine `<Drawer>` or Tremor `<Drawer>`.

---

### 9.13 Dropdowns & Context Menus
- **Purpose**: Secondary action lists, table row action menus, and contextual right-click options.
- **Visual Appearance**: Elevated surface (`--shadow-md`), 8px radius, 1px border (`#DEE2E6`), 14px text.
- **Layout**: Vertical stack of menu items; 8px vertical padding; dividers between destructive actions.
- **Interactions**: Arrow up/down navigation; `Enter` activates; `Escape` closes and restores focus.
- **Accessibility**: `role="menu"` with `role="menuitem"`, managed via roving tabindex.
- **Recommended Library**: Mantine `<Menu>` or Tremor `<DropdownMenu>`.

---

### 9.14 Tabs, Segmented Controls & Accordions
- **Purpose**: Switching views within a shared context; progressive disclosure of dense information.
- **Visual Appearance**:
  - *Segmented Control*: Inset background pill container (`#E9ECEF`), sliding white active indicator pill with subtle shadow.
  - *Underline Tabs*: Horizontal tab list with a 2px active indicator underline in Action Teal (`#0E7C86`).
  - *Accordion*: Clean rows with subtle dividers; smooth height expansion; trailing rotating chevron icon.
- **Interactions**: Left/right arrow key navigation across tabs. Accordion content height animates using CSS grid (`grid-template-rows: 0fr` to `1fr`).
- **Accessibility**: Full WAI-ARIA Tabs pattern: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
- **Recommended Library**: Tremor `<Tabs>` / `<Accordion>` or Mantine `<Tabs>` / `<SegmentedControl>`.

---

### 9.15 Toast Notifications & Alert Banners
- **Purpose**: System feedback regarding asynchronous task results, network drops, and critical alerts.
- **Visual Appearance**:
  - *Toast*: Floating card positioned at viewport top-right or bottom-center; multi-attribute icon + title + message + close trigger; progress auto-dismiss bar.
  - *Alert Banner*: Persistent inline callout card with 1px border, light tinted background, and semantic icon.
- **Accessibility**: Injected into `aria-live="polite"` (toasts) or `aria-live="assertive"` (critical errors). Does not steal focus.
- **Recommended Library**: Mantine `@mantine/notifications` or Tremor `<Callout>` / `<Toast>`.

---

### 9.16 Search Interfaces & Command Palettes (Spotlight)
- **Purpose**: Rapid global navigation, resource searching, and hotkey power actions.
- **Visual Appearance**: Floating modal dialog; large search input with leading Lucide `Search` icon; grouped result list; bottom keyboard shortcut badges (`↑↓ to navigate`, `↵ to select`, `esc to close`).
- **Interactions**: Triggered via `Cmd + K` or `Ctrl + K`. Instant fuzzy searching.
- **Accessibility**: Autocomplete combobox semantics with live screen-reader feedback.
- **Recommended Library**: Mantine `@mantine/spotlight`.

---

### 9.17 File Uploaders & Drag-and-Drop Dropzones
- **Purpose**: Ingestion of documents, spreadsheets, images, and archives.
- **Visual Appearance**: 2px dashed border in `#CED4DA`, background `#F8F9FA`, 12px radius, centered 40px Lucide `UploadCloud` icon, bold action prompt, file constraints metadata.
- **Layout**: Minimum height 180px; drag-over state transforms border to 2px solid Brand Teal (`#0E7C86`) and background to `#EFF6FF`.
- **States**:
  - *Drag Active*: Pulsing border highlight.
  - *Rejected*: Red dashed border, warning text with explicit rejection code.
  - *Uploading*: File row card with file name, byte size, progress bar, and cancel button.
- **Accessibility**: Screen reader accessible via hidden `<input type="file">` activated by `Enter` or `Space`.
- **Recommended Library**: Hybrid — React Dropzone headless logic wrapped in DaisyUI / Tremor styling.

---

### 9.18 Data Tables & DataLists
- **Purpose**: Structured display of multi-record datasets, administrative records, and financial ledgers.
- **Visual Appearance**: Horizontal border rows (`#E5E7EB`), uppercase 12px semibold column headers (`#495057`), alternating zebra rows (`#F9FAFB`), monospace alignment for numerical columns.
- **Interactions**: Column sort indicators (Lucide `ArrowUpDown`); selectable checkbox rows; pagination controls.
- **Responsive Behaviour**: Horizontal scrolling container with sticky first column on mobile viewports; or transforms into stacked mobile card list.
- **Accessibility**: Semantic `<table>`, `<thead>`, `<tbody>`, `<th> scope="col"`, `<caption>`.
- **Recommended Library**: Tremor `<Table>` or Mantine `<Table>` with `@mantine/core` DataList.

---

### 9.19 Pricing Sections & Tiers
- **Purpose**: Transparent comparison of product subscription tiers and conversion driving.
- **Visual Appearance**: 3-card horizontal grid (mobile stacked); popular tier elevated with primary border, badge ("Most Popular"), and prominent CTA button.
- **Layout**: Tier name, price with billing cycle toggle (Monthly / Annual), feature checkmark list with Lucide `Check` icons, CTA button.
- **Recommended Library**: Custom Tailwind v4 layout combining Tremor `<Card>` and DaisyUI buttons.

---

### 9.20 Testimonials & Social Proof
- **Purpose**: Establishing user trust, social validation, and peer credibility.
- **Visual Appearance**: Clean surface cards featuring user quote, star rating icons (`Star`), user avatar, name, and verified customer badge.
- **Recommended Library**: DaisyUI `card` classes + Lucide icons.

---

### 9.21 Empty States & Error Panels
- **Purpose**: Guiding users when lists contain zero records, search returns no matches, or errors occur.
- **Visual Appearance**: Centered layout; neutral muted icon (64px) inside soft circular container; clear H3 title; one-line explanatory copy; prominent primary recovery action button.
- **Rule**: Never leave an empty screen blank. Always offer a path forward (e.g., "Clear filters" or "Create record").
- **Recommended Library**: Mantine `<EmptyState>` or custom Wajah `NoMatchPanel`.

---

### 9.22 Loading States, Skeletons & Metric Trackers
- **Purpose**: Preventing layout cumulative shift (CLS) and communicating background data processing.
- **Visual Appearance**:
  - *Skeleton*: Neutral gray shape (`#E5E7EB`) with subtle shimmering wave animation (`background-position` sweep).
  - *Tracker*: Segmented block strip displaying uptime / execution history in discrete color-coded blocks.
  - *Progress Bar*: 8px height track, filled with primary color.
- **Accessibility**: Containers labeled with `aria-busy="true"` and `aria-live="polite"`.
- **Recommended Library**: Tremor `<Tracker>` / `<ProgressBar>` and Mantine `<Skeleton>`.

---

### 9.23 Charts & Analytics Metric Cards
- **Purpose**: High-level KPI visualization, revenue monitoring, and real-time operational metrics.
- **Visual Appearance**:
  - *KPI Metric Card*: Tremor `<Card>` containing metric label (14px uppercase), current value (32px bold font), trend delta badge (e.g., `+14.2%` with Lucide `TrendingUp` icon), and micro-sparkline.
  - *Primary Analytics Chart*: Area or bar chart with subtle horizontal gridlines, high-contrast hover cursor, and custom SVG tooltip.
- **Recommended Library**: Tremor Raw (`<AreaChart>`, `<BarChart>`, `<SparkChart>`, `<BarList>`).

---

## Section 10: Interaction and Animation Standards

### 10.1 Deterministic State Machine Transitions
Every interactive UI control transitions through a predictable finite state machine:

```
  [ Default State ] ──(pointer enters)──> [ Hover State ]
          │                                      │
    (focus received)                       (pointer down)
          │                                      │
          ▼                                      ▼
  [ Focus-Visible ] <──(keyboard press)── [ Active / Pressed ]
          │                                      │
          │                                (action dispatched)
          ▼                                      │
  [ Disabled State ] <─────────────────── [ Loading State ]
```

- **Hover**: 100ms transition. Subtle background darkening or border tinting. Never shift layout dimensions on hover.
- **Focus-Visible**: Triggered exclusively via keyboard tab navigation. Displays a high-contrast focus ring (`2px solid var(--color-brand-500)` with `2px offset`). Hidden during mouse clicks.
- **Active / Pressed**: 50ms physical depression: `transform: scale(0.98)` or `translateY(1px)`.
- **Disabled**: Contrast reduced, cursor set to `not-allowed`, all pointer and keyboard events suppressed.
- **Loading**: Interactive triggers disabled, replaced with an accessible spinner and `aria-busy="true"`.

### 10.2 Spring Easing & Motion Timing Curves
The Master Design System enforces Tremor's organic spring easing for all interactive surfaces:

```css
/* Master Animation Tokens */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Micro-Interaction Timing */
--duration-fast: 150ms;   /* Dropdowns, tooltips, accordion triggers */
--duration-normal: 200ms; /* Modals, drawer slide-outs, tab switches */
--duration-slow: 300ms;   /* Full-page transitions, layout expansions */
```

### 10.3 Modal & Overlay Behavior Standards
1. **Focus Containment**: When an overlay opens, focus immediately shifts to the dialog container or first interactive element. Keyboard `Tab` cycles strictly inside the overlay.
2. **Scroll Lock**: The underlying `document.body` is locked with `overflow: hidden`, preserving the scroll position and preventing page jumping.
3. **Backdrop Scrim**: A dark scrim (`rgba(15, 23, 42, 0.65)`) with an 8px blur (`backdrop-filter: blur(8px)`) overlays the background.
4. **Escape Dismissal**: Pressing the `Escape` key immediately closes the topmost active overlay and restores focus to the invoking trigger button.

### 10.4 Keyboard Navigation Protocols
- **Roving TabIndex**: In toolbars, tab lists, and menu dropdowns, only the currently active item has `tabIndex={0}`. All other items have `tabIndex={-1}`. Arrow keys move focus across items smoothly.
- **Skip Links**: Every page must provide an invisible top skip link (`<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`) that becomes visible upon the first keyboard `Tab`.

### 10.5 Touch Ergonomics & Mobile Interactions
- **48px Minimum Floor**: All touch targets must measure at least 48x48px on touchscreens.
- **8px Island Clearance**: Adjacent touch targets must be separated by at least 8px to prevent accidental taps.
- **Swipe-to-Dismiss**: Bottom sheets and drawers must support fluid vertical drag-to-dismiss gestures with a 30% resistance threshold.

---

## Section 11: Responsive Design Standards

### 11.1 The 360px Mobile-First Engineering Baseline
Rather than treating mobile as a scaled-down desktop afterthought, design begins at **360px width** (the global standard for affordable mobile smartphones):
- **Zero Horizontal Window Scroll**: Content must fit naturally within the viewport. Text wraps, tables provide horizontal containers, and buttons stack vertically.
- **320px Hardening**: Test all interfaces down to 320px viewport widths to ensure zero visual overflow for extreme legacy devices.

### 11.2 Fluid Scaling vs Breakpoint Snapping
Avoid rigid visual snapping by combining fluid units with responsive breakpoints:
```css
/* Container padding scales smoothly */
.container-responsive {
  padding-left: clamp(1rem, 5vw, 2.5rem);
  padding-right: clamp(1rem, 5vw, 2.5rem);
}
```

### 11.3 Touch vs Pointer Hover Isolation
Prevent sticky hover bugs on touch devices by wrapping all hover styles in pointer media queries:
```css
@media (hover: hover) and (pointer: fine) {
  .interactive-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

### 11.4 Foldable & Ultrawide Viewport Strategies
- **Foldables & Dual-Screen**: Use CSS environment variables (`env(safe-area-inset-top)`, `env(viewport-segment-width)`) to prevent content clipping under physical device hinges and camera notches.
- **Ultrawide Displays (>1536px)**: Always constrain dashboard content width to 1536px (`max-w-7xl` or `--breakpoint-2xl`), centering the application canvas with balanced side margins.
---

## Section 12: Design Pattern Library

The Master Design Pattern Library establishes production-ready architectural layouts and component compositions for ten dominant application archetypes.

---

### 12.1 SaaS Landing Pages
- **Objective**: Communicate value proposition, build immediate trust, and maximize conversion to product trial or demo.
- **Component Composition**:
  - `AppHeader` (Fixed with blur, logo, nav links, CTA button).
  - `HeroSection` (Display headline, subtitle, dual CTAs: Primary Trial + Secondary Demo Video modal trigger).
  - `SocialProofMarquee` (Customer logos, quantifiable trust metrics).
  - `BentoFeatureGrid` (3-column layout highlighting core capabilities).
  - `PricingComparison` (Monthly/Annual billing toggle, 3 tier cards, feature checkmarks).
  - `TestimonialCarousel` (Customer quotes, star ratings, verified company badges).
  - `FaqAccordion` (Searchable common questions).
  - `GlobalFooter` (Multi-column links, legal, status indicator).
- **Layout Wireframe**:
  ```
  ┌────────────────────────────────────────────────────────────┐
  │ [Logo]         Features   Pricing   Docs       [Sign In] │
  ├────────────────────────────────────────────────────────────┤
  │                  Build Faster with Intelligence           │
  │     The unified design system and framework for teams.     │
  │          [ Start Free Trial (56px) ]  [ Watch Demo ]      │
  │                                                            │
  │     ┌────────────────────────────────────────────────┐     │
  │     │ Product UI Preview Container with Soft Glow    │     │
  │     └────────────────────────────────────────────────┘     │
  ├────────────────────────────────────────────────────────────┤
  │ Trusted by 10,000+ teams worldwide: [Logo1] [Logo2] [Logo3]│
  ├────────────────────────────────────────────────────────────┤
  │ Feature Grid (3 Columns)                                   │
  │ [ Card: Zero-JS Speed ] [ Card: ARIA a11y ] [ Card: Tokens]│
  └────────────────────────────────────────────────────────────┘
  ```

---

### 12.2 Modern Executive Dashboards
- **Objective**: Deliver at-a-glance visibility into critical business KPIs, real-time revenue, and system health.
- **Component Composition**:
  - `AppShell` (Collapsible sidebar + fixed top navigation header).
  - `FilterBar` (Date range picker, currency selector, refresh button).
  - `MetricCardGrid` (4 KPI cards: Title, Current Value, Tremor Sparkline, Trend Delta Badge).
  - `PrimaryAnalyticsChart` (Tremor AreaChart showing revenue over time).
  - `CategoricalBreakdown` (Tremor BarList showing top revenue channels).
  - `HealthTracker` (Tremor Tracker showing 90-day operational uptime).
- **Layout Wireframe**:
  ```
  ┌──────────┬─────────────────────────────────────────────────┐
  │ [Brand]  │ Global Search (Cmd+K)        [Notifications] [@]│
  ├──────────┼─────────────────────────────────────────────────┤
  │ Overview │ Filter: [ Last 30 Days ▼ ]  [ All Regions ▼ ]   │
  │ Metrics  │ ┌───────────┬───────────┬───────────┬─────────┐ │
  │ Finance  │ │ Revenue   │ Users     │ Churn     │ Uptime  │ │
  │ Settings │ │ $142.8k   │ 12,402    │ 1.2%      │ 99.98%  │ │
  │          │ │ [+12.4%]  │ [+8.1%]   │ [-0.4%]   │ [Normal]│ │
  │          │ └───────────┴───────────┴───────────┴─────────┘ │
  │          │ ┌───────────────────────────┬─────────────────┐ │
  │          │ │ Primary Revenue Chart     │ Top Sources     │ │
  │          │ │ [ Tremor AreaChart SVG ]  │ [ BarList Rows] │ │
  │          │ └───────────────────────────┴─────────────────┘ │
  └──────────┴─────────────────────────────────────────────────┘
  ```

---

### 12.3 Admin Panels & CRUD Backoffices
- **Objective**: Efficient record management, batch operations, sorting, filtering, and deep data editing.
- **Component Composition**:
  - `AppShell` with multi-level hierarchical sidebar navigation.
  - `ActionBar` (Batch selection counter, bulk delete, export to CSV).
  - `SearchInput` with debounced query execution.
  - `DataTable` with sortable column headers, pagination controls, and row action menus.
  - `Drawer` detail inspector for viewing and editing records without leaving the page.
- **Key Flow**: Selecting a table row opens an off-canvas drawer on the right side containing form fields and an activity log.

---

### 12.4 Authentication Pages (Login, Sign-Up, MFA)
- **Objective**: Frictionless user onboarding, credential verification, and account recovery.
- **Component Composition**:
  - Centered `container-form` (max-width 440px).
  - Brand Logo + clear H1 ("Welcome back").
  - Social OAuth button group (Google, GitHub, Microsoft).
  - Divider with centered "Or continue with email" text.
  - Form Fields (`TextInput` for email, `PasswordInput` with toggle eye icon).
  - Remember me checkbox + Forgot password link.
  - Full-width primary CTA button ("Sign In to Workspace").
  - MFA Verification view: 6-digit `PinInput` with autofocus and paste handling.

---

### 12.5 Settings & Preference Pages
- **Objective**: Manage account profile, billing subscriptions, notification channels, and security keys.
- **Component Composition**:
  - 2-Column layout: Left sidebar tab navigation (Profile, Billing, Security, Team, API Keys); Right settings canvas.
  - Grouped `Card` sections with distinct H3 headers and explanatory subtitles.
  - Form controls with inline saving indicators or a floating sticky `SaveBar` at the bottom of the viewport.
  - Danger Zone card at bottom with red border, warning icon, and modal confirmation for irreversible actions.

---

### 12.6 Analytics & Observability Dashboards
- **Objective**: Real-time telemetry, server resource utilization, latency percentiles (p50, p95, p99), and error logging.
- **Component Composition**:
  - Tremor `AreaChart` and `LineChart` for multi-series metrics.
  - `CategoryBar` for CPU and Memory threshold limits (Green <70%, Amber 70-90%, Red >90%).
  - Real-time event log table with virtual scrolling for handling tens of thousands of log records without frame drops.
  - Pause/Resume live streaming toggle.

---

### 12.7 E-Commerce Interfaces
- **Objective**: Intuitive product discovery, faceted filtering, rich gallery preview, and frictionless checkout.
- **Component Composition**:
  - Faceted Sidebar: Price slider, category checkboxes, rating filter, availability toggle.
  - Responsive Product Grid: 4-column (desktop) / 2-column (mobile) cards with product thumbnail, price badge, title, and quick "Add to Cart" button.
  - Product Detail View: Image gallery carousel, size/color selector chips, stock status indicator, and sticky checkout button.

---

### 12.8 AI-Powered Chat & Copilot Applications
- **Objective**: Seamless conversational collaboration, streaming token rendering, structured tool calls, and prompt suggestions.
- **Component Composition**:
  - Message Thread: Alternating chat bubbles (DaisyUI `chat chat-start` for AI, `chat chat-end` for user).
  - Token Streaming: Smooth opacity fade; prohibition of fake mechanical typing delays.
  - Candidate Selection: Wajah candidate cards for ambiguous responses.
  - Prompt Box: Expanding multiline `Textarea` + file attachment button (`useDropzone`) + send button.
  - PII Sanitization Review Modal: Pre-submission masking for detected sensitive entities.
- **Layout Wireframe**:
  ```
  ┌────────────────────────────────────────────────────────────┐
  │ AI Copilot                                   [Clear] [•••] │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  (User) Can you analyze this rejection message?            │
  │                                                            │
  │  (AI) Here is what the portal message usually means:       │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │ Institute or Officer Side                [Building]  │  │
  │  │ Who has to act: Nodal officer must verify documents. │  │
  │  └──────────────────────────────────────────────────────┘  │
  │                                                            │
  ├────────────────────────────────────────────────────────────┤
  │ [Textarea: Ask a question or paste status...]     [Send]   │
  │ Suggested: [ Explain defective ] [ How to contact bank ]   │
  └────────────────────────────────────────────────────────────┘
  ```

---

### 12.9 File Management & Asset Ingestion Interfaces
- **Objective**: Bulk document upload, virus scanning status, metadata tagging, and folder navigation.
- **Component Composition**:
  - Top Breadcrumb trail (`Home / Projects / 2026 Reports`).
  - React Dropzone full-width ingestion zone with drag-over visual highlight.
  - Upload Queue List: File item cards showing thumbnail icon, file name, byte size, animated progress bar, and abort trigger.
  - Grid / List view toggle for existing uploaded assets.

---

### 12.10 Data-Heavy Applications & Financial Tables
- **Objective**: High-density numerical data inspection, rapid keyboard editing, column resizing, and ledger exports.
- **Component Composition**:
  - Compact table density mode (32px row height).
  - Monospace font alignment for numerical figures.
  - Color-coded profit/loss indicators paired with Lucide `TrendingUp` / `TrendingDown` icons.
  - Sticky first column (account name) and sticky header row during multidirectional scrolling.

---

## Section 13: Dashboard Design Standards

### 13.1 Information Architecture & Dashboard Types
1. **Strategic Dashboards (Executive)**: High-level KPI aggregates, macro-trends, and overall business health. Update frequency: daily/weekly. Zero noise.
2. **Analytical Dashboards**: Complex datasets, historical comparisons, drill-down filters, and exploratory cohort analysis. Update frequency: on-demand.
3. **Operational Dashboards**: Real-time system monitoring, pending transaction queues, and incident response. Update frequency: sub-second streaming.

### 13.2 The KPI Card Formula
Every KPI metric card must adhere to a standardized 4-part visual hierarchy:
```
┌────────────────────────────────────────────────────────┐
│ METRIC TITLE (14px Semibold Uppercase)      [Tooltip]  │
│                                                        │
│ $1,248,500                                             │
│ (32px Bold Value)                                      │
│                                                        │
│ [ +14.2% vs last month ]               [SparkChart]    │
│ (Delta Badge with Icon)               (Micro-Trend)   │
└────────────────────────────────────────────────────────┘
```

### 13.3 Filter Bar Design Standards
- **Placement**: Directly below the dashboard page header, spanning the full width of the canvas.
- **Core Elements**: Date range preset picker (`Today`, `Last 7 Days`, `Last 30 Days`, `Year to Date`, `Custom Range`), dimension multi-select menus, search input, and a "Reset All" button when filters are active.
- **State Persistence**: Filter states must be serialized into URL query parameters (`?range=30d&region=eu`) to enable direct link sharing and bookmarking.

### 13.4 Density Switching (Compact vs Comfortable)
- **Comfortable Mode (Default)**: Table row height 48px, card padding 24px, generous whitespace for analytical clarity.
- **Compact Mode (Power User)**: Table row height 32px, card padding 16px, reduced font sizes (`--font-body-sm`), maximizing visible information density without scrolling.

---

## Section 14: Landing Page Design Standards

### 14.1 Above-The-Fold Anatomy
The above-the-fold region must capture user intent within five seconds:
1. **Navigation**: Lightweight, uncluttered top bar with sticky blur.
2. **Headline**: Single H1 (under 12 words) stating the primary transformation or capability.
3. **Subtitle**: Supporting paragraph (under 25 words) explaining how it works.
4. **Call to Action**: High-contrast 56px primary button paired with a secondary risk-free action ("No credit card required" or "Watch 2-min demo").
5. **Interactive Preview**: High-fidelity product UI card or live interactive widget proving real utility immediately.

### 14.2 Social Proof & Trust Architecture
- Place customer logos immediately below the hero section in monochrome opacity (50% gray), brightening to 100% on hover.
- Quantifiable validation: Highlight verified numbers ("Over \$2.4B processed", "15,000+ active developers").
- Quotes must feature genuine full names, roles, company logos, and high-resolution avatars.

### 14.3 Feature Grid Systems
- **The Bento Grid**: Asymmetric 3-column layout where the primary feature occupies a 2-column span with an interactive preview, flanked by 1-column secondary feature cards.
- **Visual Proof**: Every feature card must display an actual functional component (e.g., an interactive toggle or real chart), never generic stock photography.

### 14.4 Pricing Comparison Tables
- Clear monthly / annual billing toggle, highlighting annual savings with an Action Teal badge ("Save 20%").
- Exactly three tiers: Starter, Professional (visually elevated with border highlight and "Popular" pill), and Enterprise.
- Transparent feature matrix table with Lucide `Check` and `Minus` icons.

---

## Section 15: Data Visualization Standards

### 15.1 Chart Selection Framework

| Analytical Objective | Optimal Chart Type | Component Name | Anti-Pattern to Avoid |
| :--- | :--- | :--- | :--- |
| **Trend Over Time** | Area Chart | Tremor `<AreaChart>` | Using bar charts for continuous dense time series |
| **Discrete Comparison** | Bar Chart | Tremor `<BarChart>` | Using pie charts with more than 4 slices |
| **Categorical Ranking** | Horizontal Bar List | Tremor `<BarList>` | Crowded vertical column charts with angled labels |
| **Parts of a Whole** | Donut Chart | Tremor `<DonutChart>` | Standard pie charts; donut charts with >5 segments |
| **Multi-Series Trends** | Line Chart | Tremor `<LineChart>` | More than 4 overlapping lines on one chart |
| **Micro-Trend in Card**| Sparkline | Tremor `<SparkChart>` | Full coordinate axes inside small metric cards |
| **System Health / SLA**| Discrete Segment Strip| Tremor `<Tracker>` | Continuous line charts for binary operational states |
| **Threshold / Quota** | Multi-Segment Bar | Tremor `<CategoryBar>` | Uncalibrated radial progress dials |

### 15.2 Accessible Color Palettes for Visualizations
Charts must use colors that remain distinguishable for individuals with deuteranopia, protanopia, and tritanopia:
- **Categorical Palette (Up to 5 Series)**:
  1. Series 1: Navy / Electric Blue (`#1F5FA8`)
  2. Series 2: Teal (`#0E7C86`)
  3. Series 3: Amber Orange (`#D97706`)
  4. Series 4: Violet Purple (`#7C3AED`)
  5. Series 5: Slate Neutral (`#64748B`)
- **Stroke Differentiation**: For multi-line charts, pair color with line stroke styling (Series 1: solid line; Series 2: dashed line; Series 3: dotted line) to satisfy WCAG non-color guidelines.

### 15.3 Tooltip Formatting & Interactivity
- Tooltips render inside an elevated floating card with crisp white background, dark gray text, and 1px border.
- Values must be formatted for human comprehension: currency formatted as `$1,248.50`, large counts formatted compactly as `1.2M` or `450k`, and dates formatted clearly (`Oct 24, 2026`).

### 15.4 Screen Reader Data Table Fallback
All graphical charts must be accompanied by an accessible data table rendered either directly below the chart or as a screen-reader-only element:
```html
<div class="sr-only">
  <table>
    <caption>Monthly Revenue Summary 2026</caption>
    <thead>
      <tr><th scope="col">Month</th><th scope="col">Revenue</th></tr>
    </thead>
    <tbody>
      <tr><td>January</td><td>$112,000</td></tr>
      <tr><td>February</td><td>$128,450</td></tr>
    </tbody>
  </table>
</div>
```

---

## Section 16: Iconography Standards

### 16.1 Lucide 24x24 Vector Specifications
Every icon across the entire system originates from the Lucide vector standard:
- **ViewBox**: Exactly `0 0 24 24`.
- **Stroke Width**: Uniform 2.0px (`stroke-width="2"`). For micro sizes (16px), scale stroke width to 2.25px to prevent line degradation.
- **End Caps & Corners**: `stroke-linecap="round"` and `stroke-linejoin="round"`.
- **Fill**: Strictly `fill="none"`. Colors are inherited via `stroke="currentColor"`.

### 16.2 Semantic Size Mapping

| Size Identifier | Dimensions | Stroke Width | Primary Application |
| :--- | :---: | :---: | :--- |
| `icon-xs` | 14x14px | 2.25px | Micro-badges, inline status dots, compact table indicators |
| `icon-sm` | 16x16px | 2.00px | Input prefix icons, button icons, breadcrumbs |
| `icon-md` | 20x20px | 2.00px | Standard navigation items, action icons, dropdown triggers |
| `icon-lg` | 24x24px | 2.00px | Page titles, primary metric card headers, fix card cues |
| `icon-xl` | 32x32px | 1.75px | Feature highlights, notification banners |
| `icon-2xl`| 48x48px | 1.50px | File dropzone upload targets, empty state focal points |

### 16.3 Accessibility & Semantic Rules
1. **Decorative Icons**: When an icon accompanies adjacent descriptive text (e.g., `<Button><User /> Profile</Button>`), the icon must have `aria-hidden="true"` to prevent screen readers from announcing duplicate or irrelevant information.
2. **Interactive Action Icons**: When an icon button has no visible text label (e.g., a standalone close `X` or search magnifying glass), the parent button must provide an accessible name via `aria-label="Search records"`.
---

## Section 17: Accessibility Standards

### 17.1 WCAG 2.1 Level AA & AAA Compliance Checklist
The Master Design System enforces strict compliance with WCAG 2.1 Level AA standards, targeting Level AAA for text contrast, touch targets, and non-color cueing.

| Success Criterion | Level | Master System Requirement & Implementation |
| :--- | :---: | :--- |
| **1.4.1 Use of Color** | **A** | **MANDATORY**: Color is never used as the sole method of conveying status. Every status indicator must pair color with an icon, border style, and explicit text. |
| **1.4.3 Contrast (Minimum)**| **AA** | Normal text achieves >= 4.5:1 contrast against its background; large text (>= 18px bold or >= 24px regular) achieves >= 3.0:1. |
| **1.4.6 Contrast (Enhanced)**| **AAA** | Critical instructions and body reading text target >= 7.0:1 (Gray 900 on White achieves 14.8:1). |
| **2.1.1 Keyboard** | **A** | Every interactive action is operable via keyboard (`Tab`, `Enter`, `Space`, Arrow keys, `Escape`). |
| **2.1.2 No Keyboard Trap** | **A** | Focus never becomes trapped within any component or dialog without a clear keyboard exit path. |
| **2.4.3 Focus Order** | **A** | Logical, predictable tab order following the visual layout flow. |
| **2.4.7 Focus Visible** | **AA** | High-contrast focus indicator (`2px solid var(--color-brand-500)` with `2px offset`) visible on all focused elements. |
| **2.5.5 Target Size** | **AAA** | Interactive controls meet a 48x48px touch target floor with at least 8px clearance between targets. |
| **3.2.1 On Focus** | **A** | Receiving focus does not initiate an unexpected context change or submit forms. |
| **4.1.2 Name, Role, Value** | **A** | All components expose standard ARIA roles, states, and accessible names. |

### 17.2 Multi-Attribute Semantic Cueing (The Wajah Invariant)
To eliminate exclusion for the 300+ million color-blind individuals worldwide, status indicators must employ four simultaneous sensory channels:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MULTI-ATTRIBUTE FAULT CUE MATRIX                      │
├─────────────────┬───────────┬──────────────┬───────────────┬────────────────┤
│ STATUS CATEGORY │ COLOR     │ ICON (Lucide)│ BORDER STYLE  │ MANDATORY COPY │
├─────────────────┼───────────┼──────────────┼───────────────┼────────────────┤
│ User Side       │ Teal      │ User         │ 2px Solid     │ "Action needed │
│                 │ #0E7C86   │              │ ───────       │  on your side" │
├─────────────────┼───────────┼──────────────┼───────────────┼────────────────┤
│ Institute Side  │ Blue      │ Building     │ 2px Dashed    │ "Action needed │
│                 │ #1F5FA8   │              │ - - - -       │  by institute" │
├─────────────────┼───────────┼──────────────┼───────────────┼────────────────┤
│ Financial Side  │ Orange    │ Landmark     │ 3px Double    │ "Action needed │
│                 │ #A8530A   │              │ ═══════       │  by your bank" │
├─────────────────┼───────────┼──────────────┼───────────────┼────────────────┤
│ Uncertain State │ Slate     │ HelpCircle   │ 2px Dotted    │ "Status not    │
│                 │ #5B6770   │              │ • • • •       │  clear yet"    │
└─────────────────┴───────────┴──────────────┴───────────────┴────────────────┘
```

### 17.3 Focus Management & Screen Reader Trees
- **Modal Focus Containment**: Traps tab navigation within the open dialog.
- **Focus Restoration**: When an overlay closes, focus returns to the exact element that triggered it.
- **Dynamic Feedback**: Asynchronous state updates (e.g., search filtering, file upload progress, copied text) are announced using polite ARIA live regions:
  ```html
  <div role="status" aria-live="polite" class="sr-only">
    3 files uploaded successfully.
  </div>
  ```

### 17.4 High-Contrast Black-and-White Print Stylesheet
Every critical document view (such as step-by-step fix cards and invoice receipts) must remain completely legible when printed on monochrome grayscale printers:
```css
@media print {
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  .no-print, header, nav, footer, button {
    display: none !important;
  }
  .fix-card {
    border: 2px solid #000000 !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  /* Preserve non-color cues in monochrome */
  .border-dashed { border-style: dashed !important; }
  .border-double { border-style: double !important; }
  .border-dotted { border-style: dotted !important; }
}
```

---

## Section 18: Technical Implementation Guide

### 18.1 Harmonized Architecture: DaisyUI + Mantine + Tremor
Combining multiple specialized libraries in a single web application requires strict CSS layer management to prevent specificity collisions.

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED BUILD PIPELINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Tailwind CSS v4 Engine (@theme + OKLCH Variables)         │
│             │                                               │
│             ├──> @plugin "daisyui"  (Pure CSS Utility Atoms)│
│             │                                               │
│             ├──> @layer mantine     (Namespaced CSS Modules)│
│             │                                               │
│             └──> Tremor Raw         (Radix + Recharts SVGs) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 18.2 CSS Layer Isolation Protocol
In your primary stylesheet (`globals.css`), isolate Mantine's CSS modules inside a dedicated CSS `@layer` so that Tailwind CSS v4 utilities and DaisyUI classes can override Mantine styles without requiring `!important`:

```css
@import "tailwindcss";
@plugin "daisyui";

/* Wrap Mantine core styles in a lower-priority CSS layer */
@layer mantine {
  @import "@mantine/core/styles.css";
  @import "@mantine/notifications/styles.css";
  @import "@mantine/dates/styles.css";
}
```

### 18.3 Mantine Theme Reconciliation
Synchronize Mantine's theme configuration with Tailwind CSS v4 variables:

```typescript
// theme.ts
import { createTheme, rem } from '@mantine/core';

export const masterTheme = createTheme({
  primaryColor: 'teal',
  colors: {
    teal: [
      '#EFF6FF', '#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6',
      '#1499A5', '#0E7C86', '#08656E', '#044349', '#022428',
    ],
    brand: [
      '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
      '#3B82F6', '#2575CF', '#1F5FA8', '#17324D', '#0D1D2D',
    ],
  },
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(32), lineHeight: '1.25' },
      h2: { fontSize: rem(26), lineHeight: '1.30' },
      h3: { fontSize: rem(22), lineHeight: '1.35' },
    },
  },
});
```

### 18.4 SSR Hydration Protection for Data Visualizations
Because Recharts dynamically calculates SVG container dimensions from browser window dimensions, server-rendered React applications (Next.js App Router, Remix) must wrap Tremor charts in dynamic client loaders:

```typescript
// components/DynamicChart.tsx
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@mantine/core';

export const AreaChart = dynamic(
  () => import('@/components/tremor/AreaChart').then((mod) => mod.AreaChart),
  {
    ssr: false,
    loading: () => <Skeleton height={320} radius="md" animate />,
  }
);
```

---

## Section 19: Reusable Production Code Examples

### 19.1 tokens.css: Unified CSS Tokens & Themes
```css
@import "tailwindcss";

@theme {
  /* Brand Palette (OKLCH) */
  --color-brand-950: oklch(22% 0.04 240);
  --color-brand-900: oklch(28% 0.06 240);
  --color-brand-700: oklch(46% 0.14 245);
  --color-brand-500: oklch(62% 0.20 255);
  --color-brand-100: oklch(93% 0.04 250);

  /* Primary Action Palette */
  --color-action-800: oklch(42% 0.09 195);
  --color-action-700: oklch(51% 0.11 195);
  --color-action-600: oklch(61% 0.12 195);
  --color-action-100: oklch(95% 0.05 185);

  /* Semantic Colors */
  --color-success: oklch(56% 0.15 150);
  --color-warning: oklch(58% 0.16 75);
  --color-danger: oklch(52% 0.20 25);
  --color-info: oklch(58% 0.16 230);

  /* Radiuses */
  --radius-sm: 0.25rem;
  --radius-md: 0.50rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1.00rem;

  /* Spring Animations */
  --animate-dialog-show: dialogShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-fade-in: fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes dialogShow {
    from {
      opacity: 0;
      transform: translate(-50%, -46%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

---

### 19.2 UnifiedButton.tsx: High-Performance Composable Button
```tsx
import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const UnifiedButton = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-[#0E7C86] hover:bg-[#08656E] text-white shadow-sm focus-visible:outline-[#0E7C86]",
    secondary: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm focus-visible:outline-gray-400",
    ghost: "bg-transparent hover:bg-gray-100 text-[#1F5FA8] focus-visible:outline-[#1F5FA8]",
    danger: "bg-[#D92D20] hover:bg-[#B42318] text-white shadow-sm focus-visible:outline-[#D92D20]",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-14 px-6 text-base gap-2.5 min-h-[48px]", // Mobile touch target compliant
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span className="inline-flex" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
});

UnifiedButton.displayName = 'UnifiedButton';
```

---

### 19.3 FileDropzone.tsx: React Dropzone File Ingestion Component
```tsx
import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, AlertOctagon, X } from 'lucide-react';

export interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesAccepted,
  maxFiles = 3,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejections: FileRejection[]) => {
    setErrorMessage(null);
    if (rejections.length > 0) {
      const firstError = rejections[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setErrorMessage(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      } else if (firstError.code === 'file-invalid-type') {
        setErrorMessage('Invalid file type. Only PDF and images are accepted.');
      } else {
        setErrorMessage(firstError.message);
      }
      return;
    }
    setSelectedFiles(accepted);
    onFilesAccepted(accepted);
  }, [maxSize, onFilesAccepted]);

  const removeFile = (name: string) => {
    const updated = selectedFiles.filter(f => f.name !== name);
    setSelectedFiles(updated);
    onFilesAccepted(updated);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 min-h-[180px] text-center
          ${isDragActive ? 'border-[#0E7C86] bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
          ${isDragReject ? 'border-red-500 bg-red-50/50' : ''}`}
      >
        <input {...getInputProps()} aria-label="Upload document file" />
        <UploadCloud className="w-10 h-10 text-gray-500 mb-3" aria-hidden="true" />
        <p className="text-sm font-semibold text-gray-900">
          {isDragActive ? "Drop the files here..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, PNG, JPG up to {maxSize / (1024 * 1024)}MB (Max {maxFiles} files)
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertOctagon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <ul className="space-y-2">
          {selectedFiles.map((file) => (
            <li key={file.name} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="w-5 h-5 text-[#0E7C86] shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                <span className="text-xs text-gray-500 shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                aria-label={`Remove ${file.name}`}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md focus-visible:outline-[#0E7C86]"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

### 19.4 MetricKpiCard.tsx: Executive KPI Metric Card with Sparkline
```tsx
import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { Card, SparkChart } from '@tremor/react';

export interface MetricKpiCardProps {
  title: string;
  metric: string;
  change: string;
  isPositive: boolean;
  data: { date: string; value: number }[];
  tooltipText?: string;
}

export const MetricKpiCard: React.FC<MetricKpiCardProps> = ({
  title,
  metric,
  change,
  isPositive,
  data,
  tooltipText,
}) => {
  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        {tooltipText && (
          <span title={tooltipText} className="cursor-help text-gray-400 hover:text-gray-600">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-gray-900">
          {metric}
        </span>
        <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{change}</span>
        </div>
      </div>

      <div className="mt-4">
        <SparkChart
          data={data}
          categories={['value']}
          index="date"
          colors={[isPositive ? 'emerald' : 'rose']}
          className="h-10 w-full"
        />
      </div>
    </Card>
  );
};
```

---

### 19.5 BilingualFaultCard.tsx: Wajah-Inspired Public Status Card
```tsx
import React from 'react';
import { User, Building, Landmark, HelpCircle, ExternalLink, Copy } from 'lucide-react';

export type ResponsibilityType = 'student' | 'institute' | 'bank' | 'unsure';

export interface BilingualFaultCardProps {
  portalMessage: string;
  explanationEn: string;
  explanationHi: string;
  responsibility: ResponsibilityType;
  actorSentence: string;
  steps: { action: string; location?: string; promptToSay?: string }[];
  sourceTitle: string;
  verifiedDate: string;
  onCopyPrompt?: (prompt: string) => void;
}

export const BilingualFaultCard: React.FC<BilingualFaultCardProps> = ({
  portalMessage,
  explanationEn,
  explanationHi,
  responsibility,
  actorSentence,
  steps,
  sourceTitle,
  verifiedDate,
  onCopyPrompt,
}) => {
  const config = {
    student: {
      color: 'text-[#0E7C86] bg-teal-50 border-[#0E7C86]',
      borderClass: 'border-2 border-solid',
      icon: <User className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" />,
      label: 'Your side / आपकी ओर से',
    },
    institute: {
      color: 'text-[#1F5FA8] bg-blue-50 border-[#1F5FA8]',
      borderClass: 'border-2 border-dashed',
      icon: <Building className="w-5 h-5 text-[#1F5FA8]" aria-hidden="true" />,
      label: 'Institute or officer side / संस्थान या अधिकारी की ओर से',
    },
    bank: {
      color: 'text-[#A8530A] bg-amber-50 border-[#A8530A]',
      borderClass: 'border-4 border-double',
      icon: <Landmark className="w-5 h-5 text-[#A8530A]" aria-hidden="true" />,
      label: 'Bank side / बैंक की ओर से',
    },
    unsure: {
      color: 'text-[#5B6770] bg-gray-50 border-[#5B6770]',
      borderClass: 'border-2 border-dotted',
      icon: <HelpCircle className="w-5 h-5 text-[#5B6770]" aria-hidden="true" />,
      label: 'Not sure yet / अभी पक्का नहीं',
    },
  }[responsibility];

  return (
    <article className="max-w-[640px] mx-auto bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      {/* Portal Message Echo */}
      <div className="p-5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Message on the official portal
        </span>
        <blockquote className="mt-1 text-base font-semibold text-gray-900 italic">
          “{portalMessage}”
        </blockquote>
      </div>

      <div className="p-6 space-y-6">
        {/* Plain Language Explanations */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            What this usually means
          </h3>
          <p className="mt-1 text-lg text-gray-900 leading-relaxed font-normal" lang="en">
            {explanationEn}
          </p>
          <p className="mt-2 text-lg text-gray-800 leading-relaxed font-normal" lang="hi">
            {explanationHi}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            This is our reading of the message; the portal and officers make the final decision.
          </p>
        </section>

        {/* Multi-Attribute Responsibility Badge */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${config.color} ${config.borderClass}`}>
          {config.icon}
          <div>
            <p className="text-sm font-bold">{config.label}</p>
            <p className="text-sm font-medium mt-0.5">{actorSentence}</p>
          </div>
        </div>

        {/* Ordered Action Steps (Max 5) */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            What to do next
          </h3>
          <ol className="space-y-4">
            {steps.slice(0, 5).map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-base text-gray-900">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0E7C86] text-white text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-1.5 flex-1">
                  <p className="font-semibold">{step.action}</p>
                  {step.location && (
                    <p className="text-sm text-gray-600">Where: {step.location}</p>
                  )}
                  {step.promptToSay && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm italic text-gray-800">
                      <span>“{step.promptToSay}”</span>
                      {onCopyPrompt && (
                        <button
                          type="button"
                          onClick={() => onCopyPrompt(step.promptToSay!)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E7C86] hover:underline shrink-0 ml-2"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Verified Provenance Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs text-gray-600">
          <div>
            <span className="font-semibold text-gray-800">Source: {sourceTitle}</span>
            <span className="block mt-0.5">Checked date: {verifiedDate} (Verified)</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[#1F5FA8] font-semibold hover:underline cursor-pointer">
            View Source <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
```

---

## Section 20: Design Quality Checklist

Before shipping any feature or screen, run this exhaustive 11-dimension quality audit:

### 1. Visual Consistency & Spatial Cadence
- [ ] Every padding, margin, and gap value is an exact multiple of 4px.
- [ ] Border radiuses match token standards: 8px for controls, 12px for cards, 16px for modals.
- [ ] Surface hierarchy is intact: Canvas (0), Card (1), Popover (2), Modal (3).

### 2. Typography & Hierarchy
- [ ] Exactly one H1 per screen view.
- [ ] Headings follow 1.250 Major Third scale progression.
- [ ] Reading column width is constrained to a maximum of 640px.
- [ ] Line-height for Hindi Devanagari text is at least 1.6 to prevent diacritic clipping.

### 3. Color Contrast & Non-Color Semantics
- [ ] All body text meets at least 4.5:1 contrast against its background (WCAG AA).
- [ ] Critical instructional text meets at least 7.0:1 contrast (WCAG AAA).
- [ ] Color is never used alone to convey status; paired with icon, border style, and text.
- [ ] Dark mode uses deep slate (`#0D1117`), never pure black (`#000000`).

### 4. Accessibility & Assistive Technology
- [ ] Every interactive control is reachable and operable via keyboard alone.
- [ ] High-contrast focus indicator is visible on all focused elements.
- [ ] Modals and drawers trap keyboard focus and restore focus upon dismissal.
- [ ] Decorative icons declare `aria-hidden="true"`; icon-only buttons declare `aria-label`.
- [ ] Dynamic asynchronous updates announce via `aria-live="polite"` regions.

### 5. Responsiveness & Mobile Ergonomics
- [ ] Layout renders cleanly on a 360px viewport with zero horizontal window scroll.
- [ ] Tested down to 320px width without layout breakage.
- [ ] All touch targets meet the 48x48px floor with at least 8px clearance.
- [ ] Primary mobile action buttons stand at least 56px tall.

### 6. Navigation & Routing
- [ ] Permanent, non-dismissible Independence Ribbon visible on public service views.
- [ ] Skip-to-content link present as the first focusable element.
- [ ] Active navigation routes declare `aria-current="page"`.

### 7. Form Fields & Data Ingestion
- [ ] Every input has a persistent visible label above the field (no placeholder-only labels).
- [ ] Inputs use 16px base font size to prevent iOS Safari auto-zooming.
- [ ] Drag-and-drop dropzones validate file size and MIME types with friendly error messages.
- [ ] Pre-submission sanitization modal masks detected sensitive personal identifiers.

### 8. Loading, Error & Empty States
- [ ] Skeleton loaders match the dimensions of incoming content to prevent layout shifts.
- [ ] Loading buttons display an accessible spinner and prevent duplicate submissions.
- [ ] Empty state views offer clear guidance and an active recovery action button.

### 9. Motion & Transitions
- [ ] Micro-interactions complete within 150ms–200ms using spring easing.
- [ ] No fake typing animations or artificial progress delays in AI interfaces.
- [ ] Honors `prefers-reduced-motion` by disabling spatial movement animations.

### 10. Performance & Low-Bandwidth Resilience
- [ ] Core interface renders immediately using system fonts with zero remote font blocking.
- [ ] Heavy data visualizations and drag-and-drop engines are code-split and lazy-loaded.
- [ ] Bundle footprint for core offline reading logic remains under 100KB compressed.

### 11. Radical Trust & Integrity
- [ ] No probabilistic AI confidences presented as factual certainty.
- [ ] Unverified guidance clearly labeled with a visible Draft notice.
- [ ] Print view strips navigation and renders high-contrast, black-and-white output.

---

## Section 21: Final Recommendations

### 21.1 Strategic Implementation Roadmap
1. **Phase 1: Foundation & Token Ingestion (Week 1–2)**:
   - Configure Tailwind CSS v4 `@theme` with OKLCH color variables and 4px spacing tokens.
   - Set up CSS layer isolation (`@layer mantine`) and install Lucide React vector icons.
2. **Phase 2: Core Atoms & Form Primitives (Week 3–4)**:
   - Implement `UnifiedButton`, `TextInput`, `Select`, `Checkbox`, and `FileDropzone`.
   - Validate 48x48px touch ergonomics and WCAG AA contrast compliance.
3. **Phase 3: Domain Archetypes & Dashboards (Week 5–6)**:
   - Build responsive `AppShell` with collapsible sidebar.
   - Integrate Tremor Raw analytics charts with SSR hydration guards and accessible fallback tables.
4. **Phase 4: Radical Trust & Inclusive Hardening (Week 7–8)**:
   - Implement Wajah bilingual typography and multi-attribute fault cue cards.
   - Run end-to-end screen-reader audits (NVDA, VoiceOver) and 320px viewport stress tests.

### 21.2 The Definitive Engineering Do's and Don'ts

| Practice Area | DO (Mandatory Standard) | DON'T (Strictly Prohibited) |
| :--- | :--- | :--- |
| **Color Usage** | Combine color with icons, border styles, and text. | Rely solely on green/red badges to communicate state. |
| **Mobile Viewports** | Design for a 360px baseline with vertical stacking. | Build desktop-first and scale down with horizontal scrolling. |
| **AI Systems** | Surface candidate cards and explicit "Not sure yet".| Display probabilistic scores like "98.4% confident". |
| **Form Inputs** | Provide persistent visible labels above all inputs.| Use input placeholder text as a substitute for labels. |
| **Typography** | Use system font stacks for instant first contentful paint. | Block critical page rendering on external remote web fonts. |
| **Modals & Overlays**| Trap focus and lock background body scroll. | Use CSS checkbox hacks that break keyboard accessibility. |
| **Data Visuals** | Accompany graphical charts with accessible data tables. | Render standalone SVG charts without screen-reader fallbacks. |

### 21.3 Long-Term Design System Maintenance
A design system is a living product. To prevent architectural drift:
- **Enforce Token Linting**: Use Stylelint rules to prohibit raw hardcoded hex codes or arbitrary pixel margins in application code.
- **Automated Accessibility Testing**: Integrate Axe-core and Playwright accessibility testing into CI/CD pipelines to catch contrast regressions before merging.
- **Single Source of Truth**: Treat this `MASTER-UI-UX.md` document as the immutable architectural contract governing all future web applications, SaaS dashboards, and digital services.