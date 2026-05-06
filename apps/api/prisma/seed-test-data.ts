/**
 * Seed test data for Open Doc organization
 * 
 * Creates:
 * - 10 new global specialties
 * - Adds General Medicine + Neurology to Open Doc specialties
 * - 4 new doctors (total 5 including existing)
 * - 5 patients per doctor (25 total)
 * - 5 appointments per doctor in May 2026
 * - 4-10 notes per patient with rotation across doctors/specialties
 */

import { PrismaClient, Gender, BloodType, DocumentType, AppointmentStatus, AppointmentMode } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const SUPABASE_URL = 'http://localhost:9999'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ============================================================
// CONFIGURATION
// ============================================================

const ORG_ID = 'a7372162-87cc-459e-818e-2eebff429a43' // Open Doc
const OWNER_ROLE_ID = '89b997af-7e9d-4c9c-808a-38b1d1d866ab'
const EXISTING_DOCTOR_ID = 'cc4c467a-9913-432b-adfd-c85a130aab5f' // Dann Doc

// 10 new global specialties to create
const NEW_SPECIALTIES = [
  { nameEn: 'General Medicine', nameEs: 'Medicina General', icon: 'general_medical', descriptionEn: 'General medical practice and primary care', descriptionEs: 'Práctica médica general y atención primaria' },
  { nameEn: 'Family Medicine', nameEs: 'Medicina Familiar', icon: 'family_restroom', descriptionEn: 'Comprehensive family healthcare', descriptionEs: 'Atención integral de salud familiar' },
  { nameEn: 'Neurology', nameEs: 'Neurología', icon: 'neurology', descriptionEn: 'Brain and nervous system disorders', descriptionEs: 'Trastornos del cerebro y sistema nervioso' },
  { nameEn: 'Pulmonology', nameEs: 'Neumología', icon: 'pulmonology', descriptionEn: 'Respiratory system diseases', descriptionEs: 'Enfermedades del sistema respiratorio' },
  { nameEn: 'Rheumatology', nameEs: 'Reumatología', icon: 'rheumatology', descriptionEn: 'Autoimmune and joint diseases', descriptionEs: 'Enfermedades autoinmunes y articulares' },
  { nameEn: 'Psychiatry', nameEs: 'Psiquiatría', icon: 'psychiatry', descriptionEn: 'Mental health disorders', descriptionEs: 'Trastornos de salud mental' },
  { nameEn: 'Geriatrics', nameEs: 'Geriatría', icon: 'elderly', descriptionEn: 'Healthcare for elderly patients', descriptionEs: 'Atención médica para pacientes mayores' },
  { nameEn: 'Allergy & Immunology', nameEs: 'Alergia e Inmunología', icon: 'allergy', descriptionEn: 'Allergic and immune system disorders', descriptionEs: 'Trastornos alérgicos e inmunológicos' },
  { nameEn: 'Hematology', nameEs: 'Hematología', icon: 'hematology', descriptionEn: 'Blood diseases and disorders', descriptionEs: 'Enfermedades y trastornos de la sangre' },
  { nameEn: 'Infectious Disease', nameEs: 'Infectología', icon: 'infectious_disease', descriptionEn: 'Infectious disease diagnosis and treatment', descriptionEs: 'Diagnóstico y tratamiento de enfermedades infecciosas' },
]

// Specialties to add to Open Doc (beyond existing 6)
const OPENDOC_NEW_SPECIALTY_NAMES = ['General Medicine', 'Neurology']

// 4 new doctors with assigned specialties (random from Open Doc's 8)
const NEW_DOCTORS = [
  {
    email: 'dr.garcia@opendoc.com',
    firstName: 'Carlos',
    lastName: 'García',
    specialtyNames: ['Cardiology', 'Endocrinology', 'General Medicine'],
  },
  {
    email: 'dr.martinez@opendoc.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    specialtyNames: ['Gynecology', 'Neurology', 'General Medicine'],
  },
  {
    email: 'dr.lopez@opendoc.com',
    firstName: 'Roberto',
    lastName: 'López',
    specialtyNames: ['Dermatology', 'Gastroenterology', 'General Medicine'],
  },
  {
    email: 'dr.hernandez@opendoc.com',
    firstName: 'María',
    lastName: 'Hernández',
    specialtyNames: ['Dentistry', 'Neurology', 'General Medicine'],
  },
]

// Patients data (5 per doctor)
const PATIENT_TEMPLATES: Array<{
  firstName: string
  lastName: string
  gender: Gender
  bloodType: BloodType
  dob: string
  isChronic: boolean
  allergies: string[]
  docIdSuffix: number // which doctor this patient belongs to (0-4)
}> = [
  // Doctor 0 (Dr. García) - Cardiology specialist
  { firstName: 'Juan', lastName: 'Pérez', gender: Gender.HOMBRE, bloodType: BloodType.O_POSITIVE, dob: '1985-03-15', isChronic: true, allergies: ['Penicilina'], docIdSuffix: 0 },
  { firstName: 'María', lastName: 'Rodríguez', gender: Gender.MUJER, bloodType: BloodType.A_POSITIVE, dob: '1992-07-22', isChronic: false, allergies: [], docIdSuffix: 0 },
  { firstName: 'Carlos', lastName: 'Gómez', gender: Gender.HOMBRE, bloodType: BloodType.B_NEGATIVE, dob: '1978-11-08', isChronic: true, allergies: ['Sulfas', 'Ibuprofeno'], docIdSuffix: 0 },
  { firstName: 'Ana', lastName: 'López', gender: Gender.MUJER, bloodType: BloodType.AB_POSITIVE, dob: '2001-01-30', isChronic: false, allergies: ['Aspirina'], docIdSuffix: 0 },
  { firstName: 'Pedro', lastName: 'Martínez', gender: Gender.HOMBRE, bloodType: BloodType.O_NEGATIVE, dob: '1969-05-12', isChronic: true, allergies: [], docIdSuffix: 0 },
  // Doctor 1 (Dra. Martínez) - Gynecology specialist
  { firstName: 'Lucía', lastName: 'Fernández', gender: Gender.MUJER, bloodType: BloodType.A_POSITIVE, dob: '1990-04-18', isChronic: false, allergies: [], docIdSuffix: 1 },
  { firstName: 'Carmen', lastName: 'Torres', gender: Gender.MUJER, bloodType: BloodType.O_POSITIVE, dob: '1988-09-25', isChronic: true, allergies: ['Paracetamol'], docIdSuffix: 1 },
  { firstName: 'Rosa', lastName: 'Vásquez', gender: Gender.MUJER, bloodType: BloodType.B_POSITIVE, dob: '1995-12-03', isChronic: false, allergies: ['Yodo'], docIdSuffix: 1 },
  { firstName: 'Elena', lastName: 'Morales', gender: Gender.MUJER, bloodType: BloodType.AB_NEGATIVE, dob: '1982-06-14', isChronic: true, allergies: [], docIdSuffix: 1 },
  { firstName: 'Patricia', lastName: 'Jiménez', gender: Gender.MUJER, bloodType: BloodType.A_NEGATIVE, dob: '1998-02-28', isChronic: false, allergies: ['Látex'], docIdSuffix: 1 },
  // Doctor 2 (Dr. López) - Dermatology specialist
  { firstName: 'Diego', lastName: 'Ruiz', gender: Gender.HOMBRE, bloodType: BloodType.O_POSITIVE, dob: '1991-08-07', isChronic: false, allergies: [], docIdSuffix: 2 },
  { firstName: 'Fernando', lastName: 'Castro', gender: Gender.HOMBRE, bloodType: BloodType.A_POSITIVE, dob: '1976-03-19', isChronic: true, allergies: ['Penicilina', 'Diclofenaco'], docIdSuffix: 2 },
  { firstName: 'Andrés', lastName: 'Silva', gender: Gender.HOMBRE, bloodType: BloodType.O_NEGATIVE, dob: '1987-11-11', isChronic: false, allergies: [], docIdSuffix: 2 },
  { firstName: 'Miguel', lastName: 'Ramos', gender: Gender.HOMBRE, bloodType: BloodType.B_POSITIVE, dob: '1965-01-23', isChronic: true, allergies: ['Sulfas'], docIdSuffix: 2 },
  { firstName: 'Javier', lastName: 'Ortega', gender: Gender.HOMBRE, bloodType: BloodType.AB_POSITIVE, dob: '1993-07-30', isChronic: false, allergies: [], docIdSuffix: 2 },
  // Doctor 3 (Dra. Hernández) - Dentistry specialist
  { firstName: 'Sofía', lastName: 'Navarro', gender: Gender.MUJER, bloodType: BloodType.O_POSITIVE, dob: '1996-05-09', isChronic: false, allergies: ['Ibuprofeno'], docIdSuffix: 3 },
  { firstName: 'Valentina', lastName: 'Herrera', gender: Gender.MUJER, bloodType: BloodType.A_NEGATIVE, dob: '1984-10-16', isChronic: true, allergies: [], docIdSuffix: 3 },
  { firstName: 'Camila', lastName: 'Aguilar', gender: Gender.MUJER, bloodType: BloodType.B_POSITIVE, dob: '1999-03-04', isChronic: false, allergies: ['Penicilina'], docIdSuffix: 3 },
  { firstName: 'Daniela', lastName: 'Mendoza', gender: Gender.MUJER, bloodType: BloodType.A_POSITIVE, dob: '1972-12-21', isChronic: true, allergies: ['Aspirina'], docIdSuffix: 3 },
  { firstName: 'Gabriela', lastName: 'Vargas', gender: Gender.MUJER, bloodType: BloodType.O_NEGATIVE, dob: '1994-08-13', isChronic: false, allergies: [], docIdSuffix: 3 },
  // Doctor 4 (Dann - existing) - Dentistry/General specialist
  { firstName: 'Ricardo', lastName: 'Delgado', gender: Gender.HOMBRE, bloodType: BloodType.O_POSITIVE, dob: '1980-06-27', isChronic: true, allergies: ['Penicilina', 'Sulfas'], docIdSuffix: 4 },
  { firstName: 'Alejandro', lastName: 'Medina', gender: Gender.HOMBRE, bloodType: BloodType.A_POSITIVE, dob: '1989-09-02', isChronic: false, allergies: [], docIdSuffix: 4 },
  { firstName: 'Sergio', lastName: 'Cortés', gender: Gender.HOMBRE, bloodType: BloodType.B_NEGATIVE, dob: '1974-04-15', isChronic: true, allergies: ['Lidocaína'], docIdSuffix: 4 },
  { firstName: 'Héctor', lastName: 'Fuentes', gender: Gender.HOMBRE, bloodType: BloodType.AB_POSITIVE, dob: '1997-11-08', isChronic: false, allergies: [], docIdSuffix: 4 },
  { firstName: 'Gustavo', lastName: 'Rojas', gender: Gender.HOMBRE, bloodType: BloodType.O_NEGATIVE, dob: '1986-01-19', isChronic: true, allergies: ['Penicilina'], docIdSuffix: 4 },
]

// Appointment dates in May 2026
const MAY_2026_DATES = [
  '2026-05-04T09:00:00Z',
  '2026-05-05T10:30:00Z',
  '2026-05-07T14:00:00Z',
  '2026-05-11T11:00:00Z',
  '2026-05-12T15:30:00Z',
  '2026-05-14T09:30:00Z',
  '2026-05-18T16:00:00Z',
  '2026-05-19T10:00:00Z',
  '2026-05-21T13:00:00Z',
  '2026-05-25T11:30:00Z',
]

