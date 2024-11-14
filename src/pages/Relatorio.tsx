import { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Relatorio.css";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { Sidebar } from "../components/Sidebar/Sidebar";
import IconeBolsista from "../img/bolsistas.svg";
import IconeConvenio from "../img/convenio.svg";
import IconeMaterial from "../img/material.svg";
import IconeAnalise from "../img/analise.svg";
import IconeDownload from "../img/download.svg";
import CardBolsista from "../components/CardBolsista/CardBolsista";
import axios from "axios";
import { AuthContext } from "../hook/ContextAuth";
import CardConvenio from "../components/CardConvenio/CardConvenio";

interface Bolsista {
    id: number;
    nome: string;
    areaAtuacao: string;
    projetoId: number;
    convenio: string;
    cidade: string;
    cpf: string;
    telefone: string;
    valorBolsa: string;
    duracaoBolsa: string;
}

interface Convenio {
    id: number;
    nome: string;
    tipoConvenio: string;
    objetivo: string;
    instituicao: string;
    prazo: string;
}

const Relatorio = () => {

    const navigate = useNavigate();

    const [bolsistas, setBolsistas] = useState<Bolsista[]>([]);
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const { adm } = useContext(AuthContext); // Acessa o contexto de autenticação para obter o token

    // Função para listar bolsistas
    const listarBolsistas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`, // Cabeçalho de autorização com o token
                    "Content-Type": "application/json",
                },
            });
            setBolsistas(response.data);
        } catch (error) {
            console.error("Erro ao listar bolsistas:", error);
        }
    };

    const listarConvenios = async () => {
        try {
            const response = await axios.get("http://localhost:8080/convenio/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`, // Cabeçalho de autorização com o token
                    "Content-Type": "application/json",
                },
            });
            setConvenios(response.data);
        } catch (error) {
            console.error("Erro ao listar convênios:", error);
        }
    };

    function formatarData(prazo: string): string {
        const [ano, mes, dia] = prazo;
        // Formata o mês e o dia para terem sempre dois dígitos
        // Exemplo: 1 vira 01
        const mesFormatado = mes.toString().padStart(2, '0');
        const diaFormatado = dia.toString().padStart(2, '0');
        return `${diaFormatado}/${mesFormatado}/${ano}`;
    }

    useEffect(() => {
        listarBolsistas();
        listarConvenios();
    }, []);

    return (
        <>
            <Sidebar />
            <div className="rela_container">
                <p className="notif_titulo">Relatório Anual</p>
                
                <div className="rela_cadastro">
                    <h2 className="rela_secao_titulo">Cadastros</h2>
                    <div className="rela_cadastro_baixo">
                        <div className="rela_cadastro_botao" onClick={() => navigate('/adm/bolsista/cadastrar')}>
                            <img src={IconeBolsista} />
                            <p>Cadastrar Bolsista</p>
                        </div>
                        <div className="rela_cadastro_botao" onClick={() => navigate('/adm/convenio/cadastrar')}>
                            <img src={IconeConvenio} />
                            <p>Cadastrar Convênio</p>
                        </div>
                        <div className="rela_cadastro_botao"  onClick={() => navigate('/adm/materiais/cadastrar')} >
                            <img src={IconeMaterial} />
                            <p>Cadastrar Material</p>
                        </div>
                        <div className="rela_cadastro_botao">
                            <img src={IconeAnalise} />
                            <p>Adicionar Análise</p>
                        </div>
                    </div>
                </div>

                <div className="rela_gerar">
                    <p>Clique no botão à direita para gerar e baixar um PDF com o relatório de toda a atividade do ano atual.</p>
                    <BotaoCTA img={IconeDownload} escrito="Baixar Relatório" aparencia="primario" cor="verde" />
                </div>

                <div className="rela_secao">
                    <h2 className="rela_secao_titulo">Bolsistas Cadastrados</h2>
                    {bolsistas.length > 0 ? (
                        bolsistas.map((bolsista) => (
                            <CardBolsista
                                key={bolsista.id}
                                id={bolsista.id}
                                nome={bolsista.nome}
                                areaAtuacao={bolsista.areaAtuacao}
                                projeto_id={bolsista.projetoId}
                                convenio={bolsista.convenio}
                                valorBolsa={bolsista.valorBolsa}
                                duracaoBolsa={bolsista.duracaoBolsa}
                                cidade={bolsista.cidade}
                                telefone={bolsista.telefone}
                                cpf={bolsista.cpf}
                            />
                        ))
                    ) : (
                        <p className="rela_nenhum">Não há nenhum bolsista cadastrado.</p>
                    )}
                </div>
                
                <div className="rela_secao">
                    <h2 className="rela_secao_titulo">Convênios Cadastrados</h2>
                    <div className="rela_convenios_cards">

                {convenios.length > 0 ? (
                    convenios.map((convenio) => (
                <CardConvenio
                    key={convenio.id}
                    id={convenio.id}
                    nome={convenio.nome}
                    tipoConvenio={convenio.tipoConvenio}
                    objetivo={convenio.objetivo}
                    instituicao={convenio.instituicao}
                    prazo={formatarData(convenio.prazo)}
                />
                 ))
                 ) : (
                <p className="rela_nenhum">Não há nenhum convênio cadastrado.</p>
                )}
                </div>

                    </div>
                </div>
        </>
    );
};

export default Relatorio;