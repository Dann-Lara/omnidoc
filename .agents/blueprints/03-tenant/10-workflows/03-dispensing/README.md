# 10-Workflows: 03-Dispensing — Dispensación Separada + Notificaciones

## Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 10-workflows/03-dispensing |
| **Estado** | ✅ Implementado (2026-05-11) |
| **Impacto** | Schema: modelo `Notification`; API: endpoints notificaciones, SSE; Frontend: dropdown navbar, vista pendientes, per-medication toggle |

## Propósito

Permitir que el médico solo prescriba (dé la receta) y que un farmacéutico con permiso `pharmacy.dispense` sea quien despache físicamente el medicamento. El flujo se controla mediante un toggle **por medicamento** en el formulario de creación de nota.

## Flujo Completo

### Flujo A: "Por despachar" (pendiente → farmacia despacha)

```
Doctor crea nota clínica
  └── Cada medicamento tiene toggle "Dispensar ahora" / "Por despachar"
        └── Si ALGÚN medicamento está en "Por despachar":
              └── overall dispenseNow = false (every())
                    └── create() setea medicationDispensed = false
                          └── seal() detecta medicationDispensed = false
                                ├── Crea Notification type=dispensing_pending
                                ├── NO llama a dispensingService.dispense()
                                └── SSE emite evento { type: 'new' }

Farmacéutico ve punto rojo en campana
  ├── SSE recibe evento → mutateCount() refresca badge
  ├── Abre dropdown → mutateList() refresca notificaciones
  └── Click en ítem:
        ├── PATCH /notifications/:id/read (marca leída)
        ├── router.push → /[slug]/pharmacy/dispensing/pending?noteId=X
        └── PendingPage auto-abre modal de confirmación (highlightNoteId)

Farmacéutico confirma despacho
  ├── Modal muestra medicamentos a despachar
  ├── Click "Despachar" → POST /pharmacy/dispens
  │     ├── FEFO deduce stock batch por batch
  │     ├── Crea DispensedMedication records
  │     ├── Setea medicationDispensed = true
  │     └── Crea Notification type=dispensing_completed
  └── Nota ya no aparece en pendientes
```

### Flujo B: "Dispensar ahora" (auto-despacho al sellar)

```
Doctor crea nota clínica
  └── TODOS los medicamentos están en "Dispensar ahora"
        └── overall dispenseNow = true (every())
              └── create() setea medicationDispensed = true
                    └── seal() detecta medicationDispensed = true
                          ├── Llama dispensingService.dispense()
                          │     ├── FEFO deduce stock
                          │     ├── Crea DispensedMedication records
                          │     └── createNotification = false
                          │           └── NO se crea ninguna notificación
                          └── Nota queda como despachada ✅
```

## Regla clave: `every()` vs `some()`

```
some() — ANTES (roto): si UN medicamento es "Dispensar ahora", TODO se auto-despachaba
every() — AHORA (correcto): solo si TODOS son "Dispensar ahora", auto-despacha;
                            si al menos UNO es "Por despachar", la nota entera
                            queda pendiente para farmacia
```

## Modelo de Datos

### Modelo `Notification` (existente en schema)

```prisma
model Notification {
  id               String       @id @default(uuid())
  organizationId   String
  userId           String?
  targetPermission String?
  type             String       // "dispensing_pending" | "dispensing_completed"
  title            String
  message          String?
  noteId           String?
  isRead           Boolean      @default(false)
  createdAt        DateTime     @default(now())
  organization     Organization @relation(fields: [organizationId], references: [id])
  user             User?        @relation(fields: [userId], references: [id])

  @@index([organizationId, userId])
  @@index([organizationId, targetPermission])
  @@index([organizationId, isRead])
}
```

### Tipos de notificación

