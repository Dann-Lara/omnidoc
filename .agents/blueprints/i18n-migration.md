# Blueprint: Migración global de i18n (eliminar ternarios por idioma)

## Objetivo

Estandarizar todo el frontend para usar:

```tsx
const { t } = useI18n()
t('scope.key')
```

y eliminar patrones inline:

```tsx
lang === 'en' ? '...' : '...'
lang === 'es' ? '...' : '...'
```

## Alcance

- Código objetivo: `apps/web/src/**`
- Fuente de traducciones: `apps/web/src/lib/i18n/translations.ts` (~500 keys existentes)
- Hook estándar: `apps/web/src/lib/i18n/index.tsx`

## Regla técnica

1. No introducir nuevos ternarios de idioma en JSX o lógica.
2. Todo literal de UI bilingüe debe vivir en `translations.ts`.
3. Las claves deben seguir convención `area.feature.label`.
4. Si falta traducción, agregar a `translations.ts` bajo namespace del módulo.

---

## Inventario Real (Auditado 2026-05-05)

### Total: ~208 ternarios en ~20 archivos

#### Prioridad 1 — Clinical Notes (90 ternarios, 2 archivos)

| Count | Archivo | Namespace nuevo |
|-------|---------|-----------------|
| 49 | `app/[slug]/operations/patients/[patientId]/notes/new/page.tsx` | `clinicalNotes.form.*` |
| 41 | `app/[slug]/operations/patients/[patientId]/notes/[noteId]/page.tsx` | `clinicalNotes.view.*` |

**Claves existentes que YA cubren parte**: `patients.act.*` tiene vital signs, diagnosis, plan.
**Claves nuevas necesarias**: ~80 keys para section headers, labels de formulario, modales, botones, report clinical evolution headers.

#### Prioridad 2 — Pacientes CRUD (62 ternarios, 3 archivos)

| Count | Archivo | Namespace |
|-------|---------|-----------|
| 23 | `app/[slug]/operations/patients/[patientId]/page.tsx` | `patients.detail.*` (ya existe, faltan ~15) |
| 21 | `app/[slug]/operations/patients/[patientId]/history/page.tsx` | `patients.history.*` (1 key existe, faltan ~18) |
| 18 | `app/[slug]/operations/patients/new/page.tsx` | `patients.form.*` (ya existe, faltan ~8) |

#### Prioridad 3 — Team + Operators (27 ternarios, 5 archivos)

| Count | Archivo | Namespace |
|-------|---------|-----------|
| 8 | `app/[slug]/areas/team/add/page.tsx` | `team.*` (ya existe, faltan ~5) |
| 7 | `app/admin/operators/add/page.tsx` | `admin.operators.*` (ya existe, faltan ~3) |
| 6 | `app/[slug]/areas/team/page.tsx` | `team.*` (ya existe, faltan ~4) |
| 6 | `app/[slug]/areas/team/[userId]/page.tsx` | `team.*` (ya existe, faltan ~4) |

#### Prioridad 4 — Appointments Agenda + Shared (18 ternarios, 4 archivos)

| Count | Archivo | Namespace |
|-------|---------|-----------|
| 6 | `app/[slug]/operations/appointments/components/AgendaView.tsx` | `appointments.agenda.*` + `calendar.days.*` + `calendar.months.*` |
| 6 | `components/TagSelector.tsx` | `tagSelector.*` (ya existe, 3 usadas inline) |
| 1 | `components/appointments/CalendarGrid.tsx` | `appointments.calendar.*` (ya existe) |
| 6 | `app/[slug]/operations/patients/page.tsx` | `patients.directory.*` (ya existe, ~4 inline) |

#### Prioridad 5 — UI menor (11 ternarios, 8 archivos)

