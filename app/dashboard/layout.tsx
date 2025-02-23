'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa'

interface SidebarItem {
  icon: React.ReactNode
  text: string
  path: string
}

const sidebarItems: SidebarItem[] = [
  { icon: <FaHome size={20} />, text: 'Dashboard', path: '/dashboard' },
  { icon: <FaBox size={20} />, text: 'Produk', path: '/dashboard/products' },
  { icon: <FaShoppingCart size={20} />, text: 'Transaksi', path: '/dashboard/transactions' },
  { icon: <FaUsers size={20} />, text: 'Pelanggan', path: '/dashboard/customers' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/logo-toko.jpeg"
              width={40}
              height={40}
              alt="Logo"
              className="rounded-full"
            />
            {!isCollapsed && <span className="font-bold">Warung Alinaldi</span>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <FaBars />
          </button>
        </div>

        <nav className="mt-8">
          {sidebarItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center space-x-4 px-6 py-3 hover:bg-gray-700 transition-colors"
            >
              <div>{item.icon}</div>
              {!isCollapsed && <span>{item.text}</span>}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-4 text-red-400 hover:text-red-300 transition-colors w-full ${
              isCollapsed ? 'justify-center' : 'px-2'
            }`}
          >
            <FaSignOutAlt size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}