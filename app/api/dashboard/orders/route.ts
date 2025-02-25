import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Definisikan tipe untuk item di cart
interface CartItem {
  id: string;
  quantity: number;
  harga: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    // Tambahkan tipe ke destructuring body
    const { cart, totalAmount, paymentMethod }: { 
      cart: CartItem[], 
      totalAmount: number, 
      paymentMethod: string 
    } = body

    // Insert ke table transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        total_bayar: totalAmount,
        metode_pembayaran: paymentMethod,
        status: 'completed'
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Insert transaction items, pakai tipe CartItem
    const transactionItems = cart.map((item: CartItem) => ({
      transaksi_id: transactionData.id,
      produk_id: item.id,
      jumlah: item.quantity,
      harga_saat_ini: item.harga,
      subtotal: item.harga * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ success: true, transaction: transactionData })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}