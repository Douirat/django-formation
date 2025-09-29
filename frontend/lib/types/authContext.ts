export default interface AuthentificationContext {
    chosen_user: string; // for registration purpose.
    chooseCostumer: () => void; // for registration purpose.
    chooseCompany: () => void; // for registration purpose.
    loggedUser: any;
    setTheLoggedinUser: (user: any) => void;
    authenticate: () => any;
    Logout: () => void;
}
