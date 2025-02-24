'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import Image from 'next/image'

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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/dashboard/product')
            const result = await response.json()
            setProducts(Array.isArray(result.data) ? result.data : [])
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    // Filter produk berdasarkan query pencarian
    const filteredProducts = products.filter((product) =>
        product.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="">
            {/* Header dengan gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 mb-8 shadow-lg">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Daftar Produk</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-md"
                    >
                        <FaPlus className="text-sm" />
                        Tambah Produk
                    </button>
                </div>
            </div>

            {/* Search Bar yang lebih modern */}
            <div className="relative mb-8">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md bg-white"
                />
            </div>
        
            {/* Products Grid dengan card yang lebih menarik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Tidak ada produk ditemukan
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="w-full h-32">  {/* Div pembungkus untuk mengontrol ukuran */}
                                <div className="relative h-32 overflow-hidden">
                                    <Image
                                        src={product.gambar_url}
                                        alt={product.nama}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                        priority={false}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors">
                                            <FaEdit className="text-blue-600" />
                                        </button>
                                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                                            <FaTrash className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">{product.nama}</h3>
                                <div className="space-y-2 text-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Kode</span>
                                        <span className="font-medium">{product.kode_produk}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Harga</span>
                                        <span className="font-medium text-green-600">Rp {product.harga.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Stok</span>
                                        <span className={`font-medium ${product.stok < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {product.stok} unit
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Kadaluarsa</span>
                                        <span className="font-medium">{new Date(product.tanggal_kadaluarsa).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}