| `type` | Cuándo se crea | Quién la recibe |
|--------|----------------|-----------------|
| `dispensing_pending` | `seal()` cuando `medicationDispensed=false` y hay medicamentos | Todos con permiso `pharmacy.dispense` + Owner |
| `dispensing_completed` | `dispense()` cuando `createNotification=true` (POST manual desde pending page) | Todos con permiso `pharmacy.dispense` |

**Auto-despacho desde `seal()` NO crea notificación** — se pasa `createNotification=false` a `dispense()`.

## Backend

### Endpoints implementados

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/notifications` | SupabaseAuthGuard | Listar notificaciones del usuario |
| GET | `/notifications/count` | SupabaseAuthGuard | Conteo de no leídas |
| PATCH | `/notifications/:id/read` | SupabaseAuthGuard | Marcar como leída |
| PATCH | `/notifications/read-all` | SupabaseAuthGuard | Marcar todas como leídas |
| SSE | `/notifications/events` | SupabaseAuthGuard | Server-Sent Events para tiempo real |
| GET | `/pharmacy/dispens/pending` | SupabaseAuthGuard + PharmacyPermissionsGuard | Notas selladas con medicationDispensed=false |
| GET | `/pharmacy/dispens/history` | SupabaseAuthGuard + PharmacyPermissionsGuard | Historial con dispensedByUser resuelto |
| POST | `/pharmacy/dispens` | SupabaseAuthGuard + PharmacyPermissionsGuard | Ejecutar despacho (FEFO) |

### Lógica en `create()` (patient-notes.service.ts)

```typescript
// Solo persiste el flag:
medicationDispensed: dto.dispenseNow === true,
// Sin notificaciones ni dispense aquí
```

### Lógica en `seal()` (patient-notes.service.ts)

```typescript
if (note.medicationDispensed) {
  // Flujo B: auto-despachar SIN notificación
  await this.dispensingService.dispense(dto, user, false)
} else if (parsed?.medications?.length > 0) {
  // Flujo A: crear notificación dispensing_pending
  await this.notificationsService.create({
    organizationId,
    targetPermission: 'pharmacy:dispense',
    type: 'dispensing_pending',
    title: 'Dispensación pendiente',
    message: `${patientName} — ${medSummary}`,
    noteId: note.id,
  })
}
```

### Lógica en `dispense()` (dispensing.service.ts)

```typescript
async dispense(dto: DispenseDto, user: any, createNotification: boolean = true) {
  // 1. Validar paciente y nota sellada
  // 2. FEFO: deducir stock batch por batch
  // 3. Crear DispensedMedication records
  // 4. Setear medicationDispensed = true
  // 5. Solo si createNotification: crear Notification type=dispensing_completed
}
```

### SSE en NotificationsService

```typescript
private notificationEvents = new Subject<{ type: string }>()

// En create():
this.notificationEvents.next({ type: 'new' })

// Controller:
@Sse('events')
events(): Observable<any> {
  return this.notificationsService.events$.pipe(
    map(() => ({ data: { type: 'new' } })),
  )
}
```

## Frontend

### 1. Toggle por medicamento en formulario de nota

**Archivo**: `notes/new/page.tsx`

```
Cada medicamento tiene un toggle:
  ┌─────────────────────────────────────────────┐
  │ [Instrucciones: ________________] [Dispensar ahora] │  ← OFF → "Por despachar"
  │                                               │
  │ [Instrucciones: ________________] [Por despachar]  │  ← ON → "Dispensar ahora"
  └─────────────────────────────────────────────┘
