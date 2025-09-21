'use client'

import { authUser } from '../../contexts/authContext'
import { useState, useEffect } from 'react'
import Link from "next/link"

export default function HeaderComponent() {
    const { isLogged, loggedUser, toggleToCostumer, toggleToCompany, Login, Logout } = authUser()

    return (
        <>
            {isLogged ? (
                <header>
                    <div>
                    <Link href="/">Home</Link>
                    </div>
                    <div>
                    <Link href="/services">Services</Link>
                    <button onClick={Logout}>Logout</button>
                    </div>
                </header>
            ) : (
                <header>
                    <div>
                        <Link href="/">Home</Link>
                        <Link href="/services">Services</Link>
                    </div>
                    <div>
                        <Link href="/login">Login</Link>
                        <Link href="/register">Register</Link>
                    </div>
                </header>
            )}
        </>
    )
}
