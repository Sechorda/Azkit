import React from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import SignInButton from '../login/SignInButton'
import SignOutButton from '../login/SignOutButton'
import { APP_NAME } from '../../../App'
import '../../../styles/navbar.css'

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">{APP_NAME}</div>
      <div className="navbar-actions">
        <UnauthenticatedTemplate>
          <SignInButton />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <SignOutButton />
        </AuthenticatedTemplate>
      </div>
    </nav>
  )
}

export default NavBar
