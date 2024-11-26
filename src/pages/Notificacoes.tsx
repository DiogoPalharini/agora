import { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { Projeto } from "../Type/Projeto";
import NotificacaoPedido from "../components/NotificacaoPedido/NotificacaoPedido";
import NotificacaoAlerta from "../components/NotificacaoAlerta/NotificacaoAlerta";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { AuthContext } from "../hook/ContextAuth";
import "../styles/Notificacoes.css";
import { Toast } from "../components/Swal/Swal";

const Notificacoes = () => {
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [projetosFiltrados, setProjetosFiltrados] = useState<Projeto[]>([]);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const { adm } = useContext(AuthContext);

    const fetchProjetos = async () => {
        try {
            const response = await axios.get("http://localhost:8080/projeto/listar");
            setProjetos(response.data);
        } catch (error) {
            console.error("Erro ao buscar projetos:", error);
        }
    };

    const fetchPedidos = async () => {
        try {
            const response = await axios.get("http://localhost:8080/permissao/pedidos", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            console.log("Pedidos pendentes recebidos:", response.data);
            setPedidos(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados dos pedidos:", error);
        }
    };
    

    const handleAprovar = async (id: number) => {
        try {
            console.log("Aprovando solicitação:", { id, adminAprovadorId: adm?.id });
    
            const response = await axios.post(
                `http://localhost:8080/permissao/aceitar/${id}`,
                {}, // Enviando um objeto vazio como corpo
                {
                    headers: {
                        Authorization: `Bearer ${adm?.token}`,
                        "Content-Type": "application/json"
                    },
                    params: {
                        adminAprovadorId: adm?.id,
                    },
                }
            );
    
            console.log("Resposta do servidor:", response.data);
    
            Toast.fire({
                icon: "success",
                title: "Pedido aprovado com sucesso!",
                position: "top",
                background: "#ffffff",
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.style.marginTop = "32px";
                    const progressBar = toast.querySelector(".swal2-timer-progress-bar") as HTMLElement;
                    if (progressBar) {
                        progressBar.style.backgroundColor = "#28a745"; // Verde
                    }
                },
            });
    
            // Remover o pedido da lista após aprovação
            setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido.id !== id));
        } catch (error: any) {
            console.error("Erro ao aprovar o pedido:", error);
            if (error.response) {
                console.error("Erro do servidor:", error.response.data);
            }
            Toast.fire({
                icon: "error",
                title: "Erro ao aprovar o pedido",
                position: "top",
                background: "#ffffff",
            });
        }
    };
    

    const handleRejeitar = async (id: number) => {
        try {
            await axios.post(`http://localhost:8080/permissao/negar/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
                params: {
                    adminAprovadorId: adm?.id,
                },
            });
            Toast.fire({
                icon: "success",
                title: "Pedido negado com sucesso!",
                position: "top",
                background: "#ffffff",
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.style.marginTop = "32px";
                    const progressBar = toast.querySelector(".swal2-timer-progress-bar") as HTMLElement;
                    if (progressBar) {
                        progressBar.style.backgroundColor = "#28a745"; // Verde
                    }
                },
            });
            setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido.id !== id));
        } catch (error) {
            console.error("Erro ao negar o pedido:", error);
        }
    };

    const calcularDiasParaVencer = (dataTermino: number[]): number => {
        const hoje = new Date();
        const dataTerminoDate = new Date(dataTermino[0], dataTermino[1] - 1, dataTermino[2]);
        const diferenca = dataTerminoDate.getTime() - hoje.getTime();
        return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
    };

    const formatarData = (data: Date): string => {
        const ano = data.getFullYear();
        const mes = (data.getMonth() + 1).toString().padStart(2, "0");
        const dia = data.getDate().toString().padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    };

    const filtrarProjetos = useCallback(() => {
        const hoje = new Date();
        const seteDias = new Date();
        seteDias.setDate(hoje.getDate() + 7);
    
        const hojeFormatado = formatarData(hoje);
        const seteDiasFormatado = formatarData(seteDias);
    
        const projetosFiltrados = projetos
            .filter((projeto) => {
                if (!projeto.dataTermino || projeto.dataTermino.length !== 3) {
                    // Ignora se a dataTermino for nula ou não tiver o formato esperado
                    return false;
                }
    
                const dataTermino = new Date(projeto.dataTermino[0], projeto.dataTermino[1] - 1, projeto.dataTermino[2]);
                const dataTerminoFormatada = formatarData(dataTermino);
    
                return dataTerminoFormatada >= hojeFormatado && dataTerminoFormatada <= seteDiasFormatado;
            })
            .map((projeto) => ({
                ...projeto,
                diasParaVencer: calcularDiasParaVencer(projeto.dataTermino),
            }))
            .sort((a, b) => a.diasParaVencer - b.diasParaVencer);
    
        setProjetosFiltrados(projetosFiltrados);
    }, [projetos]);
    

    useEffect(() => {
        fetchProjetos();
        fetchPedidos();
    }, []);

    useEffect(() => {
        filtrarProjetos();
    }, [projetos, filtrarProjetos]);

    return (
        <div className="notif_container">
            <Sidebar />
            <h1 className="notif_titulo">Notificações</h1>
            <div className="notif_meio">
                <div className="notif_meio_esq">
                    <h2 className="notif_subtitulo">Pedidos de Alteração</h2>
                    {pedidos.length > 0 ? (
                        pedidos.map((pedido) => (
                            <NotificacaoPedido
                                key={pedido.id}
                                pedido={pedido}
                                onAprovar={handleAprovar}
                                onRejeitar={handleRejeitar}
                            />
                        ))
                    ) : (
                        <p className="notif_nenhum">Não há pedidos de alteração no momento.</p>
                    )}
                </div>
                <div className="notif_divisoria"></div>
                <div className="notif_meio_dir">
                    <h2 className="notif_subtitulo">Alertas de Vencimento</h2>
                    {projetosFiltrados.length > 0 ? (
                        projetosFiltrados.map((projeto) => (
                            <NotificacaoAlerta
                                key={projeto.id}
                                id={projeto.id}
                                dataInicio={projeto.dataInicio}
                                dataTermino={projeto.dataTermino}
                                diasParaVencer={calcularDiasParaVencer(projeto.dataTermino)}
                            />
                        ))
                    ) : (
                        <p className="notif_nenhum">Não há alertas de vencimento no momento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notificacoes;