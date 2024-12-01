import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode } from "react";
import "../styles/InformacoesHistorico.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../hook/ContextAuth";
import { Sidebar } from "../components/Sidebar/Sidebar";

interface Historico {
  id: string;
  alteracao: string;
  tipoHistorico: string;
  alterado: string;
  dados: string;
  arquivos: string;
}

const InformacoesHistorico = () => {
  const { adm } = useContext(AuthContext);
  const { id } = useParams();
  const [historico, setHistorico] = useState<Historico | null>(null);
  const [dadosAntigos, setDadosAntigos] = useState<{ [key: string]: any } | null>(null);
  const [arquivosAntigos, setArquivosAntigos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/historico/${id}`, {
          headers: { Authorization: `Bearer ${adm?.token}` },
        });
        setHistorico(response.data);

        if (response.data.alteracao === "edicao") {
          const ultimoResponse = await axios.get(
            `http://localhost:8080/historico/ultimo/${response.data.idAlterado}/${response.data.alterado}/${response.data.id}`,
            {
              headers: { Authorization: `Bearer ${adm?.token}` },
            }
          );
          setDadosAntigos(JSON.parse(ultimoResponse.data.dados));
          setArquivosAntigos(ultimoResponse.data.arquivos ? JSON.parse(ultimoResponse.data.arquivos) : []);
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
  
  const renderDados = (dados: { [key: string]: any }, tipo: string) => {
    if (!dados || Object.keys(dados).length === 0) {
      return <p>Não há dados disponíveis para exibição.</p>;
    }
  
    const camposExcluidos = ["senha", "adm", "id", "isSenhaRedefinida", "tokenRedefinicao"]; // Lista de campos que não devem ser exibidos
  
    const removeDoubleQuotes = (value: any) => {
      return JSON.stringify(value).replace(/"/g, ""); // Remove aspas duplas
    };
  
    if (tipo === "edicao" && dadosAntigos) {
      return Object.keys(dados)
        .filter((key) => !camposExcluidos.includes(key)) // Ignora campos na lista
        .map((key) => {
          const novoValor = dados[key];
          const antigoValor = dadosAntigos[key];
  
          if (JSON.stringify(novoValor) !== JSON.stringify(antigoValor)) {
            return (
              <div key={key}>
                <strong>{key}:</strong>{" "}
                <span style={{ color: "#ED3C5C" }}>{removeDoubleQuotes(antigoValor)}</span>{" "}
                <span style={{ color: "#19670C" }}>{removeDoubleQuotes(novoValor)}</span>
              </div>
            );
          } else {
            return (
              <div key={key}>
                <strong>{key}:</strong> {removeDoubleQuotes(novoValor)}
              </div>
            );
          }
        });
    }
  
    let color: string;
    if (["ativacao", "desativacao", "criacao", "delecao"].includes(tipo)) {
      color = "#404040"; // Preto
    } else if (tipo === "edicao") {
      color = "#19670C"; // Verde para edições
    } else {
      color = "#ED3C5C"; // Vermelho para exclusões
    }
  
    return Object.keys(dados)
      .filter((key) => !camposExcluidos.includes(key)) // Ignora campos na lista
      .map((key) => (
        <div key={key} style={{ color }}>
          <strong>{key}:</strong> {removeDoubleQuotes(dados[key])}
        </div>
      ));
  };
  
  const renderArquivos = (arquivos: string) => {
    const arquivosAtuais = arquivos ? JSON.parse(arquivos) : [];
    const arquivosAntigosSet = new Set(arquivosAntigos);
    const arquivosAtuaisSet = new Set(arquivosAtuais);

    const adicionados = arquivosAtuais.filter((arquivo: string) => !arquivosAntigosSet.has(arquivo));
    const removidos = arquivosAntigos.filter((arquivo) => !arquivosAtuaisSet.has(arquivo));
    const mantidos = arquivosAtuais.filter((arquivo: string) => arquivosAntigosSet.has(arquivo));

    return (
      <div className="infoh_arquivo">
        <h4 className="infoh_arquivo_titulo">Arquivos:</h4>
        {removidos.map((arquivo) => (
          <div className="infoh_arquivo_card" key={arquivo} style={{ color: "#ED3C5C" }}>
            <strong>Removido:</strong> {arquivo}
          </div>
        ))}
        {adicionados.map((arquivo: boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Key | null | undefined) => (
          <div className="infoh_arquivo_card" key={arquivo} style={{ color: "#19670C" }}>
            <strong>Adicionado:</strong> {arquivo}
          </div>
        ))}
        {mantidos.map((arquivo: boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Key | null | undefined) => (
          <div className="infoh_arquivo_card" key={arquivo} style={{ color: "#404040" }}>
            <strong>Mantido:</strong> {arquivo}
          </div>
        ))}
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

  const { alterado, arquivos } = historico;

  const formatarAlteracao = (alteracao: string) => {
    switch (alteracao) {
      case "edicao":
        return "Edição";
      case "criacao":
        return "Criação";
      case "delecao":
        return "Exclusão";
      case "ativacao":
        return "Ativação"
      case "desativacao":
        return "Desativação"
    }
  };
  
  const formatarAlterado = (alterado: string) => {
    switch (alterado) {
      case "projeto":
        return "Projeto";
      case "admin":
        return "Administrador";
    }
  };
  

  return (
    <>
    <Sidebar />
    <div className="infoh_container">
      <h1 className="infoh_titulo">Visualizar Alterações</h1>
      <div className="infoh_cima">
        <h3><span>Ação:</span> {formatarAlteracao(historico.alteracao)} </h3>
        <h3><span>Tipo:</span> {formatarAlterado(alterado)} </h3>
      </div>
      <div className="infoh_dados">
        {renderDados(dados, historico.alteracao)}
      </div>
      {alterado === "projeto" && (
        <div>
          {renderArquivos(arquivos)}
        </div>
      )}
    </div>
    </>
  );
};

export default InformacoesHistorico;