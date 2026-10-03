import { useState, useEffect } from 'react'
import { BarChart3, Zap, Shield, TrendingUp, Clock, Trash2, ChevronDown } from 'lucide-react'
import CarForm, { CarFormData } from '../components/CarForm'
import PredictionCard, { PredictionResult } from '../components/PredictionCard'
import FeatureCard from '../components/FeatureCard'

type Page = 'home' | 'about'

interface RecentPrediction {
  brand: string
  model_year: number
  kilometers_driven: number
  fuel_type: string
  formatted_price: string
  timestamp: number
}

const API_BASE = 'https://car-price-prediction-ai-production.up.railway.app'
const STORAGE_KEY = 'autoprice_recent'
const MAX_RECENT = 5

function loadRecent(): RecentPrediction[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(list: RecentPrediction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
}

interface HomeProps {
  onNavigate: (page: Page) => void
}

export default function Home({ onNavigate }: HomeProps) {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [formData, setFormData] = useState<CarFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [recent, setRecent] = useState<RecentPrediction[]>(loadRecent)
  const [showForm, setShowForm] = useState(false)

  // Scroll to form section when activated
  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        document.getElementById('predict-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showForm])

  async function handleSubmit(data: CarFormData) {
    setLoading(true)
    setApiError(null)

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const detail = errBody?.detail ?? `Server error (HTTP ${res.status}).`
        throw new Error(detail)
      }

      const prediction: PredictionResult = await res.json()
      setResult(prediction)
      setFormData(data)

      // Save to recent predictions
      const entry: RecentPrediction = {
        brand: data.brand,
        model_year: data.model_year,
        kilometers_driven: data.kilometers_driven,
        fuel_type: data.fuel_type,
        formatted_price: prediction.formatted_price,
        timestamp: Date.now(),
      }
      const updated = [entry, ...recent].slice(0, MAX_RECENT)
      setRecent(updated)
      saveRecent(updated)

      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('network')) {
        setApiError(
  'Unable to connect to the prediction server. Please try again in a moment.'
)
      } else {
        setApiError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setFormData(null)
    setApiError(null)
    document.getElementById('predict-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function clearHistory() {
    setRecent([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section className="py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-800/60 rounded-full px-4 py-1.5 mb-6">
          <Zap size={13} className="text-brand-400" />
          <span className="text-brand-300 text-xs font-medium">Powered by Random Forest ML</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
          Know Your Car's{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Estimated Value
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Predict used-car prices using Machine Learning.
          Enter your car's details and get an instant estimate in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-8 py-3.5 text-base flex items-center gap-2"
          >
            <BarChart3 size={18} />
            Predict Car Price
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="btn-secondary px-8 py-3.5 text-base flex items-center gap-2"
          >
            How It Works
            <ChevronDown size={15} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { label: 'Training Samples', value: '3,000+' },
            { label: 'Car Brands', value: '10' },
            { label: 'ML Algorithm', value: 'Random Forest' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={Zap}
            title="Instant Prediction"
            description="Get a price estimate in milliseconds using a trained Random Forest model."
          />
          <FeatureCard
            icon={BarChart3}
            title="ML-Powered"
            description="Trained on 3,000 synthetic data points covering 10 popular Indian car brands."
          />
          <FeatureCard
            icon={Shield}
            title="No Data Stored"
            description="Your input stays in your browser. Predictions are not stored on the server."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Price Range"
            description="Get a lower and upper bound in addition to the point estimate."
          />
        </div>
      </section>

      {/* ── Predict section ── */}
      <section id="predict-section" className="pb-16 scroll-mt-20">
        {!showForm && !result && (
          <div className="text-center py-10">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-10 py-4 text-base flex items-center gap-2 mx-auto"
            >
              <BarChart3 size={18} />
              Start Predicting
            </button>
          </div>
        )}

        {(showForm || result) && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form column */}
            <div className="lg:col-span-3">
              <div className="card p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-1">Car Details</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Enter your vehicle's information to get an estimated market price.
                </p>
                {!result && (
                  <CarForm onSubmit={handleSubmit} loading={loading} apiError={apiError} />
                )}
                {result && formData && (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm mb-4">Prediction complete. See the result on the right →</p>
                    <button onClick={handleReset} className="btn-secondary text-sm">
                      Fill in another car
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result column */}
            <div className="lg:col-span-2" id="result-section">
              {!result && (
                <div className="card p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">Your prediction result will appear here.</p>
                </div>
              )}
              {result && formData && (
                <PredictionCard result={result} formData={formData} onReset={handleReset} />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Recent predictions ── */}
      {recent.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-gray-500" />
              <h2 className="text-base font-semibold text-gray-300">Recent Predictions</h2>
              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{recent.length}</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-600 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              Clear History
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Car</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Year</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">KM Driven</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Est. Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={r.timestamp} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i === recent.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3 text-gray-200">{r.brand} · {r.fuel_type}</td>
                      <td className="px-4 py-3 text-gray-400 text-right">{r.model_year}</td>
                      <td className="px-4 py-3 text-gray-400 text-right">{r.kilometers_driven.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-brand-400 font-semibold text-right">{r.formatted_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
