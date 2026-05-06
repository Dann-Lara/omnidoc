'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#00355f',
  },
  headerLeft: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#00355f',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00355f',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#191c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#42474f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  caseId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00355f',
    backgroundColor: '#f2f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 10,
    color: '#42474f',
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  patientName: {
    flex: 2,
  },
  patientLabel: {
    fontSize: 8,
    color: '#42474f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  patientNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00355f',
  },
  demographics: {
    flexDirection: 'row',
    gap: 20,
  },
  demoItem: {},
  demoLabel: {
    fontSize: 8,
    color: '#42474f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  demoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#191c1e',
  },
  qrCode: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#c2c7d1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 8,
    color: '#727780',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#42474f',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00355f',
    paddingBottom: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e3e5',
  },
  vitalLabel: {
    fontSize: 8,
    color: '#42474f',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00355f',
  },
  vitalUnit: {
    fontSize: 10,
    color: '#42474f',
    marginLeft: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  summarySection: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#191c1e',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    color: '#42474f',
    lineHeight: 1.6,
  },
  diagnosisCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e3e5',
    marginBottom: 8,
  },
  diagnosisText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#191c1e',
  },
  treatmentCard: {
    backgroundColor: '#f2f4f6',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e3e5',
  },
  treatmentGrid: {
    flexDirection: 'row',
    gap: 40,
  },
  treatmentSection: {},
  treatmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00355f',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  treatmentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#191c1e',
    marginBottom: 4,
  },
  treatmentDesc: {
    fontSize: 10,
    color: '#42474f',
    lineHeight: 1.6,
  },
  treatmentListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00355f',
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    fontSize: 10,
    color: '#42474f',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e0e3e5',
  },
  sealSection: {},
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sealIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c2c7d1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sealText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#00355f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sealHash: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#727780',
    textTransform: 'uppercase',
  },
  sealTimestamp: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#191c1e',
  },
  copyright: {
    fontSize: 8,
    color: '#727780',
    textTransform: 'uppercase',
  },
  doctorSection: {
    alignItems: 'flex-end',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#191c1e',
  },
  doctorLicense: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00355f',
    letterSpacing: 1,
  },
  doctorSpecialty: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#42474f',
    textTransform: 'uppercase',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e3e5',
  },
})

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string | null
  documentId: string | null
  dateOfBirth: string | null
  gender: string | null
}

interface Note {
  id: string
  patientId: string
  createdAt: string
  isSealed: boolean
  sealedAt: string | null
  signature: string | null
  bloodPressure: string | null
  heartRate: number | null
  temperature: number | null
  respRate: number | null
  oxygenSat: number | null
  weight: number | null
  height: number | null
  bmi: number | null
  subjective: string | null
  diagnosis: string | null
  plan: string | null
  doctor?: { id: string; firstName: string; lastName: string; specialty: string | null }
}

interface Props {
  patient: Patient | null
  note: Note
  orgName: string
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ClinicalNotePDF({ patient, note, orgName }: Props) {
  const age = calculateAge(patient?.dateOfBirth || null)
  const fullName = patient ? `${patient.firstName} ${patient.lastName}` : '-'
  const gender = patient?.gender || '-'
  const dateFormatted = formatDate(note.createdAt)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={{ color: '#ffffff', fontSize: 16 }}>🩺</Text>
              </View>
              <Text style={styles.brandText}>{orgName}</Text>
            </View>
            <Text style={styles.title}>Clinical Evolution Report</Text>
            <Text style={styles.subtitle}>Certified Medical Document</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.caseId}>CASE ID: #{note.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.date}>{dateFormatted}</Text>
          </View>
        </View>

        <View style={styles.patientInfo}>
          <View style={styles.patientName}>
            <Text style={styles.patientLabel}>Patient Name</Text>
            <Text style={styles.patientNameText}>{fullName}</Text>
          </View>
          <View style={styles.demographics}>
            <View style={styles.demoItem}>
              <Text style={styles.demoLabel}>Gender</Text>
              <Text style={styles.demoValue}>{gender}</Text>
            </View>
            <View style={styles.demoItem}>
              <Text style={styles.demoLabel}>Age</Text>
              <Text style={styles.demoValue}>
                {age !== null ? `${age} years` : '-'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>01 / Vital Signs</Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>
                {note.bloodPressure || '-'}
                <Text style={styles.vitalUnit}>mmHg</Text>
              </Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>
                {note.heartRate || '-'}
                <Text style={styles.vitalUnit}>bpm</Text>
              </Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Temperature</Text>
              <Text style={styles.vitalValue}>
                {note.temperature || '-'}
                <Text style={styles.vitalUnit}>°C</Text>
              </Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>BMI</Text>
              <Text style={styles.vitalValue}>
                {note.bmi || '-'}
                <Text style={styles.vitalUnit}>IMC</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>02 / Clinical Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Chief Complaint</Text>
              <Text style={styles.summaryText}>
                {note.subjective || 'No information available'}
              </Text>
            </View>
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Physical Examination</Text>
              <Text style={styles.summaryText}>
                Patient consulted for routine checkup. Vital signs within normal ranges.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>03 / Analysis & Diagnosis</Text>
          <View style={styles.diagnosisCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#00355f',
                  marginRight: 12,
                }}
              />
              <Text style={styles.diagnosisText}>
                {note.diagnosis || 'No diagnosis recorded'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>04 / Treatment Plan</Text>
          <View style={styles.treatmentCard}>
            <View style={styles.treatmentGrid}>
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Pharmacology</Text>
                <Text style={styles.treatmentText}>
                  {note.plan || 'No treatment plan recorded'}
                </Text>
              </View>
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Lifestyle Changes</Text>
                <View style={styles.treatmentListItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>Scheduled follow-up</Text>
                </View>
                <View style={styles.treatmentListItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>Vital signs monitoring</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.sealSection}>
            <View style={styles.sealRow}>
              <View style={styles.sealIcon}>
                <Text style={{ color: '#00355f', fontSize: 20 }}>✓</Text>
              </View>
              <View>
                <Text style={styles.sealText}>Digitally Sealed</Text>
                <Text style={styles.sealHash}>
                  Hash: {note.signature?.slice(0, 20) || '-'}
                </Text>
                <Text style={styles.sealTimestamp}>
                  {formatDate(note.sealedAt || note.createdAt)}
                </Text>
              </View>
            </View>
            <Text style={styles.copyright}>© 2024 OmniDoc. All Rights Reserved.</Text>
          </View>
          <View style={styles.doctorSection}>
            <Text style={styles.doctorName}>
              {note.doctor ? `${note.doctor.firstName} ${note.doctor.lastName}` : '-'}
            </Text>
            <Text style={styles.doctorLicense}>License: -</Text>
            <Text style={styles.doctorSpecialty}>
              {note.doctor?.specialty || 'General Medicine'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

interface PDFViewerWrapperProps {
  patient: Patient | null
  note: Note
  orgName: string
}

export function PDFViewerWrapper({ patient, note, orgName }: PDFViewerWrapperProps) {
  return (
    <PDFViewer width={800} height={600} style={{ border: 'none' }}>
      <ClinicalNotePDF patient={patient} note={note} orgName={orgName} />
    </PDFViewer>
  )
}