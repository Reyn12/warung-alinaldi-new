"use client"

import { DataTable } from "@/components/ui/data-table"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import { SummaryCard } from "./components/SummaryCard"
import { Eye, TrendingUp, Calendar, CreditCard, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DetailPesanan } from "./components/DetailPesanan"

interface Transaction {
    id: string
    date: string
    total: number
    metode: string
    status: string
}

export default function TransactionPage() {
    const [isClient, setIsClient] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [summary, setSummary] = useState({
        today: 0,
        thisWeek: 0,
        thisMonth: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        const fetchData = async () => {
            try {
                const response = await fetch('/api/dashboard/transaction')
                const data = await response.json()
                setTransactions(data.transactions)
                setSummary(data.summary)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [isClient])

    const getStatusBadge = (status: string) => {
        const colors: {[key: string]: string} = {
            'completed': 'bg-green-100 text-green-800 border-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200',
        }
        
        const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200';
        const colorClass = colors[status.toLowerCase()] || defaultColor;
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                {status}
            </span>
        )
    }

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => {
                if (typeof window === 'undefined') return row.original.date
                return (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(row.original.date), "dd MMMM yyyy", { locale: id })}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "metode",
            header: "Metode Pembayaran",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>{row.original.metode}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.status)
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => (
                <div className="font-medium text-right">
                    Rp {row.original.total.toLocaleString("id-ID")}
                </div>
            )
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(row.original.id)}
                        className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        <span>Detail</span>
                    </Button>
                )
            }
        }
    ]

    if (!isClient || isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Memuat data transaksi...</p>
            </div>
        )
    }

    return (
        <div className="p-6 rounded-lg space-y-8 max-w-7xl mx-auto bg-gradient-to-b from-white to-gray-50 min-h-screen">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Transaksi
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Terakhir diupdate: {format(new Date(), "HH:mm, dd MMM yyyy", { locale: id })}</span>
                </div>
            </div>
            
            <SummaryCard summary={summary} />
            
            <div className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                    Daftar Transaksi
                </h2>
                <div className="rounded-lg overflow-hidden border">
                    <DataTable 
                        columns={columns} 
                        data={transactions} 
                    />
                </div>
            </div>
            
            <DetailPesanan
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
                transactionId={selectedId || ""}
            />
        </div>
    )
}