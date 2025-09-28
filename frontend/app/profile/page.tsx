"use client";

import { useState, useEffect } from "react";
import { authUser } from "../../contexts/authContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const u = await authenticate();
      if (u != null) {
        console.log(`the user is already loged: ${u}`);
        router.push("/");
      } else {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  return (
    <>
      {isLoading ? (
        <div>
            <p>Loading...</p>
        </div>
      ) : (
        <main>
          <p>Hello mother fucker</p>
        </main>
      )}
    </>
  );
}
