import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
        const { data: items, error } = await supabase
            .from('transaction_items')
            .select(`
                *,
                product:products (
                    nama,
                    harga
                )
            `)
            .eq('transaksi_id', context.params.id)

        if (error) throw error

        return NextResponse.json({ items })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}