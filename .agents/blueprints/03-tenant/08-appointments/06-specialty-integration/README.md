# 06-Specialty Integration - Integración con Especialidades

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 06 - Specialty Integration |
| **Estado** | 🔄 Pendiente |
| **Dependencias** | Fase 02 (API), Fase 03 (Directory), existente `specialties/[specialtyId]/page.tsx` |

---

## 🎯 Propósito

Integrar el módulo de citas con las vistas de especialidades existentes:
1. Mostrar citas por especialidad en `/[slug]/specialties/[specialtyId]`
2. Alimentar KPIs en `/[slug]/areas/specialties` con datos reales de citas
3. Ajustar el botón "New Patient" para que dirija al flujo de agregar paciente

---

## 🎨 Maqueta de Referencia

La maqueta "Super Agenda (Dashboard)" muestra:
- Sección "Upcoming Appointments" dentro de la vista de especialidad
- Cards con: hora, paciente (avatar), tipo, médico, estado (Telehealth/In-Person, Waiting/Start)
- Filtros activos: Doctor, Specialty, Room

---

## 🔧 Ajustes a `/[slug]/specialties/[specialtyId]/page.tsx`

### Cambio 1: Conectar `MOCK_APPOINTMENTS` a API Real

**Actual** (línea 65-102):
```typescript
const MOCK_APPOINTMENTS: Appointment[] = [...] // Mocks
```

**Nuevo**:
```typescript
const [appointments, setAppointments] = useState<Appointment[]>([])

const fetchAppointments = async () => {
  try {
    const res = await fetch(`${API_URL}/appointments/specialty/${specialtyId}`, {
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      setAppointments(data)
    }
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
  }
}

useEffect(() => {
  fetchSpecialty()
  fetchAppointments() // Agregar esta línea
}, [specialtyId])
```

### Cambio 2: Ajustar el botón "New Patient"

**Actual** (línea 211-214):
```tsx
<button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl shadow-lg...">
  <UserPlus className="w-4 h-4" />
  {t('tenant.specialties.newPatient')}
</button>
```

**Nuevo** (que dirija a agregar paciente):
```tsx
<button
  onClick={() => router.push(`/${slug}/operations/patients/new`)}
  className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold text-sm"
>
  <UserPlus className="w-4 h-4" />
  {t('patients.form.new')} {/* "Nuevo Paciente" */}
</button>
```

### Cambio 3: Mostrar citas reales en la sección "Upcoming Appointments"

**Actual** (línea 300-337):
```tsx
{ MOCK_APPOINTMENTS.map((appointment) => (...))}
```

**Nuevo**:
```tsx
{appointments.map((appointment) => (
  <div key={appointment.id} className="px-5 py-4 flex items-center gap-5 group hover:bg-surface-container-low/20 transition-colors">
    <div className="w-11 text-center shrink-0">
      <p className="text-lg font-black text-primary">
        {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-[10px] text-on-surface-variant font-bold uppercase">
        {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour12: true }).split(' ')[1]}
      </p>
    </div>
    <div className="w-11 h-11 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/5 shrink-0">
      {/* Avatar del paciente */}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-base text-on-surface truncate">
        {appointment.patient?.firstName} {appointment.patient?.lastName}
      </h4>
      <p className="text-sm text-on-surface-variant truncate">
        {appointment.type} • Dr. {appointment.doctor?.firstName}
      </p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      {appointment.mode === 'TELEHEALTH' ? (
        <span className="hidden sm:inline-block px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">
          {t('appointments.specialtyView.telehealth')}
        </span>
      ) : (
        <span className="hidden sm:inline-block px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-wider">
          {t('appointments.specialtyView.inPerson')}
        </span>
      )}
      {appointment.status === 'SCHEDULED' ? (
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-container transition-all flex items-center gap-2">
          <Video className="w-4 h-4" />
          {t('appointments.specialtyView.start')}
        </button>
      ) : appointment.status === 'IN_PROGRESS' ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-tertiary-container/10 text-tertiary-container flex items-center gap-1">
          <Clock className="w-3 h-3" /> Waiting
        </span>
      ) : null}
    </div>
  </div>
))}
```

---

## 🔧 Ajustes a `/[slug]/areas/specialties/page.tsx`

### Alimentar KPIs con Datos Reales de Citas

**Actual** (línea 170-176):
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
  <div className="space-y-2">
    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
      {t('tenant.areas.specialties.avgConsultationTime')}
    </p>
    <p className="text-3xl font-black text-primary">24.5 min</p>
    ...
```

**Nuevo**: Agregar fetch de KPIs en el componente:

```typescript
const [kpis, setKpis] = useState({
  today: 0,
  totalAppointments: 0,
  avgDuration: 0,
})

useEffect(() => {
  fetchSpecialties()
  fetchKpis()
}, [])

const fetchKpis = async () => {
  try {
    const res = await fetch(`${API_URL}/appointments/kpis`, {
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      setKpis(data)
    }
  } catch (error) {
    console.error('Failed to fetch KPIs:', error)
  }
}
```

Luego usar `kpis.today` en lugar de mocks para "Global Load":

```tsx
<span className="text-base font-black text-primary leading-none">
  {kpis.today || 0} Citas Hoy
</span>
```

---

## 📋 i18n - Claves para Specialty View

Agregar en `appointments.specialtyView`:

```typescript
specialtyView: {
  upcomingAppointments: { en: 'Upcoming Appointments', es: 'Próximas Citas' },
  viewAll: { en: 'View All', es: 'Ver Todas' },
  telehealth: { en: 'Telehealth', es: 'Telesalud' },
  inPerson: { en: 'In-Person', es: 'Presencial' },
  waiting: { en: 'Waiting', es: 'Esperando' },
  start: { en: 'Start', es: 'Iniciar' },
}
```

---

## 🔧 Impacto en KPIs del Dashboard del Tenant

En `/[slug]/dashboard/page.tsx`, actualizar para mostrar datos reales:

```typescript
// Agregar en el dashboard
const [appointmentStats, setAppointmentStats] = useState({
  today: '0',
  thisWeek: '0',
})

useEffect(() => {
  fetchAppointmentStats()
}, [])

const fetchAppointmentStats = async () => {
  try {
    const res = await fetch(`${API_URL}/appointments/kpis`, {
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      setAppointmentStats({
        today: data.today.toString(),
        thisWeek: (data.today * 7).toString(), // Simplificado
      })
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}
```

Actualizar las stats en el dashboard (línea 86-108):
```tsx
{ 
  label: t('tenant.dashboard.todaysAppointments'), 
  value: appointmentStats.today, // Antes: '12'
  change: '+2',
  icon: Calendar,
  color: 'text-emerald-500'
}
```

---

## ✅ Criterios de Aceptación

- [ ] `specialties/[specialtyId]/page.tsx` conectado a API real (`/appointments/specialty/:id`)
- [ ] Botón "New Patient" redirige a `/operations/patients/new`
- [ ] Sección "Upcoming Appointments" muestra citas reales
- [ ] `areas/specialties/page.tsx` alimenta KPIs con datos reales
- [ ] Dashboard muestra conteo real de citas hoy
- [ ] i18n claves `appointments.specialtyView.*` agregadas
- [ ] Formato de hora: "09:30 AM" implementado
- [ ] Badges de Telehealth/In-Person implementados

---

## 🔗 Siguiente Fase

**07-components/README.md** → Componentes reutilizables
