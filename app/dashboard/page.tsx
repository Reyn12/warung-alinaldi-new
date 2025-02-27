'use client'
import { useState, useEffect } from 'react'
import { FaSearch, FaBarcode, FaChevronLeft, FaChevronRight, FaBoxOpen, FaShoppingCart, FaTimes } from 'react-icons/fa'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Cart from './components/cart/Cart'
import toast from 'react-hot-toast'
import { useCallback } from 'react'

// Interface untuk tipe produk
interface Product {
    id: number
    kategori_id: number
    nama: string
    harga: number
    stok: number
    gambar_url: string
    tanggal_kadaluarsa: string
    lokasi_brg: string
    created_at: string
    kode_produk: string
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
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12) // Jumlah item per halaman
    const [mobileCartVisible, setMobileCartVisible] = useState(false)

    const toggleMobileCart = () => {
        setMobileCartVisible(!mobileCartVisible)
    }


    const addToCart = useCallback((product: Product) => {
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
    }, [])

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
                        scanned: barcodeBuffer.trim(),
                        database: p.kode_produk,
                        match: p.kode_produk === barcodeBuffer.trim()
                    });
                    return p.kode_produk === barcodeBuffer.trim();
                });

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

    // Reset halaman ketika kategori atau search berubah
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, searchQuery])

    if (!isClient) {
        return <div>Loading...</div>
    }

    const filteredProducts = products.filter(product => {
        const matchCategory = selectedCategory === 'Semua Produk' || product.categories?.nama === selectedCategory
        const matchSearch = product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.kode_produk.toString().includes(searchQuery)
        return matchCategory && matchSearch
    })

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

    // Pagination controls
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
            // Scroll ke atas untuk UX yang lebih baik
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow p-3 animate-pulse">
            <div className="w-full h-40 bg-gray-300 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
    )

    // Fungsi untuk render pagination
    const renderPaginationControls = () => {
        // Jika total halaman kurang dari 2, gak perlu tampilin pagination
        if (totalPages <= 1) return null;

        // Generate array of page numbers, maksimal 5 halaman
        let pageNumbers = [];

        // Tentukan range halaman yang akan ditampilkan
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Sesuaikan startPage jika endPage sudah di maksimum
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-center mt-6 mb-4">
                {/* Previous button */}
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 mr-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                    <FaChevronLeft />
                </button>

                {/* First page button (if not in view) */}
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => paginate(1)}
                            className="px-3 py-1 mx-1 rounded hover:bg-gray-200"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="mx-1">...</span>}
                    </>
                )}

                {/* Page numbers */}
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === number
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-200'
                            }`}
                    >
                        {number}
                    </button>
                ))}

                {/* Last page button (if not in view) */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="mx-1">...</span>}
                        <button
                            onClick={() => paginate(totalPages)}
                            className="px-3 py-1 mx-1 rounded hover:bg-gray-200"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next button */}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 ml-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-gray-100 p-4">
            {/* Konten dashboard */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Kolom Kiri - Produk */}
                <div className="w-full md:w-2/3">
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

                        <div className="category-scroll flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 px-12 mx-2">
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

                    {/* Info total produk dan halaman aktif */}
                    {!isLoading && filteredProducts.length > 0 && (
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                            <p>Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} dari {filteredProducts.length} produk</p>
                            <p>Halaman {currentPage} dari {totalPages}</p>
                        </div>
                    )}

                    {/* Card produk */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                                <FaBoxOpen className="w-28 h-28 mb-5 opacity-50 text-gray-400" />
                                <p className="text-xl font-medium">Tidak ada produk yang ditemukan</p>
                                <p className="text-sm mt-2">Coba pilih kategori lain atau ubah kata kunci pencarian</p>
                            </div>
                        ) : (
                            currentItems.map((product) => {
                                const cartItem = cart.find(item => item.id === product.id)
                                const quantity = cartItem ? cartItem.quantity : 0

                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 border border-gray-100 overflow-hidden transition-all duration-300"
                                    >
                                        <div className="relative overflow-hidden rounded-lg mb-3">
                                            <motion.img
                                                whileHover={{ scale: 1.08 }}
                                                transition={{ duration: 0.3 }}
                                                src={product.gambar_url}
                                                alt={product.nama}
                                                className="w-full h-44 object-cover rounded-lg"
                                            />
                                            <div className="absolute top-1 right-1">
                                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                                    Tersedia
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-800 mb-1 truncate text-base">{product.nama}</h3>
                                        <p className="text-blue-600 font-bold text-lg mb-3">Rp {product.harga.toLocaleString()}</p>

                                        {quantity > 0 ? (
                                            <div className="flex items-center justify-between mb-1 bg-gray-50 rounded-lg p-1.5">
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                                    disabled={quantity <= 0}
                                                    className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center hover:bg-red-500 disabled:opacity-50 disabled:bg-gray-200 transition-colors shadow-sm"
                                                >
                                                    <FiMinus className="text-white" />
                                                </button>
                                                <span className="text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm">{quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                                    className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors shadow-sm"
                                                >
                                                    <FiPlus className="text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm"
                                            >
                                                <FaShoppingCart className="text-sm" /> Tambah
                                            </button>
                                        )}
                                    </motion.div>
                                )
                            })
                        )}
                    </div>

                    {/* Pagination controls */}
                    {renderPaginationControls()}
                </div>

                {/* Cart untuk desktop */}
                <div className="hidden md:block md:w-1/3">
                    <Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
                </div>
            </div>

            {/* Tombol Cart untuk Mobile */}
            <div className="md:hidden fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleMobileCart}
                    className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                >
                    <FaShoppingCart className="text-xl" />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Modal Cart untuk Mobile */}
            {mobileCartVisible && (
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center">
                    <div className="bg-white rounded-t-xl p-4 w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Keranjang Belanja</h2>
                            <button onClick={toggleMobileCart} className="text-gray-500 p-2">
                                <FaTimes />
                            </button>
                        </div>
                        <Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), {
    ssr: false
})