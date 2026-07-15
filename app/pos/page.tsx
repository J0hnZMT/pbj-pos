// app/pos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'

// Types
interface Product {
  id: string
  name: string
  type: 'RETAIL' | 'RAW_MATERIAL'
  stock: number
  baseCost: number
  retailPrice: number | null
}

interface CartItem {
  id: string
  name: string
  type: 'RETAIL' | 'PRINT_JOB'
  quantity: number        // For retail, this is item count. For print, this is number of pages.
  costPrice: number       // True cost calculated with wastage factor
  sellingPrice: number    // Final price charged to customer
}

export default function PosCheckoutPage() {
  // Mock Data / Initial states for testing before DB sync
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Ballpoint Pen (Blue)', type: 'RETAIL', stock: 45, baseCost: 0.20, retailPrice: 0.50 },
    { id: '2', name: 'Spiral Notebook A5', type: 'RETAIL', stock: 12, baseCost: 0.80, retailPrice: 1.50 },
    { id: '3', name: 'A4 Bond Paper (Raw)', type: 'RAW_MATERIAL', stock: 5000, baseCost: 0.02, retailPrice: null },
  ])

  // Configurable parameters from your admin settings panel
  const [config, setConfig] = useState({
    wastageFactor: 0.05, // 5% default wastage
    bulkTiers: [
      { minQuantity: 100, pricePerPage: 0.04 },
      { minQuantity: 11, pricePerPage: 0.07 },
      { minQuantity: 1, pricePerPage: 0.10 },
    ]
  })

  const [cart, setCart] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState<'RETAIL' | 'PRINT'>('RETAIL')
  
  // Custom Print Job Form State
  const [printPages, setPrintPages] = useState<number>(1)
  const [selectedPaper, setSelectedPaper] = useState<string>('3') // Default to A4 Bond Paper ID
  const [inkCostFactor, setInkCostFactor] = useState<number>(0.01) // Estimated ink cost per page

  // --- Core Calculation Logic ---
  
  // Adds standard retail items instantly when tapped
  const handleAddRetailToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`${product.name} is out of stock!`)
      return
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          type: 'RETAIL',
          quantity: 1,
          costPrice: product.baseCost,
          sellingPrice: product.retailPrice || 0,
        },
      ]
    })
  }

  // Calculates variable print pricing and adds it to the cart
  const handleAddPrintJobToCart = () => {
    const paperProduct = products.find(p => p.id === selectedPaper)
    if (!paperProduct) return

    // 1. Cost with wastage factor formula: (Paper Cost + Ink Cost) * (1 + Wastage)
    const rawCostPerPage = paperProduct.baseCost + inkCostFactor
    const actualCostTotal = (rawCostPerPage * printPages) * (1 + config.wastageFactor)

    // 2. Find wholesale tier pricing dynamically based on number of pages
    const sortedTiers = [...config.bulkTiers].sort((a, b) => b.minQuantity - a.minQuantity)
    let appliedPricePerPage = sortedTiers[sortedTiers.length - 1].pricePerPage // fallback lowest

    for (const tier of sortedTiers) {
      if (printPages >= tier.minQuantity) {
        appliedPricePerPage = tier.pricePerPage
        break
      }
    }

    const finalSellingPriceTotal = printPages * appliedPricePerPage

    const printItem: CartItem = {
      id: `print-${Date.now()}`, // unique dynamic ID
      name: `Custom Print (${printPages} pgs)`,
      type: 'PRINT_JOB',
      quantity: printPages,
      costPrice: actualCostTotal / printPages, // stored unit cost
      sellingPrice: finalSellingPriceTotal / printPages, // stored unit selling price
    }

    setCart((prev) => [...prev, printItem])
    setPrintPages(1) // reset page counter
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Order Summary Values
  const totalBill = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)
  const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
  const projectedProfit = totalBill - totalCost

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!')

    // Payload ready to be transmitted to your backend /api/sales route
    const transactionData = {
      totalAmount: totalBill,
      totalCost: totalCost,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pricePaid: item.sellingPrice
      }))
    }

    alert(`Receipt Printed Successfully!\nTotal: $${totalBill.toFixed(2)}\nProjected Profit: $${projectedProfit.toFixed(2)}`)
    setCart([]) // Clear screen for next transaction
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* LEFT COLUMN: Product Selector (Takes 3/5 width on tablet) */}
      <div className="flex-1 md:w-3/5 p-4 flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
        
        {/* Module Switcher Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 h-14 shrink-0">
          <button
            onClick={() => setActiveTab('RETAIL')}
            className={`flex-1 font-bold rounded-lg transition-all text-base ${
              activeTab === 'RETAIL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            🛒 School Supplies Retail
          </button>
          <button
            onClick={() => setActiveTab('PRINT')}
            className={`flex-1 font-bold rounded-lg transition-all text-base ${
              activeTab === 'PRINT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            🖨️ Custom Print Calculator
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'RETAIL' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products
                .filter((p) => p.type === 'RETAIL')
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddRetailToCart(product)}
                    className="flex flex-col justify-between items-start p-4 bg-gray-50 border border-gray-200 rounded-xl active:scale-95 transition-transform text-left h-28"
                  >
                    <span className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</span>
                    <div className="w-full flex justify-between items-end mt-2">
                      <span className="text-gray-500 text-xs">Stock: {product.stock}</span>
                      <span className="text-blue-600 font-bold text-base">${product.retailPrice?.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 max-w-lg mx-auto w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Calculate Print Production</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Base Paper Stock</label>
                  <select 
                    value={selectedPaper}
                    onChange={(e) => setSelectedPaper(e.target.value)}
                    className="w-full h-12 bg-white border border-gray-300 rounded-lg px-3 text-gray-900"
                  >
                    {products.filter(p => p.type === 'RAW_MATERIAL').map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.baseCost}/sheet base)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Pages / Prints</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setPrintPages(prev => Math.max(1, prev - 10))}
                      className="w-12 h-12 bg-gray-200 rounded-lg text-xl font-bold active:bg-gray-300 text-gray-800"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={printPages}
                      onChange={(e) => setPrintPages(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-12 text-center border border-gray-300 rounded-lg text-lg font-bold text-gray-900"
                    />
                    <button 
                      type="button"
                      onClick={() => setPrintPages(prev => prev + 10)}
                      className="w-12 h-12 bg-gray-200 rounded-lg text-xl font-bold active:bg-gray-300 text-gray-800"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-500 space-y-1">
                  <p>⚙️ Configured Wastage Safeguard: <span className="font-semibold text-gray-700">+{config.wastageFactor * 100}%</span></p>
                  <p>📈 Current Tier Rate Applied: <span className="font-semibold text-blue-600">
                    ${([...config.bulkTiers].sort((a,b)=>b.minQuantity-a.minQuantity).find(t => printPages >= t.minQuantity)?.pricePerPage || 0.10).toFixed(2)}/page
                  </span></p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPrintJobToCart}
                  className="w-full h-14 bg-blue-600 text-white font-bold rounded-xl active:bg-blue-700 shadow-md transition-colors"
                >
                  Add Print Order to Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart Summary (Takes 2/5 width on tablet) */}
      <div className="md:w-2/5 w-full bg-gray-900 text-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-black tracking-wide">CURRENT TRANSACTION</h2>
          <span className="bg-gray-800 text-xs px-3 py-1 rounded-full font-medium text-gray-400">
            {cart.length} items
          </span>
        </div>

        {/* Cart Item Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
              <div className="max-w-[70%]">
                <p className="font-semibold text-sm truncate text-white">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} units × ${(item.sellingPrice).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-green-400">
                  ${(item.sellingPrice * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-gray-500 hover:text-red-400 active:scale-90 text-sm p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
              <span className="text-4xl mb-2">📥</span>
              <p className="text-sm">Cart is empty.</p>
              <p className="text-xs text-gray-600 mt-1">Tap items on the left side to begin.</p>
            </div>
          )}
        </div>

        {/* Calculations Block & Call to Action */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 shrink-0 space-y-4">
          <div className="space-y-1.5 text-sm border-b border-gray-800 pb-3">
            <div className="flex justify-between text-gray-400">
              <span>Production Cost Estimate</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Net Profit Margin</span>
              <span className="text-green-500 font-medium">+${projectedProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-base text-gray-400 font-medium">Amount Due</span>
            <span className="text-3xl font-black text-white">${totalBill.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full h-16 rounded-xl font-black text-lg shadow-lg tracking-wider transition-all transform active:scale-[0.99] ${
              cart.length === 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white active:bg-green-700'
            }`}
          >
            COMPLETE TRANSACTION
          </button>
        </div>

      </div>
    </main>
  )
}