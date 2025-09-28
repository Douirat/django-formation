"use client";
import { useState, useEffect } from "react";
import CostumerRegistrationForm from "../../components/user/registration_form";
import { authUser } from "../../contexts/authContext";
import { useRouter } from "next/navigation";

export default function RegistrationPage() {
const router = useRouter()

 const {
    chosen_user,
    chooseCostumer,
    chooseCompany,
    loggedUser,
    toggleToCostumer,
    toggleToCompany,
    setTheLoggedUser,
    authenticate,
    Logout,
  } = authUser();
  const [isLoading, setIsLoading] = useState(true)

useEffect(()=>{
const check = async ()=>{
  const u = await authenticate()
  if(u != null){
    console.log(`the user is already loged: ${u}`)
    router.push("/")
  } else {
    setIsLoading(false)
  }
}
check()
},
[]
)


  return (
    <>
    {
      isLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : (
        <div>
          {chosen_user === "costumer" || chosen_user === "company" ? (
            <div>
              <CostumerRegistrationForm />
            </div>
          ) : (
            <div>
              <p>Please choose user type</p>
              <button onClick={chooseCostumer}>costumer</button>
              <button onClick={chooseCompany}>Company</button>
            </div>
          )}
        </div>
      )
    }
    </>
  );
}
