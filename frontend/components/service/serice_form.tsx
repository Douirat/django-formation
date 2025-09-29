"use client";

import { useState } from "react";

export default function Service_form() {
  const [service, setService] = useState({
    company: 0,
    name: "",
    description: "",
    price_per_hour: 0,
    field: "",
    created_at: "",
  });
}
