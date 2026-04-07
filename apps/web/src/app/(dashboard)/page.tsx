'use client'

import { motion } from 'framer-motion'

export default function TenantDashboard() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-on-surface mb-2">
          Clinic Dashboard
        </h2>
        <p className="text-on-surface-variant">
          Manage your clinic appointments and patients
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container p-6 rounded-xl border border-outline-variant"
        >
          <div className="text-4xl font-bold text-primary mb-2">0</div>
          <div className="text-on-surface-variant">Today&apos;s Appointments</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container p-6 rounded-xl border border-outline-variant"
        >
          <div className="text-4xl font-bold text-primary mb-2">0</div>
          <div className="text-on-surface-variant">Total Patients</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container p-6 rounded-xl border border-outline-variant"
        >
          <div className="text-4xl font-bold text-primary mb-2">0</div>
          <div className="text-on-surface-variant">This Week</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface-container p-6 rounded-xl border border-outline-variant"
      >
        <h3 className="text-xl font-semibold text-on-surface mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-primary/10 rounded-lg text-primary font-medium hover:bg-primary/20 transition">
            New Appointment
          </button>
          <button className="p-4 bg-primary/10 rounded-lg text-primary font-medium hover:bg-primary/20 transition">
            Add Patient
          </button>
          <button className="p-4 bg-primary/10 rounded-lg text-primary font-medium hover:bg-primary/20 transition">
            View Schedule
          </button>
          <button className="p-4 bg-primary/10 rounded-lg text-primary font-medium hover:bg-primary/20 transition">
            Settings
          </button>
        </div>
      </motion.div>
    </div>
  )
}
