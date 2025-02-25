import cloudinary from './cloudinary'

export async function uploadImage(file: File) {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(base64Data as string, {
      folder: 'warung-alinaldi', // customize folder name
    })

    return result.secure_url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}