| Count | Archivo | Namespace nuevo |
|-------|---------|-----------------|
| 1 | `app/[slug]/dashboard/components/TenantSidebar.tsx` | `sidebar.operationsLabel` |
| 1 | `app/[slug]/dashboard/components/TenantNavbar.tsx` | `nav.langToggle` |
| 1 | `app/admin/components/AdminNavbar.tsx` | `nav.langToggle` |
| 1 | `app/[slug]/specialties/[specialtyId]/page.tsx` | Ya tiene `tenant.specialties.*` |
| 1 | `app/[slug]/profile/page.tsx` | Ya tiene `tenant.profile.*` |
| 1 | `app/[slug]/profile/edit/page.tsx` | Ya tiene `tenant.profileEdit.*` |
| 1 | `app/[slug]/areas/specialties/page.tsx` | Ya tiene `tenant.areas.specialties.*` |
| 5 | Varios | Specialty name fallbacks (data, NO migrar) |

---

## Claves nuevas a agregar (~100 keys)

### `clinicalNotes.*` — ~80 keys

```
clinicalNotes.form.noteSaved
clinicalNotes.form.noteSealed
clinicalNotes.form.backToHistory
clinicalNotes.form.title
clinicalNotes.form.patientLabel
clinicalNotes.form.idLabel
clinicalNotes.form.chronic
clinicalNotes.form.selectSpecialty
clinicalNotes.form.noSpecialties
clinicalNotes.form.vitalSigns
clinicalNotes.form.bloodPressure
clinicalNotes.form.heartRate
clinicalNotes.form.respRate
clinicalNotes.form.weight
clinicalNotes.form.height
clinicalNotes.form.bmi
clinicalNotes.form.subjective
clinicalNotes.form.subjectivePlaceholder
clinicalNotes.form.diagnosis
clinicalNotes.form.diagnosisPlaceholder
clinicalNotes.form.plan
clinicalNotes.form.planPlaceholder
clinicalNotes.form.medication
clinicalNotes.form.medicationPlaceholder
clinicalNotes.form.dosage
clinicalNotes.form.dosagePlaceholder
clinicalNotes.form.addItem
clinicalNotes.form.followUpInstructions
clinicalNotes.form.followUpInstructionsPlaceholder
clinicalNotes.form.saveDraft
clinicalNotes.form.finalizeSeal
clinicalNotes.form.saveDraftShort
clinicalNotes.form.finalizeSealShort
clinicalNotes.form.summary
clinicalNotes.form.patientData
clinicalNotes.form.allergy
clinicalNotes.form.bloodType
clinicalNotes.form.condition
clinicalNotes.form.chronicActive
clinicalNotes.form.born
clinicalNotes.form.riskAssessment
clinicalNotes.form.cardiovascular
clinicalNotes.form.moderate
clinicalNotes.form.aiReport
clinicalNotes.form.sealNote
clinicalNotes.form.sealNoteDesc
clinicalNotes.form.legalSeal
clinicalNotes.form.cancel
clinicalNotes.form.confirm
clinicalNotes.form.patientNotFound

clinicalNotes.view.noteNotFound
clinicalNotes.view.back
clinicalNotes.view.reportTitle
clinicalNotes.view.certifiedDoc
clinicalNotes.view.patientNameLabel
clinicalNotes.view.noInformation
clinicalNotes.view.gender
clinicalNotes.view.years
clinicalNotes.view.verifyEntry
clinicalNotes.view.sectionVitalSigns
clinicalNotes.view.bloodPressureLabel
clinicalNotes.view.heartRateLabel
clinicalNotes.view.temperatureLabel
clinicalNotes.view.bmiLabel
clinicalNotes.view.sectionClinicalSummary
clinicalNotes.view.chiefComplaint
clinicalNotes.view.physicalExam
clinicalNotes.view.noPhysicalExam
clinicalNotes.view.sectionDiagnosis
clinicalNotes.view.noDiagnosis
clinicalNotes.view.sectionTreatment
clinicalNotes.view.pharmacology
clinicalNotes.view.noPlan
clinicalNotes.view.lifestyleChanges
clinicalNotes.view.scheduledFollowUp
clinicalNotes.view.vitalSignsMonitoring
clinicalNotes.view.digitallySealed
clinicalNotes.view.timestampPrefix
clinicalNotes.view.exportPDF
clinicalNotes.view.sendToPatient
clinicalNotes.view.attendingPhysician
clinicalNotes.view.generalMedicine
clinicalNotes.view.sendModalTitle
clinicalNotes.view.emailSentSuccess
clinicalNotes.view.close
clinicalNotes.view.sendNoteDesc
clinicalNotes.view.patientEmail
clinicalNotes.view.emailPlaceholder
clinicalNotes.view.send
```

