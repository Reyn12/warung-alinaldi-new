'use client';
import { Fragment, useState } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast
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

            // Jeda 1 detik sebelum tutup modal dan refresh
            setTimeout(() => {
                setIsLoading(false);
                onClose();
                window.location.reload(); // Refresh halaman
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                {/* Tambahkan Toaster di sini */}
                <Toaster position="top-right" reverseOrder={false} />

                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
                                    Tambah Produk Baru
                                </Dialog.Title>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaBox className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                                                </div>
                                                <input
                                                    {...register('nama', { required: 'Nama produk wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Masukkan nama produk"
                                                />
                                                {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaBarcode className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Kode Produk</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    {...register('kode_produk', { required: 'Kode produk wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Masukkan kode produk"
                                                />
                                                {errors.kode_produk && <p className="text-red-500 text-sm">{errors.kode_produk.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaDollarSign className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Harga</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    {...register('harga', { required: 'Harga wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Masukkan harga"
                                                />
                                                {errors.harga && <p className="text-red-500 text-sm">{errors.harga.message}</p>}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaWarehouse className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    {...register('stok', { required: 'Stok wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Masukkan jumlah stok"
                                                />
                                                {errors.stok && <p className="text-red-500 text-sm">{errors.stok.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Tanggal Kadaluarsa</label>
                                                </div>
                                                <input
                                                    type="date"
                                                    {...register('tanggal_kadaluarsa', { required: 'Tanggal kadaluarsa wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                />
                                                {errors.tanggal_kadaluarsa && <p className="text-red-500 text-sm">{errors.tanggal_kadaluarsa.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaBox className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                                </div>
                                                <select
                                                    {...register('kategori_id', { required: 'Kategori wajib dipilih' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.kategori_id && <p className="text-red-500 text-sm">{errors.kategori_id.message}</p>}
                                            </div>

                                            {/* Lokasi Brg */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-gray-500" />
                                                    <label className="block text-sm font-medium text-gray-700">Lokasi Barang</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    {...register('lokasi_brg', { required: 'Lokasi barang wajib diisi' })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Masukkan lokasi barang"
                                                />
                                                {errors.lokasi_brg && <p className="text-red-500 text-sm">{errors.lokasi_brg.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Gambar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FaImage className="text-gray-500" />
                                            <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                                        </div>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <FaUpload className="w-8 h-8 text-gray-500 mb-2" />
                                                    <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    {...register('gambar_url', { required: 'Gambar wajib diisi' })}
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                        {previewImage && (
                                            <Image src={previewImage} alt="Preview" width={100} height={100} className="mt-2 rounded-lg" />
                                        )}
                                        {errors.gambar_url && <p className="text-red-500 text-sm">{errors.gambar_url.message}</p>}
                                    </div>

                                    {/* Tombol */}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </TransitionChild>
                    </div>
                </div>

                {/* Loading Modal */}
                {isLoading && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-black/50 absolute inset-0" />
                        <div className="relative bg-white rounded-lg p-6 flex items-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
                            <p className="text-gray-700">Sedang memproses...</p>
                        </div>
                    </div>
                )}
            </Dialog>
        </Transition>
    );
}