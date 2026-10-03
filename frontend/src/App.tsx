import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'

type Page = 'home' | 'about'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <About />}
      </main>
      <Footer />
    </div>
  )
}

export default App
