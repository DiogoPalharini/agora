import React, { useContext } from "react";
import IconeBolsista from "../../img/bolsistas.svg";
import IconeEditar from "../../img/editar.svg";
import IconeLixeira from "../../img/lixeira_branco.svg";
import "./CardBolsista.css";
import axios from "axios";
import { AuthContext } from "../../hook/ContextAuth";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Toast } from "../Swal/Swal";

interface CardBolsistaProps {
    id: number;
    nome: string;
    areaAtuacao: string;
    projeto_id: number;
    convenio: string;
    valorBolsa: string;
    duracaoBolsa: string;
    cidade: string;
    telefone: string;
    cpf: string;
}

const CardBolsista: React.FC<CardBolsistaProps> = ({
    id,
    nome,
    areaAtuacao,
    projeto_id,
    convenio,
    valorBolsa,
    duracaoBolsa,
    cidade,
    telefone,
    cpf,
}) => {

    const navigate = useNavigate();
    const { adm } = useContext(AuthContext); // Acessa o token do administrador autenticado

    // Função para excluir o bolsista
    const excluirBolsista = async () => {
        const result = await Swal.fire({
            title: 'Deseja excluir o cadastro deste bolsista?',
            text: 'Esta ação não pode ser desfeita.',
            showDenyButton: true,
            confirmButtonText: 'Sim',
            denyButtonText: 'Não',
            width: 620,
            confirmButtonColor: 'rgb(224, 40, 86)',
            denyButtonColor: 'rgb(0,114,187)',
            heightAuto: false,
            backdrop: true,
            customClass: {
                confirmButton: 'confirmButton',
                denyButton: 'denyButton',
            }
        });

        if (result.isConfirmed) {
            try {
                // Exclui o bolsista
                await axios.delete(`http://localhost:8080/bolsistas/deletar/${id}?idAdm=${adm?.id}`, {
                    headers: {
                        Authorization: `Bearer ${adm?.token}`, // Cabeçalho de autorização com token
                        "Content-Type": "application/json",
                    },
                });

                Toast.fire({
                    icon: 'success',
                    title: "Bolsista excluído com sucesso!",
                    position: 'top',
                    background: '#ffffff',
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.style.marginTop = '32px';
                        const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
                        if (progressBar) {
                            progressBar.style.backgroundColor = '#28a745';
                        }
                    }
                });

                navigate('/'); // Redireciona para uma página temporária
                setTimeout(() => navigate('/adm/relatorio'), 10); // Volta para a página atual após um pequeno delay
            
            } catch (error) {
                console.error("Erro ao excluir bolsista:", error);
                alert("Erro ao excluir bolsista.");
            }
        }
    };

    return (
        <div className="cabo_container">
            <div className="cabo_info">
                <div className="cabo_esq">
                    <img className="cabo_esq_img" src={IconeBolsista} alt="Ícone Bolsista" />
                    <div className="cabo_botoes mobile">
                        <div className="cabo_botoes botao" onClick={() => navigate(`/adm/bolsista/editar/${id}`)}>
                        <img src={IconeEditar} alt="Ícone Editar" />
                    </div>
                        <div className="cabo_botoes botao excluir" onClick={excluirBolsista}>
                        <img src={IconeLixeira} alt="Ícone Lixeira" />
                </div>
            </div>
                </div>
                <div className="cabo_meio_1">
                    <p><span>Nome: </span>{nome}</p>
                    <p><span>Área Atuação: </span>{areaAtuacao}</p>
                    <p><span>Projeto: </span>{projeto_id}</p>
                </div>
                <div className="cabo_meio_2">
                    <p><span>Convênio: </span>{convenio}</p>
                    <p><span>Valor Bolsa: </span>{valorBolsa}</p>
                    <p><span>Duração Bolsa: </span>{duracaoBolsa}</p>
                </div>
                <div className="cabo_dir">
                    <p><span>Cidade: </span>{cidade}</p>
                    <p><span>Telefone: </span>{telefone}</p>
                    <p><span>CPF: </span>{cpf}</p>
                </div>
            </div>
            <div className="cabo_botoes desktop">
                <div className="cabo_botoes botao" onClick={() => navigate(`/adm/bolsista/editar/${id}`)}>
                    <img src={IconeEditar} alt="Ícone Editar" />
                </div>
                <div className="cabo_botoes botao excluir" onClick={excluirBolsista}>
                    <img src={IconeLixeira} alt="Ícone Lixeira" />
                </div>
            </div>
        </div>
    );
};

export default CardBolsista;
