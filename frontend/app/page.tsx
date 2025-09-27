'use client'
import { authUser } from '../contexts/authContext'
import { useState, useEffect } from 'react'


export default function HomePage() {
    const { chosen_user, chooseCostumer, chooseCompany, loggedUser, toggleToCostumer, toggleToCompany, authenticate ,Logout } = authUser()
    const [toggleLogginRegistration, setToggleLogginRegistration] = useState(true)
    
  useEffect(() => {
    const fetchUser = async () => {
      const t = await authenticate();
      console.log("Authenticated user:", t);
    };
    fetchUser();
  }, []);


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