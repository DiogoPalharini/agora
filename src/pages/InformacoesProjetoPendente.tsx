import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import axios from 'axios';
import '../styles/InformacoesProjeto.css';
import { AuthContext } from '../hook/ContextAuth';
import BotaoCTA from '../components/BotaoCTA/BotaoCTA';

interface Arquivo {
    id: number;
    nomeArquivo: string;
    tipoDocumento: string;
}

interface Projeto {
    referencia: string;
    nome: string;
    empresa: string;
    objeto: string;
    descricao: string;
    coordenador: string;
    ocultarValor: boolean;
    ocultarEmpresa: boolean;
    valor: number;
    dataInicio: number[];
    dataTermino: number[];
}

const InformacoesProjetoPendente = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const projeto: Projeto = location.state;
    const [arquivos] = useState<Arquivo[]>([]);
    const { adm } = useContext(AuthContext);

    useEffect(() => {
    }, [projeto, adm]);

    const downloadArquivo = (arquivoId: number, nomeArquivo: string) => {
        axios.get(`http://localhost:8080/arquivos/download/${arquivoId}`, {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${adm?.token}`
            }
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nomeArquivo);
            document.body.appendChild(link);
            link.click();
        })
        .catch((error) => {
            console.error('Erro ao baixar arquivo:', error);
        });
    };

    const formatarData = (dataArray: number[]): string => {
        if (Array.isArray(dataArray) && dataArray.length === 3) {
            return new Date(dataArray[0], dataArray[1] - 1, dataArray[2]).toLocaleDateString('pt-BR');
        }
        return 'Data inválida';
    };

    const formatarValor = (valor: number | string) => {
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
        return valorNumerico.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\s/g, '');
    };

    return (
        <>
            <Sidebar />
            <div className="infopro_container menor">
                <div className="infopro_cima">
                    <h1 className="infopro_titulo">Informações do Projeto</h1>
                    <div className="infopro_cima_dir">
                        <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
                    </div>
                </div>

                <div className="infopro_info">
                    <div>
                        <p className="infopro_info_titulo">Nome do projeto</p>
                        <p className="infopro_info_texto">{projeto.nome}</p>
                    </div>

                    <div>
                        <p className="infopro_info_titulo">Empresa</p>
                        <p className="infopro_info_texto">{projeto.ocultarEmpresa ? 'EMPRESA OCULTADA PARA O PÚBLICO' : projeto.empresa}</p>
                    </div>

                    <div>
                        <p className="infopro_info_titulo">Objeto</p>
                        <p className="infopro_info_texto">{projeto.objeto}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Descrição</p>
                        <p className="infopro_info_texto">{projeto.descricao}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Coordenador</p>
                        <p className="infopro_info_texto">{projeto.coordenador}</p>
                    </div>

                    <div>
                        <p className="infopro_info_titulo">Valor do Projeto</p>
                        <p className="infopro_info_texto">{projeto.ocultarValor ? 'VALOR OCULTADO PARA O PÚBLICO' : formatarValor(projeto.valor)}</p>
                    </div>

                    <div>
                        <p className="infopro_info_titulo">Data de início</p>
                        <p className="infopro_info_texto">{formatarData(projeto.dataInicio)}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Data de término</p>
                        <p className="infopro_info_texto">{formatarData(projeto.dataTermino)}</p>
                    </div>

                    <div>
                        <p className="infopro_info_titulo cima">Arquivos do projeto</p>
                        {arquivos.length > 0 ? (
                            <div className="infopro_arquivos_container">
                                {arquivos.map(arquivo => (
                                    <div className="infopro_arquivo_item" key={arquivo.id} onClick={() => downloadArquivo(arquivo.id, arquivo.nomeArquivo)}>
                                        <h2>{arquivo.tipoDocumento}</h2>
                                        <p>{arquivo.nomeArquivo}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="infopro_nenhum">Nenhum arquivo disponível.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InformacoesProjetoPendente;