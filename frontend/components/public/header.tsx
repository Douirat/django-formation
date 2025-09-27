'use client'

import { authUser } from '../../contexts/authContext'
import Link from "next/link"

export default function HeaderComponent() {
    const { loggedUser, toggleToCostumer, toggleToCompany, Logout} = authUser()

    // create a function to handle logout:
    const triggerLogout = () => {
        const token = localStorage.getItem("authToken")
        console.log("Logging out with token:", token);

        if (!token) {
            console.error("No auth token found");
        } else {
            fetch("http://127.0.0.1:8000/customers/logout/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
            })
                .then(async (res) => {
                    if (!res.ok) {
                        // server returned an error
                        const text = await res.text();
                        console.error("Logout failed:", text);
                        return;
                    }
                    const data = await res.json();
                    console.log("Logout response:", data);
                    localStorage.removeItem("authToken");
                    Logout();
                })
                .catch((err) => {
                    console.error("Logout error:", err);
                });

        }
    }

    return (
        <>
            {loggedUser != "" ? (
                <header>
                    <div>
                        <Link href="/">Home</Link>
                        <Link href="/profile">Profile</Link>
                    </div>
                    <div>
                        <Link href="/services">Services</Link>
                        <button onClick={triggerLogout}>Logout</button>
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
