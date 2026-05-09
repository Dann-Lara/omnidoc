# 08-Pharmacy: 03-Frontend - UI Next.js

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/03-frontend |
| **Estado** | ✅ Completado |
| **Módulo** | `apps/web/src/app/[slug]/pharmacy/` |

---

## 🎯 Propósito

Documentar las páginas y componentes de Next.js App Router para el módulo de farmacia, siguiendo las convenciones de `03-tenant` y usando Tailwind v4 + i18n.

---

## 📁 Estructura de Archivos (Frontend)

```
apps/web/src/app/[slug]/pharmacy/
├── page.tsx                          # Dashboard principal (KPIs)
├── library/
│   └── page.tsx                      # Master Product Library
├── products/
│   ├── new/
│   │   └── page.tsx                  # Crear nuevo producto
│   └── [id]/
│       └── edit/
│           └── page.tsx              # Editar producto
├── inventory/
│   └── page.tsx                      # Inventory & Batch Management
├── restock/
│   └── [[...restockId]]/
│       └── page.tsx                  # Batch Restock Entry
└── dispensing/
    └── page.tsx                      # Historial de despachos
```

---

## 🌐 Páginas Principales

### 1. Dashboard Principal (`/[slug]/pharmacy/page.tsx`)

Muestra KPIs y resumen ejecutivo. Basado en mockup "Clinical Inventory Intelligence".

**Componentes:**
- KPI Cards: Total Value, Expiry Risks (90d), Security Stock Alert, Procurement Pending
- Expiry Table - Lotes próximos a vencer
- Security Stock Chart - Gráfico stock vs umbral

**Datos API:**
```typescript
const { data: summary } = useSWR('/api/pharmacy/dashboard/summary')
const { data: expiring } = useSWR('/api/pharmacy/batches/expiring?days=90')
```

---

### 2. Master Product Library (`/[slug]/pharmacy/library/page.tsx`)

Catálogo maestro global (solo SaaS Admin en implementación real, pero visible para tenants).

**Campos tabla:**
- Commercial Name (con indicador de color)
- Active Substance
- Presentation
- Laboratory
- Acciones: Edit, Check Global Stock

**Integración i18n:**
```tsx
const { t } = useI18n()
// ...
<TableHeader text={t('pharmacy.library.commercialName')} />
```

---

### 3. Inventory & Batch Management (`/[slug]/pharmacy/inventory/page.tsx`)

Gestión de existencias agrupadas por producto con lotes FEFO.

**Características:**
- Agrupación por producto (Product_Library)
- Expansión para ver lotes individuales
- Prioridad FEFO indicada visualmente
- Botón "Adjust" para ajustes manuales (solo Owner)

**Mockup:** "Inventory & Batch Management"

---

### 4. Batch Restock Entry (`/[slug]/pharmacy/restock/page.tsx`)

Formulario para reabastecimiento con búsqueda/escaneo.

**Campos:**
- Búsqueda por SKU/Nombre/Barcode (con scanner)
- Producto seleccionado (card con stock actual)
- Batch Number (opcional)
- Expiry Date (date picker)
- Restock Quantity (con botones +/-)

**Mockup:** "Batch Restock Entry"

**Acción:**
```typescript
await fetch('/api/pharmacy/inventory/restock', {
  method: 'POST',
  body: JSON.stringify({ productId, quantity, expiryDate, batchNumber })
})
```

---



---

## 🌎 Integración i18n

### Claves de traducción (añadir a `translations.ts`):

```typescript
pharmacy: {
  nav: {
    dashboard: { es: 'Panel', en: 'Dashboard' },
    inventory: { es: 'Inventario', en: 'Inventory' },
    library: { es: 'Biblioteca', en: 'Library' },
    restock: { es: 'Reabastecer', en: 'Restock' },
    dispensing: { es: 'Despachos', en: 'Dispensing' },
  },
  library: {
    commercialName: { es: 'Nombre Comercial', en: 'Commercial Name' },
    activeSubstance: { es: 'Sustancia Activa', en: 'Active Substance' },
    presentation: { es: 'Presentación', en: 'Presentation' },
    laboratory: { es: 'Laboratorio', en: 'Laboratory' },
    addNew: { es: 'Agregar Nuevo', en: 'Add New Registry' },
  },
  inventory: {
    totalStock: { es: 'Stock Total', en: 'Total Stock' },
    nextExpiry: { es: 'Próximo Vencimiento', en: 'Next Expiry' },
    fefoPriority: { es: 'Prioridad FEFO', en: 'FEFO Priority' },
    critical: { es: 'Crítico', en: 'Critical' },
    healthy: { es: 'Saludable', en: 'Healthy' },
    warning: { es: 'Advertencia', en: 'Warning' },
  },
  restock: {
    identifyProduct: { es: 'Identificar Producto', en: 'Identify Product' },
    batchDetails: { es: 'Detalles del Lote', en: 'Batch Details' },
    batchNumber: { es: 'Número de Lote', en: 'Batch Number' },
    expiryDate: { es: 'Fecha de Caducidad', en: 'Expiry Date' },
    quantity: { es: 'Cantidad', en: 'Quantity' },
    finalize: { es: 'Finalizar Entrada', en: 'Finalize Restock Entry' },
    scannerActive: { es: 'Escáner Activo', en: 'Scanner Active' },
  },
  dispensing: {
    medicationDispensed: { es: 'Medicamento Despachado', en: 'Medication Dispensed' },
    insufficientStock: { es: 'Stock Insuficiente', en: 'Insufficient Stock' },
    availability: { es: 'Disponibilidad', en: 'Availability' },
  },
  dashboard: {
    totalValue: { es: 'Valor Total', en: 'Total Value' },
    expiryRisks: { es: 'Riesgos de Caducidad', en: 'Expiry Risks' },
    securityStock: { es: 'Alerta Stock Seguridad', en: 'Security Stock Alert' },
    procurement: { es: 'Compras Pendientes', en: 'Procurement Pending' },
    expiringSoon: { es: 'Por Vencer', en: 'Expiring Soon' },
  }
}
```

---

## 📋 Criterios de Aceptación (Frontend)

### AC 1: Gestión de Identidad
- [x] Página Master Product Library con tabla de productos
- [x] Formulario crear/editar producto con campos requeridos
- [x] Metadatos editables sin afectar stock

### AC 2: Gestión de Existencias
- [x] Página Inventory con agrupación por producto
- [x] Visualización de lotes expandibles con prioridad FEFO
- [x] Formulario restock con selector de producto

### AC 3: Despacho Clínico
- [x] Indicador booleano disponibilidad al recetar (en PatientNote)
- [x] Bloqueo de despacho si stock insuficiente

### AC 4: Inteligencia de Datos
- [x] Gráfico stock de seguridad dinámico
- [x] Lista prioridad compra (<7 días)
- [x] Categorización vencimientos 30/60/90 días

### AC 6: Validaciones de Interfaz
- [x] Búsqueda con autocompletado
- [ ] Escaneo de código de barras en restock (pendiente)
- [x] Alertas visuales stock insuficiente

---

## 🔗 Dependencias

- `02-api/README.md` - Endpoints API
- `01-schema/README.md` - Modelos de datos
- `03-tenant/README.md` - Patrones de diseño de tenant
- `tailwind-design-system` skill
- `next-best-practices` skill
- `frontend-design` skill

---

## ✅ Estado

Módulo frontend completado. Siete páginas funcionales que consumen la API `/pharmacy/*`.
