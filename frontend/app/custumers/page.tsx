'use client'
import { authUser } from '../../contexts/authContext'
import { useState } from 'react'

export default function HomePage() {
    const { isLogged, loggedUser, toggleToCostumer, toggleToCompany, Login, Logout } = authUser()
    const [toggleLogginRegistration, setToggleLogginRegistration] = useState(true)
    return (
        <main>
            {isLogged ? (
                <>
                    <p>wellcome home Ben Doe.</p>
                    <button onClick={Logout}>Logout</button>
                </>
            ) : (
                <>
                    {
                        toggleLogginRegistration ? (
                            <>
                                <h2>Login</h2>
                                <button onClick={()=> {setToggleLogginRegistration(false)}}>register</button>
                            </>
                        ) : (
                            <>
                                <h2>Registration</h2>
                                <button onClick={()=> {setToggleLogginRegistration(true)}}>loggin</button>
                            </>
                        )
                    }
                </>
            )}
        </main>
    )
}