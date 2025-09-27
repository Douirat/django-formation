
// Create a type for the users (costumers/companies) to help me with decifering 
// user related data comming from the back end authenticate
//  the user:
// lib/types/costumer.ts
export default interface Costumer {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    date_of_birth: string; // store as string for input
    user_type: string; // TODO: Add user type later:
}

// {
//   "email": "test3@example.com",
//   "password": "secret123",
//   "password_confirm": "secret123",
//   "username": "tester3",
//   "date_of_birth": "1995-05-20"
// }