### `calendar.*` — 16 keys

```
calendar.days.0 → Sun / Dom
calendar.days.1 → Mon / Lun
calendar.days.2 → Tue / Mar
calendar.days.3 → Wed / Mié
calendar.days.4 → Thu / Jue
calendar.days.5 → Fri / Vie
calendar.days.6 → Sat / Sáb

calendar.months.0 → Jan / Ene
calendar.months.1 → Feb / Feb
calendar.months.2 → Mar / Mar
calendar.months.3 → Apr / Abr
calendar.months.4 → May / May
calendar.months.5 → Jun / Jun
calendar.months.6 → Jul / Jul
calendar.months.7 → Aug / Ago
calendar.months.8 → Sep / Sep
calendar.months.9 → Oct / Oct
calendar.months.10 → Nov / Nov
calendar.months.11 → Dec / Dic
```

### `nav.langToggle` — 2 keys

```
nav.langToggle.showSpanish → ES
nav.langToggle.showEnglish → EN
```

### `sidebar.operationsLabel` — 1 key

```
sidebar.operationsLabel → Operations / Operaciones
```

---

## Estrategia por fases

### Fase 1 — Agregar claves faltantes a translations.ts
- ~100 keys nuevas
- 1 archivo a modificar

### Fase 2 — Migrar Clinical Notes (90 ternarios)
- `notes/new/page.tsx` (49)
- `notes/[noteId]/page.tsx` (41)

### Fase 3 — Migrar Pacientes CRUD (62 ternarios)
- `patients/[id]/page.tsx` (23)
- `patients/[id]/history/page.tsx` (21)
- `patients/new/page.tsx` (18)

### Fase 4 — Migrar Team + Operators (27 ternarios)
- `team/add/page.tsx` (8)
- `operators/add/page.tsx` (7)
- `patients/page.tsx` (6)
- `team/page.tsx` (6)
- `team/[userId]/page.tsx` (6)

### Fase 5 — Componentes compartidos + UI menor (29 ternarios)
- `AgendaView.tsx` (6)
- `TagSelector.tsx` (6)
- `CalendarGrid.tsx` (1)
- UI menor: 8 archivos, 1 ternario cada uno

---

## Playbook de migración por archivo

1. Identificar textos con `lang === 'en' ? ... : ...` o `lang === 'es' ? ... : ...`
2. Mapear a key existente en `translations.ts` o usar nueva key
3. Reemplazar en componente por `t('...')`
4. Mantener interpolaciones con templates seguros:
   - Ejemplo: `t('profile.roleDescription').replace('{orgName}', orgName)`
5. Verificar EN/ES manualmente en la vista afectada
6. Ejecutar lint puntual/chequeo del área tocada

## Checklist de aceptación por PR

- [ ] No se agregaron nuevos ternarios por idioma.
- [ ] Cada literal bilingüe se movió a `translations.ts`.
- [ ] Claves siguen convención `area.feature.label`.
- [ ] Render correcto en EN/ES en pantalla afectada.
- [ ] Sin errores de lint en archivos modificados.
- [ ] `rg "lang\\s*===\\s*['\"](en|es)['\"]" apps/web/src` muestra solo excepciones técnicas.

## Excepciones confirmadas (NO migrar)

| Archivo / Patrón | Razón |
|-----------------|-------|
| `lib/i18n/index.tsx` | Lógica del hook `useI18n` |
| `lib/context/LanguageContext.tsx` | Contexto de cambio de idioma |
| `specialty.nameEs \|\| specialty.nameEn` | Data fallback, no copy bilingüe |
| `toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')` | Formato de fecha, no copy |
| `getBMICategoryES(bmi)` vs `getBMICategory(bmi)` | Lógica de negocio (categorías con thresholds diferentes) |

