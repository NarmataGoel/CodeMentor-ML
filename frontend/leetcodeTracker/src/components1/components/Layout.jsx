import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const Layout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
)

export default Layout
