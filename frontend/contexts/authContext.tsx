'use client'
import { createContext, useContext, useState, ReactNode } from "react"
import AuthentificationContext from "../lib/types/authContext"

const authContext = createContext<AuthentificationContext | undefined>(undefined)


// create the auth provider.
export default function AuthProvider({ children }: { children: ReactNode }) {
    const [loggedUser, setLoggedUser] = useState<"costumer" | "company" | "">("")
    const [isLogged, setIsLogged] = useState(false)
    const Login = () => setIsLogged(true)
    const Logout = () => setIsLogged(false)
    const toggleToCostumer = () => setLoggedUser("costumer")
    const toggleToCompany = () => setLoggedUser("company")

    return (
        <authContext.Provider value={{ isLogged, loggedUser, toggleToCostumer, toggleToCompany, Login, Logout }}>{children}</authContext.Provider>
    )
}



// The auth provider user.
export const authUser = () => {
    const context = useContext(authContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}