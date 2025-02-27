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
    const [showSuccessModal, setShowSuccessModal] = useState(false);


    const handleConfirm = () => {
        setStep('pembayaran')
    }

    const handleBack = () => {
        setStep('konfirmasi')
    }

    const handleSelectMethod = (method: 'qris' | 'tunai') => {
        setSelectedMethod(method)
        onSelectMethod(method)
    }

    const handleProcessOrder = async () => {
        try {
            const response = await fetch('/api/dashboard/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart,
                    totalAmount,
                    paymentMethod: selectedMethod
                })
            })

            const data = await response.json()

            if (data.success) {
                localStorage.removeItem('cart')
                onProcessOrder() // Panggil fungsi yang dikasih dari parent

                // Tampilkan modal sukses
                setShowSuccessModal(true);

                // Tunggu 1.5 detik lalu tutup dan reload
                setTimeout(() => {
                    onClose();       // Tutup modal
                    window.location.reload();
                }, 1500);
            } else {
                alert('Gagal memproses pesanan')
            }
        } catch (error) {
            alert('Terjadi kesalahan')
        }
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
                                        onClick={() => handleSelectMethod('qris')}
                                        className={`flex flex-col items-center justify-center p-6 border-2 ${selectedMethod === 'qris'
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
                                        onClick={() => handleSelectMethod('tunai')}
                                        className={`flex flex-col items-center justify-center p-6 border-2 ${selectedMethod === 'tunai'
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
                                        onClick={handleProcessOrder}
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

            {/* Modal Sukses */}
            {showSuccessModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-8 shadow-2xl max-w-sm mx-auto text-center border border-blue-700"
                    >
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Pembayaran Berhasil!</h3>
                        <p className="text-blue-100 mb-4">Pesanan kamu sedang diproses</p>
                        <div className="w-full h-1 bg-blue-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-blue-400"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PembayaranModal