// Clinical note templates organized by specialty
const NOTE_TEMPLATES: Record<string, Array<{
  subjective: string
  diagnosis: string
  plan: string
  bp: string
  hr: number
  temp: number
  rr: number
  spo2: number
  weight: number
  height: number
}>> = {
  Cardiology: [
    {
      subjective: 'Paciente refiere dolor torácico opresivo intermitente desde hace 2 semanas, irradiado a brazo izquierdo. Disnea de medianos esfuerzos (NYHA II).',
      diagnosis: 'Angina inestable - ICD-10: I20.0\nFactores de riesgo: Hipertensión, dislipidemia, tabaquismo activo',
      plan: 'Metoprolol 50mg VO c/12h\nAspirina 100mg VO c/24h\nAtorvastatina 40mg VO nocte\nHolter 24h y ecocardiograma transtorácico\nControl en 15 días',
      bp: '150/95', hr: 88, temp: 36.8, rr: 18, spo2: 97, weight: 78, height: 172,
    },
    {
      subjective: 'Palpitaciones frecuentes desde hace 1 mes. Episodios de taquicardia de inicio súbito, duración variable. Sin síncope.',
      diagnosis: 'Taquicardia paroxística supraventricular - ICD-10: I47.1\nEKG: ondas P retrógradas, QRS estrecho, frecuencia 180 bpm',
      plan: 'Adenosina 6mg IV si episodio agudo\nVerapamilo 120mg VO c/12h\nElectrolitos séricos y función tiroidea\nEvaluación para ablación por catéter',
      bp: '120/80', hr: 102, temp: 36.5, rr: 16, spo2: 98, weight: 72, height: 168,
    },
    {
      subjective: 'Edema en miembros inferiores grado II, ortopnea de 2 almohadas, disnea paroxística nocturna. Fatiga creciente.',
      diagnosis: 'Insuficiencia cardíaca congestiva NYHA II - ICD-10: I50.9\nFEVI estimada: 35-40% en ecocardiograma previo',
      plan: 'Furosemida 40mg VO c/24h\nEnalapril 10mg VO c/12h\nCarvedilol 6.25mg VO c/12h\nRestricción hídrica 1.5L/día\nControl de peso diario',
      bp: '140/85', hr: 95, temp: 36.6, rr: 22, spo2: 94, weight: 85, height: 175,
    },
    {
      subjective: 'Síncope de esfuerzo sin pródromos. Antecedente de soplo cardíaco no evaluado. Mareo al subir escaleras.',
      diagnosis: 'Estenosis aórtica severa sospechada - ICD-10: I35.0\nSoplo sistólico eyectivo grado IV/VI en foco aórtico',
      plan: 'Ecocardiograma transtorácico urgente\nCateterismo cardíaco prequirúrgico\nEvaluación quirúrgica para reemplazo valvular\nRestricción de actividad física intensa',
      bp: '110/70', hr: 72, temp: 36.7, rr: 16, spo2: 98, weight: 68, height: 165,
    },
    {
      subjective: 'Dolor precordial atípico, no relacionado con esfuerzo. Ansiedad asociada. Mejora con reposo pero no completamente.',
      diagnosis: 'Dolor torácico no cardíaco - ICD-10: R07.9\nDescartado síndrome coronario agudo: troponinas negativas x2\nEKG sin cambios isquémicos',
      plan: 'Omeprazol 20mg VO c/24h\nLorazepam 0.5mg VO PRN ansiedad\nPrueba de esfuerzo con imágen\nManejo de ansiedad con terapia cognitiva\nReevaluación en 1 mes',
      bp: '125/78', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 170,
    },
    {
      subjective: 'Fibrilación auricular paroxística detectada en Holter. Episodios de irregularidad del pulso de 2-3 horas.',
      diagnosis: 'Fibrilación auricular paroxística - ICD-10: I48.0\nCHADS2-VASc: 2 puntos\nScore HAS-BLED: 1',
      plan: 'Apixabán 5mg VO c/12h\nAmiodarona 200mg VO c/24h\nControl de frecuencia y ritmo\nEco transesofágico si cardioversión\nControl INR si cambio a warfarina',
      bp: '130/82', hr: 92, temp: 36.6, rr: 18, spo2: 97, weight: 76, height: 170,
    },
    {
      subjective: 'Hipertensión arterial mal controlada a pesar de triple terapia. Cefalea frontal matutina. Visión borrosa intermitente.',
      diagnosis: 'Hipertensión resistente - ICD-10: I10\nMAPA: promedio 24h 145/92 mmHg\nDescartar causas secundarias',
      plan: 'Agregar espironolactona 25mg VO c/24h\nPerfil lipídico y glucemia en ayunas\nEcografía renal y doppler arterias renales\nCatecolaminas en orina 24h\nControl en 2 semanas',
      bp: '160/100', hr: 85, temp: 36.5, rr: 16, spo2: 98, weight: 82, height: 174,
    },
    {
      subjective: 'Dolor en pantorrillas al caminar 200 metros (claudicación intermitente). Pulsos pedios disminuidos bilateralmente.',
      diagnosis: 'Enfermedad arterial periférica - ICD-10: I73.9\nÍndice tobillo-brazo: 0.65 derecho, 0.70 izquierdo',
      plan: 'Cilostazol 100mg VO c/12h\nClopidogrel 75mg VO c/24h\nAtorvastatina 80mg VO nocte\nPrograma de caminata supervisada\nAngiografía por tomografía computarizada',
      bp: '138/88', hr: 74, temp: 36.6, rr: 16, spo2: 97, weight: 88, height: 176,
    },
  ],
  Gynecology: [
    {
      subjective: 'Control prenatal de 24 semanas. G2P1. Movimientos fetales presentes. Sin sangrado ni contracciones.',
      diagnosis: 'Embarazo de 24 semanas, curso normal - ICD-10: Z34.80\nPeso fetal estimado: 680g\nFCF: 140 lpm\nPresentación cefálica',
      plan: 'Vitamina prenatal c/24h\nCurva de tolerancia a glucosa 75g\nHemograma completo y perfil de coagulación\nControl en 2 semanas\nSignos de alarma: sangrado, pérdida de líquido',
      bp: '110/70', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 160,
    },
    {
      subjective: 'Papanicolaou de rutina. Sin síntomas. Última menstruación hace 2 semanas. Anticonceptivo oral combinado.',
      diagnosis: 'Citología cervical normal - ICD-10: Z12.4\nClasificación Bethesda: NILM\nHPV negativo',
      plan: 'Continuar anticoncepción oral\nPróxima citología en 3 años\nEducación sobre signos de alarma ginecológicos\nConsejería sobre prevención de ITS',
      bp: '118/74', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 58, height: 158,
    },
    {
      subjective: 'Sangrado intermenstrual abundante desde hace 3 meses. Dismenorrea progresiva. Dispareunia.',
      diagnosis: 'Endometriosis pélvica sospechada - ICD-10: N80.9\nUSG transvaginal: quiste ovárico derecho 4cm (endometrioma)',
      plan: 'Dienogest 2mg VO c/24h\nAINEs para dolor pélvico\nRMN pélvica con contraste\nCA-125 basal\nEvaluación por cirugía laparoscópica si no mejora',
      bp: '115/72', hr: 70, temp: 36.6, rr: 16, spo2: 99, weight: 60, height: 162,
    },
    {
      subjective: 'Síntomas climatéricos: sofocación severa (10-12/día), sudoración nocturna, insomnio, irritabilidad. Amenorrea 8 meses.',
      diagnosis: 'Menopausia con síntomas vasomotores - ICD-10: N95.1\nFSH: 58 mUI/mL, Estradiol: <15 pg/mL\nDensitometría ósea: T-score -1.8 (osteopenia)',
      plan: 'Terapia hormonal de reemplazo: estrógenos conjugados 0.625mg + MPA 2.5mg\nCalcio 1200mg + Vitamina D 800UI\nEjercicio con carga de peso\nControl de mama y Papanicolaou',
      bp: '128/80', hr: 74, temp: 36.5, rr: 16, spo2: 99, weight: 68, height: 156,
    },
    {
      subjective: 'Dolor pélvico agudo lado derecho de 4 horas. Náuseas, sin vómito. FUM hace 3 semanas.',
      diagnosis: 'Torsión de anexo derecho sospechada - ICD-10: N83.5\nUSG: masa anexial derecha 6cm sin flujo Doppler',
      plan: 'Laparoscopia diagnóstica y terapérgica urgente\nMarcadores tumorales: CA-125, AFP, hCG\nAnalgesia IV prequirúrgica\nConservación de tejido ovárico si viable',
      bp: '105/65', hr: 95, temp: 37.2, rr: 20, spo2: 98, weight: 55, height: 155,
    },
    {
      subjective: 'Deseo de planificación familiar. Pareja estable, no desea embarazo en 2 años. Sin contraindicaciones para métodos hormonales.',
      diagnosis: 'Consejería anticonceptiva - ICD-10: Z30.0\nIMC: 22.5, sin factores de riesgo cardiovascular\nCervix: sin alteraciones',
      plan: 'DIU de cobre como primera opción (no hormonal)\nAlternativa: implante subdérmico de etonogestrel\nPreservativo como doble protección\nExplicación de métodos y efectos secundarios',
      bp: '112/68', hr: 68, temp: 36.4, rr: 16, spo2: 99, weight: 56, height: 158,
    },
  ],
  Dermatology: [
    {
      subjective: 'Lesiones eritematoescamosas en codos, rodillas y cuero cabelludo desde hace 6 meses. Prurito moderado que afecta la calidad de vida.',
      diagnosis: 'Psoriasis en placas - ICD-10: L40.0\nPASI estimado: 8.5\nAfectación <5% de superficie corporal\nSigno de Auspitz positivo',
      plan: 'Betametasona dipropionato 0.05% crema c/12h x 2 semanas\nCalcipotriol crema c/12h en alternancia\nQueratolítico salicílico 5% en cuero cabelludo\nFototerapia UVB si no mejora en 4 semanas',
      bp: '120/78', hr: 72, temp: 36.5, rr: 16, spo2: 98, weight: 75, height: 170,
    },
    {
      subjective: 'Pápulas, pústulas y eritema facial en zona T y mejillas. Empeora con exposición solar y alimentos picantes.',
      diagnosis: 'Rosácea pápulo-pustulosa - ICD-10: L71.9\nEritema facial fijo con telangiectasias\nSin comedones (diferencial de acné)',
      plan: 'Metronidazol 0.75% gel facial c/12h\nDoxiciclina 100mg VO c/24h x 6 semanas\nProtector solar FPS 50+ diario\nEvitar desencadenantes: sol, alcohol, picante',
      bp: '118/75', hr: 68, temp: 36.6, rr: 16, spo2: 99, weight: 65, height: 162,
    },
    {
      subjective: 'Manchas hipercrómicas irregulares en mejillas y frente de 1 año de evolución. Empeora notablemente en verano.',
      diagnosis: 'Melasma - ICD-10: L81.1\nDistribución centrofacial, tipo mixto\nEscala MASI: 12.4 (moderado-severo)',
      plan: 'Hidroquinona 4% crema nocturna x 3 meses (ciclo)\nÁcido kójico 2% crema matutina\nProtector solar de color FPS 50+ reaplicar c/4h\nEvitar exposición solar directa\nMesoterapia despigmentante si no mejora',
      bp: '115/72', hr: 70, temp: 36.4, rr: 16, spo2: 99, weight: 60, height: 158,
    },
    {
      subjective: 'Lesión pigmentada asimétrica de 1.2cm en espalda, con bordes irregulares y color heterogéneo. Crecimiento progresivo en 6 meses.',
      diagnosis: 'Nevus displásico sospechoso - ICD-10: D22.5\nRegla ABCDE: A(+), B(+), C(+), D(>6mm), E(evolutivo)\nDermatoscopía: patrón atípico con red pigmentada irregular',
      plan: 'Biopsia excisional con margen de 2mm\nEstudio histopatológico urgente\nMapeo de lesiones de cuerpo completo\nEducación sobre fotoprotección y autoexamen\nControl en 1 mes post biopsia',
      bp: '125/80', hr: 75, temp: 36.7, rr: 16, spo2: 98, weight: 80, height: 178,
    },
    {
      subjective: 'Lesiones vesiculosas agrupadas en zona lumbar derecha, dolor urente. Aparecieron hace 3 días. Fiebre leve.',
      diagnosis: 'Herpes zoster - ICD-10: B02.9\nDermatoma L2 derecho, estadio vesicular\nPrurito previo de 3 días en misma zona',
      plan: 'Valaciclovir 1000mg VO c/8h x 7 días\nGabapentina 300mg VO nocte si dolor neuropático\nCuidado local de lesiones (no romper vesículas)\nControl en 7 días\nVacuna Shingrix si >50 años',
      bp: '130/82', hr: 80, temp: 37.2, rr: 18, spo2: 97, weight: 72, height: 168,
    },
    {
      subjective: 'Acné facial severo con nódulos y quistes en mandíbula y mejillas. Cicatrices atróficas en evolución. Falló tratamiento tópico.',
      diagnosis: 'Acné noduloquístico - ICD-10: L70.0\nGrado IV (severo) según clasificación de Leeds\nImpacto psicológico significativo',
      plan: 'Isotretinoína 40mg VO c/24h con comidas\nPerfil lipídico y hepático basal y mensual\nAnticoncepción obligatoria si mujer en edad fértil\nEmoliente facial no comedogénico\nDuración estimada: 6-9 meses',
      bp: '122/76', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 160,
    },
    {
      subjective: 'Urticaria crónica espontánea de 4 meses de evolución. Ronchas pruriginosas recurrentes, duran <24h pero reaparecen.',
      diagnosis: 'Urticaria crónica - ICD-10: L50.1\nAutologous serum skin test: negativo\nHemograma y TSH normales (descartar causa sistémica)',
      plan: 'Cetirizina 10mg VO c/12h (doble dosis de anti-H1)\nRanitidina 150mg VO c/12h (anti-H2 complementario)\nOmalizumab 300mg SC mensual si refractario\nDiario de síntomas y alimentos desencadenantes',
      bp: '118/72', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 58, height: 155,
    },
  ],
  Gastroenterology: [
    {
      subjective: 'Dolor epigástrico ardoroso relacionado con comidas, pirosis frecuente postprandial. Mejora parcial con antiácidos OTC.',
      diagnosis: 'Reflujo gastroesofágico erosivo - ICD-10: K21.0\nEscala DeMeester: 45 (anormal)\nTest de H. pylori pendiente',
      plan: 'Omeprazol 40mg VO c/24h x 8 semanas\nTest de Helicobacter pylori en heces\nEvitar alimentos irritantes: café, chocolate, picante\nElevar cabecera de cama 15cm\nEndoscopía si no mejora en 8 semanas',
      bp: '122/78', hr: 74, temp: 36.5, rr: 16, spo2: 99, weight: 80, height: 172,
    },
    {
      subjective: 'Dolor abdominal en cuadrante superior derecho postprandial, náuseas ocasionales. Antecedente de episodios similares hace 1 año.',
      diagnosis: 'Colelitiasis sintomática - ICD-10: K80.20\nUSG: cálculos biliares múltiples (12), vía biliar no dilatada\nFunción hepática: normal',
      plan: 'Dieta baja en grasa estricta\nUrsodesoxicólico 300mg VO c/12h\nReferir a cirugía general para colecistectomía laparoscópica\nSignos de alarma: fiebre, ictericia, dolor incoercible',
      bp: '128/82', hr: 76, temp: 36.8, rr: 18, spo2: 98, weight: 85, height: 168,
    },
    {
      subjective: 'Diarrea crónica de 3 meses de evolución con pérdida de peso de 4kg. Distensión abdominal frecuente y dolor tipo cólico.',
      diagnosis: 'Síndrome de intestino irritable (diarreico) - ICD-10: K58.0\nDescartada enfermedad celíaca: anticuerpos negativos\nCalprotectina fecal: normal (descartada EII)',
      plan: 'Dieta baja en FODMAPs supervisada por nutricionista\nLoperamida 2mg VO PRN diarrea\nTrimebutina 200mg VO c/8h\nProbióticos (Saccharomyces boulardii)\nSeguimiento en 4 semanas',
      bp: '115/72', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 165,
    },
    {
      subjective: 'Hepatitis crónica en seguimiento. Transaminasas elevadas en último control. Fatiga persistente pero tolerable.',
      diagnosis: 'Hepatitis crónica por VHC - ICD-10: B18.2\nALT: 85 U/L (N: <40), AST: 72 U/L (N: <35)\nCarga viral HCV: 850,000 UI/mL\nGenotipo 1b',
      plan: 'Sofosbuvir/Velpatasvir 400/100mg VO c/24h x 12 semanas\nControl de función hepática mensual\nUSG hepático semestral para HCC\nEvitar alcohol y hepatotóxicos\nCarga viral al finalizar tratamiento (RVS12)',
      bp: '120/76', hr: 72, temp: 36.6, rr: 16, spo2: 98, weight: 75, height: 175,
    },
    {
      subjective: 'Estreñimiento crónico de larga evolución. Evacuaciones 1-2 veces por semana, esfuerzo excesivo. Sensación de evacuación incompleta.',
      diagnosis: 'Estreñimiento funcional crónico - ICD-10: K59.00\nDescartada causa orgánica (colonoscopía previa normal)\nTransito colónico: lento',
      plan: 'Psyllium 10g VO c/24h con abundante agua\nPolietilenglicol 17g VO c/24h si no evacúa en 3 días\nHidratación >2L/día\nEjercicio regular mínimo 30min/día\nHigiene intestinal: horario fijo, posición en cuclillas',
      bp: '118/74', hr: 68, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 160,
    },
    {
      subjective: 'Dolor abdominal difuso recurrente. Saciedad precoz, plenitud postprandial. H. pylori positivo en test de aliento.',
      diagnosis: 'Dispepsia funcional + H. pylori positivo - ICD-10: K30, B96.81\nTest de ureasa: 25 ppm (positivo >24)\nSin síntomas de alarma',
      plan: 'Esquema cuádruple terapia 14 días:\n- Bismuto subsalicilato 2 tab c/6h\n- Metronidazol 500mg c/8h\n- Tetraciclina 500mg c/6h\n- Omeprazol 40mg c/12h\nConfirmar erradicación a las 4 semanas',
      bp: '120/75', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 73, height: 170,
    },
    {
      subjective: 'Hemorragia digestiva baja intermitente. Sangrado rojo rutilante con defecación. Sin dolor abdominal.',
      diagnosis: 'Hemorroides internas grado II sangrantes - ICD-10: K64.2\nRectoscopía: 3 paquetes hemorroidarios en posiciones 3, 7 y 11\nHb: 11.2 g/dL (leve anemia)',
      plan: 'Fibra y abundante hidratación\nFlavonoides (diosmina 500mg c/12h x 2 meses)\nLigadura con banda elástica si no mejora\nSulfato ferroso 325mg VO c/24h\nEvitar esfuerzo defecatorio prolongado',
      bp: '115/70', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 78, height: 174,
    },
  ],
  'General Medicine': [
    {
      subjective: 'Consulta de chequeo anual. Sin síntomas actuales. Antecedente de hipertensión controlada. Fumador ocasional.',
      diagnosis: 'Chequeo médico preventivo - ICD-10: Z00.00\nIMC: 24.5 (normal)\nPA: controlada con enalapril 10mg\nRiesgo cardiovascular: 8% a 10 años',
      plan: 'Laboratorios anuales: hemograma, glucemia, perfil lipídico, creatinina\nECG basal\nVacuna influenza anual\nConsejería para dejar de fumar\nControl en 6 meses',
      bp: '120/78', hr: 72, temp: 36.5, rr: 16, spo2: 98, weight: 72, height: 172,
    },
    {
      subjective: 'Síntomas gripales desde hace 5 días: congestión nasal, rinorrea, malestar general, fiebre 37.8°C.',
      diagnosis: 'Infección viral de vías respiratorias superiores - ICD-10: J06.9\nFaringe eritematosa sin exudado\nSin adenopatías cervicales',
      plan: 'Reposo relativo e hidratación\nParacetamol 500mg VO c/8h si fiebre\nLavados nasales con solución salina\nNo se indica antibiótico (origen viral)\nControl si fiebre >5 días o empeoramiento',
      bp: '118/72', hr: 80, temp: 37.8, rr: 18, spo2: 97, weight: 68, height: 165,
    },
    {
      subjective: 'Fatiga persistente de 2 meses. Sueño no reparador. Dolor muscular difuso. Concentración disminuida.',
      diagnosis: 'Fatiga crónica - ICD-10: R53.83\nDescartada: anemia, hipotiroidismo, diabetes\nVitamina D: 18 ng/mL (insuficiente)',
      plan: 'Colecalciferol 2000 UI VO c/24h x 3 meses\nHábitos de sueño: higiene del sueño\nEjercicio aeróbico progresivo\nManejo del estrés\nReevaluación de función tiroidea en 3 meses',
      bp: '110/68', hr: 68, temp: 36.4, rr: 16, spo2: 99, weight: 58, height: 158,
    },
    {
      subjective: 'Dolor articular múltiple de 6 semanas. Rigidez matutina de 45 minutos. Mejora con actividad.',
      diagnosis: 'Poliartralgia inflamatoria - ICD-10: M25.50\nFR: negativo, Anti-CCP: pendiente\nPCR: 12 mg/L (elevada)\nVSG: 35 mm/h (elevada)',
      plan: 'Naproxeno 500mg VO c/12h x 2 semanas\nAnti-CCP y panel autoinmune completo\nRadiografías de manos y pies\nEvaluación por reumatología\nReposo relativo durante fase inflamatoria',
      bp: '125/80', hr: 75, temp: 37.0, rr: 16, spo2: 98, weight: 65, height: 162,
    },
    {
      subjective: 'Dermatitis de contacto en manos. Lesiones eritematosas y descamativas. Empeora con lavado frecuente de manos.',
      diagnosis: 'Dermatitis de contacto irritativa - ICD-10: L24.0\nManos: eritema, descamación, fisuras en pulpejos\nSin signos de infección secundaria',
      plan: 'Crema barrera con dimeticona c/4h\nEvitar detergentes irritantes\nGuantes de algodón debajo de guantes de goma\nClobetasol 0.05% crema nocturna x 7 días\nEmoliente frecuente después de lavado',
      bp: '115/72', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 60, height: 155,
    },
    {
      subjective: 'Cefalea tensional frecuente. 4-5 episodios semanales. Dolor tipo banda bilateral. Asociada a estrés laboral.',
      diagnosis: 'Cefalea tensional episódica frecuente - ICD-10: G44.2\nNeurológico: sin focales\nFondo de ojo: papila normal',
      plan: 'Amitriptilina 25mg VO nocte (profilaxis)\nManejo de estrés y técnicas de relajación\nErgonomía del puesto de trabajo\nEvitar uso excesivo de analgésicos\nEjercicio regular y pausas activas',
      bp: '130/82', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 75, height: 170,
    },
    {
      subjective: 'Lumbalgia mecánica de 3 semanas. Dolor que empeora con flexión y mejora con extensión. Sin irradiación radicular.',
      diagnosis: 'Lumbalgia inespecífica - ICD-10: M54.5\nPalpación: contractura paravertebral bilateral\nLasègue: negativo bilateral\nSin déficits neurológicos',
      plan: 'Naproxeno 500mg VO c/12h x 10 días\nRelajante muscular: ciclobenzaprina 10mg nocte\nCalor local 20min c/6h\nEjercicios de extensión lumbar\nReevaluación si persiste >6 semanas',
      bp: '122/78', hr: 74, temp: 36.5, rr: 16, spo2: 98, weight: 80, height: 175,
    },
    {
      subjective: 'Control de diabetes tipo 2. Adherente a metformina. Monitoreo glucémico irregular. Dieta inconsistente.',
      diagnosis: 'Diabetes mellitus tipo 2 - ICD-10: E11.9\nHbA1c: 7.8% (objetivo <7%)\nGlucemia en ayunas: 145 mg/dL\nPerfil lipídico: LDL 135 mg/dL',
      plan: 'Metformina 850mg VO c/12h (aumentar dosis)\nAgente añadido: linagliptina 5mg VO c/24h\nEducación nutricional intensiva\nMonitoreo glucémico: ayunas y 2h postprandial\nControl HbA1c en 3 meses',
      bp: '135/85', hr: 76, temp: 36.5, rr: 16, spo2: 98, weight: 88, height: 170,
    },
  ],
  Neurology: [
    {
      subjective: 'Cefalea recurrente de 2 años. Crisis unilaterales pulsátiles de 4-12 horas. Náuseas, fotofobia, fonofobia. 3-4 crisis/mes.',
      diagnosis: 'Migraña sin aura - ICD-10: G43.0\nFrecuencia: 3-4 crisis/mes\nMIDAS score: 21 (discapacidad moderada)\nDescartadas causas secundarias por neuroimagen',
      plan: 'Sumatriptán 50mg VO al inicio de crisis\nPropranolol 80mg VO c/24h (profilaxis)\nDiario de cefaleas\nEvitar desencadenantes identificados\nControl en 6 semanas',
      bp: '125/80', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 160,
    },
    {
      subjective: 'Parestesias en ambos pies "como calcetines" desde hace 3 meses. Ardor y hormigueo. Empeora en la noche.',
      diagnosis: 'Neuropatía periférica simétrica distal - ICD-10: G62.9\nSensibilidad vibratoria disminuida en MMII\nReflejos aquileos abolidos bilateralmente',
      plan: 'Pregabalina 75mg VO c/12h\nVitamina B12 (cianocobalamina 1000mcg IM semanal x 4)\nHbA1c y glucemia (descartar diabetes)\nElectromiografía de miembros inferiores\nCalzado adecuado, evitar lesiones',
      bp: '130/82', hr: 74, temp: 36.6, rr: 16, spo2: 98, weight: 78, height: 172,
    },
    {
      subjective: 'Vértigo rotatorio súbito de 30 segundos al girar la cabeza en la cama. Sin hipoacusia ni acúfenos. Náuseas asociadas.',
      diagnosis: 'Vértigo posicional paroxístico benigno - ICD-10: H81.1\nDix-Hallpike: nistagmo rotatorio fatigable derecho\nSin déficit neurológico focal',
      plan: 'Maniobra de Epley x 3 series en consulta\nRehabilitación vestibular\nProclorperazina 10mg VO PRN crisis agudas\nEjercicios de Brandt-Daroff en casa\nControl en 1 semana',
      bp: '118/72', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 168,
    },
    {
      subjective: 'Temblor de reposo en mano derecha de 6 meses. Bradiquinesia progresiva. Rigidez en brazo derecho. Micrografía.',
      diagnosis: 'Enfermedad de Parkinson estadio II (Hoehn & Yahr) - ICD-10: G20\nSignos cardinales: temblor, bradiquinesia, rigidez\nRespuesta a prueba de levodopa: positiva',
      plan: 'Levodopa/Carbidopa 100/25mg VO c/8h (titular)\nPramipexol 0.125mg VO c/8h\nEjercicio físico regular (caminata, tai chi)\nEvaluación por terapia ocupacional\nControl en 4 semanas',
      bp: '110/68', hr: 65, temp: 36.5, rr: 16, spo2: 99, weight: 68, height: 165,
    },
    {
      subjective: 'Crisis convulsiva generalizada tónico-clónica de 2 minutos. Pérdida de conciencia, movimientos tónico-clónicos, mordedura lateral de lengua. Post-ictal confuso.',
      diagnosis: 'Epilepsia generalizada primera crisis - ICD-10: G40.9\nEEG: actividad epileptiforme generalizada\nNeuroimagen pendiente',
      plan: 'Levetiracetam 500mg VO c/12h (iniciar monoterapia)\nRMN cerebral con protocolo epilepsia\nEducación sobre prevención de crisis\nEvitar conducción de vehículos\nControl en 1 mes con EEG de seguimiento',
      bp: '128/80', hr: 85, temp: 36.6, rr: 18, spo2: 97, weight: 75, height: 175,
    },
    {
      subjective: 'Pérdida progresiva de memoria de 1 año. Dificultad para encontrar palabras. Se pierde en lugares conocidos. Alteración de actividades instrumentales.',
      diagnosis: 'Deterioro cognitivo probable tipo Alzheimer - ICD-10: G30.9\nMMSE: 20/30 (deterioro leve-moderado)\nFAQ: 8/10 (dependencia instrumental)',
      plan: 'Donepezilo 5mg VO nocte (titular a 10mg)\nEstimulación cognitiva estructurada\nEvaluación de seguridad en el hogar\nSoporte para cuidador\nRMN cerebral y estudios de laboratorio para descartar reversibles',
      bp: '135/85', hr: 72, temp: 36.5, rr: 16, spo2: 98, weight: 62, height: 155,
    },
    {
      subjective: 'Dolor facial paroxístico unilateral tipo descarga eléctrica, desencadenado por tacto y masticación. Crisis de 30-60 segundos.',
      diagnosis: 'Neuralgia del trigémino - ICD-10: G50.0\nDistribución V2-V3 derecha\nZona gatillo: mejilla derecha',
      plan: 'Carbamazepina 200mg VO c/12h (titular gradualmente)\nRMN cerebral con secuencias de nervios craneales\nPerfil hepático basal\nSi refractario: evaluación para descompresión microvascular',
      bp: '125/78', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 168,
    },
  ],
  Dentistry: [
    {
      subjective: 'Dolor dental intenso en muela inferior derecha. Sensibilidad al frío y calor. Dolor espontáneo nocturno que impide dormir.',
      diagnosis: 'Pulpitis irreversible de pieza 46 - ICD-10: K04.0\nRX: imagen radiolúcida periapical en 46\nCaries profunda que afecta cámara pulpar\nPercusión: positiva',
      plan: 'Endodoncia de pieza 46 en 2 sesiones\nAnestesia local (lidocaína 2% con epinefrina)\nApertura y extirpación pulpar en sesión 1\nObturación termoplástica en sesión 2\nCorona posterior de porcelana-fusión a metal',
      bp: '120/78', hr: 75, temp: 36.5, rr: 16, spo2: 99, weight: 72, height: 170,
    },
    {
      subjective: 'Sangrado gingival frecuente al cepillarse. Mal aliento constante. Sensación de "dientes sueltos". No ha visitado al dentista en 3 años.',
      diagnosis: 'Periodontitis crónica generalizada moderada - ICD-10: K05.31\nSondaje: bolsas de 4-6mm generalizadas\nMovilidad grado I en incisivos inferiores\nRadiografía: pérdida ósea horizontal 25-50%',
      plan: 'Raspado y alisado radicular (4 cuadrantes en sesiones)\nInstrucción de higiene oral personalizada\nClorhexidina 0.12% enjuague c/12h x 2 semanas\nReevaluación periodontal a las 6 semanas\nMantenimiento cada 3-4 meses',
      bp: '118/75', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 78, height: 174,
    },
    {
      subjective: 'Dolor e inflamación en zona de muela del juicio inferior izquierda. Dificultad para abrir boca. Sabor desagradable.',
      diagnosis: 'Pericoronaritis aguda de pieza 38 - ICD-10: K05.42\nPieza 38 parcialmente erupcionada, impactada mesioangular\nOpérculo eritematoso y edematoso\nTrismo: apertura 25mm',
      plan: 'Irrigación subopercular con clorhexidina\nAmoxicilina 500mg VO c/8h x 7 días\nAINEs para dolor y trismo\nOpiculectomía si pieza es funcional\nExodoncia de 38 si impactada y sin antagonista',
      bp: '125/80', hr: 80, temp: 37.5, rr: 18, spo2: 98, weight: 80, height: 175,
    },
    {
      subjective: 'Revisión de ortodoncia en curso. Alineación satisfactoria. Buen cumplimiento con elásticos. Sin molestias significativas.',
      diagnosis: 'Tratamiento de ortodoncia en fase de acabado - ICD-10: Z46.6\nClase molar I bilateral\nOverbite: 20%, Overjet: 2mm\nCoordinación de arcadas: buena',
      plan: 'Cambiar a alambres de acabado 0.019x0.025 SS\nElásticos triángulo c/24h\nControl en 4 semanas\nPlan de retención: Hawley superior, 3-3 fijo inferior\nPanorámica de control al finalizar',
      bp: '115/72', hr: 68, temp: 36.4, rr: 16, spo2: 99, weight: 58, height: 158,
    },
    {
      subjective: 'Lesión blanca en mucosa yugal derecha que no se desprende al raspado. No dolorosa. Descubierta en revisión de rutina.',
      diagnosis: 'Leucoplasia oral - ICD-10: K13.21\nMucosa yugal derecha: parche blanco no removible de 1.5cm\nNo factores de irritación mecánica evidente\nTabaquismo: negativo',
      plan: 'Biopsia incisional urgente\nElimina factores de riesgo potencial\nControl en 1 semana con resultados\nSi displasia moderada-severa: escisión completa\nSeguimiento cada 6 meses post-tratamiento',
      bp: '122/76', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 162,
    },
    {
      subjective: 'Sensibilidad dental generalizada al frío y dulces. Múltiples restauraciones antiguas con bordes abiertos.',
      diagnosis: 'Caries recurrente múltiple - ICD-10: K02.8\nPiezas 16, 26, 36, 46: caries recurrente Clase II\nPieza 11: caries Clase IV\nSensibilidad dentinaria generalizada',
      plan: 'Restauraciones: composite tipo A en anteriores\nAmalgama o composite en posteriores según criterio\nBarniz de flúor profesional\nCrema desensibilizante nocturna\nControl de caries: selladores en piezas sanas',
      bp: '118/74', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 168,
    },
    {
      subjective: 'Exodoncia de pieza 26. Extracción realizada sin complicaciones. Coágulo formado correctamente. Sangrado mínimo.',
      diagnosis: 'Post-exodoncia de molar superior izquierdo - ICD-10: Z98.84\nAlveolo sin signos de infección\nCoágulo estable\nSin alveolitis',
      plan: 'Ibuprofeno 400mg VO c/8h x 5 días\nNo enjuagar, escupir ni fumar 48h\nDieta blanda 3 días\nClorhexidina 0.12% enjuague suave a partir del día 3\nControl en 7 días para evaluación de cicatrización',
      bp: '120/75', hr: 74, temp: 36.6, rr: 16, spo2: 99, weight: 75, height: 172,
    },
    {
      subjective: 'Revisión de prótesis removible superior de 3 años de uso. Molestia en paladar, zonas de presión. Pérdida de retención.',
      diagnosis: 'Estomatitis subprotésica + rebase necesario - ICD-10: K12.6\nPaladar: eritema difuso bajo base protésica\nRetención disminuida, movilidad de prótesis\nPérdida ósea residual moderada',
      plan: 'Retirar prótesis 3 días antes del rebase\nTratamiento de estomatitis: nistatina suspensión c/6h x 14 días\nRebase directo con material de rebase\nInstrucción de limpieza de prótesis\nControl en 2 semanas',
      bp: '125/80', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 68, height: 160,
    },
  ],
  Endocrinology: [
    {
      subjective: 'Aumento de peso progresivo de 8kg en 6 meses. Intolerancia al frío. Estreñimiento. Cansancio extremo. Piel seca.',
      diagnosis: 'Hipotiroidismo primario - ICD-10: E03.9\nTSH: 12.5 mUI/L (elevada), T4 libre: 0.6 ng/dL (baja)\nTPO-Ab: positivo (Hashimoto)',
      plan: 'Levotiroxina 50mcg VO en ayunas c/24h\nControl de TSH en 6 semanas (ajustar dosis)\nDieta hipocalórica supervisada\nEducación sobre administración de levotiroxina\nSeguimiento cada 3 meses',
      bp: '115/72', hr: 58, temp: 36.0, rr: 14, spo2: 99, weight: 78, height: 165,
    },
    {
      subjective: 'Palpitaciones, pérdida de peso de 5kg a pesar de aumento de apetito. Intolerancia al calor. Temblor fino en manos.',
      diagnosis: 'Hipertiroidismo - ICD-10: E05.90\nTSH: 0.01 mUI/L, T4 libre: 3.2 ng/dL\nTRAb: positivo (Graves)\nOftalmopatía leve grado 2',
      plan: 'Metimazol 20mg VO c/24h\nPropranolol 20mg VO c/8h\nControl de función tiroidea mensual\nEvaluación por oftalmología\nOpciones definitivas: radioyodo o tiroidectomía',
      bp: '135/75', hr: 105, temp: 37.0, rr: 18, spo2: 98, weight: 55, height: 158,
    },
    {
      subjective: 'Obesidad grado II con síndrome metabólico. Circunferencia de cintura 105cm. Presión arterial elevada en controles previos.',
      diagnosis: 'Síndrome metabólico - ICD-10: E88.81\nIMC: 32.5\nGlucemia en ayunas: 112 mg/dL\nTriglicéridos: 220 mg/dL, HDL: 32 mg/dL',
      plan: 'Metformina 500mg VO c/12h\nEstilolibro intensivo: dieta mediterránea + ejercicio 150min/semana\nControl de lípidos: considerar estatina\nMonitoreo de PA en casa\nControl cada 3 meses',
      bp: '142/88', hr: 78, temp: 36.5, rr: 18, spo2: 97, weight: 95, height: 170,
    },
    {
      subjective: 'Nódulo tiroideo descubierto en USG de rutina. 1.5cm hipoecoico en lóbulo derecho. Sin síntomas de compresión.',
      diagnosis: 'Nódulo tiroideo TI-RADS 4 - ICD-10: E04.1\nUSG: nódulo 1.5cm, hipoecoico, microcalcificaciones\nTSH normal: 2.1 mUI/L\nPAAF pendiente',
      plan: 'Punción aspirativa con aguja fina guiada por USG\nPerfil tiroideo completo\nSi Bethesda III o IV: repetir PAAF o prueba molecular\nSeguimiento cada 6 meses si benigno\nCirugía si Bethesda V o VI',
      bp: '120/75', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 162,
    },
    {
      subjective: 'Adrenal incidentaloma de 2.5cm en TC abdominal. Sin síntomas sugestivos de hiperfunción. Descubrimiento casual.',
      diagnosis: 'Adrenal incidentaloma - ICD-10: D35.00\nTC: nódulo 2.5cm, homogéneo, <10 HU (benigno)\nMetanefrinas plasmáticas: normales\nDexametasona 1mg: cortisol suprimido',
      plan: 'TC de control en 6-12 meses\nPerfil hormonal basal\nSi estable: TC anual x 2 años\nNo requiere cirugía si <4cm y benigno\nEducación sobre síntomas de hiperfunción',
      bp: '125/80', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 72, height: 168,
    },
    {
      subjective: 'Control de diabetes tipo 1. Uso de bomba de insulina. HbA1c en rango. Episodio de hipoglucemia severa hace 2 meses.',
      diagnosis: 'Diabetes mellitus tipo 1 - ICD-10: E10.65\nHbA1c: 7.2% (aceptable)\nTiempo en rango: 72%\nHipoglucemia severa: 1 episodio',
      plan: 'Ajustar basal de bomba: reducir 10% nocturna\nRevisar ratios insulina/carbohidrato\nCGM (Monitoreo continuo de glucosa)\nGlucagón inyectable PRN hipoglucemia severa\nEducación sobre manejo de hipoglucemias',
      bp: '110/68', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 160,
    },
  ],
  Pediatrics: [
    {
      subjective: 'Fiebre de 39°C desde hace 3 días, tos productiva, rinorrea hialina. Rechazo parcial de alimentos.',
      diagnosis: 'Infección respiratoria aguda baja - ICD-10: J22\nAuscultación: estertores crepitantes bilaterales basales\nFR: 28 rpm, SatO2: 96%',
      plan: 'Amoxicilina 50mg/kg/día VO dividido c/8h x 10 días\nParacetamol 15mg/kg VO c/6h si fiebre >38°C\nHidratación oral abundante\nControl en 48-72h\nSignos de alarma: dificultad respiratoria',
      bp: '95/60', hr: 110, temp: 38.5, rr: 28, spo2: 96, weight: 15, height: 95,
    },
    {
      subjective: 'Diarrea acuosa 6-8 episodios/día desde hace 4 días. Vómito ocasional. Signos de deshidratación leve.',
      diagnosis: 'Gastroenteritis aguda - ICD-10: K52.9\nDeshidratación grado I (5-7%)\nMucosas secas, llanto sin lágrimas',
      plan: 'Vida Suero Oral 500ml/día a sorbos pequeños\nZinc 20mg VO c/24h x 14 días\nDieta blanda, evitar lácteos\nSignos de alarma: letargo, vómito incoercible\nControl en 48h',
      bp: '90/55', hr: 120, temp: 37.8, rr: 24, spo2: 98, weight: 12, height: 88,
    },
    {
      subjective: 'Exantema maculopapular generalizado iniciado en tronco. Fiebre leve previa. Contacto con casos similares en escuela.',
      diagnosis: 'Exantema viral probable (Roseola) - ICD-10: B08.2\nLesiones eritematosas confluentes en tronco, respetando cara\nEstado general: bueno',
      plan: 'Manejo sintomático\nParacetamol 10mg/kg VO c/6h PRN\nHidratación adecuada\nAislamiento hasta 24h sin fiebre\nControl si fiebre persiste >5 días',
      bp: '88/52', hr: 105, temp: 37.5, rr: 22, spo2: 99, weight: 14, height: 92,
    },
    {
      subjective: 'Dolor de oído derecho desde hace 2 días, fiebre 38.5°C, irritabilidad. Otoscopia: membrana timpánica eritematosa y abombada.',
      diagnosis: 'Otitis media aguda derecha - ICD-10: H66.90\nMembrana timpánica abombada, sin perforación\nBulging + eritema',
      plan: 'Amoxicilina 80-90mg/kg/día VO dividido c/12h x 10 días\nIbuprofeno 10mg/kg VO c/8h PRN dolor\nGotas óticas analgésicas PRN\nControl en 48-72h\nVacuna neumocócica al día',
      bp: '92/58', hr: 115, temp: 38.3, rr: 26, spo2: 97, weight: 13, height: 90,
    },
    {
      subjective: 'Control de niño sano. Desarrollo psicomotor adecuado para edad. Vacunación al corriente.',
      diagnosis: 'Consulta de crecimiento y desarrollo - ICD-10: Z00.129\nPercentil peso: P50-75\nPercentil talla: P50\nPercentil PC: P50',
      plan: 'Continuar lactancia materna exclusiva\nVitamina D 400 UI/día\nVacuna correspondiente a edad\nPróximo control en 1 mes\nEstimulación temprana',
      bp: '85/50', hr: 100, temp: 36.5, rr: 20, spo2: 99, weight: 8, height: 70,
    },
    {
      subjective: 'Sibilancias recurrentes. Tercer episodio en 6 meses. Despierta de noche con tos. Alivio con salbutamol.',
      diagnosis: 'Asma persistente moderada - ICD-10: J45.40\nEspirometría: VEF1 72% (reversible a salbutamol)\nPrick test positivo a ácaros',
      plan: 'Budesonida 200mcg inhalada c/12h + salbutamol PRN\nPlan de acción escrito para asma\nControl ambiental: funda antiácaros\nEspirometría de control en 3 meses\nEvaluación por alergología',
      bp: '100/60', hr: 95, temp: 36.5, rr: 24, spo2: 95, weight: 22, height: 120,
    },
  ],
  Otolaryngology: [
    {
      subjective: 'Hipoacusia progresiva bilateral de 2 años. Acúfenos en oído izquierdo. Dificultad para conversar en ambientes ruidosos.',
      diagnosis: 'Presbiacusia bilateral - ICD-10: H91.10\nAudiometría: hipoacusia neurosensorial bilateral simétrica\nPromedio tonal: 45dB dBHL',
      plan: 'Adaptación de audífonos retroauriculares\nPrueba de audífono bilateral x 30 días\nEntrenamiento auditivo\nControl en 1 mes post adaptación\nProtección auditiva en ambientes ruidosos',
      bp: '130/80', hr: 72, temp: 36.5, rr: 16, spo2: 98, weight: 75, height: 170,
    },
    {
      subjective: 'Epistaxis recurrente derecha de 2 meses. Sangrado leve pero frecuente. Sequedad nasal asociada.',
      diagnosis: 'Epistaxis recurrente anterior derecha - ICD-10: R04.0\nRinoscopía anterior: vaso de Kiesselbach visible\nCoagulación: TP, TTPa normales',
      plan: 'Cauterización química con nitrato de plata\nEmoliente nasal (vaselina) c/12h x 2 semanas\nHumidificador ambiental\nEvitar manipulación nasal\nControl en 2 semanas',
      bp: '135/85', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 165,
    },
    {
      subjective: 'Ronquido severo con pausas respiratorias nocturnas. Somnolencia diurna excesiva. Cefalea matutina frecuente.',
      diagnosis: 'Síndrome de apnea obstructiva del sueño - ICD-10: G47.30\nEpworth: 16/24\nPolisomnografía: IAH 28 eventos/hora (moderado-severo)',
      plan: 'CPAP nasal a 10 cmH2O\nTítulo con CPAP automático\nPérdida de peso (IMC: 31)\nEvitar alcohol y sedantes nocturnos\nControl en 1 mes con descarga de datos CPAP',
      bp: '140/90', hr: 74, temp: 36.5, rr: 18, spo2: 94, weight: 92, height: 175,
    },
    {
      subjective: 'Dolor de garganta severo con odinofagia. Fiebre 39°C. Dificultad para tragar. Voz de "patata caliente".',
      diagnosis: 'Amigdalitis aguda estreptocócica - ICD-10: J03.00\nExudado amigdalar blanco bilateral\nTest rápido de Strep A: positivo\nAdenopatías cervicales anteriores',
      plan: 'Penicilina V 500mg VO c/8h x 10 días\nAINEs para dolor y fiebre\nHidratación abundante\nGárgaras con agua salada\nControl en 48h si no mejora',
      bp: '118/72', hr: 92, temp: 39.0, rr: 20, spo2: 97, weight: 65, height: 160,
    },
    {
      subjective: 'Rinorrea clara bilateral, estornudos frecuentes, prurito nasal. Estacional (primavera). Historia familiar de atopia.',
      diagnosis: 'Rinitis alérgica estacional - ICD-10: J30.2\nPrick test: positivo a pólenes de gramíneas\nCornetes nasales hipertrofiados y pálidos',
      plan: 'Fluticasona nasal 50mcg/dosis c/12h\nLoratadina 10mg VO c/24h\nLavados nasales con solución salina\nEvitar exposición a alérgenos\nInmunoterapia sublingual si refractario',
      bp: '115/70', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 158,
    },
    {
      subjective: 'Otorrea purulenta derecha de 2 semanas. Antecedente de otitis media recurrente. Hipoacusia leve ipsilateral.',
      diagnosis: 'Otitis media crónica supurativa - ICD-10: H66.12\nOtoscopía: perforación timpánica central derecha\nSecreción mucopurulenta en conducto auditivo',
      plan: 'Gotas óticas de ciprofloxacino/dexametasona c/12h x 7 días\nSecreción para cultivo y antibiograma\nAudiometría tonal\nTimpanoplastia electiva si perforación persistente\nMantener oído seco',
      bp: '120/75', hr: 70, temp: 36.8, rr: 16, spo2: 99, weight: 68, height: 165,
    },
  ],
  Ophthalmology: [
    {
      subjective: 'Visión borrosa progresiva bilateral de 1 año. Dificultad para leer de lejos. Deslumbramiento nocturno.',
      diagnosis: 'Catarata nuclear bilateral - ICD-10: H25.10\nAVSC: OD 20/60, OS 20/50\nCristalino: opacidad nuclear grado 2+ bilateral',
      plan: 'Facoemulsificación con LIO monofocal OD programada\nEvaluación preoperatoria: biometría, topografía\nGotas preoperatorias: moxifloxacino + AINE\nControl postoperatorio día 1, semana 1, mes 1\nCirugía OS tras recuperación OD',
      bp: '128/78', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 72, height: 168,
    },
    {
      subjective: 'Visión borrosa cercana. Dificultad para leer sin acercar el material. Fatiga visual al final del día.',
      diagnosis: 'Presbicia bilateral - ICD-10: H52.4\nAV de lejos: 20/20 bilateral\nAV de cerca: J3 (bilateral)\nAO: +1.50 dioptrías',
      plan: 'Gafas de lectura +1.50 dioptrías\nOpciones: gafas monofocales, bifocales o progresivas\nLentes de contacto multifocales como alternativa\nControl en 1 año\nEjercicios de relajación visual',
      bp: '122/76', hr: 68, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 160,
    },
    {
      subjective: 'Dolor ocular severo derecho de 4 horas. Ojo rojo, visión con halos alrededor de luces. Náuseas y vómito.',
      diagnosis: 'Glaucoma agudo de ángulo cerrado - ICD-10: H40.20\nPIO OD: 52 mmHg (normal <21)\nCámara anterior: estrecha\nPupila: semi-midriática fija',
      plan: 'Emergencia oftalmológica:\n- Acetazolamida 500mg IV stat\n- Timolol 0.5% gotas c/12h OD\n- Pilocarpina 2% gotas c/6h OD\n- Manitol 20% IV si no baja PIO\nIridotomía periférica con láser YAG en 24-48h',
      bp: '145/92', hr: 95, temp: 36.6, rr: 20, spo2: 97, weight: 70, height: 165,
    },
    {
      subjective: 'Sequedad ocular bilateral con sensación de arenilla. Ardor al final del día. Uso de pantallas >8h/día.',
      diagnosis: 'Síndrome de ojo seco - ICD-10: H04.12\nSchirmer: 5mm/5min OD, 7mm/5min OS (anormal)\nTBUT: 4 segundos (reducido)',
      plan: 'Lágrimas artificiales sin conservantes c/4h\nCiclosporina 0.05% gotas c/12h si severo\nRegla 20-20-20 para pantallas\nOmega 3 suplemento 1000mg/día\nTapones lagrimales si refractario',
      bp: '118/72', hr: 68, temp: 36.5, rr: 16, spo2: 99, weight: 60, height: 155,
    },
    {
      subjective: 'Flotantes y destellos luminosos en ojo derecho desde hace 2 días. Sin pérdida de campo visual.',
      diagnosis: 'Desprendimiento de vítreo posterior - ICD-10: H43.81\nFondo de ojo: vítreo separado, sin rotura retiniana visible\nUSG ocular: vítreo desprendido',
      plan: 'Examen de fondo de ojo con dilatación en 1 semana\nEducación sobre signos de alarma (cortina, pérdida visual)\nEvitar esfuerzo físico intenso\nSi nueva rotura: fotocoagulación láser\nControl inmediato si síntomas empeoran',
      bp: '125/80', hr: 74, temp: 36.5, rr: 16, spo2: 99, weight: 68, height: 162,
    },
  ],
  Oncology: [
    {
      subjective: 'Masa palpable en cuadrante superior externo de mama derecha de 3cm, adherida a planos profundos. Ganglio axilar ipsilateral palpable.',
      diagnosis: 'Carcinoma ductal infiltrante de mama - ICD-10: C50.919\nBiopsia core needle confirmada\nER+: 90%, PR+: 70%, HER2: 0, Ki-67: 15%\nEstadiaje: T2N1M0 (IIB)',
      plan: 'Cirugía: mastectomía modificada + biopsia de ganglio centinela\nQuimioterapia adyuvante: esquema AC-T\nRadioterapia postquirúrgica\nTamoxifeno 20mg VO c/24h x 5 años\nEvaluación multidisciplinaria de equipo de mama',
      bp: '125/80', hr: 82, temp: 36.8, rr: 18, spo2: 97, weight: 70, height: 162,
    },
    {
      subjective: 'Control post quimioterapia ciclo 3. Náuseas controladas con ondansetrón. Fatiga moderada. Leucopenia leve.',
      diagnosis: 'Control de quimioterapia adyuvante - ICD-10: Z51.11\nEsquema AC-T: Ciclo 3 de 8 completados\nLeucocitos: 3200 (referencia: 4000-11000)\nNeutrófilos: 1800',
      plan: 'Continuar esquema oncológico\nFilgrastim 300mcg SC si neutrófilos <1500\nOndansetrón 8mg VO c/8h PRN náuseas\nControl de hemograma en 7 días\nPróximo ciclo en 21 días',
      bp: '110/68', hr: 72, temp: 36.4, rr: 16, spo2: 99, weight: 58, height: 158,
    },
    {
      subjective: 'Tos persistente de 4 semanas con hemoptisis ocasional. Dolor torácico derecho. Pérdida de peso de 8kg en 2 meses.',
      diagnosis: 'Carcinoma pulmonar no microcítico - ICD-10: C34.90\nBiopsia broncoscópica confirmada\nEGFR mutación positiva, ALK negativo\nEstadiaje: T3N1M0 (IIIA)',
      plan: 'Erlotinib 150mg VO c/24h (terapia dirigida)\nTAC de tórax-abdomen cada 8 semanas\nPET-CT basal para estadificación\nControl de toxicidad cutánea (erupción por EGFR)\nEvaluación por cirugía si downstaging',
      bp: '132/84', hr: 85, temp: 37.0, rr: 20, spo2: 95, weight: 72, height: 175,
    },
    {
      subjective: 'Seguimiento post tratamiento de linfoma. Remisión confirmada en PET-CT de control. Fatiga residual manejable.',
      diagnosis: 'Linfoma de Hodgkin en remisión completa - ICD-10: C81.90\nPost 6 ciclos de ABVD\nPET-CT: Deauville score 1 (remisión completa metabólica)',
      plan: 'Seguimiento cada 3 meses por 2 años\nHemograma completo y VSG cada consulta\nEcografía cervical y axilar\nRehabilitación progresiva\nEducación sobre signos de recaída',
      bp: '115/72', hr: 68, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 165,
    },
    {
      subjective: 'Detección de antígeno prostático elevado en estudio de rutina. PSA: 8.5 ng/mL. Tacto rectal: nódulo duro en próstata.',
      diagnosis: 'Cáncer de próstata sospechado - ICD-10: C61\nPSA total: 8.5 ng/mL, PSA libre: 1.2 ng/mL\nÍndice PSA libre/total: 14% (sugestivo)\nTacto rectal: nódulo duro lóbulo derecho',
      plan: 'Biopsia transrectal ecoguiada (12 cilindros)\nResonancia multiparamétrica de próstata\nGleason score pendiente\nConsejería sobre opciones: vigilancia activa vs tratamiento\nMarcadores tumorales de seguimiento',
      bp: '130/82', hr: 76, temp: 36.6, rr: 16, spo2: 98, weight: 80, height: 172,
    },
    {
      subjective: 'Sangrado rectal intermitente desde hace 2 meses. Cambio en hábito intestinal. Pérdida de peso de 5kg en 3 meses.',
      diagnosis: 'Adenocarcinoma de colon - ICD-10: C18.9\nColonoscopía con biopsia confirmada\nCEA basal: 12 ng/mL (elevado)\nEstadiaje TAC: T3N0M0 (IIB)',
      plan: 'Colectomía derecha laparoscópica programada\nEstudio preoperatorio completo\nQuimioterapia adyuvante: FOLFOX x 6 ciclos\nControl de CEA cada 3 meses post-cirugía\nColonoscopía de vigilancia al año',
      bp: '118/75', hr: 78, temp: 36.6, rr: 16, spo2: 98, weight: 65, height: 170,
    },
  ],
  Psychiatry: [
    {
      subjective: 'Tristeza persistente de 4 meses. Pérdida de interés en actividades. Insomnio de conciliación. Ideación autolítica pasiva.',
      diagnosis: 'Trastorno depresivo mayor - ICD-10: F32.1\nPHQ-9: 16 (depresión moderada)\nHAMD-17: 20\nSin factores psicóticos, sin episodios previos',
      plan: 'Sertralina 50mg VO c/24h (titular a 100mg)\nPsicoterapia cognitivo-conductual semanal\nPlan de seguridad: números de emergencia\nEvaluación de riesgo suicida en cada consulta\nControl en 2 semanas',
      bp: '118/72', hr: 68, temp: 36.5, rr: 16, spo2: 99, weight: 60, height: 160,
    },
    {
      subjective: 'Episodios de ansiedad severa con palpitaciones, disnea, temblor y sensación de muerte inminente. 3 ataques/semana.',
      diagnosis: 'Trastorno de pánico - ICD-10: F41.0\nEscala de severidad de pánico: 18/35\nEKG: normal (descartar arritmia)\nTSH y hemograma normales',
      plan: 'Escitalopram 10mg VO c/24h\nClonazepam 0.5mg VO PRN crisis (corto plazo)\nTécnicas de respiración diafragmática\nPsicoterapia CBT enfocada en pánico\nExposición interoceptiva gradual',
      bp: '130/85', hr: 95, temp: 36.5, rr: 22, spo2: 98, weight: 65, height: 162,
    },
    {
      subjective: 'Insomnio crónico de 6 meses. Dificultad para conciliar y mantener el sueño. Pensamientos rumiativos nocturnos.',
      diagnosis: 'Insomnio crónico - ICD-10: G47.00\nÍndice de Pittsburgh (PSQI): 14\nDiario de sueño: latencia 90min, TST 4.5h\nConsumo de cafeína: 4 tazas/día',
      plan: 'Higiene del sueño: sin pantallas 2h antes de dormir\nRestricción de cafeína después de 12h\nTrazodona 50mg VO nocte\nTerapia cognitivo-conductual para insomnio (CBT-I)\nDiario de sueño para seguimiento',
      bp: '122/76', hr: 74, temp: 36.5, rr: 16, spo2: 99, weight: 70, height: 168,
    },
    {
      subjective: 'Control de TDAH en tratamiento. Mejoría en concentración con metilfenidato. Insomnio inicial controlado. Apetito disminuido.',
      diagnosis: 'TDAH del adulto - ICD-10: F90.0\nEscala ASRS: 3/6 síntomas activos\nDivulgación: trabajo 7/10, social 6/10\nIMC: bajó de 24 a 22 con tratamiento',
      plan: 'Metilfenidato LA 36mg VO matutino\nControl de peso mensual\nEstrategias compensatorias: organización del tiempo\nEvaluación de necesidad de dosis adicional por la tarde\nControl en 1 mes',
      bp: '125/80', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 170,
    },
  ],
  Rheumatology: [
    {
      subjective: 'Dolor e inflamación en articulaciones de manos (MCF y IFP) de 4 meses. Rigidez matutina >1 hora. Simétrico.',
      diagnosis: 'Artritis reumatoide - ICD-10: M06.9\nDAS28: 4.8 (actividad moderada)\nFR: 85 UI/mL (positivo), Anti-CCP: >250 (positivo)\nPCR: 18 mg/L, VSG: 45 mm/h',
      plan: 'Metotrexato 15mg/sem VO + ácido fólico 5mg 48h después\nPrednisona 10mg VO c/24h (puente, reducir gradualmente)\nRadiografías de manos y pies\nEvaluación cada mes para ajuste de tratamiento\nSi no remisión a 6 meses: biológico (adalimumab)',
      bp: '125/78', hr: 72, temp: 36.8, rr: 16, spo2: 98, weight: 62, height: 158,
    },
    {
      subjective: 'Dolor lumbar inflamatorio de 2 años. Mejora con ejercicio, empeora con reposo. Despertares nocturnos por dolor.',
      diagnosis: 'Espondiloartritis axial - ICD-10: M45.9\nHLA-B27: positivo\nRMN sacroilíaca: edema óseo bilateral\nBASDAI: 6.2/10',
      plan: 'Naproxeno 500mg VO c/12h (NSAID de prueba)\nEjercicio diario: natación, estiramientos\nSi no respuesta a NSAIDs en 3 meses: adalimumab 40mg SC c/2 sem\nFisioterapia especializada\nControl BASDAI cada consulta',
      bp: '122/76', hr: 70, temp: 36.5, rr: 16, spo2: 99, weight: 72, height: 172,
    },
    {
      subjective: 'Brotes de artritis en primer metatarso-falángico derecho. Dolor severo, eritema, edema. Desencadenado por alcohol y carnes rojas.',
      diagnosis: 'Gota aguda - ICD-10: M10.071\nÁcido úrico: 8.5 mg/dL (elevado)\nArtrocentesis pendiente (descartar séptica)\nCRISTALES: negativos en episodio previo',
      plan: 'Colchicina 1mg VO stat, luego 0.5mg c/2h x 3 dosis\nIndometacina 50mg VO c/8h si no contraindicación\nAlopurinol 100mg VO c/24h (iniciar 2 sem post-brote)\nDieta baja en purinas\nHidratación abundante >2L/día',
      bp: '135/85', hr: 80, temp: 37.2, rr: 18, spo2: 97, weight: 88, height: 175,
    },
    {
      subjective: 'Rash malar en alas de nariz y mejillas. Dolor articular en muñecas y rodillas. Fotosensibilidad marcada.',
      diagnosis: 'Lupus eritematoso sistémico - ICD-10: M32.9\nSLEDAI: 8 (actividad leve-moderada)\nANA: positivo 1:640 (patrón homogéneo)\nAnti-dsDNA: positivo, C3: bajo',
      plan: 'Hidroxicloroquina 400mg VO c/24h\nPrednisona 15mg VO c/24h (taper gradual)\nProtector solar FPS 50+\nLaboratorios cada mes: hemograma, orina, complemento\nEvaluación nefrológica (descartar nefritis lúpica)',
      bp: '118/72', hr: 74, temp: 36.8, rr: 16, spo2: 98, weight: 58, height: 155,
    },
  ],
  Geriatrics: [
    {
      subjective: 'Evaluación geriátrica integral. Múltiples comorbilidades: HTA, DM2, artrosis. Polifarmacia (8 medicamentos). Dificultad para actividades básicas.',
      diagnosis: 'Evaluación geriátrica integral - ICD-10: Z00.81\nÍndice de Barthel: 75/100 (dependencia leve)\nÍndice de Lawton: 4/8\nMMSE: 24/30',
      plan: 'Desprescripción: suspender medicamentos no esenciales\nRevisión de interacciones farmacológicas\nAdaptación del hogar: barras de baño, antideslizantes\nEjercicio: caminata 30 min/día\nSuplemento de vitamina D y calcio',
      bp: '145/88', hr: 72, temp: 36.5, rr: 16, spo2: 97, weight: 65, height: 158,
    },
    {
      subjective: 'Pérdida de memoria progresiva de 2 años. Desorientación temporal. Repetición de preguntas. Dificultad para manejar finanzas.',
      diagnosis: 'Demencia tipo Alzheimer - ICD-10: G30.9\nMMSE: 18/30\nGDS: 5 (deterioro moderadamente severo)\nFAQ: 21/30',
      plan: 'Donepezilo 10mg VO nocte\nMemantina 10mg VO c/12h\nEstimulación cognitiva diaria\nAdaptación del entorno: rutinas, etiquetas\nSoporte para cuidador: grupo de apoyo\nControl cada 3 meses',
      bp: '135/85', hr: 68, temp: 36.5, rr: 16, spo2: 98, weight: 60, height: 155,
    },
    {
      subjective: 'Caída domiciliaria hace 3 días. Sin pérdida de conciencia. Contusión en cadera derecha. Marcha inestable.',
      diagnosis: 'Caída accidental + riesgo de caídas recurrente - ICD-10: W19, R26.89\nTimed Up and Go: 18 segundos (alto riesgo)\nFuerza muscular MMII: 3+/5 bilateral',
      plan: 'Radiografía de cadera (descartar fractura)\nFisioterapia: fortalecimiento y equilibrio\nRevisión de medicamentos (causa de caída)\nAdaptación del hogar: eliminar alfombras, mejorar iluminación\nDispositivo de asistencia: bastón o andador',
      bp: '138/82', hr: 75, temp: 36.6, rr: 16, spo2: 98, weight: 62, height: 152,
    },
  ],
  'Allergy & Immunology': [
    {
      subjective: 'Reacción alérgica severa tras ingesta de mariscos: urticaria generalizada, angioedema labial, dificultad respiratoria leve.',
      diagnosis: 'Anafilaxia por mariscos - ICD-10: T78.00XA\nIgE específica a mariscos: 15 kU/L\nPrick test: positivo fuerte (roncha 8mm)',
      plan: 'Epinefrina autoinyectora (EpiPen 0.3mg IM) - educar uso\nLevocetirizina 5mg VO c/24h\nEvitación estricta de mariscos y derivados\nEducación sobre plan de acción de anafilaxia\nBrazalete de identificación médica',
      bp: '95/60', hr: 105, temp: 36.8, rr: 22, spo2: 95, weight: 70, height: 168,
    },
    {
      subjective: 'Rinitis y conjuntivitis alérgica estacional severa. Empeora en primavera. Congestión nasal constante, lagrimeo.',
      diagnosis: 'Rinoconjuntivitis alérgica estacional - ICD-10: J30.1\nPrick test: positivo a pólenes de olivo y gramíneas\nNasal score: 8/12\nConjuntival score: 6/8',
      plan: 'Fluticasona nasal + olopatadina gotas oftálmicas\nMontelukast 10mg VO nocte\nInmunoterapia subcutánea: protocolo de 3 años\nEvitar exposición: ventanas cerradas, purificador de aire\nSeguimiento cada 3 meses',
      bp: '118/72', hr: 72, temp: 36.5, rr: 16, spo2: 99, weight: 65, height: 162,
    },
  ],
  Hematology: [
    {
      subjective: 'Fatiga severa, palidez cutánea y mucosa. Disnea de medianos esfuerzos. Hemoglobina baja en estudio de rutina.',
      diagnosis: 'Anemia ferropénica - ICD-10: D50.9\nHb: 8.5 g/dL, Hto: 26%\nFerritina: 8 ng/mL (baja)\nVCM: 72 fL (microcitosis)',
      plan: 'Sulfato ferroso 325mg VO c/8h con vitamina C\nBuscar causa: endoscopía + colonoscopía\nControl de hemograma en 4 semanas\nDieta rica en hierro: carnes rojas, espinacas\nSi refractario: hierro IV',
      bp: '108/65', hr: 90, temp: 36.4, rr: 18, spo2: 97, weight: 55, height: 158,
    },
    {
      subjective: 'Hematomas frecuentes sin trauma. Epistaxis ocasional. Petequias en extremidades inferiores.',
      diagnosis: 'Púrpura trombocitopénica inmune (PTI) - ICD-10: D69.3\nPlaquetas: 25,000/μL\nResto de líneas normales\nAspirado de médula: megacariocitos aumentados',
      plan: 'Prednisona 1mg/kg/día VO x 2 semanas\nInmunoglobulina IV si plaquetas <10,000\nEvitar AINEs y anticoagulantes\nControl de plaquetas cada 3 días\nEvaluación por hematología para segunda línea',
      bp: '115/70', hr: 78, temp: 36.5, rr: 16, spo2: 99, weight: 62, height: 160,
    },
  ],
  'Infectious Disease': [
    {
      subjective: 'Fiebre intermitente de 2 semanas, sudoración nocturna profusa, pérdida de peso de 4kg. Tos seca ocasional.',
      diagnosis: 'Tuberculosis pulmonar sospechada - ICD-10: A15.0\nRX tórax: infiltrado en ápice derecho con cavitación\nBAAR en esputo: pendiente\nIGRA: pendiente',
      plan: 'Esputo para BAAR x 3 muestras\nEsputo para GeneXpert MTB/RIF\nAislamiento respiratorio hasta confirmar/negar\nEsquema RIPE si confirmado: rifampicina, isoniacida, pirazinamida, etambutol\nNotificación obligatoria a salud pública',
      bp: '120/75', hr: 85, temp: 38.2, rr: 20, spo2: 96, weight: 60, height: 165,
    },
    {
      subjective: 'Fiebre de 39°C, mialgias intensas, cefalea retro-orbitaria, exantema macular. Viaje reciente a zona endémica de dengue.',
      diagnosis: 'Dengue sin signos de alarma - ICD-10: A90\nNS1: positivo, IgM: positivo\nPlaquetas: 120,000/μL\nHematocrito: 42% (sin hemoconcentración)',
      plan: 'Hidratación oral: 2-3L/día\nParacetamol 1g VO c/8h (evitar AINEs/aspirina)\nReposo relativo\nControl de plaquetas y hematocrito diario\nSignos de alarma: dolor abdominal, sangrado, letargo',
      bp: '105/65', hr: 95, temp: 39.0, rr: 20, spo2: 98, weight: 72, height: 175,
    },
    {
      subjective: 'Herida infectada en pie derecho tras pisar clavo. Eritema, calor, edema, secreción purulenta. Fiebre 38°C.',
      diagnosis: 'Celulitis de extremidad inferior - ICD-10: L03.115\nEritema perilesional de 5cm\nSecreción purulenta para cultivo\nRx pie: sin cuerpo extraño, sin osteomielitis',
      plan: 'Amoxicilina/Clavulanato 875/125mg VO c/12h\nElevación del miembro afectado\nLimpieza de herida y apósito estéril\nCultivo de secreción\nControl en 48h: si empeora, IV con vancomicina',
      bp: '128/80', hr: 88, temp: 38.0, rr: 20, spo2: 97, weight: 80, height: 172,
    },
  ],
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function createSupabaseUser(email: string, firstName: string, lastName: string): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'test-doctor-123',
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role: 'COLLABORATOR' },
  })

  if (error) {
    throw new Error(`Error creating Supabase user ${email}: ${error.message}`)
  }

  return data.user.id
}

