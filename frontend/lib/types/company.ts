export interface Company {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  field_of_work: string; // TODO: Add the user type later so i will have to determine it by the user it self.
}

// {
//   "email": "company@example.com",
//   "username": "mycompany",
//   "password": "securePass123",
//   "password_confirm": "securePass123"
// }
