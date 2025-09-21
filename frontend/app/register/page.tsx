'use client'
import { useState, useEffect } from 'react'
import CostumerRegistrationForm from "../../components/cotumers/registration_form";

export default function RegistrationPage() {
    const [userType, setUserType] = useState<'costumer' | 'company' | ''>('')
    const setCostumer = () => setUserType("costumer")
    const setCompany = () => setUserType("company")

    return (
        <div>
            {
                userType === "costumer" ? (
                    <div>
                        <CostumerRegistrationForm />
                    </div>
                ) : userType === "company" ? (
                    <div>Company form</div>
                ) : (
                    <div>
                        <p>Please choose user type</p>
                        <button onClick={setCostumer}>costumer</button>
                        <button onClick={setCompany}>Company</button>
                    </div>

                )
            }

        </div>
    )
}