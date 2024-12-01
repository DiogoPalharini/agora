import { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Relatorio.css";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { Sidebar } from "../components/Sidebar/Sidebar";
import IconeBolsista from "../img/bolsistas.svg";
import IconeConvenio from "../img/convenio.svg";
import IconeMaterial from "../img/material.svg";
import IconeAnalise from "../img/analise.svg";
import IconeBolsistaSecundario from "../img/bolsistas_azul.svg";
import IconeConvenioSecundario from "../img/convenio_azul.svg";
import IconeMaterialSecundario from "../img/material_azul.svg";
import IconeAnaliseSecundario from "../img/analise_azul.svg";
import IconeDownload from "../img/download.svg";
import CardBolsista from "../components/CardBolsista/CardBolsista";
import axios from "axios";
import { AuthContext } from "../hook/ContextAuth";
import CardConvenio from "../components/CardConvenio/CardConvenio";
import CardMaterial from "../components/CardMaterial/CardMaterial";
import CardAnalise from "../components/CardAnalise/CardAnalise";

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

interface Material {
    id: number;
    nome: string;
    nomeProjeto: string;
    quantidadeUsada: number;
    valor: number;
    fornecedor: string;
    descricao: string;
}

interface AnaliseProjeto {
    id: string;
    valorGasto: number;
    autor: string;
    informacoesAdicionais: string;
    resultadoObtido: boolean;
    idProjeto: string;
}

const Relatorio = () => {

    const navigate = useNavigate();

    const [bolsistas, setBolsistas] = useState<Bolsista[]>([]);
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [analises, setAnalises] = useState<AnaliseProjeto[]>([]);
    const { adm } = useContext(AuthContext); // Acessa o contexto de autenticação para obter o token

    const [secaoAtiva, setSecaoAtiva] = useState<string>("bolsistas");

    const ativarSecao = (secao: string) => {
        setSecaoAtiva(secao);
    };
    

    // Função para listar bolsistas
    const listarBolsistas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            const bolsistasFormatados = response.data.map((bolsista: Bolsista) => ({
                ...bolsista,
                valorBolsa: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(bolsista.valorBolsa))
            }));
            setBolsistas(bolsistasFormatados);
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

    const listarMateriais = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setMateriais(response.data);
        } catch (error) {
            console.error("Erro ao buscar materiais:", error);
        }
    };

    const listarAnalises = async () => {
        try {
            const response = await axios.get("http://localhost:8080/analises/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Análises recebidas:", response.data); // Debug
            setAnalises(response.data);
        } catch (error) {
            console.error("Erro ao listar análises:", error);
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
        listarMateriais();
        listarAnalises();
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
                        <div className="rela_cadastro_botao" onClick={() => navigate('/adm/material/cadastrar')} >
                            <img src={IconeMaterial} />
                            <p>Cadastrar Material</p>
                        </div>
                        <div className="rela_cadastro_botao" onClick={() => navigate('/adm/analise/cadastrar')}>
                            <img src={IconeAnalise} />
                            <p>Cadastrar Análise</p>
                        </div>
                    </div>
                </div>

                <div className="rela_gerar">
                    <p>Clique no botão à direita para visualizar o relatório anual.</p>
                    <BotaoCTA img={IconeDownload} escrito="Ver Relatório Anual" aparencia="primario" cor="verde" onClick={() => navigate('/adm/relatorioAnual')}/>
                </div>

                <div className="rela_mostrar">
                    <div className={`rela_mostrar_botao cima ${secaoAtiva === "bolsistas" ? "primario" : "secundario"}`} onClick={() => ativarSecao("bolsistas")}>
                        <img src={secaoAtiva === "bolsistas" ? IconeBolsista : IconeBolsistaSecundario} />
                        <p>Bolsistas</p>
                    </div>
                    <div className={`rela_mostrar_botao cima ${secaoAtiva === "convenios" ? "primario" : "secundario"}`} onClick={() => ativarSecao("convenios")}>
                        <img src={secaoAtiva === "convenios" ? IconeConvenio : IconeConvenioSecundario} />
                        <p>Convênios</p>
                    </div>
                    <div className={`rela_mostrar_botao ${secaoAtiva === "materiais" ? "primario" : "secundario"}`} onClick={() => ativarSecao("materiais")}>
                        <img src={secaoAtiva === "materiais" ? IconeMaterial : IconeMaterialSecundario} />
                        <p>Materiais</p>
                    </div>
                    <div className={`rela_mostrar_botao ${secaoAtiva === "analises" ? "primario" : "secundario"}`} onClick={() => ativarSecao("analises")}>
                        <img src={secaoAtiva === "analises" ? IconeAnalise : IconeAnaliseSecundario} />
                        <p>Análises</p>
                    </div>
                </div>

            {secaoAtiva === "bolsistas" && (
        <div className="rela_secao">
        <h2 className="rela_secao_titulo">Bolsistas Cadastrados</h2>
        {bolsistas.length > 0 ? (
            bolsistas.map((bolsista) =>
                bolsista && bolsista.id ? (
                    <CardBolsista
                        key={bolsista.id}
                        id={bolsista.id}
                        nome={bolsista.nome}
                        areaAtuacao={bolsista.areaAtuacao}
                        projeto_id={bolsista.projetoId}
                        valorBolsa={bolsista.valorBolsa}
                        duracaoBolsa={bolsista.duracaoBolsa}
                        cidade={bolsista.cidade}
                        telefone={bolsista.telefone}
                        cpf={bolsista.cpf}
                    />
                ) : null
            )
        ) : (
            <p className="rela_nenhum">Não há nenhum bolsista cadastrado.</p>
        )}
    </div>
)}

{secaoAtiva === "convenios" && (
    <div className="rela_secao">
        <h2 className="rela_secao_titulo">Convênios Cadastrados</h2>
        <div className="rela_convenios_cards">
            {convenios.length > 0 ? (
                convenios.map((convenio) =>
                    convenio && convenio.id ? (
                        <CardConvenio
                            key={convenio.id}
                            id={convenio.id}
                            nome={convenio.nome}
                            tipoConvenio={convenio.tipoConvenio}
                            objetivo={convenio.objetivo}
                            instituicao={convenio.instituicao}
                            prazo={formatarData(convenio.prazo)}
                        />
                    ) : null
                )
            ) : (
                <p className="rela_nenhum">Não há nenhum convênio cadastrado.</p>
            )}
        </div>
    </div>
)}

{secaoAtiva === "materiais" && (
    <div className="rela_secao">
        <h2 className="rela_secao_titulo">Materiais Cadastrados</h2>
        <div className="rela_materiais_cards">
            {materiais.length > 0 ? (
                materiais.map((material) =>
                    material && material.id ? (
                        <CardMaterial
                            key={material.id}
                            id={material.id}
                            nome={material.nome}
                            projetoAssociado={material.nomeProjeto?.split(" - ")[0]}
                            quantidadeUsada={material.quantidadeUsada}
                            valor={material.valor}
                            fornecedor={material.fornecedor}
                            descricao={material.descricao}
                        />
                    ) : null
                )
            ) : (
                <p className="rela_nenhum">Não há nenhum material cadastrado.</p>
            )}
        </div>
    </div>
)}

{secaoAtiva === "analises" && (
    <div className="rela_secao">
        <h2 className="rela_secao_titulo">Análises de Projeto Cadastradas</h2>
        {analises.length > 0 ? (
            analises.map((analise) =>
                analise && analise.id ? (
                    <CardAnalise
                        key={analise.id}
                        id={analise.id}
                        valorGasto={analise.valorGasto}
                        autor={analise.autor}
                        informacoesAdicionais={analise.informacoesAdicionais}
                        resultadoObtido={analise.resultadoObtido}
                        idProjeto={analise.idProjeto}
                    />
                ) : null
            )
        ) : (
            <p className="rela_nenhum">Não há nenhuma análise cadastrada.</p>
        )}
    </div>
)}

            </div>
        </>
    );
};

export default Relatorio;