import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getMlServiceStatus } from '../services/mlService'

const sections = [
  {
    label: 'LEARN',
    links: [
      { path: '/', name: 'Dashboard', icon: 'ti ti-layout-dashboard', end: true },
      { path: '/practice', name: 'My Practice', icon: 'ti ti-code' },
      { path: '/recommendations', name: 'Recommendations', icon: 'ti ti-sparkles' },
      { path: '/goals', name: 'Learning Goals', icon: 'ti ti-target-arrow' },
    ],
  },
  {
    label: 'INSIGHTS',
    links: [
      { path: '/analytics', name: 'Analytics', icon: 'ti ti-chart-bar' },
      { path: '/weak-topics', name: 'Weak Topics', icon: 'ti ti-activity' },
      { path: '/profile', name: 'My Profile', icon: 'ti ti-user-circle' },
    ],
  },
]

const Navbar = () => {
  const [mlStatus, setMlStatus] = useState({
    connected: false,
    message: 'Checking ML service...',
  })

  useEffect(() => {
    let isMounted = true

    const checkConnection = async () => {
      const status = await getMlServiceStatus()

      if (isMounted) {
        setMlStatus(status)
      }
    }

    checkConnection()

    const interval = setInterval(checkConnection, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">
          <i className="ti ti-brain" />
        </span>
        <span>
          <strong>CodeMentor <span>ML</span></strong>
          <small>DSA learning workspace</small>
        </span>
      </NavLink>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <p className="nav-section-label">{section.label}</p>

            {section.links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                <i className={item.icon} aria-hidden="true" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span
          className={`status-dot ${mlStatus.connected ? 'connected' : 'disconnected'}`}
        />

        <div>
          <strong>
            {mlStatus.connected ? 'ML service connected' : 'ML service unavailable'}
          </strong>
          <small>{mlStatus.message}</small>
        </div>
      </div>
    </aside>
  )
}

export default Navbar
