import { Card } from "@/components/ui/card"

interface SummaryCardProps {
  summary: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium">Transaksi Hari Ini</h3>
        <p className="text-2xl font-bold mt-2">
          Rp {summary.today.toLocaleString("id-ID")}
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-medium">Transaksi Minggu Ini</h3>
        <p className="text-2xl font-bold mt-2">
          Rp {summary.thisWeek.toLocaleString("id-ID")}
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-medium">Transaksi Bulan Ini</h3>
        <p className="text-2xl font-bold mt-2">
          Rp {summary.thisMonth.toLocaleString("id-ID")}
        </p>
      </Card>
    </div>
  )
}