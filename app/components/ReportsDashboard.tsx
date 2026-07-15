import { useEffect, useState } from 'react';

export default function ReportsDashboard() {
  const [report, setReport] = useState({ revenue: 0, expenses: 0, profit: 0 });

  useEffect(() => {
    // Fetch aggregated data from your backend API
    fetch('/api/reports?range=this_month')
      .then(res => res.json())
      .then(data => setReport(data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="bg-green-100 p-6 rounded-lg shadow">
        <h3 className="text-green-800 text-lg font-bold">Total Revenue</h3>
        <p className="text-3xl">${report.revenue.toFixed(2)}</p>
      </div>
      <div className="bg-red-100 p-6 rounded-lg shadow">
        <h3 className="text-red-800 text-lg font-bold">Cost of Goods (Expenses)</h3>
        <p className="text-3xl">${report.expenses.toFixed(2)}</p>
      </div>
      <div className="bg-blue-100 p-6 rounded-lg shadow">
        <h3 className="text-blue-800 text-lg font-bold">Gross Profit</h3>
        <p className="text-3xl">${report.profit.toFixed(2)}</p>
      </div>
    </div>
  );
}