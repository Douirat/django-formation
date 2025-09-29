// lib/types/user.ts
export default interface User {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  user_type: string; // differentiates company vs customer
  date_of_birth?: string; // optional because companies may not have DOB
  field_of_work?: string; // optional because only companies have this
}

// i unified my users to ease the work flow and debuging and the option helps determine which user is(costumer/company)

/**
==> Example objects:
const customerExample: User = {
  email: "test3@example.com",
  username: "tester3",
  password: "secret123",
  password_confirm: "secret123",
  user_type: "customer",
  date_of_birth: "1995-05-20"
};

const companyExample: User = {
  email: "company@example.com",
  username: "mycompany",
  password: "securePass123",
  password_confirm: "securePass123",
  user_type: "company",
  field_of_work: "Software Development"
};
*/