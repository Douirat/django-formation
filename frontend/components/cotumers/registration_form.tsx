"use client";

import Costumer from "../../lib/types/costumer";
import { useState } from "react";
import { authUser } from "../../contexts/authContext";

export default function CostumerRegistrationForm() {
  // form state
  const [costumerData, setCostmerData] = useState<Costumer>({
    email: "",
    password: "",
    username: "",
    birth_date: "", // SSR-safe string for <input type="date">
  });

  // message for errors/success
  const [message, setMessage] = useState<string>("");

  // extract context functionality:
  const { Login, toggleToCostumer } = authUser();
  // handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCostmerData((prev) => ({
      ...prev,
      [name]: value, // store as string
    }));
  };

  // validate input
  const isValidInput = (): boolean => {
    if (!costumerData.email || !costumerData.password || !costumerData.username || !costumerData.birth_date) {
      setMessage("Please fill in all fields");
      return false;
    }

    // email validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(costumerData.email)) {
      setMessage("Invalid email");
      return false;
    }

    // password validation: 8+ chars, uppercase, lowercase, number, special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(costumerData.password)) {
      setMessage(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
      );
      return false;
    }

    // birth_date validation
    // birth_date validation
    const birthDateObj = new Date(costumerData.birth_date);

    // Check if it's a valid date
    if (isNaN(birthDateObj.getTime())) {
      setMessage("Invalid birth date");
      return false;
    }

    // Check if older than 18
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    const dayDiff = today.getDate() - birthDateObj.getDate();

    let finalAge = age;
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      finalAge--;
    }

    if (finalAge < 18) {
      setMessage("You must be at least 18 years old");
      return false;
    }


    return true;
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!isValidInput()) return;

    try {
      const payload = {
        ...costumerData,
        birth_date: new Date(costumerData.birth_date).toISOString().split("T")[0], // convert string -> date
      };

      const res = await fetch("http://127.0.0.1:8000/customers/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Registration failed");
      setMessage("Registered successfully!");
      const data = await res.json()
      console.log("response", data); // THis line will wait foe the web API to resolve the promise then finish execution because of the blocking await keyword.
      localStorage.setItem("authToken", data.token);
      Login()
      // reset form
      setCostmerData({ email: "", password: "", username: "", birth_date: "" });
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={costumerData.username}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={costumerData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={costumerData.password}
        onChange={handleChange}
      />
      <input
        type="date"
        name="birth_date"
        value={costumerData.birth_date}
        onChange={handleChange}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Register
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
}
