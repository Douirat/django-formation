"use client";

import React,  { useEffect, useState } from "react";
import { Service } from "../../lib/types/service";
import { authUser } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import Render_fields_options from "./services_select";


// the service creation form:
export default function Service_form() {
  const router = useRouter();
  const [service, setService] = useState<Service>({
    name: "",
    description: "",
    price_per_hour: 0,
    field: "",
    // created_at: "",
  });

  const { loggedUser, setTheLoggedinUser, Logout } = authUser();

  const [message, setMessage] = useState("");

  // whene ever the user changes input:
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // check input validation:
  const isValid = (): boolean => {
    if (
      !service.company ||
      service.description ||
      service.field ||
      service.price_per_hour
    ) {
      setMessage("All input fields are requiered");
      return false;
    }

    if (!isNaN(service.price_per_hour)) {
      setMessage("The price should be a valid number.");
      return false;
    }

    return true;
  };



  // handle the submition:
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (service.company == 0) {
      service.company = loggedUser.id;
    }
    if (loggedUser.field_of_work != "All in One") {
      service.field = loggedUser.field_of_work;
    }
    if (!isValid) {
      setMessage("All input fields are requiered");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("User is not logged in.");
      const payload = {
        ...service,
      };
      console.log("the new created service: ", payload);

      const response = await fetch(`http://127.0.0.1:8000/services/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error creating a service");
      }

      setMessage("service created successfully.");
      console.log(response.json());
    } catch (err: any) {
      setMessage(err.message || "something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="name"
        value={service.name}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        value={service.description}
        onChange={handleChange}
      ></textarea>

      <input
        type="number"
        name="price_per_hour"
        placeholder="price per hour"
        value={service.price_per_hour}
        onChange={handleChange}
      />

      {loggedUser?.field_of_work != "All in One" ? (
        <input
          type="text"
          name="Field"
          placeholder="fIeld is already determined: "
          value={loggedUser?.field_of_work}
          disabled
        />
      ) : (
        Render_fields_options(service.field, handleChange)
      )}

      <button type="submit">Create</button>
      <p></p>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
}