// ============================================================
// MAIN SEED SCRIPT
// ============================================================

async function main() {
  console.log('🏥 Seeding test data for Open Doc organization...\n')

  // --- Step 1: Create new global specialties ---
  console.log('📋 Step 1: Creating new global specialties...')
  const existingSpecialties = await prisma.specialty.findMany()
  const existingNames = new Set(existingSpecialties.map(s => s.nameEn))

  const specialtyMap = new Map<string, string>() // nameEn -> id
  for (const s of existingSpecialties) {
    specialtyMap.set(s.nameEn, s.id)
  }

  for (const spec of NEW_SPECIALTIES) {
    if (existingNames.has(spec.nameEn)) {
      console.log(`  ⏭️ ${spec.nameEn} already exists`)
      specialtyMap.set(spec.nameEn, specialtyMap.get(spec.nameEn)!)
    } else {
      const created = await prisma.specialty.create({ data: spec })
      specialtyMap.set(spec.nameEn, created.id)
      console.log(`  ✅ ${spec.nameEn} / ${spec.nameEs}`)
    }
  }

  // --- Step 2: Add General Medicine + Neurology to Open Doc specialties ---
  console.log('\n🏢 Step 2: Adding specialties to Open Doc organization...')
  const openDoc = await prisma.organization.findUnique({ where: { id: ORG_ID } })
  const currentSpecIds = openDoc?.specialtyIds || []
  const newSpecIdsToAdd = OPENDOC_NEW_SPECIALTY_NAMES
    .map(name => specialtyMap.get(name)!)
    .filter(id => id && !currentSpecIds.includes(id))

  if (newSpecIdsToAdd.length > 0) {
    await prisma.organization.update({
      where: { id: ORG_ID },
      data: { specialtyIds: [...currentSpecIds, ...newSpecIdsToAdd] },
    })
    console.log(`  ✅ Added ${newSpecIdsToAdd.length} specialties to Open Doc`)
  } else {
    console.log('  ⏭️ All target specialties already assigned to Open Doc')
  }

  const openDocSpecialtyIds = [...currentSpecIds, ...newSpecIdsToAdd]
  const openDocSpecialties = await prisma.specialty.findMany({
    where: { id: { in: openDocSpecialtyIds } },
  })

  console.log(`  📊 Open Doc now has ${openDocSpecialtyIds.length} specialties`)

  // --- Step 3: Create doctors ---
  console.log('\n👨‍⚕️ Step 3: Creating doctors...')
  const doctors: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    specialtyIds: string[]
    specialtyNames: string[]
  }> = []

  // Include existing doctor
  const existingDoc = await prisma.user.findUnique({ where: { id: EXISTING_DOCTOR_ID } })
  if (existingDoc) {
    const docSpecs = ['Dentistry', 'General Medicine', 'Neurology']
    const docSpecIds = docSpecs.map(n => specialtyMap.get(n)!).filter(Boolean)

    await prisma.user.update({
      where: { id: EXISTING_DOCTOR_ID },
      data: { specialtyIds: docSpecIds },
    })

    doctors.push({
      id: existingDoc.id,
      firstName: existingDoc.firstName,
      lastName: existingDoc.lastName,
      email: existingDoc.email,
      specialtyIds: docSpecIds,
      specialtyNames: docSpecs,
    })
    console.log(`  ✅ ${existingDoc.firstName} ${existingDoc.lastName} (existing) -> ${docSpecs.join(', ')}`)
  }

  for (const docTemplate of NEW_DOCTORS) {
    console.log(`  Creating ${docTemplate.firstName} ${docTemplate.lastName}...`)

    let supabaseId: string
    const existingUser = await prisma.user.findFirst({ where: { email: docTemplate.email } })

    if (existingUser) {
      console.log(`    ⚠️ User already exists, updating specialtyIds`)
      supabaseId = existingUser.supabaseId
      const specIds = docTemplate.specialtyNames.map(n => specialtyMap.get(n)!).filter(Boolean)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { specialtyIds: specIds },
      })
      doctors.push({
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        specialtyIds: specIds,
        specialtyNames: docTemplate.specialtyNames,
      })
      continue
    }

    try {
      supabaseId = await createSupabaseUser(docTemplate.email, docTemplate.firstName, docTemplate.lastName)
    } catch (err) {
      console.error(`    ❌ Failed to create Supabase user: ${err}`)
      continue
    }

    const specIds = docTemplate.specialtyNames.map(n => specialtyMap.get(n)!).filter(Boolean)

    const user = await prisma.user.create({
      data: {
        supabaseId,
        organizationId: ORG_ID,
        roleId: OWNER_ROLE_ID,
        email: docTemplate.email,
        firstName: docTemplate.firstName,
        lastName: docTemplate.lastName,
        userType: 'COLLABORATOR',
        subtype: 'doctor',
        specialtyIds: specIds,
      },
    })

    doctors.push({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      specialtyIds: specIds,
      specialtyNames: docTemplate.specialtyNames,
    })
    console.log(`    ✅ ${user.firstName} ${user.lastName} -> ${docTemplate.specialtyNames.join(', ')}`)
  }

  console.log(`\n  📊 Total doctors: ${doctors.length}`)

  // --- Step 4: Create patients ---
  console.log('\n👥 Step 4: Creating patients...')
  const patientsByDoctor: Record<string, Array<{ id: string; firstName: string; lastName: string }>> = {}
  for (const doc of doctors) {
    patientsByDoctor[doc.id] = []
  }

  for (const pTemplate of PATIENT_TEMPLATES) {
    const doctorIndex = pTemplate.docIdSuffix
    const doctor = doctors[doctorIndex]
    if (!doctor) continue

    const existingPatient = await prisma.patient.findFirst({
      where: {
        organizationId: ORG_ID,
        firstName: pTemplate.firstName,
        lastName: pTemplate.lastName,
      },
    })

    if (existingPatient) {
      console.log(`  ⏭️ ${existingPatient.firstName} ${existingPatient.lastName} already exists`)
      patientsByDoctor[doctor.id].push({
        id: existingPatient.id,
        firstName: existingPatient.firstName,
        lastName: existingPatient.lastName,
      })
      continue
    }

    const patient = await prisma.patient.create({
      data: {
        organizationId: ORG_ID,
        firstName: pTemplate.firstName,
        lastName: pTemplate.lastName,
        email: `${pTemplate.firstName.toLowerCase()}.${pTemplate.lastName.toLowerCase()}@example.com`,
        phone: `+52 55 ${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        dateOfBirth: new Date(pTemplate.dob),
        gender: pTemplate.gender,
        bloodType: pTemplate.bloodType,
        documentType: DocumentType.DNI,
        documentId: `${randomInt(10000000, 99999999)}`,
        isChronic: pTemplate.isChronic,
        allergies: pTemplate.allergies,
      },
    })

    patientsByDoctor[doctor.id].push({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
    })
    console.log(`  ✅ ${patient.firstName} ${patient.lastName} (${doctor.firstName})`)
  }

  // --- Step 5: Create appointments in May 2026 ---
  console.log('\n📅 Step 5: Creating appointments (May 2026)...')
  for (const doctor of doctors) {
    const patients = patientsByDoctor[doctor.id]
    const primarySpecialtyId = doctor.specialtyIds[0]

    for (let i = 0; i < Math.min(5, patients.length); i++) {
      const patient = patients[i]

      const existingAppt = await prisma.appointment.findFirst({
        where: {
          userId: doctor.id,
          patientId: patient.id,
          scheduledAt: new Date(MAY_2026_DATES[i]),
        },
      })

      if (existingAppt) {
        console.log(`  ⏭️ Appointment already exists for ${patient.firstName}`)
        continue
      }

      await prisma.appointment.create({
        data: {
          organizationId: ORG_ID,
          patientId: patient.id,
          userId: doctor.id,
          specialtyId: primarySpecialtyId,
          scheduledAt: new Date(MAY_2026_DATES[i]),
          duration: 30,
          status: AppointmentStatus.SCHEDULED,
          type: 'CONSULTATION',
          mode: AppointmentMode.IN_PERSON,
          reason: 'Consulta de seguimiento',
        },
      })
      console.log(`  ✅ ${doctor.firstName} -> ${patient.firstName} (${new Date(MAY_2026_DATES[i]).toLocaleDateString('es-MX')})`)
    }
  }

  // --- Step 6: Create medical notes with rotation ---
  console.log('\n📝 Step 6: Creating medical notes with rotation...')
  let totalNotes = 0

  const noteDateStart = new Date('2025-01-01')
  const noteDateEnd = new Date('2026-04-30')

  for (const doctor of doctors) {
    const patients = patientsByDoctor[doctor.id]
    if (patients.length === 0) continue

    console.log(`  Processing patients of ${doctor.firstName} ${doctor.lastName}...`)

    for (const patient of patients) {
      // Determine how many notes (4-10, random)
      const noteCount = randomInt(4, 10)
      const existingCount = await prisma.patientNote.count({
        where: { patientId: patient.id },
      })

      if (existingCount >= noteCount) {
        console.log(`    ⏭️ ${patient.firstName} already has ${existingCount} notes (needed: ${noteCount})`)
        continue
      }

      // Pick which doctors will write notes for this patient
      // Always include the primary doctor + 1-3 others (rotating)
      const otherDoctors = doctors.filter(d => d.id !== doctor.id)
      const otherCount = randomInt(1, Math.min(3, otherDoctors.length))
      const shuffledOthers = shuffleArray(otherDoctors).slice(0, otherCount)
      const noteDoctors = [doctor, ...shuffledOthers]

      // Generate note dates sorted
      const dates: Date[] = []
      for (let i = 0; i < noteCount; i++) {
        dates.push(randomDate(noteDateStart, noteDateEnd))
      }
      dates.sort((a, b) => a.getTime() - b.getTime())

      const notesToCreate = noteCount - existingCount

      for (let i = 0; i < notesToCreate; i++) {
        // Rotate: pick doctor from the pool
        const noteDoctor = noteDoctors[i % noteDoctors.length]
        // Pick specialty from that doctor's specialties
        const noteSpecialtyId = noteDoctor.specialtyIds[i % noteDoctor.specialtyIds.length]
        const noteSpecialtyName = openDocSpecialties.find(s => s.id === noteSpecialtyId)?.nameEn || 'General Medicine'

        // Get templates for this specialty
        const templates = NOTE_TEMPLATES[noteSpecialtyName] || NOTE_TEMPLATES['General Medicine']
        const template = templates[i % templates.length]

        await prisma.patientNote.create({
          data: {
            patientId: patient.id,
            doctorId: noteDoctor.id,
            organizationId: ORG_ID,
            specialtyId: noteSpecialtyId,
            bloodPressure: template.bp,
            heartRate: template.hr,
            temperature: template.temp,
            respRate: template.rr,
            oxygenSat: template.spo2,
            weight: template.weight,
            height: template.height,
            subjective: template.subjective,
            diagnosis: template.diagnosis,
            plan: template.plan,
            isSealed: true,
            sealedAt: dates[i + existingCount],
            createdAt: dates[i + existingCount],
            updatedAt: dates[i + existingCount],
          },
        })

        totalNotes++
        console.log(`    ✅ Note ${i + 1}: ${patient.firstName} by ${noteDoctor.firstName} (${noteSpecialtyName}) - ${dates[i + existingCount].toLocaleDateString('es-MX')}`)
      }
    }
  }

  // --- Summary ---
  console.log('\n📊 ================================')
  console.log('   SEED DATA SUMMARY')
  console.log('================================')
  console.log(`New specialties created: ${NEW_SPECIALTIES.filter(s => !existingNames.has(s.nameEn)).length}`)
  console.log(`Open Doc total specialties: ${openDocSpecialtyIds.length}`)
  console.log(`Total doctors: ${doctors.length}`)
  console.log(`Total patients: ${Object.values(patientsByDoctor).reduce((a, b) => a + b.length, 0)}`)
  console.log(`Total appointments: ${doctors.length * 5}`)
  console.log(`Total notes created: ${totalNotes}`)
  console.log('================================')
  console.log('\n✅ Test data seeding complete!')
  console.log('🔑 All doctor passwords: test-doctor-123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
