import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createRouteHandlerClient({ cookies })

    try {
        // Ambil semua transaksi
        const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })

        if (transactionError) throw transactionError
        if (!transactions) return NextResponse.json({ 
            transactions: [], 
            summary: { today: 0, thisWeek: 0, thisMonth: 0 } 
        })

        // Format tanggal untuk filter
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        const thisMonth = now.toISOString().slice(0, 7)

        // Hitung summary
        const summary = {
            today: transactions
                .filter(t => t.created_at?.split('T')[0] === today)
                .reduce((sum, t) => sum + (t.total_bayar || 0), 0),
            thisWeek: transactions
                .filter(t => t.created_at?.split('T')[0] >= thisWeek)
                .reduce((sum, t) => sum + (t.total_bayar || 0), 0),
            thisMonth: transactions
                .filter(t => t.created_at?.split('T')[0].startsWith(thisMonth))
                .reduce((sum, t) => sum + (t.total_bayar || 0), 0)
        }

        return NextResponse.json({ 
            transactions: transactions.map(t => ({
                id: t.id,
                date: t.created_at?.split('T')[0] || '',
                total: t.total_bayar || 0,
                metode: t.metode_pembayaran,
                status: t.status
            })),
            summary 
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}