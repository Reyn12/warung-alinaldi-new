import { NextResponse } from 'next/server'
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const response = await imagekit.upload({
            file: buffer,
            fileName: file.name,
        })

        return NextResponse.json({
            success: true,
            url: response.url
        })
    } catch (_error) {
        return NextResponse.json(
            { error: 'Gagal upload gambar' },
            { status: 500 }
        )
    }
}