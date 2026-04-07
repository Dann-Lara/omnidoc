'use client'

import { motion } from 'framer-motion'

export default function SaaSDashboard() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-on-surface mb-2">
          Superadmin Dashboard
        </h2>
        <p className="text-on-surface-variant">
          Manage all organizations and system settings
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
          <div className="text-on-surface-variant">Total Organizations</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container p-6 rounded-xl border border-outline-variant"
        >
          <div className="text-4xl font-bold text-primary mb-2">0</div>
          <div className="text-on-surface-variant">Active Users</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container p-6 rounded-xl border border-outline-variant"
        >
          <div className="text-4xl font-bold text-primary mb-2">$0</div>
          <div className="text-on-surface-variant">Monthly Revenue</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface-container p-6 rounded-xl border border-outline-variant"
      >
        <h3 className="text-xl font-semibold text-on-surface mb-4">Recent Activity</h3>
        <p className="text-on-surface-variant">No recent activity</p>
      </motion.div>
    </div>
  )
}
