import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    try {
        const supabase = await createServerClient()

        // Fetch categories
        if (type === 'categories') {
            const { data: categories, error } = await supabase
                .from('categories')
                .select('*')
                .order('nama', { ascending: true })

            if (error) {
                throw error
            }

            return NextResponse.json({
                status: 'success',
                data: categories
            })
        }

        // Fetch products (default)
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
            throw error
        }

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
            { error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}