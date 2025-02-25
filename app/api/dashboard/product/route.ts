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
                lokasi_brg,
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
            gambar_url: `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.gambar_url.split('/').pop()}`
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

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const formData = await request.json()
        
        const {
            nama,
            kode_produk,
            harga,
            stok,
            kategori_id,
            lokasi_brg,
            gambar_url,
            tanggal_kadaluarsa
        } = formData

        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    nama,
                    kode_produk,
                    lokasi_brg,
                    harga,
                    stok,
                    kategori_id,
                    gambar_url,
                    tanggal_kadaluarsa
                }
            ])
            .select()

        if (error) {
            throw error
        }

        return NextResponse.json({
            status: 'success',
            data
        })

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Gagal menambahkan produk' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createServerClient()
        const formData = await request.json()
        
        const {
            id,  // perlu id untuk update
            nama,
            kode_produk,
            harga,
            stok,
            kategori_id,
            lokasi_brg,
            gambar_url,
            tanggal_kadaluarsa
        } = formData

        const { data, error } = await supabase
            .from('products')
            .update({
                nama,
                kode_produk,
                lokasi_brg,
                harga,
                stok,
                kategori_id,
                gambar_url,
                tanggal_kadaluarsa
            })
            .eq('id', id)  // update where id = formData.id
            .select()

        if (error) {
            throw error
        }

        return NextResponse.json({
            status: 'success',
            data
        })

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Gagal update produk' },
            { status: 500 }
        )
    }
}