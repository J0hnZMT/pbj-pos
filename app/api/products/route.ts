// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Double-check if your import alias is "@/" or "../../lib/prisma"

// 1. GET: Fetch all products from your inventory
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc', // Sort alphabetically
      },
    })
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Database Fetch Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory products' },
      { status: 500 }
    )
  }
}

// 2. POST: Add a new product or raw material to your database
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, stock, baseCost, retailPrice } = body

    // Simple validation
    if (!name || !type || baseCost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (name, type, baseCost)' },
        { status: 400 }
      )
    }

    if (type !== 'RETAIL' && type !== 'RAW_MATERIAL') {
      return NextResponse.json(
        { error: 'Type must be either RETAIL or RAW_MATERIAL' },
        { status: 400 }
      )
    }

    // Save the product using Prisma
    const newProduct = await prisma.product.create({
      data: {
        name,
        type,
        stock: Number(stock) || 0,
        baseCost: Number(baseCost),
        // Raw materials might not have a retail price, only retail items do
        retailPrice: type === 'RETAIL' ? Number(retailPrice) : null,
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Database Insert Error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}