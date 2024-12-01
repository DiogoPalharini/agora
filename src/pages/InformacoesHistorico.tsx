import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../hook/ContextAuth";

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
    if (tipo === "edicao" && dadosAntigos) {
      return Object.keys(dados).map((key) => {
        const novoValor = dados[key];
        const antigoValor = dadosAntigos[key];

        if (JSON.stringify(novoValor) !== JSON.stringify(antigoValor)) {
          return (
            <div key={key}>
              <strong>{key}:</strong>{" "}
              <span style={{ color: "red" }}>{JSON.stringify(antigoValor)}</span>{" "}
              <span style={{ color: "green" }}>{JSON.stringify(novoValor)}</span>
            </div>
          );
        } else {
          return (
            <div key={key}>
              <strong>{key}:</strong> {JSON.stringify(novoValor)}
            </div>
          );
        }
      });
    }

    let color: string;
    if (tipo === "criacao" || tipo === "ativacao") {
      color = "green";
    } else if (tipo === "delecao" || tipo === "desativacao") {
      color = "red";
    }
    return Object.keys(dados).map((key) => (
      <div key={key} style={{ color }}>
        <strong>{key}:</strong> {JSON.stringify(dados[key])}
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
      <div>
        <h4>Arquivos:</h4>
        {removidos.map((arquivo) => (
          <div key={arquivo} style={{ color: "red" }}>
            <strong>Removido:</strong> {arquivo}
          </div>
        ))}
        {adicionados.map((arquivo: boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Key | null | undefined) => (
          <div key={arquivo} style={{ color: "green" }}>
            <strong>Adicionado:</strong> {arquivo}
          </div>
        ))}
        {mantidos.map((arquivo: boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Key | null | undefined) => (
          <div key={arquivo} style={{ color: "black" }}>
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

  return (
    <div>
      <h1>Visualizar Histórico</h1>
      <h3>Ação: {historico.alteracao}</h3>
      <h3>Tipo: {alterado}</h3>
      <div>
        <h4>Dados:</h4>
        {renderDados(dados, historico.alteracao)}
      </div>
      {alterado === "projeto" && (
        <div>
          {renderArquivos(arquivos)}
        </div>
      )}
    </div>
  );
};

export default InformacoesHistorico;