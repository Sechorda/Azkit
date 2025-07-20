import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home24Filled } from '@fluentui/react-icons'
import '../../../styles/sidebar.css'

const SideBar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-link">
          <Home24Filled />
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/profile" className="sidebar-link">
          Profile
        </NavLink>
        <NavLink to="/tool1" className="sidebar-link">
          Tool 1
        </NavLink>
        <NavLink to="/tool2" className="sidebar-link">
          Tool 2
        </NavLink>
        <NavLink to="/tool3" className="sidebar-link">
          Tool 3
        </NavLink>
        <NavLink to="/tool4" className="sidebar-link">
          Tool 4
        </NavLink>
      </nav>
    </div>
  )
}

export default SideBar
