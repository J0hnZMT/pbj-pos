// app/inventory/page.tsx
'use client'

import React, { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  type: 'RETAIL' | 'RAW_MATERIAL'
  stock: number
  baseCost: number
  retailPrice: number | null
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'RETAIL' | 'RAW_MATERIAL'>('ALL')

  // Fetch data from the API route we created earlier
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('Failed to load inventory')
        const data = await res.json()
        setProducts(data)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'ALL' || product.type === filterType
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600 animate-pulse">Loading inventory...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md text-center shadow-sm">
          <p className="font-bold">Error Connection</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage printing raw materials and school supplies.
            </p>
          </div>
        </div>

        {/* Search and Filters (Optimized for touch targets on tablets) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-base text-gray-900"
          />
          <div className="flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm h-12">
            {(['ALL', 'RETAIL', 'RAW_MATERIAL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filterType === type 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type === 'ALL' ? 'All' : type === 'RETAIL' ? 'Retail Supplies' : 'Raw Materials'}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Inventory Table / Card Grid */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          
          {/* Table view for Tablets and Desktops */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.type === 'RETAIL' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {product.type === 'RETAIL' ? 'Retail' : 'Raw Material'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{product.stock} units</span>
                        {product.stock <= 5 && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 animate-pulse">
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.baseCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {product.retailPrice ? `$${product.retailPrice.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No products match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card list view optimized for Mobile / Small Tablet screens */}
          <div className="block md:hidden divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      product.type === 'RETAIL' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {product.type === 'RETAIL' ? 'Retail' : 'Raw'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {product.retailPrice ? `$${product.retailPrice.toFixed(2)}` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">Cost: ${product.baseCost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">Available Stock:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">{product.stock} units</span>
                    {product.stock <= 5 && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-800">LOW</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">No products match your search.</div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}