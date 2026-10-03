import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react'

interface ModelMetrics {
  algorithm: string
  training_samples: number
  test_samples: number
  mae_lakhs: number
  rmse_lakhs: number
  r2_score: number
  features: string[]
}

const API_BASE = '/api'

function MetricBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function About() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/metrics`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setMetrics)
      .catch(() =>
        setMetricsError(
          'Could not load model metrics. Make sure the FastAPI backend is running and the model is trained.'
        )
      )
  }, [])

  const pipeline = [
    { step: 'Car Details', desc: 'User inputs 8 features via the form' },
    { step: 'Data Preprocessing', desc: 'OneHotEncoder for categoricals, passthrough for numerics via ColumnTransformer' },
    { step: 'Random Forest Model', desc: '200 decision trees in an ensemble, each trained on a bootstrapped sample' },
    { step: 'Price Prediction', desc: 'Average of all tree predictions as the final point estimate' },
    { step: 'Estimated Price', desc: 'Displayed with a ±10% approximation band (not a statistical CI)' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">About the Model</h1>
        <p className="text-gray-400 leading-relaxed">
          AutoPrice AI uses a Random Forest Regression model trained on synthetic Indian used-car data.
          This page explains how the prediction pipeline works and shows actual model evaluation metrics.
        </p>
      </div>

      {/* Prediction pipeline */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5">How the Prediction Works</h2>
        <div className="space-y-3">
          {pipeline.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-brand-700/40 border border-brand-600/40 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-brand-400 text-xs font-bold">{i + 1}</span>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="w-px h-4 bg-gray-800 mt-1" />
                )}
              </div>
              <div className="card p-4 flex-1 mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{item.step}</span>
                  {i < pipeline.length - 1 && <ArrowRight size={12} className="text-gray-600" />}
                </div>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Model metrics */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5">Model Evaluation Metrics</h2>

        {metricsError && (
          <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-start gap-3 mb-4">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{metricsError}</p>
          </div>
        )}

        {!metrics && !metricsError && (
          <div className="card p-6 text-center text-gray-500 text-sm">Loading metrics…</div>
        )}

        {metrics && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <MetricBadge label="Algorithm" value="Random Forest" />
              <MetricBadge label="Training Samples" value={metrics.training_samples.toLocaleString()} />
              <MetricBadge label="Test Samples" value={metrics.test_samples.toLocaleString()} />
              <MetricBadge label="R² Score" value={metrics.r2_score.toFixed(3)} sub="1.0 = perfect" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <MetricBadge
                label="MAE (Mean Absolute Error)"
                value={`₹${metrics.mae_lakhs.toFixed(2)} Lakhs`}
                sub="Average absolute prediction error"
              />
              <MetricBadge
                label="RMSE (Root Mean Squared Error)"
                value={`₹${metrics.rmse_lakhs.toFixed(2)} Lakhs`}
                sub="Penalises large errors more"
              />
            </div>

            {/* Features list */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Input Features ({metrics.features.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {metrics.features.map((f) => (
                  <span key={f} className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-gray-700">
                    {f.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Disclaimer section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Important Notes</h2>
        <div className="space-y-3">
          {[
            'This model is trained on synthetically generated data, not real market transactions.',
            'Predictions are estimates and should not be used for financial decisions or official valuations.',
            'The ±10% price range is an approximation band, not a statistically guaranteed confidence interval.',
            'Model performance will improve significantly when trained on real-world dataset.',
            'Prices are in Indian Rupees (₹) and represent the Indian used-car market context.',
          ].map((note, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={14} className="text-brand-500 mt-0.5 shrink-0" />
              <p className="text-gray-400 text-sm">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-brand-400" />
              <span className="text-sm font-medium text-white">Backend</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>Python · FastAPI · Uvicorn</li>
              <li>scikit-learn RandomForestRegressor</li>
              <li>pandas · numpy · joblib</li>
              <li>ColumnTransformer · OneHotEncoder</li>
            </ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-purple-400" />
              <span className="text-sm font-medium text-white">Frontend</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>React 18 · TypeScript · Vite</li>
              <li>Tailwind CSS</li>
              <li>Lucide React Icons</li>
              <li>Browser LocalStorage for history</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
