"use client";
import { useState, useEffect } from "react";
import CostumerRegistrationForm from "../../components/user/registration_form";
import { authUser } from "../../contexts/authContext";

export default function RegistrationPage() {
  const {chosen_user, chooseCostumer, chooseCompany, loggedUser, toggleToCostumer, toggleToCompany, Logout } = authUser();

  return (
    <div>
      {chosen_user === "costumer" || chosen_user === "company" ? (
        <div>
          <CostumerRegistrationForm />
        </div>
      ) : (
        <div>
          <p>Please choose user type</p>
          <button onClick={chooseCostumer}>costumer</button>
          <button onClick={chooseCompany}>Company</button>
        </div>
      )}
    </div>
  );
}
