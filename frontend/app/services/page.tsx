"use client";

import { useState, useEffect } from "react";
import { authUser } from "../../contexts/authContext";
import { useRouter } from "next/navigation";

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
        
      } else {
        router.push("/");
        setIsLoading(false);
      }
    };
    check();
  }, []);


  const handleSubmit = () => {
    
  }

  return (
    <>
      {isLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : activeForm ? (
        <div>
          <form onSubmit={handleSubmit}>

          </form>
        </div>
      ) : (
        <main>
          <p>Hello mother fucker</p>
          <button onClick={() => setActiveForm(true)}>create service</button>
        </main>
      )}
    </>
  );
}
