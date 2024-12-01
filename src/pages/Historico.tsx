import "../styles/Historico.css";
import { Sidebar } from "../components/Sidebar/Sidebar";
import IconePesquisar from "../img/pesquisar_cinza.svg";
import IconeSeta from "../img/seta_data.svg";
import CardHistorico from "../components/CardHistorico/CardHistorico";
import axios from "axios";
import { AuthContext } from "../hook/ContextAuth";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [adminNames, setAdminNames] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState(""); // Estado para o termo de busca
  const navigate = useNavigate();

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

  const fetchAdminName = async (adminId: number) => {
    try {
      if (!adminNames[adminId]) {
        const response = await axios.get(`http://localhost:8080/adm/${adminId}`, {
          headers: { Authorization: `Bearer ${adm?.token}` },
        });
        const name = response.data.nome;
        setAdminNames((prev) => ({ ...prev, [adminId]: name }));
      }
    } catch (error) {
      console.error(`Erro ao buscar nome do admin com ID ${adminId}:`, error);
    }
  };

  useEffect(() => {
    fetchHistoricos();
  }, []);

  useEffect(() => {
    // Busca os nomes dos administradores com base no ID
    historicos.forEach((historico) => {
      fetchAdminName(historico.admAlterador);
    });
  }, [historicos]);

  const handleCardClick = (id: number) => {
    navigate(`/adm/historico/${id}`);
  };

  // Filtrar os históricos com base no nome do administrador
  const filteredHistoricos = historicos.filter((historico) => {
    const adminName = adminNames[historico.admAlterador] || ""; // Nome do admin pelo ID
    return adminName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                placeholder="Pesquise por um administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de busca
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
        {filteredHistoricos.length > 0 ? (
          [...filteredHistoricos] // Cria uma cópia do array
            .reverse() // Inverte a ordem
            .map((historico) => (
              <div key={historico.id} onClick={() => handleCardClick(historico.id)}>
                <CardHistorico
                  id={historico.id}
                  nomeAdmin={historico.admAlterador}
                  alvoID={historico.idAlterado}
                  TipoAlteracao={historico.alteracao as "criacao" | "edicao" | "delecao" | "ativacao" | "desativacao"}
                  DataAlteracao={new Date(historico.dataAlteracao).toLocaleDateString()}
                  TipoAlvo={historico.alterado as "projeto" | "admin"}
                />
              </div>
            ))
        ) : (
          <p className="hist_nenhum">Nenhum resultado de busca.</p>
        )}
      </div>

      </div>
    </>
  );
};

export default Historico;