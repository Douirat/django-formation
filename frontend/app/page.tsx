"use client";
import { authUser } from "../contexts/authContext";
import { useState, useEffect } from "react";

export default function HomePage() {
  const {
    loggedUser,
    authenticate,
  } = authUser();



  const [toggleLogginRegistration, setToggleLogginRegistration] =
    useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authenticate();
      
      if (user != null){
        console.log("Authenticated user:", user);
      }
      
      setIsLoading(false)
    };
    fetchUser();
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loadin ...</p>
      ) : loggedUser != null && loggedUser.user_type == "costumer" ? (
        <h1>Welcome Customer!</h1>
      ) : loggedUser != null && loggedUser.user_type === "company" ? (
        <h1>Welcome Company!</h1>
      ) : (
        <h1>Please log in</h1>
      )}
    </>
  );
}
