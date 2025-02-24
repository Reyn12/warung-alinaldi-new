// page.tsx
'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaBarcode } from 'react-icons/fa'
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

    const removeFromCart = (id: number) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id))
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/dashboard/product')
                const result = await response.json()
                if (result.status === 'success') {
                    setProducts(result.data)
                } else {
                    throw new Error(result.message)
                }
            } catch (err) {
                console.error('Error fetching products:', err)
            }
        }
        fetchProducts()
    }, [])

    if (!isClient) {
        return <div>Loading...</div>
    }

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
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow p-3">
                            <img
                                src={product.gambar_url}
                                alt={product.nama}
                                className="w-full h-40 object-cover rounded-lg mb-2"
                            />
                            <h3 className="font-semibold">{product.nama}</h3>
                            <p className="text-blue-600 mb-2">Rp {product.harga.toLocaleString()}</p>
                            <button
                                onClick={() => addToCart(product)}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Tambah ke Keranjang
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Komponen Cart */}
            <Cart cart={cart} removeFromCart={removeFromCart} />
        </div>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), {
    ssr: false
})