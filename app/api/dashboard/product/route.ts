import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createServerClient()

        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
                kategori_id,
                nama,
                harga,
                stok,
                gambar_url,
                tanggal_kadaluarsa,
                created_at,
                kode_produk,
                categories (
                    id,
                    nama
                )
            `)
            .order('nama', { ascending: true })

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform URL gambar
        const transformedProducts = products.map(product => ({
            ...product,
            gambar_url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/warung-alinaldi/${product.gambar_url.split('/').pop()}`
        }))

        return NextResponse.json({
            status: 'success',
            data: transformedProducts
        })

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}