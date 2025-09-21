'use client'
import { authUser } from '../contexts/authContext'
import { useState, useEffect } from 'react'


export default function HomePage() {
    const { isLogged, loggedUser, toggleToCostumer, toggleToCompany, Login, Logout } = authUser()
    const [toggleLogginRegistration, setToggleLogginRegistration] = useState(true)
    
    return (
        <main>
       {loggedUser === "customer" ? (
        <h1>Welcome Customer!</h1>
      ) : loggedUser === "company" ? (
        <h1>Welcome Company!</h1>
      ) : (
        <h1>Please log in</h1>
      )}
        </main>
    )
}