"use client"

import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import { SummaryCard } from "./components/SummaryCard"


interface Transaction {
    id: string
    date: string
    product: string
    quantity: number
    total: number
}

interface SummaryCardProps {
    summary: {
        today: number
        thisWeek: number
        thisMonth: number
    }
}

export default function TransactionPage() {
    const [isClient, setIsClient] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [summary, setSummary] = useState({
        today: 0,
        thisWeek: 0,
        thisMonth: 0
    })

    // Tambah useEffect khusus untuk handle client-side
    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        // Contoh data dummy
        const dummyData: Transaction[] = [
            {
                id: "1",
                date: "2025-02-25",
                product: "Indomie Goreng",
                quantity: 2,
                total: 50000
            },
            {
                id: "2",
                date: "2025-02-25",
                product: "Teh Pucuk",
                quantity: 3,
                total: 15000
            },
            {
                id: "3",
                date: "2025-02-24",
                product: "Beras 5kg",
                quantity: 1,
                total: 75000
            },
        ]
        setTransactions(dummyData)

        // Update summary (contoh)
        setSummary({
            today: 65000,    // Total hari ini
            thisWeek: 140000, // Total minggu ini
            thisMonth: 500000 // Total bulan ini
        })
    }, [])

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => {
                // Pindah format tanggal ke client-side
                if (typeof window === 'undefined') return row.original.date
                return format(new Date(row.original.date), "dd MMMM yyyy", { locale: id })
            }
        },
        {
            accessorKey: "product",
            header: "Produk"
        },
        {
            accessorKey: "quantity",
            header: "Jumlah"
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => `Rp ${row.original.total.toLocaleString("id-ID")}`
        }
    ]

    if (!isClient) {
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
        </div>
    )
}