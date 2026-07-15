// app/dashboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [report, setReport] = useState({ revenue: 0, expenses: 0, profit: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetches your reports from the database API
    fetch('/api/reports?range=this_month')
      .then((res) => res.json())
      .then((data) => {
        setReport(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback placeholder data if API isn't built yet
        setReport({ revenue: 1240.50, expenses: 450.20, profit: 790.30 })
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Dashboard</h1>
        
        {loading ? (
          <p className="text-gray-500">Loading your reports...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 p-6 rounded-lg shadow-sm border border-green-200">
              <h3 className="text-green-800 text-lg font-semibold">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-900">${report.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-6 rounded-lg shadow-sm border border-red-200">
              <h3 className="text-red-800 text-lg font-semibold">Cost of Goods (Expenses)</h3>
              <p className="text-3xl font-bold text-red-900">${report.expenses.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
              <h3 className="text-blue-800 text-lg font-semibold">Gross Profit</h3>
              <p className="text-3xl font-bold text-blue-900">${report.profit.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}