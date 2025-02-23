'use client'

import { useState, useEffect } from 'react'
import { FaBox, FaShoppingCart, FaUsers, FaMoneyBillWave } from 'react-icons/fa'

interface DashboardCard {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    transactions: 0,
    customers: 0,
    revenue: 0
  })

  // Nanti di sini bisa fetch data stats dari API
  useEffect(() => {
    // Contoh data dummy
    setStats({
      products: 150,
      transactions: 1240,
      customers: 364,
      revenue: 15000000
    })
  }, [])

  const cards: DashboardCard[] = [
    {
      title: 'Total Produk',
      value: stats.products,
      icon: <FaBox size={24} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Transaksi',
      value: stats.transactions,
      icon: <FaShoppingCart size={24} />,
      color: 'bg-green-500'
    },
    {
      title: 'Total Pelanggan',
      value: stats.customers,
      icon: <FaUsers size={24} />,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Pendapatan',
      value: stats.revenue,
      icon: <FaMoneyBillWave size={24} />,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-6 text-white`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">{card.title}</p>
                <p className="text-2xl font-bold mt-2">
                  {card.title.includes('Pendapatan')
                    ? `Rp ${card.value.toLocaleString()}`
                    : card.value.toLocaleString()}
                </p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}