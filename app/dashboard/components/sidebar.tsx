'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    FaHome,
    FaBox,
    FaShoppingCart,
    FaUsers,
    FaSignOutAlt,
    FaBars
} from 'react-icons/fa'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarItem {
    icon: React.ReactNode
    text: string
    path: string
}

const sidebarItems: SidebarItem[] = [
    { icon: <FaHome size={20} />, text: 'Dashboard', path: '/dashboard' },
    { icon: <FaBox size={20} />, text: 'Produk', path: '/dashboard/products' },
    { icon: <FaShoppingCart size={20} />, text: 'Transaksi', path: '/dashboard/transaction' }
]

interface SidebarProps {
    onLogout: () => Promise<void>
    isMobileMenuOpen?: boolean
    onMobileMenuClose?: () => void
}

export default function Sidebar({ onLogout, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const pathname = usePathname()

    // Handle mobile menu close when clicking menu items
    const handleMenuClick = () => {
        if (onMobileMenuClose) {
            onMobileMenuClose()
        }
    }

    // Force expand sidebar on mobile when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsCollapsed(false)
        }
    }, [isMobileMenuOpen])

    return (
        <div className={`
            bg-gradient-to-b from-gray-900 to-gray-800 
            text-white transition-all duration-300 ease-in-out shadow-lg 
            ${isCollapsed ? 'w-20' : 'w-72'} 
            h-screen flex flex-col
            md:relative
        `}>
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                    <Image
                        src="/images/logo-toko.jpeg"
                        width={40}
                        height={40}
                        alt="Logo"
                        priority
                        className="rounded-full border-2 border-blue-500"
                    />
                    {!isCollapsed && (
                        <span className="font-semibold text-lg tracking-wide">Toko Alinaldi</span>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-full hover:bg-gray-700/50 transition-colors hidden md:block"
                >
                    <FaBars className="text-gray-300" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 space-y-2">
            {sidebarItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.path}
                        onClick={handleMenuClick}
                        className={`flex items-center space-x-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 ${
                            pathname === item.path
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                        }`}
                    >
                        <div className="flex-shrink-0">{item.icon}</div>
                        {!isCollapsed && (
                            <span className="text-sm font-medium">{item.text}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-5 border-t border-gray-700/50">
                <button
                    onClick={onLogout}
                    className={`flex items-center space-x-3 px-3 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 ${
                        isCollapsed ? 'justify-center' : ''
                    }`}
                >
                    <FaSignOutAlt size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </div>
    )
}