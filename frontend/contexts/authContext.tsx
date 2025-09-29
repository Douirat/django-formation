"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import AuthentificationContext from "../lib/types/authContext";
import User from "../lib/types/user";


const authContext = createContext<AuthentificationContext | undefined>(
  undefined
);

// create the auth provider.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedUser, setLoggedUser] = useState< User | null >(null);

  // TODO: set the loggedin user:
const setTheLoggedinUser = (user: User) => {
  setLoggedUser(user)
}

  // const [isLogged, setIsLogged] = useState(false)
  // const Login = () => setIsLogged(true)
  const [chosen_user, setChosenUser] = useState<"costumer" | "company" | "">( 
    ""
  );  // To help with registration from.
  const chooseCostumer = () => setChosenUser("costumer");
  const chooseCompany = () => setChosenUser("company");


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
      setLoggedUser(user)
      return user;
    } catch (err) {
      console.error("Authentication check failed:", err);
      return null;
    }
  };

  // empty the user.
  const Logout = () => setLoggedUser(null);

  return (
    <authContext.Provider
      value={{
        chosen_user, // to determine which registration form
        chooseCostumer, //chosen
        chooseCompany,
        loggedUser,  // determine the type of the user (costumer/company).
        authenticate,  // check the visitor session.
        setTheLoggedinUser,
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
