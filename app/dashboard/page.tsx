'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaBarcode, FaShoppingCart, FaTrash } from 'react-icons/fa'
import dynamic from 'next/dynamic'

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

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Contoh kategori (nanti bisa diambil dari API)
    const categories = ['Semua Produk', 'Favorit', 'Baru', 'Makanan', 'Minuman', 'Snack']

    const [products, setProducts] = useState<Product[]>([])

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
                {/* Search Bar & Barcode */}
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

                {/* Kategori */}
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

                {/* Grid Produk */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow p-3">
                            <img
                                src={product.gambar_url}
                                alt={product.nama}
                                className="w-full h-40 object-cover rounded-lg mb-2"
                            />
                            <h3 className="font-semibold">{product.nama}</h3>
                            <p className="text-blue-600">Rp {product.harga.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kolom Kanan - Cart */}
            <div className="w-1/3 bg-white shadow-lg rounded-xl p-6 border border-gray-100 sticky top-4">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                    <FaShoppingCart className="text-blue-600 text-xl" />
                    <h2 className="font-bold text-lg text-gray-800">Keranjang Belanja</h2>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 italic">Keranjang masih kosong</p>
                        <p className="text-sm text-gray-400 mt-2">Tambahkan produk untuk memulai</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Contoh item cart */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                <div>
                                    <p className="font-medium text-gray-800">Nama Produk</p>
                                    <p className="text-sm text-gray-600">Rp 100.000</p>
                                </div>
                            </div>
                            <button className="text-red-500 hover:text-red-700">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                )}

                {/* Total dan tombol konfirmasi - Selalu muncul */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-medium text-gray-700">Total:</p>
                        <p className="font-bold text-lg text-gray-900">
                            Rp {cart.length === 0 ? '0' : '100.000'}
                        </p>
                    </div>
                    <button
                        className={`w-full py-2.5 rounded-lg transition-colors duration-200 font-medium
                ${cart.length === 0
                                ? 'bg-blue-300 cursor-not-allowed text-gray-100'
                                : 'bg-blue-800 hover:bg-blue-900 text-white'}`}
                        disabled={cart.length === 0}
                    >
                        Konfirmasi Pembayaran
                    </button>
                </div>
            </div>
        </div>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), {
    ssr: false
})