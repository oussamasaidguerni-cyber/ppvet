import { Calendar, FileText, CreditCard, Package } from 'lucide-react'

interface PlaceholderProps {
  title: string
  icon: 'calendar' | 'medical' | 'billing' | 'inventory'
  description: string
}

const icons = {
  calendar: Calendar,
  medical: FileText,
  billing: CreditCard,
  inventory: Package,
}

export default function Placeholder({ title, icon, description }: PlaceholderProps) {
  const Icon = icons[icon]
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="border border-gray-200 p-8 text-center max-w-md mx-auto">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
