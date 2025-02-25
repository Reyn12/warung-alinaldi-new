import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useEffect, useState } from "react"

interface DetailPesananProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
}

interface TransactionItem {
  id: number
  produk_id: number
  jumlah: number
  harga_saat_ini: number
  subtotal: number
  product: {
    nama: string
    harga: number
  }
}

export function DetailPesanan({ isOpen, onClose, transactionId }: DetailPesananProps) {
  const [items, setItems] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/dashboard/transaction/${transactionId}`)
        const data = await response.json()
        setItems(data.items)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, transactionId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Pesanan</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium">
              <div>Produk</div>
              <div>Harga</div>
              <div>Jumlah</div>
              <div>Subtotal</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-4 gap-4">
                <div>{item.product.nama}</div>
                <div>Rp {item.harga_saat_ini.toLocaleString("id-ID")}</div>
                <div>{item.jumlah}</div>
                <div>Rp {item.subtotal.toLocaleString("id-ID")}</div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}