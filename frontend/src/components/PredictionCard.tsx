import { RotateCcw, TrendingUp, AlertTriangle, Car, Gauge, Fuel, Settings, Users } from 'lucide-react'
import { CarFormData } from './CarForm'

export interface PredictionResult {
  predicted_price: number
  formatted_price: string
  lower_estimate: string
  upper_estimate: string
  lower_price: number
  upper_price: number
}

interface PredictionCardProps {
  result: PredictionResult
  formData: CarFormData
  onReset: () => void
}

function InfoBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <Icon size={12} />
        {label}
      </div>
      <span className="text-gray-200 text-sm font-medium truncate">{value}</span>
    </div>
  )
}

export default function PredictionCard({ result, formData, onReset }: PredictionCardProps) {
  const rangePct = Math.round(
    ((result.upper_price - result.lower_price) / result.predicted_price) * 50
  )

  return (
    <div className="animate-slide-up">
      {/* Main price card */}
      <div className="card p-6 sm:p-8 mb-4 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-600/20 border border-brand-700/40 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-brand-400" />
            </div>
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-wide">Estimated Car Price</span>
          </div>

          <div className="mb-2">
            <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              {result.formatted_price}
            </span>
          </div>

          {/* Range bar */}
          <div className="mt-5 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="text-gray-400 font-medium">{result.lower_estimate}</span>
              <span className="text-gray-600 text-xs">Estimated Range (±{rangePct}%)</span>
              <span className="text-gray-400 font-medium">{result.upper_estimate}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-700 via-brand-500 to-purple-500 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 p-3.5 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
            <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-yellow-200/70 text-xs leading-relaxed">
              This is an ML-based estimated price and should not be considered an official vehicle valuation.
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle details */}
      <div className="card p-5 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Vehicle Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoBadge icon={Car} label="Brand" value={formData.brand} />
          <InfoBadge icon={Settings} label="Year" value={String(formData.model_year)} />
          <InfoBadge icon={Gauge} label="KM Driven" value={formData.kilometers_driven.toLocaleString('en-IN') + ' km'} />
          <InfoBadge icon={Fuel} label="Fuel" value={formData.fuel_type} />
          <InfoBadge icon={Settings} label="Transmission" value={formData.transmission} />
          <InfoBadge icon={Settings} label="Engine" value={formData.fuel_type === 'Electric' ? 'Electric' : `${formData.engine_cc} cc`} />
          <InfoBadge icon={Users} label="Owners" value={formData.owner_count >= 4 ? '4+' : String(formData.owner_count)} />
          <InfoBadge
            icon={Gauge}
            label={formData.fuel_type === 'Electric' ? 'Range' : 'Mileage'}
            value={formData.fuel_type === 'Electric' ? `${formData.mileage} km` : `${formData.mileage} km/l`}
          />
        </div>
      </div>

      {/* Reset button */}
      <button onClick={onReset} className="btn-secondary w-full flex items-center justify-center gap-2">
        <RotateCcw size={15} />
        Predict Another Car
      </button>
    </div>
  )
}
