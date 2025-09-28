"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import AuthentificationContext from "../lib/types/authContext";
import User from "@/lib/types/user";
import { promises } from "dns";

const authContext = createContext<AuthentificationContext | undefined>(
  undefined
);

// create the auth provider.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedUser, setLoggedUser] = useState<"costumer" | "company" | "">("");

  // const [isLogged, setIsLogged] = useState(false)
  // const Login = () => setIsLogged(true)
  const [chosen_user, setChosenUser] = useState<"costumer" | "company" | "">(
    ""
  );
  const chooseCostumer = () => setChosenUser("costumer");
  const chooseCompany = () => setChosenUser("company");
  const toggleToCostumer = () => setLoggedUser("costumer");
  const toggleToCompany = () => setLoggedUser("company");
  const setTheLoggedUser = (arg: string) => {
    if (arg == "costumer") {
      toggleToCostumer();
    } else if (arg == "company") {
      toggleToCompany();
    } else {
      console.log("wrong user type");
    }
  };

  // Create the uthentication function to check if the user has a valid session:
  const authenticate = async (): Promise<User | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    console.log("the token", token);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/authentication/authenticate/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (!res.ok) return null;

      const user: User = await res.json();
      console.log("The logged in user is:", user);

      return user;
    } catch (err) {
      console.error("Authentication check failed:", err);
      return null;
    }
  };

  // empty the user.
  const Logout = () => setLoggedUser("");

  return (
    <authContext.Provider
      value={{
        chosen_user,
        chooseCostumer,
        chooseCompany,
        loggedUser,
        toggleToCostumer,
        toggleToCompany,
        setTheLoggedUser,
        authenticate,
        Logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

// The auth provider user.
export const authUser = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
