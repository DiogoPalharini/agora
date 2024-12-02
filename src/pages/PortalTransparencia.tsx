import { useEffect, useState, useContext } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import '../styles/PortalTransparencia.css';
import { Projeto } from "../Type/Projeto";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import AutoComplete from '../components/AutoComplete/AutoComplete'
import IconVer from "../img/ver.svg"
import IconPesquisar from "../img/pesquisar.svg"
import IconInfo from "../img/info.svg"
import IconCriarProjeto from "../img/criar_projeto.svg"
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { AuthContext } from './../hook/ContextAuth';

const PortalTransparencia = () => {

    const navigate = useNavigate();
    const { adm } = useContext(AuthContext);

    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [projetosFiltrados, setProjetosFiltrados] = useState<Projeto[]>([]);
    const [palavraChave, setPalavraChave] = useState('');
    const [coordenador, setCoordenador] = useState('');
    const [situacao, setSituacao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataTermino, setDataTermino] = useState('');

    useEffect(() => {
        const fetchProjetos = async () => {
            try {
                const response = await axios.get('http://localhost:8080/projeto/listar');
                
                // Filtrar projetos que não possuem situação "Desativado"
                const projetosAtivos = response.data.filter((projeto: Projeto) => projeto.situacao !== "Desativado");
    
                setProjetos(projetosAtivos); // Define apenas projetos ativos no estado
                setProjetosFiltrados(projetosAtivos); // Define a lista inicial com apenas projetos ativos
            } catch (error) {
                console.error(error);
            }
        };
    
        fetchProjetos();
    }, []);
    

    const formatarDataParaComparacao = (dataArray: number[]) => {
        if (Array.isArray(dataArray) && dataArray.length === 3) {
            const [ano, mes, dia] = dataArray.map(num => String(num).padStart(2, '0'));
            return `${ano}-${mes}-${dia}`;
        }
        return '';
    };

    const formatarDataParaVisualizacao = (dataArray: number[]) => {
        if (Array.isArray(dataArray) && dataArray.length === 3) {
            const [ano, mes, dia] = dataArray.map(num => String(num).padStart(2, '0'));
            return `${dia}/${mes}/${ano}`;
        }
        return '';
    };

    const semProjetos = () => {
        if (projetos.length === 0) {
            return "Ainda não há nenhum projeto cadastrado.";
        } else {
            return "Nenhum projeto encontrado com os filtros aplicados.";
        }
    };

    const aplicarFiltro = () => {

        const projetosFiltrados = projetos.filter((projeto) => {

            const palavraChaveMatch = 
            palavraChave ?
            projeto.descricao?.toLowerCase().includes(palavraChave.toLowerCase()) ||
            projeto.referenciaProjeto?.toLowerCase().includes(palavraChave.toLowerCase()) : true

            const coordenadorMatch = coordenador ? projeto.coordenador.toLowerCase().includes(coordenador.toLowerCase()) : true;

            const situacaoMatch = situacao ? projeto.situacao == situacao : true

            const dataInicioFormatada = formatarDataParaComparacao(projeto.dataInicio);
            const dataTerminoFormatada = formatarDataParaComparacao(projeto.dataTermino);

            const dataInicioFiltro = dataInicio.split('/').reverse().join('-');
            const dataTerminoFiltro = dataTermino.split('/').reverse().join('-');

            const dataInicioMatch = dataInicio ? dataInicioFormatada >= dataInicioFiltro : true;
            const dataTerminoMatch = dataTermino ? dataTerminoFormatada <= dataTerminoFiltro : true;

            return palavraChaveMatch && coordenadorMatch && situacaoMatch && dataInicioMatch && dataTerminoMatch;
        });

        setProjetosFiltrados(projetosFiltrados);
    };

    return (
        <div className="container-principal-portal">
            <Sidebar />
            <div className={`container-texto ${adm ? 'menor' : ''}`}>
                <h1 className="portal_titulo">Fundação de Apoio à Pesquisa de Pós-Graduandos (FAPG)</h1>
                <p>A Fundação vem com o objetivo de trazer transformações importantes para o meio acadêmico, e busca conseguir isso com a obstinação dos seus dirigentes <br /> e funcionários no sentido de torná-la sempre mais ágil e precisa.</p>
                <div className="portal_divisoria">
                </div>
                <div className="filtragem">
                    <form onSubmit={(e) => { e.preventDefault(); aplicarFiltro(); }} className="space-y-4">
                        <div className="filtragem_linha_item grande">
                            <label className="texto-label">Busca por Palavra Chave</label>
                            <input type="text" value={palavraChave} onChange={(e) => setPalavraChave(e.target.value)} className="input-padrao"/>
                        </div>
                        
                        <div className="filtragem_linha filtragem_baixo_margem">
                        <div className="filtragem_linha_item maior">
                            <label className="texto-label">Coordenador</label>
                            <AutoComplete prop="coordenador" onValueChange={setCoordenador}/>
                        </div>
                        <div className="filtragem_linha_item maior">
                            <label className="texto-label">Situação</label>
                            <select id="situacao" name="situacao" value={situacao} onChange={(e) => setSituacao(e.target.value)} className="custom-select input-padrao">
                                <option value="">Escolha uma opção</option>
                                <option value="Em Andamento">Em andamento</option>
                                <option value="Encerrado">Encerrado</option>
                            </select>
                        </div>
                        <div className="filtragem_linha_item menor">
                            <label className="texto-label">Data de início</label>
                            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-padrao"/>
                        </div>
                        <div className="filtragem_linha_item menor">
                            <label className="texto-label">Data de término</label>
                            <input type="date" value={dataTermino} onChange={(e) => setDataTermino(e.target.value)} className="input-padrao"/>
                        </div>
                        </div>
                        <div className="filtragem_botoes_baixo">
                            <BotaoCTA img={IconPesquisar} escrito="Buscar" aparencia="primario" type="submit" />
                        {adm && (
                            <div className="filtragem_botao_admin">
                                <div className="filtragem_botao_admin_mensagem">
                                    <p>Somente administradores podem ver isso</p>
                                    <img src={IconInfo} />
                                </div>
                                <BotaoCTA img={IconCriarProjeto} escrito="Criar Projeto" aparencia="primario"  link="/adm/cadastrar-projeto" />
                            </div>
                        )}
                        </div>
                    </form>
                </div>
                <br />
                <br />
                {projetosFiltrados.length > 0 ? (
                    <>
                        <div>
                            <div>
                                {projetosFiltrados.map((projeto) => (
                                    <div className="portal_projeto_container" key={projeto.id}>
                                        <div className="portal_projeto_esq">
                                            <p><span>Nome:</span> {projeto.referenciaProjeto} - {projeto.nome}</p>
                                            <p><span>Coordenador:</span> {projeto.coordenador}</p>
                                        </div>
                                        <div className="portal_projeto_meio">
                                            <p><span>Início:</span> {formatarDataParaVisualizacao(projeto.dataInicio)}</p>
                                            <p><span>Término:</span> {formatarDataParaVisualizacao(projeto.dataTermino)}</p>
                                        </div>
                                        <div className="portal_projeto_dir">
                                            <div>
                                                <p><span>Situação:</span></p>
                                                <div className="portal_projeto_dir_baixo">
                                                    <div className={`portal_projeto_bolinha ${projeto.situacao !== "Em Andamento" ? "desativado" : ""}`}>
                                                    </div>
                                                    <p className={`portal_projeto_dir_badge ${projeto.situacao !== "Em Andamento" ? "desativado" : ""}`}>{projeto.situacao}</p>
                                                </div>
                                            </div>
                                            <div className="admin_botao_acoes ver mobile" onClick={() => navigate(`/projeto/${projeto.id}`, { state: projeto })}>
                                            <img src={IconVer} />
                                            <h2>Ver</h2>
                                        </div>
                                        </div>
                                        <div className="admin_botao_acoes ver desktop" onClick={() => navigate(`/projeto/${projeto.id}`, { state: projeto })}>
                                            <img src={IconVer} />
                                            <h2>Ver</h2>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="sem_projetos">{semProjetos()}</p>
                )}
            </div>
        </div>
    );
};

export default PortalTransparencia;
