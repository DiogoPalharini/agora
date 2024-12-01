import "../styles/Historico.css";
import { Sidebar } from "../components/Sidebar/Sidebar";
import IconePesquisar from "../img/pesquisar_cinza.svg";
import IconeSeta from "../img/seta_data.svg";
import CardHistorico from "../components/CardHistorico/CardHistorico";
import axios from "axios";
import { AuthContext } from "../hook/ContextAuth";
import { useContext, useEffect, useState } from "react";

interface Historico {
  id: number;
  admAlterador: number;
  alteracao: string;
  alterado: string;
  arquivos: string | null;
  dados: string | null;
  dataAlteracao: string;
  idAlterado: number;
}

const Historico = () => {
  const { adm } = useContext(AuthContext);
  const [historicos, setHistoricos] = useState<Historico[]>([]);

  const fetchHistoricos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/historico/listar", {
        headers: { Authorization: `Bearer ${adm?.token}` },
      });
      setHistoricos(response.data);
    } catch (error) {
      console.error("Erro ao buscar históricos:", error);
    }
  };

  useEffect(() => {
    fetchHistoricos();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="hist_container">
        <h2 className="notif_titulo">Histórico de Ações</h2>

        <div className="hist_cima">
          <div className="hist_pesquisa">
            <h2>BARRA DE BUSCA</h2>
            <div className="hist_pesquisa_barra">
              <div className="hist_pesquisa_esq">
                <img src={IconePesquisar} alt="Ícone de pesquisa" />
              </div>
              <input
                type="text"
                placeholder="Pesquise por um admin ou ID de projeto..."
              />
            </div>
          </div>
          <div className="hist_datas">
            <div>
              <h2>INÍCIO</h2>
              <input type="date" />
            </div>
            <img src={IconeSeta} alt="Ícone seta" />
            <div>
              <h2>FIM</h2>
              <input type="date" />
            </div>
          </div>
        </div>

        <div className="hist_cards">
          {historicos.map((historico) => (
            <CardHistorico
              key={historico.id}
              nomeAdmin={historico.admAlterador}
              alvoID={historico.idAlterado}
              TipoAlteracao={historico.alteracao as "criacao" | "edicao" | "delecao" | "ativacao" | "desativacao"}
              DataAlteracao={new Date(historico.dataAlteracao).toLocaleDateString()}
              TipoAlvo={historico.alterado as "projeto" | "admin"}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Historico;
