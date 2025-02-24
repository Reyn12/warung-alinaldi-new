// components/cart/Cart.tsx
import { FaShoppingCart, FaTrash } from 'react-icons/fa'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface CartItem {
    id: number
    kategori_id: number
    nama: string
    harga: number
    stok: number
    gambar_url: string
    tanggal_kadaluarsa: string
    created_at: string
    kode_produk: number
    quantity: number
}

interface CartProps {
    cart: CartItem[]
    updateQuantity: (id: number, newQuantity: number) => void
    removeFromCart: (id: number) => void
}

const Cart = ({ cart, updateQuantity, removeFromCart }: CartProps) => {
    // Hitung total
    const total = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-1/3 bg-white shadow-lg rounded-xl p-6 border border-gray-100 sticky top-4"
        >
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
                <AnimatePresence>
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={item.gambar_url}
                                    alt={item.nama}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{item.nama}</p>
                                    <p className="text-sm text-gray-600">
                                        Rp {item.harga.toLocaleString()} x
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center hover:bg-red-500 disabled:opacity-50 disabled:bg-gray-200"
                                        >
                                            <FiMinus className="text-white text-sm" />
                                        </button>
                                        <span className="text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-500"
                                        >
                                            <FiPlus className="text-white text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <p className="font-medium text-gray-700">Total:</p>
                    <p className="font-bold text-lg text-gray-900">
                        Rp {total.toLocaleString()}
                    </p>
                </div>
                <button
                    className={`w-full py-2.5 rounded-lg transition-colors duration-200 font-medium
                        ${cart.length === 0
                            ? 'bg-blue-800 opacity-30 cursor-not-allowed text-gray-100'
                            : 'bg-blue-800 hover:bg-blue-900 text-white'}`}
                    disabled={cart.length === 0}
                >
                    Konfirmasi Pembayaran
                </button>
            </div>
        </motion.div>
    )
}

export default Cart