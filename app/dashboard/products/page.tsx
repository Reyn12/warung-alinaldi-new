'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RiAddFill, RiSearchLine, RiEditLine, RiDeleteBinLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri'
import { MdOutlineInventory2 } from 'react-icons/md'
import Image from 'next/image'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'


// Import komponen dengan dynamic import dan opsi ssr: false
const TambahProduk = dynamic(
    () => import('./components/tambahProduk/TambahProduk'),
    { ssr: false }
)

const EditProduk = dynamic(
    () => import('./components/editProduk/EditProduk'),
    { ssr: false }
)

interface Product {
    id: number;
    kategori_id: number;
    nama: string;
    harga: number;
    stok: number;
    gambar_url: string;
    tanggal_kadaluarsa: string;
    created_at: string;
    kode_produk: string;
    lokasi_brg: string;
    categories: {
        id: number;
        nama: string;
    }
}

interface Category {
    id: number;
    nama: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isTambahModalOpen, setIsTambahModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(8)

    // Fetch kategori saat komponen dimuat
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/dashboard/product?type=categories')
            const result = await response.json()
            setCategories(result.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    // Fetch produk saat komponen dimuat
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

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    // Reset halaman ke 1 saat pencarian berubah
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    // Filter produk berdasarkan pencarian
    const filteredProducts = products.filter(product =>
        product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.kode_produk.toString().includes(searchQuery)
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

    // Fungsi untuk ganti halaman
    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        // Scroll ke atas halaman
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handler untuk tombol edit
    const handleEditClick = (product: Product) => {
        setSelectedProduct(product)
        setIsEditModalOpen(true)
    }

    // Handler untuk tombol hapus
    const handleDeleteClick = async (id: number) => {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            try {
                const response = await fetch(`/api/dashboard/product?id=${id}`, {
                    method: 'DELETE',
                })
                if (response.ok) {
                    setProducts(products.filter((p) => p.id !== id))
                    toast.success('Produk berhasil dihapus!')
                } else {
                    throw new Error('Gagal menghapus produk')
                }
            } catch (error) {
                console.error('Error deleting product:', error)
                toast.error('Gagal menghapus produk')
            }
        }
    }

    // Handler untuk menutup modal edit
    const handleEditModalClose = () => {
        setIsEditModalOpen(false)
        setSelectedProduct(null)
        fetchProducts() // Refresh data setelah edit
    }

    // Handler untuk menutup modal tambah
    const handleTambahModalClose = () => {
        setIsTambahModalOpen(false)
        fetchProducts() // Refresh data setelah tambah
    }

    // Buat array untuk page numbers
    const pageNumbers: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Fungsi untuk render pagination numbers dengan ellipsis
    const renderPaginationButtons = () => {
        // Jika total halaman < 8, tampilkan semua nomor halaman
        if (totalPages <= 7) {
            return pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`px-3 py-1 mx-1 rounded-md ${currentPage === number
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {number}
                </button>
            ));
        }

        // Jika halaman saat ini dekat dengan awal
        if (currentPage <= 3) {
            return (
                <>
                    {[1, 2, 3, 4, 5].map((number) => (
                        <button
                            key={number}
                            onClick={() => goToPage(number)}
                            className={`px-3 py-1 mx-1 rounded-md ${currentPage === number
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                    <span className="px-3 py-1">...</span>
                    <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                    >
                        {totalPages}
                    </button>
                </>
            );
        }

        // Jika halaman saat ini dekat dengan akhir
        if (currentPage >= totalPages - 2) {
            return (
                <>
                    <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                    >
                        1
                    </button>
                    <span className="px-3 py-1">...</span>
                    {[totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages].map((number) => (
                        <button
                            key={number}
                            onClick={() => goToPage(number)}
                            className={`px-3 py-1 mx-1 rounded-md ${currentPage === number
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                </>
            );
        }

        // Jika halaman saat ini di tengah
        return (
            <>
                <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                >
                    1
                </button>
                <span className="px-3 py-1">...</span>
                {[currentPage - 1, currentPage, currentPage + 1].map((number) => (
                    <button
                        key={number}
                        onClick={() => goToPage(number)}
                        className={`px-3 py-1 mx-1 rounded-md ${currentPage === number
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {number}
                    </button>
                ))}
                <span className="px-3 py-1">...</span>
                <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                >
                    {totalPages}
                </button>
            </>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            {/* Header dengan gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <MdOutlineInventory2 className="text-3xl text-white" />
                        <h1 className="text-2xl font-bold text-white">Daftar Produk</h1>
                    </div>
                    <button
                        onClick={() => setIsTambahModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all shadow-md font-medium"
                    >
                        <RiAddFill className="text-lg" />
                        Tambah Produk
                    </button>
                </div>
            </div>

            {/* Search Bar & Info jumlah produk */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                <div className="relative w-full sm:w-2/3">
                    <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                        type="text"
                        placeholder="Cari produk berdasarkan nama atau kode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md bg-white"
                    />
                </div>
                <div className="text-sm flex items-center gap-2 bg-white rounded-lg p-3 shadow-md w-full sm:w-auto">
                    <span className="text-gray-500">Total Produk:</span>
                    <span className="font-semibold text-indigo-600">{filteredProducts.length}</span>
                    {searchQuery && (
                        <>
                            <span className="text-gray-500 ml-2">Hasil pencarian :</span>
                            <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{searchQuery}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                        />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                        <div className="text-5xl text-gray-300">🔍</div>
                        <p>Tidak ada produk yang sesuai dengan pencarian</p>
                    </div>
                ) : (
                    currentItems.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={product.gambar_url}
                                    alt={product.nama}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    priority={false}
                                />
                                <div className="absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="p-2.5 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
                                    >
                                        <RiEditLine className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(product.id)}
                                        className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <RiDeleteBinLine className="text-lg" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {product.categories?.nama || 'Tanpa Kategori'}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-1">{product.nama}</h3>
                                <div className="space-y-3 text-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Kode</span>
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{product.kode_produk}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Harga</span>
                                        <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Rp {product.harga.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Stok</span>
                                        <span className={`font-medium px-2 py-0.5 rounded ${product.stok < 10
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {product.stok} unit
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Kadaluarsa</span>
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{new Date(product.tanggal_kadaluarsa).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Lokasi</span>
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{product.lokasi_brg}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && filteredProducts.length > 0 && (
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <div className="flex items-center shadow-md rounded-lg overflow-hidden">
                        <button
                            onClick={() => goToPage(currentPage > 1 ? currentPage - 1 : 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-4 py-2 ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <RiArrowLeftSLine className="text-lg" />
                            <span>Prev</span>
                        </button>

                        <div className="hidden md:flex">
                            {renderPaginationButtons()}
                        </div>

                        <div className="md:hidden flex items-center bg-white px-3 py-2">
                            <select
                                value={currentPage}
                                onChange={(e) => goToPage(parseInt(e.target.value))}
                                className="bg-white border-0 focus:ring-0 text-indigo-600 font-medium"
                            >
                                {pageNumbers.map(num => (
                                    <option key={num} value={num}>
                                        Halaman {num} dari {totalPages}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => goToPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-4 py-2 ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <span>Next</span>
                            <RiArrowRightSLine className="text-lg" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-md">
                        <span>Menampilkan</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-gray-200 rounded px-2 py-1 text-indigo-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="4">4</option>
                            <option value="8">8</option>
                            <option value="12">12</option>
                            <option value="16">16</option>
                            <option value="20">20</option>
                        </select>
                        <span>dari {filteredProducts.length} produk</span>
                    </div>
                </div>
            )}

            {/* Modal Tambah Produk */}
            <TambahProduk
                isOpen={isTambahModalOpen}
                onClose={handleTambahModalClose}
                categories={categories}
            />

            {/* Modal Edit Produk */}
            {selectedProduct && (
                <EditProduk
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    selectedProduct={selectedProduct}
                    categories={categories}
                />
            )}
        </div>
    )
}