import React from 'react'
import { CheckIcon, ClockIcon, XIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  variant: 'confirmed' | 'pending' | 'cancelled'
  percentChange?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  variant,
  percentChange,
}) => {
  const getCardStyles = () => {
    return 'bg-[#D6EBF3] text-[#447F98]'
  }
  const getIcon = () => {
    switch (variant) {
      case 'confirmed':
        return <CheckIcon className="h-10 w-10 p-2 bg-[#B9D8E1] text-[#447F98] text-xl rounded-full" />
      case 'pending':
        return <ClockIcon className="h-10 w-10 p-2 bg-[#B9D8E1] text-[#447F98] text-xl rounded-full" />
      case 'cancelled':
        return <XIcon className="h-10 w-10 p-2 bg-[#B9D8E1] text-[#447F98] text-xl rounded-full" />
      default:
        return null
    }
  }
  return (
    <div className={`rounded-xl ${getCardStyles()}`} style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="px-6 pt-6 flex justify-between items-center">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
      </div>
      <div className="flex items-center justify-center h-full">
        {getIcon()}
      </div>
      </div>
      <div className="mt-4 px-6 pb-6 pt-3 border-t-[4px] border-white/40 justify-center">
        <p className="text-sm mt-2 text-medium">
          Cambio: {percentChange ?? "0%"}
        </p>
      </div>
    </div>
  )
}
