import { FaQrcode, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CartItem } from '@/app/types'

interface PembayaranModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectMethod: (method: 'qris' | 'tunai') => void
    totalAmount: number
    cart: CartItem[] // Tambah prop cart
    onProcessOrder: () => void
}

const PembayaranModal = ({ isOpen, onClose, onSelectMethod, totalAmount, cart, onProcessOrder }: PembayaranModalProps) => {
    const [step, setStep] = useState<'konfirmasi' | 'pembayaran'>('konfirmasi')
    const [selectedMethod, setSelectedMethod] = useState<'qris' | 'tunai'>('tunai')

    const handleConfirm = () => {
        setStep('pembayaran')
    }

    const handleBack = () => {
        setStep('konfirmasi')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[999]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md"
                    >
                        {step === 'konfirmasi' ? (
                            <>
                                <h2 className="text-2xl font-bold mb-4 text-center">Konfirmasi Pesanan</h2>
                                <div className="max-h-[300px] overflow-y-auto mb-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                                            <img
                                                src={item.gambar_url}
                                                alt={item.nama}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.nama}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} x Rp {item.harga.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                Rp {(item.quantity * item.harga).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 mb-6">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>Rp {totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Lanjutkan
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center mb-4">
                                    <button
                                        onClick={handleBack}
                                        className="text-gray-600 hover:text-gray-800 mr-3"
                                    >
                                        ←
                                    </button>
                                    <h2 className="text-2xl font-bold text-center flex-1">Pilih Metode Pembayaran</h2>
                                </div>
                                <p className="text-center text-lg mb-6">
                                    Total: <span className="font-bold">Rp {totalAmount.toLocaleString()}</span>
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelectMethod('qris')}
                                        className={`flex flex-col items-center justify-center p-6 border-2 ${
                                            selectedMethod === 'qris' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                        } rounded-xl transition-all`}
                                    >
                                        <FaQrcode className="text-4xl mb-3 text-blue-500" />
                                        <span className="font-semibold">QRIS</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelectMethod('tunai')}
                                        className={`flex flex-col items-center justify-center p-6 border-2 ${
                                            selectedMethod === 'tunai' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                        } rounded-xl transition-all`}
                                    >
                                        <FaMoneyBillWave className="text-4xl mb-3 text-blue-500" />
                                        <span className="font-semibold">TUNAI</span>
                                    </motion.button>
                                </div>

                                <div className="flex gap-4 mt-6 w-full">
                                    <button
                                        onClick={handleBack}
                                        className="w-1/2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={onProcessOrder}
                                        className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Proses Pesanan
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default PembayaranModal