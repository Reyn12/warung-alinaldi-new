'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaBarcode } from 'react-icons/fa'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Cart from './components/cart/Cart'

// Interface untuk tipe produk
interface Product {
    id: number
    kategori_id: number
    nama: string
    harga: number
    stok: number
    gambar_url: string
    tanggal_kadaluarsa: string
    created_at: string
    kode_produk: number
}

// Interface untuk item di cart
interface CartItem extends Product {
    quantity: number
}

const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isClient, setIsClient] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true) // State untuk loading

    useEffect(() => {
        setIsClient(true)
    }, [])

    const categories = ['Semua Produk', 'Favorit', 'Baru', 'Makanan', 'Minuman', 'Snack']

    const addToCart = (product: Product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id)
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...currentCart, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(id)
            return
        }
        setCart(currentCart => currentCart.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ))
    }

    const removeFromCart = (id: number) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id))
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true) // Mulai loading
                const response = await fetch('/api/dashboard/product')
                const result = await response.json()
                if (result.status === 'success') {
                    setProducts(result.data)
                } else {
                    throw new Error(result.message)
                }
            } catch (err) {
                console.error('Error fetching products:', err)
            } finally {
                setIsLoading(false) // Selesai loading
            }
        }
        fetchProducts()
    }, [])

    if (!isClient) {
        return <div>Loading...</div>
    }

    // Komponen Skeleton
    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow p-3 animate-pulse">
            <div className="w-full h-40 bg-gray-300 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
    )

    return (
        <div className="flex gap-4 p-4">
            {/* Kolom Kiri */}
            <div className="w-2/3">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="w-full px-4 py-2 rounded-lg border"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button className="p-2 bg-blue-500 text-white rounded-lg">
                        <FaBarcode size={24} />
                    </button>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 bg-gray-100 rounded-full whitespace-nowrap hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                        // Tampilkan skeleton saat loading
                        Array.from({ length: 8 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))
                    ) : (
                        // Tampilkan produk saat data sudah dimuat
                        products.map((product) => {
                            const cartItem = cart.find(item => item.id === product.id)
                            const quantity = cartItem ? cartItem.quantity : 0

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ x: -50 }} // Mulai dari kiri (50px ke kiri dari posisi normal)
                                    animate={{ x: 0 }}   // Bergerak ke posisi normal
                                    whileHover={{ scale: 1.03 }} // Hover tetap sama
                                    transition={{ duration: 0.2 }} // Durasi animasi tetap
                                    className="bg-white rounded-lg shadow p-3"
                                >
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                        src={product.gambar_url}
                                        alt={product.nama}
                                        className="w-full h-40 object-cover rounded-lg mb-2"
                                    />
                                    <h3 className="font-semibold">{product.nama}</h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-blue-600">Rp {product.harga.toLocaleString()}</p>
                                        {quantity > 0 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                                    disabled={quantity <= 0}
                                                    className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center hover:bg-red-500 disabled:opacity-50 disabled:bg-gray-200"
                                                >
                                                    <FiMinus className="text-white text-sm" />
                                                </button>
                                                <span className="text-sm font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                                    className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-500"
                                                >
                                                    <FiPlus className="text-white text-sm" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Tambah ke Keranjang
                                    </button>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Komponen Cart */}
            <Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
        </div>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), {
    ssr: false
})