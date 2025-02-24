'use client'
import { useState, useEffect } from 'react'
import { FaSearch, FaBarcode, FaChevronLeft, FaChevronRight, FaBoxOpen } from 'react-icons/fa'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Cart from './components/cart/Cart'
import toast from 'react-hot-toast'

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
    categories?: { nama: string }
}

// Interface untuk item di cart
interface CartItem extends Product {
    quantity: number
}

const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart')
            return savedCart ? JSON.parse(savedCart) : []
        }
        return []
    })
    const [isClient, setIsClient] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState('Semua Produk')

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

    // Tambah useEffect buat update localStorage tiap cart berubah
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Event listener untuk scanner
    useEffect(() => {
        let barcodeBuffer = ''
        let lastKeyTime = Date.now()

        const handleBarcodeScan = (event: KeyboardEvent) => {
            const currentTime = Date.now()

            // Reset buffer jika terlalu lama antara keypress
            if (currentTime - lastKeyTime > 100) {
                barcodeBuffer = ''
            }

            // Update waktu terakhir
            lastKeyTime = currentTime

            // Tambahkan karakter ke buffer
            if (event.key !== 'Enter') {
                barcodeBuffer += event.key
                return
            }

            // Proses barcode saat Enter
            if (barcodeBuffer) {
                console.log('Scanned barcode:', barcodeBuffer)
                console.log('Tipe data barcode:', typeof barcodeBuffer)

                // Coba cari produk
                const product = products.find(p => {
                    console.log('Comparing:', {
                        scanned: +barcodeBuffer,
                        database: p.kode_produk,
                        match: p.kode_produk === +barcodeBuffer
                    })
                    return p.kode_produk === +barcodeBuffer
                })

                if (product) {
                    console.log('Found product:', product)
                    addToCart(product)
                } else {
                    toast.error(`Produk dengan kode ${barcodeBuffer} tidak ditemukan`)
                    console.log('Products in database:', products.map(p => ({
                        kode: p.kode_produk,
                        tipe: typeof p.kode_produk
                    })))
                }
                barcodeBuffer = ''
            }
        }

        // Add event listener
        window.addEventListener('keypress', handleBarcodeScan)

        // Cleanup
        return () => {
            window.removeEventListener('keypress', handleBarcodeScan)
        }
    }, [products, addToCart])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/dashboard/category')
            const result = await response.json()
            if (result.status === 'success') {
                setCategories(result.data)
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
        }
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
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/dashboard/product'),
                    fetch('/api/dashboard/product?type=categories')
                ])

                const productsResult = await productsResponse.json()
                const categoriesResult = await categoriesResponse.json()

                if (productsResult.status === 'success') {
                    setProducts(productsResult.data)
                }
                if (categoriesResult.status === 'success') {
                    setCategories(categoriesResult.data)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if (!isClient) {
        return <div>Loading...</div>
    }

    const filteredProducts = products.filter(product => {
        const matchCategory = selectedCategory === 'Semua Produk' || product.categories?.nama === selectedCategory
        const matchSearch = product.nama.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCategory && matchSearch
    })

    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow p-3 animate-pulse">
            <div className="w-full h-40 bg-gray-300 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
    )

    return (
        <div className="relative min-h-screen bg-gray-100 p-4">
            {/* Konten dashboard */}
            <div className="flex gap-4">
                {/* Kolom Kiri */}
                <div className="w-2/3">
                    {/* Filter Cari Produk */}
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

                    {/* Kategori Produk */}
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 rounded-lg"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 rounded-lg"></div>

                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                            onClick={() => {
                                const container = document.querySelector('.category-scroll')
                                container?.scrollBy({ left: -200, behavior: 'smooth' })
                            }}
                        >
                            <FaChevronLeft className="text-gray-600" />
                        </button>

                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                            onClick={() => {
                                const container = document.querySelector('.category-scroll')
                                container?.scrollBy({ left: 200, behavior: 'smooth' })
                            }}
                        >
                            <FaChevronRight className="text-gray-600" />
                        </button>

                        <div className="category-scroll flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 px-10">
                            <button
                                key="all"
                                onClick={() => setSelectedCategory('Semua Produk')}
                                className={`px-4 py-2 my-4 rounded-full whitespace-nowrap transition-colors ${selectedCategory === 'Semua Produk'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Semua Produk
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.nama)}
                                    className={`px-4 py-2 my-4 rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.nama
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.nama}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                                <FaBoxOpen className="w-24 h-24 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Tidak ada produk yang ditemukan</p>
                                <p className="text-sm">Coba pilih kategori lain atau ubah kata kunci pencarian</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const cartItem = cart.find(item => item.id === product.id)
                                const quantity = cartItem ? cartItem.quantity : 0

                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ x: -50 }}
                                        animate={{ x: 0 }}
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ duration: 0.2 }}
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
        </div>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), {
    ssr: false
})