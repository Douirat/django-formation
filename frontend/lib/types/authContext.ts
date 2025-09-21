
export default interface AuthentificationContext {
    isLogged: boolean;
    loggedUser: string;
    toggleToCostumer: () => void;
    toggleToCompany: () => void;
    Login: () => void;
    Logout: () => void;
}
