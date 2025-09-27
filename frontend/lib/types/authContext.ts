export default interface AuthentificationContext {
    chosen_user: string; // for registration purpose.
    chooseCostumer: () => void; // for registration purpose.
    chooseCompany: () => void; // for registration purpose.
    loggedUser: string;
    toggleToCostumer: () => void;
    toggleToCompany: () => void;
    setTheLoggedUser: (arg: string) => void;
    authenticate: () => any;
    Logout: () => void;
}
