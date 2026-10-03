import { Car, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <Car size={15} className="text-white" />
              </div>
              <span className="font-bold text-white">AutoPrice <span className="text-brand-400">AI</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Predict used-car prices using Machine Learning.
              Powered by a Random Forest model trained on synthetic data.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Project</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>React + TypeScript Frontend</li>
              <li>FastAPI Python Backend</li>
              <li>Random Forest ML Model</li>
              <li>scikit-learn Pipeline</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Disclaimer</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              All predictions are ML-based estimates generated from synthetic training data.
              They should not be considered official vehicle valuations or financial advice.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} AutoPrice AI · Demo ML Project
          </p>
          <div className="flex items-center gap-3 text-gray-600">
            <Github size={14} />
            <span className="text-xs">Open Source Demo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
