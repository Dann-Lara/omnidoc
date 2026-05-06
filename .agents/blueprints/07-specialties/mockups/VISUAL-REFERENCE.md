# Mockups Visuales - Módulo de Especialidades

Este archivo contiene referencias y estructurales de los mockups de UI para el módulo de especialidades.

---

## 1. SaaS - Catálogo de Especialidades

**Ubicación**: `/admin/parameters/specialties`

**Descripción**: Tablamaestra con todas las especialidades globales

**Elementos visuales**:
- Header: "Master Specialty Catalog" con breadcrumbs: Parameters > Specialties
- Stats bento: Total Verified (42), Active Now (38), Pending Sync (04), System Health
- Tabla con columnas:
  - Icon (círculo con icono del specialty)
  - English Nomenclature (nombre en inglés + ID: SPEC-001-CRD)
  - Spanish Translation (traducción al español)
  - System Status (toggle Active/Inactive)
  - Actions (botón más)
- Pie de tabla: "Showing 4 of 42 Master Specialties" con paginación

**Colores**:
- Primary: #00355f
- Secondary: #48626e
- Surface container: #eceef0

---

## 2. SaaS - Crear/Editar Especialidad

**Ubicación**: `/admin/parameters/specialties/new` o `/admin/parameters/specialties/:id`

**Descrição**: Formulario para crear o editar una especialidad

**Elementos visuales**:
- Header con breadcrumbs: Parameters > Specialties > Create New
- Formulario asimétrico (2 columnas):
  
  **Columna izquierda - Identity & Translation**:
  - Specialty Name (Spanish) - input text
  - Specialty Name (English) - input text
  - Description (Spanish) - textarea
  - Description (English) - textarea
  
  **Columna izquierda - Configuration Schema**:
  - Editor JSON con config_schema
  - Ejemplo:
    ```json
    {
      "clinical_logic": {
        "triage_priority": "high",
        "required_vitals": ["bp", "hr", "spo2"]
      },
      "billing_rules": {
        "taxonomy_code": "207R00000X"
      }
    }
    ```

  **Columna derecha - Iconography & Status**:
  - Icon Selector: preview + input para Material Symbols key
  - Active Status: toggle switch
  - Audit Metadata (info): Global ID, Tenant Inheritance, Sync Status

**Botones**:
- Discard Draft
- Save Specialty

---

## 3. Tenant - Grid de Especialidades

**Ubicación**: `/[slug]/areas/specialties`

**Descripción**: Grilla visual de especialidades del tenant con volumen

**Layout** (Bento Grid asimétrico):
- **Cardiology** (6x4): 12,482 pacientes - recuadro grande primary
- **Pediatrics** (3x3): 8,910 pacientes, 72% fill
- **Oncology** (3x3): 4,205 pacientes  
- **Neurology** (3x3): 3,110 pacientes
- **Orthopedics** (3x3): 2,845 pacientes
- **Dermatology** (2x2): 1,240 pacientes - small
- **Pulmonology** (2x2): 942 pacientes - small
- **Endocrinology** (2x2): 715 pacientes - small

**Stats inferiores**:
- Avg. Consultation Time: 24.5 min (+1.2%)
- Resource Utilization: 88.4% (bar)
- Staff Efficiency: 92/100

**Legend** (derecha):
- Critical High Activity: square primary
- Standard Outpatient: square secondary
- Specialized Lab Work: square tertiary
- Emerging Markets: square outline

**FAB**: "Deploy Specialty"

---

## 4. Tenant - Dashboard por Especialidad

**Ubicación**: `/[slug]/areas/specialties/:specialtyId`

**Descripción**: Dashboard detallado de una especialidad específica

**Layout** (Bento Grid):

**Header**: 
- Breadcrumbs: Areas > Cardiology
- Título: "Specialty Dashboard - Cardiology"
- Botón: New Patient

**Stats row** (3 columnas):
- Daily Capacity: 84% con mini gráfica
- Avg. Consult: 22m (+4%)
- Wait Time: 12m (-8%)

**Critical Reminders** (4 columnas):
- ECG Module Calibration (warning)
- Stock Alert: Warfarin (emergency)

**Upcoming Appointments** (8 columnas):
- Lista de citas con:
  - Hora (09:30 AM)
  - Avatar del paciente
  - Nombre (Eleanor Vance)
  - Tipo (Post-Op Follow-up • Dr. Thorne)
  - Etiqueta (Telehealth/In-Person)
  - Botón: Start Consultation

**Sidebar derecho** (4 columnas):
- Supplies Inventory con barras de progreso
- Quick Actions (Protocols, Lab Orders, Analytics, Settings)

---

## Especificaciones Técnicas

### Iconos (Material Symbols Outlined)
Los iconos usan la librería Material Symbols con la prop:
```
style="font-variation-settings: 'FILL' 1;"
```

Keys de ejemplo:
- `cardiology` - Cardiología
- `neurology` - Neurología  
- `dermatology` - Dermatología
- `pediatrics` - Pediatría
- `child_care` - Cuidado infantil
- `biotech` - Biotecnología
- `psychiatry` - Psiquiatría
- `pulmonology` - Pulmonología
- `nephrology` - Nefrología
- `orthopedics` - Ortopedia

### Colores del Design System
- Primary: #00355f
- Primary container: #0f4c81
- Secondary container: #cbe7f5
- Tertiary container: #00525d
- Surface: #f8f9fb
- Surface container: #eceef0
- Surface container lowest: #ffffff
- On surface: #191c1e
- On surface variant: #42474f
- Error: #ba1a1a
- Outline: #727780

---

##Notas de Implementación

1. **Icons**: Usar Material Symbols Outlined directamente en React
2. **Toggle**: Implementar con el patrón de checkbox + div + transform
3. **JSON Editor**: Usar un componente de editor de código con highlighting
4. **Grid/Bento**: Usar CSS Grid con las clases de Tailwind del design system
5. **Stats bars**: Implementar con div h-X bg-X y style="width: X%"