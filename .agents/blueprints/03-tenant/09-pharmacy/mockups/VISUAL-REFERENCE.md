# 08-Pharmacy: Mockups - Referencia Visual

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/mockups |
| **Estado** | ✅ Mockups Proporcionados |
| **Formato** | HTML + Tailwind CSS v4 |

---

## 🎨 Mockups Disponibles

### 1. Clinical Inventory Intelligence (Dashboard Principal)

**Archivo:** `clinical-inventory-intelligence.html`
**Descripción:** Dashboard ejecutivo con KPIs, riesgos de caducidad, alertas de stock y gráficos de seguridad.

**Secciones:**
- Hero Section con título y botones de acción
- KPI Grid (4 tarjetas): Total Value, Expiry Risks, Security Stock Alert, Procurement Pending
- Expiring Batch Surveillance (tabla de lotes por vencer)
- Security Stock Variance (gráfico de barras)
- Editorial Sidebar (Monthly Intelligence Summary, Stock Insights)

**Colores clave:**
- Primary: `#00355f`, `#0f4c81`
- Error: `#ba1a1a`
- Tertiary: `#003941`
- Surface: `#f8f9fb`

**Iconos:** Material Symbols Outlined (`priority_high`, `warning`, `inventory_2`, `analytics`)

---

### 2. Inventory & Batch Management

**Archivo:** `inventory-batch-management.html`
**Descripción:** Gestión de inventario agrupado por producto con lotes FEFO expandibles.

**Secciones:**
- Operational Overview con botón "Add Batch / Restock"
- High-Density Metrics Row (Total SKUs, Active Batches, Critical Expiry)
- Filter & Search Bar
- Product & Batch Grouped View (ej: Amoxicillin, Insulin)
- Batch Detail Table con prioridad FEFO
- Load More pagination

**Características FEFO:**
- Prioridad visual: "NEXT OUT" (color `tertiary`)
- Estados: CRITICAL (30d), MODERATE (60d), HEALTHY (90d)
- Acciones: "Adjust" en hover

---

### 3. Master Product Library

**Archivo:** `master-product-library.html`
**Descripción:** Catálogo maestro global de medicamentos con metadatos.

**Secciones:**
- Title & Action (botón "Add New Registry")
- Breadcrumbs & Search
- Main Table (Commercial Name, Active Substance, Presentation, Laboratory)
- Pagination (Showing 1-4 of 1,248 products)

**Campos tabla:**
- Color indicator (primary circle)
- ID: MED-90210, BIO-44521, etc.
- Acciones: `edit_note`, `inventory_2` (Check Global Stock)

**Ejemplos:**
- Lipitor (Atorvastatin Calcium) - 10mg Tablet
- Humira (Adalimumab) - 40mg/0.4mL Pen
- Ventolin HFA (Albuterol Sulfate) - 90mcg Inhaler
- Januvia (Sitagliptin) - 100mg Tablet

---

### 4. Batch Restock Entry

**Archivo:** `batch-restock-entry.html`
**Descripción:** Formulario de reabastecimiento con búsqueda/escaneo de código de barras.

**Secciones:**
- Header con botón "Guidelines"
- Left Column:
  - Identify Product (con scanner activo)
  - Product Selected State (card con imagen)
  - Batch Details (Batch Number, Expiry Date)
  - Restock Quantity (+/- buttons)
- Right Column (sticky):
  - Inventory Impact Summary (On Hand + Adding = Proyected)
  - Compliance Check (checklist)
  - Primary Action: "Finalize Restock Entry"
  - Recent Batch Entries

**Funcionalidades:**
- Barcode scanner simulation (`barcode_scanner` icon)
- Quantity selector with +/- buttons
- Real-time inventory projection
- Compliance indicators (Cold-chain, SKU match)

---

## 🎨 Estilos y Tokens (Tailwind v4)

### Colores Personalizados

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary': '#00355f',
        'primary-container': '#0f4c81',
        'primary-fixed': '#d2e4ff',
        'on-primary': '#ffffff',
        'secondary': '#48626e',
        'secondary-container': '#cbe7f5',
        'tertiary': '#003941',
        'tertiary-container': '#00525d',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'surface': '#f8f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#42474f',
        'outline': '#727780',
        'outline-variant': '#c2c7d1',
      },
      fontFamily: {
        'headline': ['Manrope'],
        'display': ['Manrope'],
        'body': ['Inter'],
        'label': ['Inter']
      }
    }
  }
}
```

### Clases Utilitarias Importantes

- `material-symbols-outlined` - Iconos (configurar `font-variation-settings`)
- `font-display` / `font-headline` - Manrope (titulos)
- `font-body` / `font-label` - Inter (cuerpo)
- `tonal-gradient` / `primary-gradient` - Gradientes de marca
- `bg-surface-container-*` - Jerarquía de superficies
- `text-on-surface-*` - Textos sobre superficies

---

## 📱 Responsive Breakpoints

Siguiendo las reglas de `responsive-design` skill:

| Breakpoint | Clase | Descripción |
|------------|-------|-------------|
| 640px | `sm:` | Mobile large |
| 768px | `md:` | Tablet |
| 1024px | `lg:` | Desktop |
| 1280px | `xl:` | Wide desktop |

**Mobile-First:** Las mockups usan `md:flex-row`, `lg:grid-cols-3`, etc.

---

## 🔗 Integración con Tailwind Design System

Este módulo DEBE usar los tokens definidos en `00-global/03-design-system.md`:

- Usar `@import "tailwindcss"` (v4)
- No hardcodear colores, usar tokens del design system
- Respetar `border-radius: 0.125rem` (DEFAULT)
- Fuentes: Manrope (titulos), Inter (texto)

---

## 📋 Checklist de Implementación UI

### Dashboard (AC 4)
- [ ] KPI Cards con bordes laterales (`border-l-4`)
- [ ] Tabla "Expiring Batch Surveillance" con estados de criticidad
- [ ] Gráfico "Security Stock Variance" (usar Recharts o similar)
- [ ] Editorial Sidebar con imagen de fondo

### Inventory Management (AC 2, AC 3)
- [ ] Agrupación por producto (card con imagen)
- [ ] Expansión de lotes con prioridad FEFO visual
- [ ] Botones "Adjust" que aparecen en hover
- [ ] Estados: CRITICAL (error), MODERATE (secondary), HEALTHY (tertiary)

### Master Library (AC 1)
- [ ] Tabla con búsqueda y filtros
- [ ] Paginación funcional
- [ ] Acciones: Editar metadatos, Ver stock global

### Restock Entry (AC 2.5, AC 6.3)
- [ ] Búsqueda con icono de scanner activo
- [ ] Producto seleccionado (card con stock actual)
- [ ] Inputs: Batch Number, Expiry Date (date picker)
- [ ] Quantity con botones +/- 
- [ ] Resumen "Inventory Impact" en tiempo real
- [ ] Checklist de cumplimiento

---

## 🎯 Diferencias con Mockups (Ajustes Reales)

| Mockup | Ajuste Real |
|---------|-------------|
| Colores hardcoded | Usar tokens del design system (`primary`, `surface-container`, etc.) |
| Fuentes via CDN | Usar `next/font` (local) |
| Material Symbols CDN | Descargar o usar librería local |
| HTML puro | Convertir a componentes React/Next.js |
| Tailwind CDN | Usar PostCSS + `@tailwindcss/postcss` (v4) |
| Imágenes placeholders | Usar `placeholder.svg` o Unsplash API |

---

## ✅ Estado

Mockups proporcionados como referencia visual. La implementación real usa tokens del design system en lugar de colores hardcoded.
