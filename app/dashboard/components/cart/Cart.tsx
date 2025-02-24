// components/cart/Cart.tsx
import { FaShoppingCart, FaShoppingBasket } from 'react-icons/fa'
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
    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.harga * item.quantity, 0)
    }

    const handleCheckout = () => {
        // Logic untuk checkout bisa ditambahkan di sini
        console.log("Proses checkout dimulai")
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-[350px] min-h-[500px] rounded-lg shadow-lg p-4 flex flex-col border border-gray-100 sticky top-4"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <FaShoppingCart className="text-blue-600" />
                <h2 className="font-semibold">Keranjang Belanja</h2>
            </div>

            {/* Cart Items - tambah flex-1 agar mengisi space yang tersedia */}
            <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                        <FaShoppingBasket className="w-16 h-16 mb-4 opacity-50" />
                        <p className="font-medium">Keranjang masih kosong</p>
                        <p className="text-sm text-gray-400">Tambahkan produk untuk memulai</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-4 p-4 border-b border-gray-100"
                            >
                                <div className="relative">
                                    <img
                                        src={item.gambar_url}
                                        alt={item.nama}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200" // tambah border
                                    />
                                    <span className="absolute -top-2 -right-2 bg-gray-200 text-sm px-2 rounded-full">
                                        {item.quantity}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800">{item.nama}</h3>
                                    <p className="text-sm text-gray-500">Rp {item.harga.toLocaleString()}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-lg hover:bg-red-200"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-500 rounded-lg hover:bg-green-200"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer dengan total dan tombol - akan selalu di bawah */}
            <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">
                        Rp {calculateTotal().toLocaleString()}
                    </span>
                </div>
                <button
                    className={`w-full bg-blue-600 text-white py-3 rounded-lg transition-colors
                        ${cart.length === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-700'}`}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                >
                    Konfirmasi Pembayaran
                </button>
            </div>
        </motion.div>
    )
}

export default Cart