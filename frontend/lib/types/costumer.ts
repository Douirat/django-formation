
// Create a type for the users (costumers/companies) to help me with decifering 
// user related data comming from the back end authenticate
//  the user:
// lib/types/costumer.ts
export default interface Costumer {
    email: string;
    password: string;
    username: string;
    birth_date: string; // store as string for input
}

//   -d '{
//     "email": "test3@example.com",
//     "password": "secret123",
//     "username": "tester3",
//     "birth_date": "1995-05-20"
//   }'
