import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../styles/EditarProjeto.css';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { AuthContext } from '../hook/ContextAuth';
import BotaoCTA from '../components/BotaoCTA/BotaoCTA';
import criarProjeto from '../img/criar_projeto.svg';
import Lixeira from "../img/lixeira.svg";
import { Toast } from '../components/Swal/Swal';

interface Arquivo {
    id: number;
    nomeArquivo: string;
    tipoDocumento: string;
}

interface Projeto {
    id: number;
    referenciaProjeto: string;
    nome: string;
    empresa: string;
    objeto: string;
    descricao: string;
    coordenador: string;
    ocultarValor: boolean;
    ocultarEmpresa: boolean;
    valor: number;
    dataInicio: string;
    dataTermino: string;
    situacao: string;
}

const EditarProjeto = () => {
    const { adm } = useContext(AuthContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Projeto | null>(null);
    const [arquivosExistentes, setArquivosExistentes] = useState<Arquivo[]>([]);
    const [arquivosNovos, setArquivosNovos] = useState<{
        propostas: File | null;
        contratos: File | null;
        artigos: File | null;
    }>({ propostas: null, contratos: null, artigos: null });
    const [valorFormatado, setValorFormatado] = useState<string>('');
    const [fileName, setFileName] = useState({
        propostas: 'Nenhum arquivo selecionado.',
        contratos: 'Nenhum arquivo selecionado.',
        artigos: 'Nenhum arquivo selecionado.',
    });
    const [arquivosParaExcluir, setArquivosParaExcluir] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados do projeto
    useEffect(() => {
        const fetchProjeto = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/projeto/${id}`, {
                    headers: { Authorization: `Bearer ${adm?.token}` },
                });
                const projeto = response.data;
                projeto.dataInicio = formatarDataParaInput(projeto.dataInicio);
                projeto.dataTermino = formatarDataParaInput(projeto.dataTermino);
                setFormData(projeto);
                setValorFormatado(formatarValor(projeto.valor));
            } catch (error) {
                console.error('Erro ao carregar o projeto:', error);
                Toast.fire({ icon: 'error', title: 'Erro ao carregar projeto.' });
            } finally {
                setIsLoading(false);
            }
        };

        if (adm && id) fetchProjeto();
    }, [adm, id]);

    // Formatar valor para exibição
    const formatarValor = (valor: number | string) => {
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
        return valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Formatar data para input
    const formatarDataParaInput = (dataArray: number[]): string => {
        if (Array.isArray(dataArray) && dataArray.length === 3) {
            const [ano, mes, dia] = dataArray;
            return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        }
        return '';
    };

    // Manipulação de mudanças no formulário
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'valor') {
            const numericValue = parseFloat(value.replace(/\D/g, '')) / 100;
            setFormData((prevData) => (prevData ? { ...prevData, [name]: numericValue } : prevData));
            setValorFormatado(formatarValor(numericValue));
        } else {
            setFormData((prevData) => (prevData ? { ...prevData, [name]: value } : prevData));
        }
    };

    // Manipulação de arquivos
    const handleArquivoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setArquivosNovos((prev) => ({ ...prev, [name]: files[0] }));
            setFileName((prev) => ({ ...prev, [name]: files[0].name }));
        }
    };

    const handleExcluirArquivo = (arquivoId: number) => {
        setArquivosParaExcluir((prev) => [...prev, arquivoId]);
        setArquivosExistentes((prev) => prev.filter((arquivo) => arquivo.id !== arquivoId));
    };

    // Submissão do formulário
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            ...formData,
            adm: adm?.id,
        };

        try {
            if (adm?.tipo === 1) {
                await salvarProjeto(payload);
            } else {
                await enviarSolicitacaoEdicao(payload);
            }
        } catch (error) {
            console.error('Erro ao processar a submissão:', error);
        }
    };

    const salvarProjeto = async (payload: any) => {
        try {
            const data = new FormData();

            data.append('projeto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

            Object.entries(arquivosNovos).forEach(([tipo, file]) => {
                if (file) data.append(tipo, file);
            });

            arquivosParaExcluir.forEach((id) => data.append('arquivosExcluidos', id.toString()));

            await axios.put(`http://localhost:8080/projeto/editar/${id}`, data, {
                headers: { Authorization: `Bearer ${adm?.token}` },
            });

            Toast.fire({
                icon: 'success',
                title: 'Projeto atualizado com sucesso!',
            });
            navigate("/");
        } catch (error) {
            console.error('Erro ao atualizar o projeto:', error);
            Toast.fire({ icon: 'error', title: 'Erro ao atualizar o projeto.' });
        }
    };

    const enviarSolicitacaoEdicao = async (payload: any) => {
        try {
            const data = new FormData();

            const projetoInfo = {
                referenciaProjeto: payload.referenciaProjeto,
                nome: payload.nome,
                empresa: payload.empresa,
                objeto: payload.objeto,
                descricao: payload.descricao,
                coordenador: payload.coordenador,
                ocultarValor: payload.ocultarValor,
                ocultarEmpresa: payload.ocultarEmpresa,
                valor: payload.valor,
                dataInicio: payload.dataInicio,
                dataTermino: payload.dataTermino,
                situacao: payload.situacao,
            };

            const solicitacaoPayload = {
                adminSolicitanteId: adm?.id,
                statusSolicitado: "Pendente",
                projetoId: id,
                informacaoProjeto: JSON.stringify(projetoInfo),
                tipoAcao: "Editar",
            };

            data.append('solicitacao', new Blob([JSON.stringify(solicitacaoPayload)], { type: 'application/json' }));

            Object.entries(arquivosNovos).forEach(([tipo, file]) => {
                if (file) data.append(tipo, file);
            });

            await axios.post('http://localhost:8080/permissao/solicitarEdicao', data, {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            Toast.fire({
                icon: 'success',
                title: 'Solicitação de edição enviada com sucesso!',
            });
            navigate("/");
        } catch (error) {
            console.error('Erro ao enviar solicitação de edição:', error);
            Toast.fire({ icon: 'error', title: 'Erro ao enviar solicitação.' });
        }
    };

    if (isLoading) return <div>Carregando...</div>;
    if (!formData) return <div>Erro: Projeto não encontrado.</div>;
    
    return (
        <div className="cadpro_container">
          <Sidebar />
          <div className="formulario">
            <div className="infopro_cima">
              <h1 className="infopro_titulo">Editar Projeto</h1>
              <div className="infopro_cima_dir">
                <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
              </div>
            </div>
            <form onSubmit={handleSubmit} className="cadpro_form">
              <div>
                <label className="cadpro_label">Nome do Projeto</label>
                <input
                  type="text"
                  className="input-padrao cadpro_correcao"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                />
              </div>
      
              <div className="cadpro_secao_dois">
                <div className="cadpro_secao_esq">
                  <label className="cadpro_label">Empresa</label>
                  <input
                    type="text"
                    className="input-padrao"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                  />
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      name="ocultarEmpresa"
                      checked={formData.ocultarEmpresa}
                      onChange={(e) =>
                        setFormData((prevData) =>
                          prevData ? { ...prevData, ocultarEmpresa: e.target.checked } : prevData
                        )
                      }
                      className="checkbox-input"
                    />
                    <label>Ocultar Empresa Para o Público</label>
                  </div>
                </div>
      
                <div className="cadpro_secao_dir">
                  <label className="cadpro_label">Valor</label>
                  <input
                      type="text"
                      className="input-padrao"
                      name="valor"
                      value={valorFormatado}
                      onChange={handleInputChange}
                  />
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      name="ocultarValor"
                      checked={formData.ocultarValor}
                      onChange={(e) =>
                        setFormData((prevData) =>
                          prevData ? { ...prevData, ocultarValor: e.target.checked } : prevData
                        )
                      }
                      className="checkbox-input"
                    />
                    <label>Ocultar Valor Para o Público</label>
                  </div>
                </div>
              </div>
      
              <div>
                <label className="cadpro_label">Descrição</label>
                <textarea
                  className="input-padrao cadpro_descricao cadpro_correcao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                />
              </div>
      
              <div className="cadpro_secao_dois">
                <div className="cadpro_secao_dir">
                  <label className="cadpro_label">Coordenador</label>
                  <input
                    type="text"
                    className="input-padrao"
                    name="coordenador"
                    value={formData.coordenador}
                    onChange={handleInputChange}
                  />
                </div>
      
                <div className="cadpro_secao_dir">
                  <label className="cadpro_label">Objeto</label>
                  <input
                    type="text"
                    className="input-padrao"
                    name="objeto"
                    value={formData.objeto}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
      
              <div className="cadpro_secao_dois">
                <div className="cadpro_secao_esq">
                  <label className="cadpro_label">Data de Início</label>
                  <input
                    type="date"
                    className="input-padrao"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                  />
                </div>
      
                <div className="cadpro_secao_dir">
                  <label className="cadpro_label">Data de Término</label>
                  <input
                    type="date"
                    className="input-padrao"
                    name="dataTermino"
                    value={formData.dataTermino}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <p className="cadpro_label correcao cima">Arquivos Existentes</p>
              {arquivosExistentes.length > 0 ? (
                <div className="edipro_arquivos_existentes_container">
                  {arquivosExistentes.map((arquivo) => (
                    <div className="edipro_arquivo_existente" key={arquivo.id}>
                      <p className="edipro_arquivo_existente_titulo">{arquivo.tipoDocumento}</p>
                      <p className="edipro_arquivo_existente_nome">{arquivo.nomeArquivo}</p>
                      <BotaoCTA img={Lixeira} escrito="Excluir" aparencia="secundario" cor="vermelho" onClick={() => handleExcluirArquivo(arquivo.id)}/>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cadpro_file_baixo bottom">Ainda não há arquivos existentes</p>
              )}
      
            <h3 className="cadpro_label">Adicionar Novo Arquivo</h3>

            <div className="cadpro_secao_dois">
            <div className="cadpro_parte_tres">
              <label className="cadpro_label">Propostas</label>
              <input
                type="file"
                name="propostas"
                onChange={handleArquivoChange}
                style={{ display: 'none' }}
                id="filePropostas"
              />
              <BotaoCTA
                escrito="Selecionar Propostas"
                aparencia="primario"
                onClick={() => document.getElementById('filePropostas')?.click()}
              />
              <div className="cadpro_file_baixo">
                <p>{fileName.propostas}</p>
              </div>
            </div>

            <div className="cadpro_parte_tres">
              <label className="cadpro_label">Contratos</label>
              <input
                type="file"
                name="contratos"
                onChange={handleArquivoChange}
                style={{ display: 'none' }}
                id="fileContratos"
              />
              <BotaoCTA
                escrito="Selecionar Contratos"
                aparencia="primario"
                onClick={() => document.getElementById('fileContratos')?.click()}
              />
              <div className="cadpro_file_baixo">
                <p>{fileName.contratos}</p>
              </div>
            </div>

            <div className="cadpro_parte_tres">
              <label className="cadpro_label">Artigos</label>
              <input
                type="file"
                name="artigos"
                onChange={handleArquivoChange}
                style={{ display: 'none' }}
                id="fileArtigos"
              />
              <BotaoCTA
                escrito="Selecionar Artigos"
                aparencia="primario"
                onClick={() => document.getElementById('fileArtigos')?.click()}
              />
              <div className="cadpro_file_baixo">
                <p>{fileName.artigos}</p>
              </div>
            </div>
          </div>
      
              <div className="edipro_botoes">
              <BotaoCTA
                        img={criarProjeto}
                        escrito={adm?.tipo === 1 ? "Salvar Alterações" : "Solicitar Edição"}
                        aparencia="primario"
                        type="submit"
                    />
              </div>
            </form>
          </div>
        </div>
      );
    };

export default EditarProjeto;
