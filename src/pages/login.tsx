import { useContext, useState, useEffect } from "react";
import { useAuth } from "../hook/Auth";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../hook/Axios";
import axios from "axios";
import { AuthContext } from "../hook/ContextAuth";
import '../styles/Login.css';
import { erroror, Toast} from "../components/Swal/Swal";
import Navbar from "../components/Navbar/Navbar";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import IconeChave from "../img/chave.svg"

interface JwtPayLoad {
    tipo: string;
    sub: string;
}

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 1 * 60 * 1000; // 1 minuto

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { post } = useAxios();
    const [erro, setErro] = useState(false);
    const { setAdm } = useContext(AuthContext);
    const [attempt, setAttempt] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemExemplo, setMensagemExemplo] = useState("");

    useEffect(() => {
        const storedAttempts = localStorage.getItem("loginAttempts");
        const blockTimestamp = localStorage.getItem("blockTimestamp");

        if (storedAttempts) {
            setAttempt(parseInt(storedAttempts, 10));
        }

        if (blockTimestamp) {
            const currentTime = Date.now();
            if (currentTime - parseInt(blockTimestamp, 10) < BLOCK_TIME) {
                setIsBlocked(true);
                erroror("Você ainda está bloqueado. Tente novamente mais tarde.");
            } else {
                localStorage.removeItem("blockTimestamp");
                localStorage.setItem("loginAttempts", "0");
                setAttempt(0);
                setIsBlocked(false);
            }
        }
    }, []);

    useEffect(() => {
        // Adiciona a classe no-margin ao body quando o componente é montado
        document.body.classList.add("no-margin");
        
        // Remove a classe quando o componente é desmontado
        return () => {
            document.body.classList.remove("no-margin");
        };
    }, []);

    const validateSenha = (senha: string): boolean => {
        const senhaRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}[\]:;<>,.?/~`|-]{8,255}$/;
        return senhaRegex.test(senha);
    }

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleHome = () => {
        navigate("/")
    }
    

    const handleLogin = () => {

        if (isBlocked) {
            erroror("Você ainda está bloqueado. Tente novamente mais tarde.");
            setEmail("");
            setPassword("");
            setMensagemErro("Você excedeu o limite de tentativas.");
            setMensagemExemplo("Tente novamente mais tarde.");
            setErro(false);
            return;
        }

        if (attempt >= MAX_ATTEMPTS) {
            erroror("Você excedeu o limite de tentativas. Tente novamente mais tarde.");
            localStorage.setItem("blockTimestamp", Date.now().toString());
            setIsBlocked(true);
            return;
        }

        if (!email || !password) {
            erroror("Preencha todos os campos...");
            setErro(true);
            return;
        }

        if (!validateEmail(email)) {
            erroror("E-mail inválido...");
            setMensagemErro("Formato de E-mail inválido...");
            setErro(false);
            return;

        } else {
            setMensagemErro("");
        }

        if (!validateSenha(password)) {
            erroror("Senha inválida...");
            setMensagemErro("A senha deve conter no mínimo 8 caracteres");
            setErro(false);
            return;

        } else {
            setMensagemErro("");
        }

        post("http://localhost:8080/login", { email, password })
            .then(async (res) => {
                const data = res.data;
                const decoded = jwtDecode<JwtPayLoad>(data.token);
                const tipo = await axios.get(`http://localhost:8080/adm/${decoded.sub}/tipo`, {
                    headers: { Authorization: `Bearer ${data.token}` },
                });
                const user = await axios.get(`http://localhost:8080/adm/${decoded.sub}/infoAdm`, {
                    headers: { Authorization: `Bearer ${data.token}` },
                }
                )

                const admData = {
                    token: data.token,
                    tipo: tipo.data,
                    sub: decoded.sub,
                    email: user.data.email,
                    nome: user.data.nome,
                    telefone: user.data.telefone,
                    cpf: user.data.cpf,
                    id: user.data.id,
                    ativo: user.data.ativo,
                };

                login(admData);
                setAdm(admData);
                Toast.fire({
                    icon: 'success',
                    title: 'Login efetuado com sucesso!',
                });
                navigate("/", { replace: true });

                localStorage.setItem("loginAttempts", "0");
                setAttempt(0);
            })
            .catch(() => {
                const newAttempt = attempt + 1;
                setAttempt(newAttempt);
                localStorage.setItem("loginAttempts", newAttempt.toString());

                if (newAttempt >= MAX_ATTEMPTS) {
                    erroror("Você excedeu o limite de tentativas. Tente novamente mais tarde.");
                    localStorage.setItem("blockTimestamp", Date.now().toString());
                    setIsBlocked(true);
                    setEmail("");
                    setPassword("");
                    setMensagemErro("Você excedeu o limite de tentativas.");
                    setMensagemExemplo("Tente novamente mais tarde.");
                    setErro(false);
                    return;
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: 'Verifique suas informações.',
                        heightAuto: false,
                        backdrop: false,
                    });
                    setMensagemErro("");
                    setMensagemExemplo("");
                    setErro(true);
                    setPassword("");
                }
            });
    };

    return (
        <>
        <Navbar />
        <div className="login_container">
            <div className="login_card">
                <div className="login_card_esq">
                    <h1>Entrar como administrador</h1>
                    <input
                        aria-placeholder="Email"
                        type="text" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <input 
                        aria-placeholder="Senha"
                        type="password" 
                        placeholder="Senha" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />

                    {mensagemErro && <div className="login_erro">{mensagemErro} <br/> {mensagemExemplo}</div>}
                    {erro && <div className="login_erro">Credenciais inválidas. Verifique suas informações.</div>}
                    <BotaoCTA img={IconeChave} escrito="Entrar" onClick={handleLogin} aparencia="primario" />
                    <p onClick={handleHome} className="login_link">Ir para a página inicial</p>
                </div>
                <div className="login_card_dir">
                </div>
            </div>
        </div>
        </>
    );
}