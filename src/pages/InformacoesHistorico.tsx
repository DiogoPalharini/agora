import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../hook/ContextAuth";

interface Historico {
  id: string;
  tipoHistorico: string;
  alterado: string;
  dados: string;
}

const InformacoesHistorico = () => {
  const { adm } = useContext(AuthContext);
  const { id } = useParams();
  const [historico, setHistorico] = useState<Historico | null>(null);
  const [dadosAntigos, setDadosAntigos] = useState<{ [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/historico/${id}`, {
          headers: { Authorization: `Bearer ${adm?.token}` },
        });
        setHistorico(response.data);

        if (response.data.tipoHistorico === "Edição") {
          const ultimoResponse = await axios.get(
            `http://localhost:8080/historico/ultimo/${response.data.idAlterado}/${response.data.alterado}`,
            {
              headers: { Authorization: `Bearer ${adm?.token}` },
            }
          );
          setDadosAntigos(JSON.parse(ultimoResponse.data.dados));
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
    if (tipo === "Edição" && dadosAntigos) {
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

    const color = tipo === "Criação" ? "green" : "red";
    return Object.keys(dados).map((key) => (
      <div key={key} style={{ color }}>
        <strong>{key}:</strong> {JSON.stringify(dados[key])}
      </div>
    ));
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

  const { tipoHistorico, alterado } = historico;

  return (
    <div>
      <h1>Visualizar Histórico</h1>
      <h3>Ação: {tipoHistorico}</h3>
      <h3>Tipo: {alterado}</h3>
      <div>
        <h4>Dados:</h4>
        {renderDados(dados, tipoHistorico)}
      </div>
    </div>
  );
};

export default InformacoesHistorico;
