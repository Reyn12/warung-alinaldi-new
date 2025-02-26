import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { ShoppingCart, Package, DollarSign, ShoppingBag, Layers } from "lucide-react"
import { motion } from "framer-motion"

interface DetailPesananProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
}

interface TransactionItem {
  id: number | string
  transaksi_id: number | string
  produk_id: number | string
  jumlah: number
  harga_saat_ini: number
  product: {
    nama: string
    harga: number
  }
  subtotal?: number
}

export function DetailPesanan({ isOpen, onClose, transactionId }: DetailPesananProps) {
  const [items, setItems] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !transactionId) return

    console.log("TransactionId:", transactionId)

    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dashboard/transaction/${transactionId}`)
        const data = await response.json()

        console.log("Response data:", data)

        setItems(data.items || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, transactionId])

  useEffect(() => {
    if (items.length > 0) {
      console.log("Items state updated:", items)
    }
  }, [items])

  const totalAmount = items.reduce((sum, item) =>
    sum + (item.subtotal || (item.jumlah * item.harga_saat_ini)), 0
  )

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border-0 shadow-xl">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl flex items-center gap-2 text-blue-700">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length > 0 ? (
          <motion.div
            className="px-6 pb-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Detail Produk
                </h3>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-medium">Produk</th>
                    <th className="text-right py-3 px-4 font-medium">Harga</th>
                    <th className="text-center py-3 px-4 font-medium">Jumlah</th>
                    <th className="text-right py-3 px-4 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      className="hover:bg-blue-50 transition-colors"
                      variants={itemVariants}
                    >
                      <td className="py-4 px-4 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-blue-400" />
                        <span>{item.product?.nama || 'Produk tidak tersedia'}</span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        <span className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3 w-3" />
                          {item.harga_saat_ini?.toLocaleString("id-ID") || '0'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {item.jumlah}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        Rp {(item.subtotal || (item.jumlah * item.harga_saat_ini))?.toLocaleString("id-ID") || '0'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-bold">
                    <td colSpan={3} className="py-4 px-4 text-left">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span>Total</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-blue-700">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
            Data transaksi tidak ditemukan
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}