import { Car, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'

type Page = 'home' | 'about'

interface NavbarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About Model', page: 'about' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Car size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              AutoPrice <span className="text-brand-400">AI</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => onNavigate('home')}
              className="ml-4 btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <BarChart3 size={15} />
              Predict Price
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800 mt-1 pt-3 animate-fade-in">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => { onNavigate(link.page); setMobileOpen(false) }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${
                  currentPage === link.page
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { onNavigate('home'); setMobileOpen(false) }}
              className="w-full btn-primary mt-2 text-sm flex items-center justify-center gap-2"
            >
              <BarChart3 size={15} />
              Predict Price
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
