'use client';
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
    FaUpload,
    FaImage,
    FaBox,
    FaBarcode,
    FaDollarSign,
    FaWarehouse,
    FaCalendarAlt,
    FaTrash,
    FaMapMarkerAlt,
} from 'react-icons/fa';


interface Category {
    id: number;
    nama: string;
}

interface Product {
    id: number;
    kategori_id: number;
    nama: string;
    harga: number;
    stok: number;
    gambar_url: string;
    tanggal_kadaluarsa: string;
    created_at: string;
    kode_produk: string;
    lokasi_brg: string;
}

interface EditProdukProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProduct: Product | null;
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



export default function EditProduk({ isOpen, onClose, selectedProduct, categories }: EditProdukProps) {
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<FormData>();

    useEffect(() => {
        if (selectedProduct) {
            reset({
                nama: selectedProduct.nama,
                kode_produk: selectedProduct.kode_produk,
                harga: selectedProduct.harga,
                stok: selectedProduct.stok,
                kategori_id: selectedProduct.kategori_id,
                tanggal_kadaluarsa: selectedProduct.tanggal_kadaluarsa.split('T')[0],
            });
            setPreviewImage(`/uploads/${selectedProduct.gambar_url}`);
        }
    }, [selectedProduct, reset]);

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

    const onSubmit = async (data: FormData) => {
        if (!selectedProduct) return;

        try {
            setIsLoading(true);
            let fileName = selectedProduct.gambar_url;

            if (selectedImage) {
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

                fileName = uploadResult.url.split('/').pop() || '';
            }

            const productData = {
                ...data,
                gambar_url: fileName,
                id: selectedProduct.id
            };

            const response = await fetch('/api/dashboard/product', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Gagal update produk');
            }

            toast.success('Produk berhasil diupdate!');

            setTimeout(() => {
                setIsLoading(false);
                onClose();
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    const handleClose = () => {
        setPreviewImage('');
        setSelectedImage(null);
        reset();
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-4"
                        >
                            <Dialog.Panel className="relative bg-white rounded-lg p-6 w-full max-w-5xl">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Produk</h2>
                                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
                                    {/* Kolom Kiri - Data Produk */}
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaBox className="text-blue-500" /> Nama Produk
                                                </label>
                                                <input
                                                    {...register("nama", { required: "Nama wajib diisi" })}
                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaBarcode className="text-blue-500" /> Kode Produk
                                                </label>
                                                <input
                                                    {...register("kode_produk", { required: "Kode wajib diisi" })}
                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.kode_produk && <p className="text-red-500 text-sm mt-1">{errors.kode_produk.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaDollarSign className="text-blue-500" /> Harga
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register("harga", { required: "Harga wajib diisi", min: 0 })}
                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.harga && <p className="text-red-500 text-sm mt-1">{errors.harga.message}</p>}
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaWarehouse className="text-blue-500" /> Stok
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register("stok", { required: "Stok wajib diisi", min: 0 })}
                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.stok && <p className="text-red-500 text-sm mt-1">{errors.stok.message}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                <FaBox className="text-blue-500" /> Kategori
                                            </label>
                                            <select
                                                {...register("kategori_id", { required: "Kategori wajib dipilih" })}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.kategori_id && <p className="text-red-500 text-sm mt-1">{errors.kategori_id.message}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                <FaCalendarAlt className="text-blue-500" /> Tanggal Kadaluarsa
                                            </label>
                                            <input
                                                type="date"
                                                {...register("tanggal_kadaluarsa", { required: "Tanggal wajib diisi" })}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.tanggal_kadaluarsa && <p className="text-red-500 text-sm mt-1">{errors.tanggal_kadaluarsa.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-gray-500" />
                                                <label className="block text-sm font-medium text-gray-700">Lokasi Barang</label>
                                            </div>
                                            <input
                                                type="text"
                                                {...register('lokasi_brg', { required: 'Lokasi barang wajib diisi' })}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Masukkan lokasi barang"
                                                defaultValue={selectedProduct?.lokasi_brg || ''}
                                            />
                                            {errors.lokasi_brg && <p className="text-red-500 text-sm mt-1">{errors.lokasi_brg.message}</p>}
                                        </div>
                                    </div>

                                    {/* Kolom Kanan - Gambar */}
                                    <div className="w-1/3 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="flex items-center gap-2 text-gray-700 mb-2">
                                                <FaImage className="text-blue-500" /> Gambar Produk
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                {previewImage ? (
                                                    <div className="relative">
                                                        <Image
                                                            src={previewImage.startsWith('http') ? previewImage : previewImage.replace('/uploads/', '')}
                                                            alt="Preview"
                                                            width={300}
                                                            height={300}
                                                            className="mx-auto rounded-lg"
                                                            style={{ objectFit: "cover" }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewImage('')}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="py-8">
                                                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                                                        <p className="text-gray-500">Klik untuk upload gambar</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="imageInput"
                                                />
                                                <label
                                                    htmlFor="imageInput"
                                                    className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                                                >
                                                    Pilih Gambar
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Tombol aksi */}
                                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}