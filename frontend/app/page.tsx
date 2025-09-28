"use client";
import { authUser } from "../contexts/authContext";
import { useState, useEffect } from "react";

export default function HomePage() {
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
  const [toggleLogginRegistration, setToggleLogginRegistration] =
    useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const t = await authenticate();
      
      console.log("Authenticated user:", t);
      if (t)[
        setTheLoggedUser(t.user_type)
      ]
      setIsLoading(false)
    };
    fetchUser();
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loadin ...</p>
      ) : loggedUser === "costumer" ? (
        <h1>Welcome Customer!</h1>
      ) : loggedUser === "company" ? (
        <h1>Welcome Company!</h1>
      ) : (
        <h1>Please log in</h1>
      )}
    </>
  );
}
