import { useState, useEffect } from "react";
import { formatarCampo } from "./formatarCampo";
import "../../styles/InformacoesHistorico.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../hook/ContextAuth";
import { Sidebar } from "../../components/Sidebar/Sidebar";

// Interface para o histórico
interface Historico {
  id: string;
  alteracao: string;
  tipoHistorico: string;
  alterado: string;
  dados: string;
  arquivos: string;
}

// Interface para o arquivo detalhado
interface ArquivoDetalhado {
  id: string;
  nomeArquivo: string;
}

const InformacoesHistorico = () => {
  const { adm } = useContext(AuthContext);
  const { id } = useParams();
  const [historico, setHistorico] = useState<Historico | null>(null);
  const [dadosAntigos, setDadosAntigos] = useState<{ [key: string]: any } | null>(null);
  const [arquivosDetalhes, setArquivosDetalhes] = useState<ArquivoDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do histórico
  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/historico/${id}`, {
          headers: { Authorization: `Bearer ${adm?.token}` },
        });
        setHistorico(response.data);

        if (response.data.arquivos) {
          const arquivosIds = JSON.parse(response.data.arquivos);
          if (arquivosIds.length > 0) {
            const arquivosResponse = await axios.get(
              `http://localhost:8080/arquivos/buscar-por-ids?ids=${arquivosIds.join(",")}`,
              { headers: { Authorization: `Bearer ${adm?.token}` } }
            );
            setArquivosDetalhes(arquivosResponse.data);
          }
        }
      } catch (err: any) {
        console.error("Erro ao buscar histórico:", err);
        setError("Não foi possível carregar o histórico. Verifique o backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [id, adm]);

  // Renderizar os dados
  const renderDados = (dados: { [key: string]: any }, tipo: string) => {
    if (!dados || Object.keys(dados).length === 0) {
      return <p>Não há dados disponíveis para exibição.</p>;
    }

    const camposExcluidos = ["senha", "adm", "id", "isSenhaRedefinida", "tokenRedefinicao"];

    return Object.keys(dados)
      .filter((key) => !camposExcluidos.includes(key))
      .map((key) => {
        const value = dados[key];
        const antigoValor = dadosAntigos ? dadosAntigos[key] : null;

        // Exibir antes e depois para valores alterados
        if (tipo === "edicao" && antigoValor !== undefined && JSON.stringify(value) !== JSON.stringify(antigoValor)) {
          return (
            <div key={key}>
              <span style={{ fontWeight: "500" }}>{key}:</span>{" "}
              <span style={{ color: "#ED3C5C" }}>{antigoValor}</span>{" "}
              <span style={{ color: "#19670C" }}>{value}</span>
            </div>
          );
        }

        return (
          <div key={key}>
            <span style={{ fontWeight: "500" }}>{key}:</span> {value}
          </div>
        );
      });
  };


  const renderArquivos = () => {
    if (arquivosDetalhes.length === 0) {
      return <p className="infoh_arquivo_vazio">Nenhum arquivo relacionado.</p>;
    }
  
    const alterarTexto = () => {
      switch (historico?.alteracao) {
        case "criacao":
          return "Arquivos Adicionados:";
        case "edicao":
          return "Arquivos Excluídos:";
        case "delecao":
          return "Arquivos Disponíveis:";
        default:
          return "Arquivos:";
      }
    };
  
    return (
      <div className="infoh_arquivo">
        <h4 className="infoh_arquivo_titulo">{alterarTexto()}</h4>
        <div className="infoh_arquivo_cards">
          {arquivosDetalhes.map((arquivo) => (
            <div className="infoh_arquivo_card" key={arquivo.id}>
              <a
                href={`http://localhost:8080/arquivos/download/${arquivo.id}`}
                download={arquivo.nomeArquivo}
                style={{ textDecoration: "none", color: "#404040", fontWeight: "500" }}
              >
                {arquivo.nomeArquivo}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;
  if (!historico) return <p>Histórico não encontrado.</p>;

  let dados: { [key: string]: any } = {};
  try {
    dados = JSON.parse(historico.dados);
  } catch (err) {
    console.error("Erro ao parsear dados:", err);
    return <p>Erro ao carregar os dados do histórico.</p>;
  }

  const { alterado } = historico;

  return (
    <>
      <Sidebar />
      <div className="infoh_container">
        <h1 className="infoh_titulo">Visualizar Alterações</h1>
        <div className="infoh_cima">
          <h3>
            <span>Ação:</span> {historico.alteracao}
          </h3>
          <h3>
            <span>Tipo:</span> {alterado}
          </h3>
        </div>
        <div className="infoh_dados">{renderDados(dados, historico.alteracao)}</div>
        {alterado === "projeto" && renderArquivos()}
      </div>
    </>
  );
};

export default InformacoesHistorico;