```

**Lógica de envío**:
```typescript
dispenseNow: medicationItems.every((m) => m.dispenseNow) || undefined,
//            ^^^^^ EVERY, no SOME
```

**Traducciones** (translations.ts):
```typescript
dispenseNow: { en: 'Dispense now', es: 'Dispensar ahora' },     // ON → auto-despacha
dispensing: { en: 'Pending', es: 'Por despachar' },             // OFF → pendiente farmacia
```

### 2. SSE Hook

```typescript
function useNotificationSSE(onEvent: () => void) {
  const savedCallback = useRef(onEvent)
  savedCallback.current = onEvent

  useEffect(() => {
    const es = new EventSource(`${API_URL}/notifications/events`, { withCredentials: true })
    es.onmessage = () => savedCallback.current()
    return () => es.close()
  }, [])
}
```

### 3. NotificationDropdown

**Archivo**: `components/notifications/NotificationDropdown.tsx`

```
┌──────────────────────────────────────┐
│  Notificaciones         [✓ Marcar todas] │
├──────────────────────────────────────┤
│  💊 Dispensación pendiente           │
│     Juan Pérez — Acyclovir 400mg     │
│     hace 2 min                    ●  │
├──────────────────────────────────────┤
│  [→ Ver todas las notificaciones]    │
└──────────────────────────────────────┘
```

**Click en ítem**:
```typescript
async function handleNotificationClick(n) {
  // 1. Marcar como leída (con try-catch independiente)
  try { await PATCH /notifications/:id/read } catch {}

  // 2. Navegar según tipo
  if (n.type === 'dispensing_pending')
    router.push(`/${slug}/pharmacy/dispensing/pending?noteId=${n.noteId}`)
  else if (n.type === 'dispensing_completed')
    router.push(`/${slug}/pharmacy/dispensing`)
}
```

### 4. Pending Dispensing Page

**Archivo**: `pharmacy/dispensing/pending/page.tsx`

```
┌──────────────────────────────────────────────────┐
│  ← Despachos Pendientes                   2      │
├──────────────────────────────────────────────────┤
│  👤 María García     Dr. Pérez   23 May  ●  [Despachar]  │
│  👤 Juan López       Dr. Gómez   22 May      [Despachar]  │
└──────────────────────────────────────────────────┘
```

**Modal de confirmación** (se abre auto si `highlightNoteId` coincide):

```
┌──────────────────────────────────────┐
│  📦 Confirmar Despacho               │
│  Juan López                          │
├──────────────────────────────────────┤
│  Revisa los medicamentos:            │
│                                      │
│  💊 Acyclovir 400mg Tablets    x2    │
│    1 cada 8h                         │
│                                      │
│  [Cancelar]           [Despachar]    │
└──────────────────────────────────────┘
```

**Auto-apertura desde notificación**:
```typescript
useEffect(() => {
  if (highlightNoteId && pendings.length > 0 && !autoOpened.current) {
    const note = pendings.find(n => n.id === highlightNoteId)
    if (note) {
      autoOpened.current = true
      handleOpenConfirm(note)
    }
  }
}, [highlightNoteId, pendings])
```

**Suspense boundary**: El componente principal envuelve el contenido en `<Suspense>` porque usa `useSearchParams()`.

### 5. Botón contextual en nota clínica

**Archivo**: `notes/[noteId]/page.tsx`

```
┌──────────────────────────────────────────┐
│  💊 Prescribed Medications  [Pendiente]  │  ← badge ámbar
│  ┌──────────────────────────────────────┐│
│  │ Acyclovir 400mg Tablets         x2  ││
│  │ 1 cada 8h                           ││
│  └──────────────────────────────────────┘│
│  [Dispensar]                            │  ← solo si note.isSealed
│                                            y note.medicationDispensed=false
│                                            y currentUser tiene pharmacy.dispense
└──────────────────────────────────────────┘
```

## Notificación Click — Manejo de errores

`handleNotificationClick` implementa:

1. **PATCH mark-as-read envuelto en try-catch** — un error en el PATCH no impide la navegación
2. **`console.log('[NotificationClick]', { type, noteId })`** — debug en consola del navegador
3. **Navigation separada** — fuera del try-catch, siempre se ejecuta

## Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `apps/api/prisma/schema.prisma` | Modelo `Notification` |
| `apps/api/src/notifications/notifications.module.ts` | Módulo SSE + endpoints |
| `apps/api/src/notifications/notifications.controller.ts` | CRUD + SSE endpoint |
| `apps/api/src/notifications/notifications.service.ts` | Lógica con Subject para SSE |
| `apps/api/src/patient-notes/patient-notes.service.ts` | `create()` solo persiste flag; `seal()` decide dispense vs notificación; `catch {}` → `logger.warn()` |
| `apps/api/src/pharmacy/dispensing/dispensing.controller.ts` | `GET /pending`, `GET /history` |
| `apps/api/src/pharmacy/dispensing/dispensing.service.ts` | `getPending()` filtra por `isSealed`; `dispense()` con `createNotification` param |
| `apps/web/src/components/notifications/NotificationDropdown.tsx` | Dropdown con SSE, shake animation, manejo de errores |
| `apps/web/src/app/[slug]/pharmacy/dispensing/pending/page.tsx` | Vista pendientes + modal confirmación + Suspense |
| `apps/web/src/app/[slug]/operations/patients/[patientId]/notes/new/page.tsx` | `some()` → `every()`, toggle labels corregidos |
| `apps/web/src/app/[slug]/operations/patients/[patientId]/notes/[noteId]/page.tsx` | Botón "Dispensar" condicional a `isSealed && !medicationDispensed` |
| `apps/web/src/lib/i18n/translations.ts` | Claves `dispenseNow`, `dispensing`, `notifications.*`, `dispensing.pending.*` |

## Criterios de Aceptación (verificados)

- [x] Si TODOS los medicamentos son "Dispensar ahora" → auto-despacha al sellar → sin notificación
- [x] Si ALGÚN medicamento es "Por despachar" → nota pendiente → notificación `dispensing_pending`
- [x] SSE notifica en tiempo real (sin polling)
- [x] Click en notificación navega a pending page con `noteId` en query param
- [x] Pending page auto-abre modal cuando `highlightNoteId` coincide
- [x] Confirmación de despacho llama a `POST /pharmacy/dispens` (FEFO)
- [x] Historial de despachos resuelve `dispensedBy` con datos del usuario
- [x] Error en PATCH mark-as-read no bloquea navegación
- [x] `catch {}` reemplazado por `logger.warn()` con contexto
- [x] Labels de toggle claros: "Dispensar ahora" vs "Por despachar"
- [x] Compatibilidad hacia atrás: flag `medicationDispensed` ya existía como `Boolean @default(false)`
- [x] Sin cambios en schema que rompan datos existentes
- [x] Sin librerías externas nuevas

## Decisiones de diseño

| Decisión | Alternativa descartada | Motivo |
|----------|----------------------|--------|
| `every()` en dispenseNow | `some()` | Si un medicamento está pendiente, toda la nota debe estar pendiente |
| Notificación en `seal()` no en `create()` | Notificación inmediata al crear | La nota no tiene sentido si no está sellada; el farmacéutico solo ve notas selladas |
| SSE sobre polling | `setInterval` c/30s | `setInterval(fn, 0)` causaba loop infinito; SSE es push, más eficiente |
| `createNotification=false` desde seal | Siempre notificar | El médico que auto-despacha no necesita notificación |
| PATCH mark-as-read en try-catch separado | Bloque único | Error en PATCH no debe impedir navegación |
| `dispensedBy` como String (sin FK) | Relación con User | Schema existente; se resuelve con `prisma.user.findMany` en `getHistory()` |

## Notas

- `plan` field en el formulario de nota es para el plan de tratamiento clínico — NO para estado de despacho
- `getHistory()` resuelve `dispensedByUser` con `prisma.user.findMany` (no hay FK, es String)
- El badge en nota clínica depende exclusivamente de `medicationDispensed` (no de `isSealed`)
- La vista de pendientes requiere que la nota esté sellada (`isSealed: true`)
- El modal de confirmación en pending page carga los medicamentos desde `GET /patients/:id/notes/:id` (decrypt)
