import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="card p-6 hover:border-gray-700 transition-colors">
      <div className="w-10 h-10 bg-brand-900/50 border border-brand-800 rounded-xl flex items-center justify-center mb-4">
        <Icon size={20} className="text-brand-400" />
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
