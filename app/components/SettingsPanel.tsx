import { useState } from 'react';

export default function SettingsPanel({ initialSettings }) {
  const [wastage, setWastage] = useState(initialSettings.wastageFactor * 100);
  const [tiers, setTiers] = useState(initialSettings.bulkTiers);

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ 
        wastageFactor: wastage / 100, 
        bulkTiers: tiers 
      })
    });
    alert("Settings updated seamlessly!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Pricing Configuration</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Wastage Factor (%)
        </label>
        <p className="text-sm text-gray-500 mb-2">Accounts for jams and misprints.</p>
        <input 
          type="number" 
          value={wastage} 
          onChange={(e) => setWastage(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Wholesale/Bulk Tiers
        </label>
        {tiers.map((tier, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <input 
              type="number" 
              placeholder="Min Pages" 
              value={tier.minQuantity} 
              className="border p-2 rounded w-1/2"
              readOnly
            />
            <input 
              type="number" 
              placeholder="Price/Page ($)" 
              value={tier.pricePerPage} 
              className="border p-2 rounded w-1/2"
              readOnly
            />
          </div>
        ))}
        {/* Button to add new tiers would go here */}
      </div>

      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Save Configurations
      </button>
    </div>
  );
}