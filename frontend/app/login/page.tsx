"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Payload } from "../../lib/types/login";
import { authUser } from "../../contexts/authContext";

export default function LoginPage() {
  //router:
  const router = useRouter();

  // extract context functionality:
  const {
    chosen_user,
    chooseCostumer,
    chooseCompany,
    loggedUser,
    toggleToCostumer,
    toggleToCompany,
    setTheLoggedUser,
    Logout,
  } = authUser();

  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setMessage("All fields are requiered.");
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/authentication/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Login failed.");
      }

      const data = await res.json();
      console.log(data);
      setMessage("Login successful");
      setTheLoggedUser(data.user.user_type);
      localStorage.setItem("authToken", data.token);

      router.push("/");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    }
  };

  const isValid = (): boolean => {
    if (!payload.email || !payload.password) {
      return false;
    }
    return true;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-sm mx-auto"
    >
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={payload.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={payload.password}
        onChange={handleChange}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Login
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
}
