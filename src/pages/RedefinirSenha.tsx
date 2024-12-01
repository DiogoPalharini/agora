import { useEffect, useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/RedefinirSenha.css";
import Navbar from "../components/Navbar/Navbar";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import IconeChave from "../img/chave.svg"

export const RedefinirSenha = () => {
    const [novaSenha, setNovaSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const handlePasswordChange = async (e: any) => {
        e.preventDefault();

        if (!token) {
            setMensagem("Token inválido ou ausente.");
            return;
        }

        try {
            await axios.post(`http://localhost:8080/adm/redefinir-senha?token=${token}`, novaSenha, {
                headers: {
                    "Content-Type": "text/plain",
                }
            });
            setMensagem("Senha redefinida com sucesso! Redirecionando para login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error: any) {
            let errorMessage;
            if (error.response?.data) {
                errorMessage = typeof error.response.data === "string"
                    ? error.response.data
                    : error.response.data.error || "Erro desconhecido ao redefinir a senha.";
            } else {
                errorMessage = "Erro ao redefinir a senha.";
            }
            setMensagem(errorMessage);
        }
    };

    useEffect(() => {
        // Adiciona a classe no-margin ao body quando o componente é montado
        document.body.classList.add("no-margin");
        
        // Remove a classe quando o componente é desmontado
        return () => {
            document.body.classList.remove("no-margin");
        };
    }, []);

    return (
        <>
        <Navbar />
        <div className="resen_container">
            <div className="resen_card">
            <h2>Redefinir Senha</h2>
            <p>Certifique-se que sua nova senha tenha pelo menos 08 caracteres.</p>
            <form onSubmit={handlePasswordChange}>
                <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
                <BotaoCTA img={IconeChave} escrito="Redefinir Senha" aparencia="primario" type="submit" />
            </form>
            {mensagem && <p className="resen_mensagem">{mensagem}</p>}
        </div>
        </div>
    </>
    );
};
