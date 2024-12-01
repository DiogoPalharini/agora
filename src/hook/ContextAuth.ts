import { createContext } from "react";
import { AdmProps } from "../Type/Adm";

interface AuthContextProps {
    token: any;
    adm: AdmProps | undefined | null,
    setAdm: (adm: AdmProps | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
    adm: null,
    setAdm: () => {}
});