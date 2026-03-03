import { useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PinGrid from './PinGrid'
import './Home.css'
import Footer from './Footer'

const Home = () => {
  const [searchParams] = useSearchParams()
  const hasSearch = !!searchParams.get('q')?.trim()

  return (
    <div className="home-container inspira-home">
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <main className="home-main inspira-main">
          {!hasSearch && (
            <h1 className="inspira-headline">Прекрасне чекає на вас</h1>
          )}
          <PinGrid />
          {/* footer content appears after the grid so scrolling to bottom reveals it */}
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default Home

