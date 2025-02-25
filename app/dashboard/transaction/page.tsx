"use client"

import { DataTable } from "@/components/ui/data-table"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import { SummaryCard } from "./components/SummaryCard"
import { Eye } from "lucide-react"
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

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => {
                if (typeof window === 'undefined') return row.original.date
                return format(new Date(row.original.date), "dd MMMM yyyy", { locale: id })
            }
        },
        {
            accessorKey: "metode",
            header: "Metode Pembayaran"
        },
        {
            accessorKey: "status",
            header: "Status"
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => `Rp ${row.original.total.toLocaleString("id-ID")}`
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedId(row.original.id)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )
            }
        }
    ]

    if (!isClient || isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Transaksi</h1>
            <SummaryCard summary={summary} />
            <div>
                <h2 className="text-2xl font-bold mb-4">Daftar Transaksi</h2>
                <DataTable columns={columns} data={transactions} />
            </div>
            <DetailPesanan
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
                transactionId={selectedId || ""}
            />
        </div>
    )
}