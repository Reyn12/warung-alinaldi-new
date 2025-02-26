import { CalendarDays, TrendingUp, Wallet, CreditCard } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
}

interface SummaryProps {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export function SummaryCard({ summary }: { summary: SummaryProps }) {
  const cards = [
    {
      title: "Transaksi Hari Ini",
      value: summary.today,
      icon: <Wallet className="h-10 w-10 text-blue-500" />,
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Transaksi Minggu Ini",
      value: summary.thisWeek,
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
    {
      title: "Transaksi Bulan Ini",
      value: summary.thisMonth,
      icon: <CalendarDays className="h-10 w-10 text-purple-500" />,
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-gradient-to-br ${card.bgColor} border ${card.borderColor} p-6 rounded-xl shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold">Rp {card.value.toLocaleString("id-ID")}</h3>
            </div>
            <div className="p-3 rounded-full bg-white/70 shadow-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}