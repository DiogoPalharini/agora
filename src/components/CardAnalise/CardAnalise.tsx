import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import "./CardAnalise.css";
import { AuthContext } from '../../hook/ContextAuth';
import IconeEditar from "../../img/editar.svg";
import IconeLixeira from "../../img/lixeira_branco.svg";
import Swal from 'sweetalert2';
import { Toast } from "../Swal/Swal";
import { useNavigate } from 'react-router-dom';

interface CardAnaliseProps {
    id: string;
    valorGasto: number;
    autor: string;
    informacoesAdicionais: string;
    resultadoObtido: boolean;
    idProjeto: string;
}

interface Projeto {
    id: number;
    referenciaProjeto: string;
    valor: number;
    nome: string;
}

const CardAnalise: React.FC<CardAnaliseProps> = ({
  id,
  valorGasto,
  autor,
  informacoesAdicionais,
  resultadoObtido,
  idProjeto,
}) => {

    const [nomeProjeto, setNomeProjeto] = useState<string>("");
    const [valorPrevisto, setValorPrevisto] = useState<number>(0);
    const { adm } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjeto = async () => {
            try {
                const response = await axios.get<Projeto>(
                    `http://localhost:8080/projeto/referencia?referenciaProjeto=${encodeURIComponent(idProjeto)}`, {
                    headers: {
                        Authorization: `Bearer ${adm?.token}`,
                        "Content-Type": "application/json",
                    },
                });
                const projetoData = response.data;
                setValorPrevisto(projetoData.valor);
                setNomeProjeto(projetoData.nome);
            } catch (error) {
                console.error("Erro ao buscar dados do projeto");
            }
        };
        fetchProjeto();
    }, [idProjeto, adm]);

    const diferenca = valorPrevisto - valorGasto;

    const formatarValor = (valor: number) =>
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const getClassAndFormattedDiff = (valor: number) => {
        if (valor > 0) {
            return { classe: 'verde', valorFormatado: `+${formatarValor(valor)}` };
        } else if (valor < 0) {
            return { classe: 'vermelho', valorFormatado: `${formatarValor(valor)}` };
        }
        return { classe: 'verde', valorFormatado: `+${formatarValor(valor)}` };
    };

    const { classe, valorFormatado } = getClassAndFormattedDiff(diferenca);

    const excluirAnalise = async () => {
        const result = await Swal.fire({
            title: 'Deseja excluir o cadastro dessa Análise?',
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
                // Exclui o Analise
                await axios.delete(`http://localhost:8080/analises/deletar/${id}?idAdm=${adm?.id}`, {
                    headers: {
                        Authorization: `Bearer ${adm?.token}`,
                        "Content-Type": "application/json",
                    },
                });

                Toast.fire({
                    icon: 'success',
                    title: "Análise excluída com sucesso!",
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
                console.error("Erro ao excluir Analise:", error);
                alert("Erro ao excluir Analise.");
            }
        }
    };

    return (
        <div className="cana_container">
            <div className="cana_cima">
                <div className="cana_cima_esq">
                    <p>{idProjeto}</p>
                    <h2>{nomeProjeto}</h2>
                </div>
                <div className="cana_cima_dir">
                  <div className="cabo_botoes botao">
                      <img src={IconeEditar} alt="Ícone Editar" onClick={() => navigate(`/adm/analise/editar/${id}`)}/>
                  </div>
                  <div className="cabo_botoes botao excluir" onClick={excluirAnalise}>
                      <img src={IconeLixeira} alt="Ícone Lixeira" />
                  </div>
                </div>
            </div>
            <div className="cana_baixo">
                <div className="cana_baixo_esq">
                    <div className="cana_baixo_linha primeiro">
                        <p>Valor previsto de Gasto:</p>
                        <p>{formatarValor(valorPrevisto)}</p>
                    </div>
                    <div className="cana_baixo_linha">
                        <p>Valor Real Gasto:</p>
                        <p>{formatarValor(valorGasto)}</p>
                    </div>
                    <div className="cana_baixo_linha">
                        <p>Diferença:</p>
                        <p className={classe}>{valorFormatado}</p>
                    </div>
                </div>

                <div className="cana_baixo_dir">
                  <div className="cana_baixo_dir_titulo">
                    <h2><span>Depoimento de:</span> {autor}</h2>
                    <p>Alcançou a Meta: <span className={resultadoObtido ? 'verde' : 'vermelho'}> {resultadoObtido ? 'Sim' : 'Não'}</span> </p>
                  </div>
                  <p>{informacoesAdicionais}</p>
                </div>
            </div>
        </div>
    );
};

export default CardAnalise;
