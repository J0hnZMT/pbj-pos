// app/components/SettingsPanel.tsx
'use client'

import { useState } from 'react'

// 1. Define the TypeScript structures for your configuration
interface BulkTier {
  minQuantity: number
  pricePerPage: number
}

interface SettingsPanelProps {
  initialSettings: {
    wastageFactor: number
    bulkTiers: BulkTier[]
  }
}

// 2. Apply the interface to the component props
export default function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [wastage, setWastage] = useState(initialSettings.wastageFactor * 100)
  const [tiers, setTiers] = useState<BulkTier[]>(initialSettings.bulkTiers)

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          wastageFactor: wastage / 100, 
          bulkTiers: tiers 
        })
      })

      if (!response.ok) throw new Error('Failed to update settings')
      alert("Settings updated seamlessly!")
    } catch (error) {
      alert("Error saving configurations.")
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Pricing Configuration</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-1">
          Wastage Factor (%)
        </label>
        <p className="text-xs text-gray-500 mb-2">Accounts for paper jams, misprints, and layout scraps.</p>
        <input 
          type="number" 
          value={wastage} 
          onChange={(e) => setWastage(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded w-full text-gray-950 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Wholesale / Bulk Tiers
        </label>
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-1/2">
                <span className="text-xs text-gray-400 block mb-0.5">Min Pages</span>
                <input 
                  type="number" 
                  value={tier.minQuantity} 
                  className="border border-gray-300 bg-gray-50 p-2 rounded w-full text-gray-700 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="w-1/2">
                <span className="text-xs text-gray-400 block mb-0.5">Price / Page ($)</span>
                <input 
                  type="number" 
                  value={tier.pricePerPage} 
                  className="border border-gray-300 bg-gray-50 p-2 rounded w-full text-gray-700 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg w-full transition-colors">
        Save Configurations
      </button>
    </div>
  )
}