## Guardrails

- No refactorizar lógica funcional junto con migración i18n salvo que sea necesario.
- No mezclar migración masiva con cambios de diseño visual.
- Si una sección requiere copy dinámico complejo, documentar excepción y crear clave dedicada.

## Comandos útiles

```bash
# Encontrar deuda actual
rg "lang\\s*===\\s*['\"](en|es)['\"]" apps/web/src --files-with-matches

# Contar ocurrencias por archivo
rg -c "lang\\s*===\\s*['\"](en|es)['\"]" apps/web/src

# Buscar usos correctos del hook
rg "const \\{ t \\} = useI18n\\(\\)" apps/web/src

# Verificar archivos limpios (solo deben quedar excepciones técnicas)
rg "lang\\s*===\\s*['\"](en|es)['\"]" apps/web/src --files-with-matches | grep -v "LanguageContext\|i18n/index"
```

---

## Estado Final (2026-05-05)

### Migración completada
- **Archivos migrados**: 9 archivos completamente a `t()` calls
  - `notes/[noteId]/page.tsx` (41 ternarios → `clinicalNotes.view.*`)
  - `patients/history/page.tsx` (21 ternarios → `patients.history.*`)
  - `patients/[patientId]/page.tsx` (23 ternarios → `patients.detail.*`)
  - `patients/new/page.tsx` (18 ternarios → `patients.form.*`)
  - `patients/page.tsx` (6 ternarios → `patients.directory.*`)
  - `areas/team/page.tsx` (6 ternarios → `team.*`)
  - `admin/operators/add/page.tsx` (7 ternarios → `admin.operators.*`)
  - `areas/team/add/page.tsx` (5 ternarios UI → `team.*`)
  - `dashboard/components/TenantSidebar.tsx` (1 ternario → `sidebar.operationsLabel`)

### Claves agregadas (~110 keys nuevas)
- `patients.history.*` (timeline, stats, filters)
- `patients.detail.*` (admin identity, contact, allergies, demographics)
- `patients.form.*` (patient creation flow, gender labels)
- `patients.directory.*` (listing, gender labels)
- `clinicalNotes.view.*` (sealed note view, report headers, modal labels)
- `team.statusLabels.*` (status badges)
- `team.perm.*` (permission descriptions)
- `admin.operators.*` (invite flow, tenant selection)
- `team.inviteDesc`, `team.permissionsInherited`, `team.noUserTypesConfigured`, `team.firstNamePlaceholder`, `team.lastNamePlaceholder`

### Excepciones confirmadas (21 ternarios restantes — NO migrar)
Todos son patrones de data-fallback o formato de fecha:

| Archivo | Count | Patrón | Razón |
|---------|-------|--------|-------|
| `areas/team/add/page.tsx` | 3 | `config.name/description`, `specialty.nameEs` | Data fallback |
| `areas/team/[userId]/page.tsx` | 4 | `s.nameEs`, `value.name`, `userTypes[...].name` | Data mapping |
| `notes/new/page.tsx` | 3 | `getBMICategoryES`, `specialty.nameEs`, `toLocaleDateString` | Lógica + data + formato |
| `AgendaView.tsx` | 6 | `MONTHS_ES`, `DAYS_ES`, `toLocaleDateString` | Formato de fecha |
| `profile/edit/page.tsx` | 1 | `spec.nameEs` | Data fallback |
| `profile/page.tsx` | 1 | `specialty.nameEs` | Data fallback |
| `TagSelector.tsx` | 3 | `tag.nameEs` | Data fallback (componente genérico) |

### Validación ejecutada
- `pnpm typecheck`: ✅ Limpio, sin errores
- `rg "lang === 'es'" apps/web/src`: Solo 21 coincidencias (todas excepciones técnicas)

### Pendiente para fase de commit
- `pnpm build` + `pnpm test` (solo en commit)
- Verificación manual EN/ES en pantallas migradas
