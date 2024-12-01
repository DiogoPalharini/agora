import { useState, useEffect} from "react";
import { formatarCampo } from "./formatarCampo";
import "../../styles/InformacoesHistorico.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../hook/ContextAuth";
import { Sidebar } from "../../components/Sidebar/Sidebar";

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
  
    const camposExcluidos = ["senha", "adm", "id", "isSenhaRedefinida", "tokenRedefinicao"];
  
    const renderSubDados = (
      subdados: { [key: string]: any },
      subdadosAntigos: { [key: string]: any } | null,
      subTipo: string
    ) => {
      return Object.keys(subdados)
        .filter((key) => !camposExcluidos.includes(key))
        .map((key) => {
          const novoValor = subdados[key];
          const antigoValor = subdadosAntigos ? subdadosAntigos[key] : null;
          const valorFormatadoNovo = formatarCampo(subTipo, key, novoValor);
          const valorFormatadoAntigo = formatarCampo(subTipo, key, antigoValor);
  
          const [chaveNovo, ...valorArrayNovo] = valorFormatadoNovo.split(":");
          const valorNovo = valorArrayNovo.join(":").trim();
  
          const [, ...valorArrayAntigo] = valorFormatadoAntigo.split(":");
          const valorAntigo = valorArrayAntigo.join(":").trim();
  
          if (tipo === "edicao" && antigoValor !== undefined && JSON.stringify(novoValor) !== JSON.stringify(antigoValor)) {
            return (
              <div key={key}>
                <span style={{ fontWeight: "500" }}>{chaveNovo}:</span>{" "}
                <span style={{ color: "#ED3C5C" }}>{valorAntigo} (Antes)</span>{" "}
                <span style={{ color: "#19670C" }}>{valorNovo} (Depois)</span>
              </div>
            );
          }
  
          return (
            <div key={key}>
              <span style={{ fontWeight: "500" }}>{chaveNovo}:</span> {valorNovo}
            </div>
          );
        });
    };
  
    return Object.keys(dados)
      .filter((key) => !camposExcluidos.includes(key))
      .map((key) => {
        const value = dados[key];
        const antigoValor = dadosAntigos ? dadosAntigos[key] : null;
        const valorFormatadoNovo = formatarCampo(tipo, key, value);
        const valorFormatadoAntigo = formatarCampo(tipo, key, antigoValor);
  
        const [chaveNovo, ...valorArrayNovo] = valorFormatadoNovo.split(":");
        const valorNovo = valorArrayNovo.join(":").trim();
  
        const [, ...valorArrayAntigo] = valorFormatadoAntigo.split(":");
        const valorAntigo = valorArrayAntigo.join(":").trim();
  
        if (typeof value === "object" && !Array.isArray(value)) {
          return (
            <div key={key}>
              <span style={{ fontWeight: "500" }}>{chaveNovo}:</span>
              <div style={{ paddingLeft: "1rem" }}>{renderSubDados(value, antigoValor, tipo)}</div>
            </div>
          );
        }
  
        // Exibir antes e depois para valores simples
        if (tipo === "edicao" && antigoValor !== undefined && JSON.stringify(value) !== JSON.stringify(antigoValor)) {
          return (
            <div key={key}>
              <span style={{ fontWeight: "500" }}>{chaveNovo}:</span>{" "}
              <span style={{ color: "#ED3C5C" }}>{valorAntigo}</span>{" "}
              <span style={{ color: "#19670C" }}>{valorNovo}</span>
            </div>
          );
        }
  
        return (
          <div key={key}>
            <span style={{ fontWeight: "500" }}>{chaveNovo}:</span> {valorNovo}
          </div>
        );
      });
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
        {removidos.length === 0 && adicionados.length === 0 && mantidos.length === 0 ? (
          <p className="infoh_arquivo_vazio">Não houve nenhuma mudança de arquivos.</p>
        ) : (
          <>
          <div className="infoh_arquivo_cards">
            {removidos.map((arquivo: any) => (
              <div className="infoh_arquivo_card" key={arquivo}>
                <p><strong style={{ color: "#ED3C5C", fontWeight: "500"}}>Removido:</strong> ID {arquivo}</p>
              </div>
            ))}
            {adicionados.map((arquivo: any) => (
              <div className="infoh_arquivo_card" key={arquivo}>
                <p><strong style={{ color: "#19670C", fontWeight: "500"}}>Adicionado:</strong> ID {arquivo}</p>
              </div>
            ))}
            {mantidos.map((arquivo: any) => (
              <div className="infoh_arquivo_card" key={arquivo}>
                <p><strong style={{ color: "#404040", fontWeight: "500"}}>Mantido:</strong> ID {arquivo}</p>
              </div>
            ))}
          </div>
          </>
        )}
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