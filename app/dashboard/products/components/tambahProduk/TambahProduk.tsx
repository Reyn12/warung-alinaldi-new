'use client';
import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaUpload,
    FaImage,
    FaBox,
    FaBarcode,
    FaDollarSign,
    FaWarehouse,
    FaCalendarAlt,
    FaMapMarkerAlt,
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

// Define category interface based on the categories table
interface Category {
    id: number;
    nama: string;
}

interface TambahProdukProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

interface FormData {
    nama: string;
    kode_produk: string;
    harga: number;
    stok: number;
    kategori_id: number;
    gambar_url: File | string;
    tanggal_kadaluarsa: string;
    lokasi_brg: string;
}

export default function TambahProduk({ isOpen, onClose, categories }: TambahProdukProps) {
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    // Dropzone implementation
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1
    });

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true);

            if (!selectedImage) {
                throw new Error('Pilih gambar dulu ya');
            }

            const formData = new FormData();
            formData.append('file', selectedImage);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                throw new Error('Gagal upload gambar');
            }

            const fileName = uploadResult.url.split('/').pop();

            const productData = {
                ...data,
                gambar_url: fileName
            };

            const response = await fetch('/api/dashboard/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Gagal menambah produk');
            }

            // Tampilkan toast sukses
            toast.success('Produk berhasil ditambahkan!');
            onClose();
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            toast.error(error.message || 'Terjadi kesalahan');
            console.error('Error adding product:', error);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Toaster position="top-center" />
                
                {/* Background overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold text-center text-gray-800 mb-6 border-b pb-4"
                                >
                                    Tambah Produk Baru
                                </Dialog.Title>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left column - Image upload */}
                                        <div className="space-y-4">
                                            <div 
                                                {...getRootProps()} 
                                                className={`border-2 border-dashed rounded-xl p-4 h-64 flex flex-col items-center justify-center cursor-pointer transition-all
                                                    ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
                                                    ${previewImage ? 'border-indigo-500' : ''}`}
                                            >
                                                <input {...getInputProps()} />
                                                
                                                {previewImage ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={previewImage}
                                                            alt="Preview"
                                                            fill
                                                            className="object-contain rounded-lg"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {isDragActive ? 
                                                                'Lepaskan gambar di sini...' : 
                                                                'Tarik & lepas gambar di sini, atau klik untuk memilih'
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            PNG, JPG, JPEG hingga 5MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Kategori */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaBox className="text-indigo-500" />
                                                    Kategori
                                                </label>
                                                <select
                                                    {...register('kategori_id', { required: true })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.kategori_id && (
                                                    <p className="text-red-500 text-xs mt-1">Kategori harus dipilih</p>
                                                )}
                                            </div>
                                            
                                            {/* Tanggal Kadaluarsa */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaCalendarAlt className="text-indigo-500" />
                                                    Tanggal Kadaluarsa
                                                </label>
                                                <input
                                                    type="date"
                                                    {...register('tanggal_kadaluarsa', { required: true })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                />
                                                {errors.tanggal_kadaluarsa && (
                                                    <p className="text-red-500 text-xs mt-1">Tanggal kadaluarsa harus diisi</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Right column - Product details */}
                                        <div className="space-y-4">
                                            {/* Nama Produk */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaBox className="text-indigo-500" />
                                                    Nama Produk
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('nama', { required: true })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="Masukkan nama produk"
                                                />
                                                {errors.nama && (
                                                    <p className="text-red-500 text-xs mt-1">Nama produk harus diisi</p>
                                                )}
                                            </div>
                                            
                                            {/* Kode Produk */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaBarcode className="text-indigo-500" />
                                                    Kode Produk
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('kode_produk', { required: true })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="Masukkan kode produk"
                                                />
                                                {errors.kode_produk && (
                                                    <p className="text-red-500 text-xs mt-1">Kode produk harus diisi</p>
                                                )}
                                            </div>
                                            
                                            {/* Harga */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaDollarSign className="text-indigo-500" />
                                                    Harga
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('harga', { required: true, min: 0 })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="Masukkan harga"
                                                />
                                                {errors.harga && (
                                                    <p className="text-red-500 text-xs mt-1">Harga harus diisi dan valid</p>
                                                )}
                                            </div>
                                            
                                            {/* Stok */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaWarehouse className="text-indigo-500" />
                                                    Stok
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('stok', { required: true, min: 0 })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="Masukkan jumlah stok"
                                                />
                                                {errors.stok && (
                                                    <p className="text-red-500 text-xs mt-1">Stok harus diisi dan valid</p>
                                                )}
                                            </div>
                                            
                                            {/* Lokasi Barang */}
                                            <div className="space-y-2">
                                                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-indigo-500" />
                                                    Lokasi Barang
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('lokasi_brg', { required: true })}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="Masukkan lokasi barang"
                                                />
                                                {errors.lokasi_brg && (
                                                    <p className="text-red-500 text-xs mt-1">Lokasi barang harus diisi</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all
                                                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menyimpan...
                                                </span>
                                            ) : (
                                                'Simpan Produk'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}