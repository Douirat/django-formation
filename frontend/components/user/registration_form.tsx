"use client";

import User from "../../lib/types/user";
import { useState } from "react";
import { authUser } from "../../contexts/authContext";
import {useRouter} from "next/navigation";
import { log } from "console";

export default function UserRegistrationForm() {
  // form state
  const [userData, setUserData] = useState<User>({
    email: "",
    username: "",
    password: "",
    password_confirm: "",
    user_type: "",
    date_of_birth: undefined,
    field_of_work: undefined,
  });

  // message for errors/success
  const [message, setMessage] = useState("");

  // router:
const router = useRouter()

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

  // setUserType(chosen_user)
  if (!userData.user_type) {
    userData.user_type = chosen_user;
  }
  console.log("user type: ", chosen_user);
  // handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value, // store as string
    }));
  };

  // validate input
  const isValidInput = (): boolean => {
    if (chosen_user == "costumer") {
      if (
        !userData.email ||
        !userData.password ||
        !userData.username ||
        !userData.date_of_birth ||
        !userData.user_type
      ) {
        setMessage("Please fill in all fields");
        return false;
      }
    } else if (chosen_user == "company") {
      if (
        !userData.email ||
        !userData.password ||
        !userData.username ||
        !userData.field_of_work ||
        !userData.user_type
      ) {
        setMessage("Please fill in all fields");
        return false;
      }
    } else {
    }

    // email validation
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)
    ) {
      setMessage("Invalid email");
      return false;
    }

    // password validation: 8+ chars, uppercase, lowercase, number, special
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      setMessage(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
      );
      return false;
    }

    // date_of_birth validation
    // date_of_birth validation
    if (chosen_user == "costumer") {
      const dob = userData.date_of_birth
        ? new Date(userData.date_of_birth)
        : new Date("");

      // Check if it's a valid date
      if (isNaN(dob.getTime())) {
        setMessage("Invalid birth date");
        return false;
      }

      // Check if older than 18
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      let finalAge = age;
      // Adjust if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        finalAge--;
      }

      if (finalAge < 18) {
        setMessage("You must be at least 18 years old");
        return false;
      }
    }

    return true;
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    console.log("user data: ", userData);
    if (!isValidInput()) return;

    try {
      var payload = {
        ...userData,
      };

      if (chosen_user == "costumer") {
        payload = {
          ...userData,
          date_of_birth: new Date(
            userData.date_of_birth ? userData.date_of_birth : ""
          )
            .toISOString()
            .split("T")[0],
        };
      }

      const res = await fetch(
        `http://127.0.0.1:8000/authentication/register_${chosen_user}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Registration failed");
      setMessage("Registered successfully!");
      const data = await res.json();
      setTheLoggedUser(data.user.user_type)
      router.push('/')
      console.log("response", data); // THis line will wait foe the web API to resolve the promise then finish execution because of the blocking await keyword.
      localStorage.setItem("authToken", data.token);
      
      // reset form

      setUserData({
        email: "",
        username: "",
        password: "",
        password_confirm: "",
        user_type: "company",
        date_of_birth: undefined,
        field_of_work: undefined,
      });
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-sm mx-auto"
    >
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={userData.username}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={userData.password}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password_confirm"
        placeholder="Password confirmation"
        value={userData.password_confirm}
        onChange={handleChange}
      />

      {chosen_user === "costumer" ? (
        <input
          type="date"
          name="date_of_birth"
          value={
            userData.date_of_birth
              ? userData.date_of_birth.toString().split("T")[0]
              : ""
          }
          onChange={handleChange}
        />
      ) : (
        <select
          name="field_of_work"
          value={userData.field_of_work}
          onChange={handleChange}
        >
          <option value="">Select Field of Work</option>
          <option value="Air Conditioner">Air Conditioner</option>
          <option value="All in One">All in One</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Electricity">Electricity</option>
          <option value="Gardening">Gardening</option>
          <option value="Home Machines">Home Machines</option>
          <option value="Housekeeping">Housekeeping</option>
          <option value="Interior Design">Interior Design</option>
          <option value="Locks">Locks</option>
          <option value="Painting">Painting</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Water Heaters">Water Heaters</option>
        </select>
      )}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Register
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
}
