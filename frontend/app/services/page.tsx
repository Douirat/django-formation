"use client";

import { useState, useEffect } from "react";
import { authUser } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import Service_form from "../../components/service/company_service";
export default function LoginPage() {
  const {
    loggedUser,
    authenticate,
    Logout,
  } = authUser();

  const router = useRouter();
  const [activeForm, setActiveForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const user = await authenticate();
      if (user != null) {
        console.log(`the user is already loged: ${user}`);
        
        setIsLoading(false);
      } else {
        router.push("/");
      }
    };
    check();
  }, []);




  useEffect(()=>{
  if(!loggedUser){
    router.push("/")
  }
}, [loggedUser])


  return (
    <>
      {isLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : loggedUser?.user_type != "costumer" ? (activeForm ? (
        <div>
          <Service_form/>
        </div>
      ) : (
        <main>
          <p>Hello mother fucker</p>
          <button onClick={() => setActiveForm(true)}>create service</button>
        </main>
      )) : (
        <div>
          <p>The user is a costumer</p>
        </div>
      )}
    </>
  );
}
