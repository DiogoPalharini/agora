import React, { useContext } from "react";
import "./CardHistorico.css";
import IconeCriacao from "../../img/criacao_historico.svg";
import IconeEdicao from "../../img/editar_projeto.svg";
import IconeDelecao from "../../img/lixeira.svg";
import IconeAtivacao from "../../img/unplug_verde.svg"
import IconeDesativacao from "../../img/unplug_vermelho.svg"
import IconeCalendario from "../../img/calendario.svg";
import IconeVer from "../../img/olho_ver.svg"
import axios from "axios";
import { AuthContext } from "../../hook/ContextAuth";
import { Link } from "react-router-dom";

interface AlteracaoProjetoProps {
  nomeAdmin: number;
  alvoID: number;
  DataAlteracao: string;
  TipoAlteracao: "criacao" | "edicao" | "delecao" | "ativacao" | "desativacao";
  TipoAlvo: "projeto" | "admin";
}

const AlteracaoProjeto: React.FC<AlteracaoProjetoProps> = ({ nomeAdmin, alvoID, DataAlteracao, TipoAlteracao, TipoAlvo }) => {
  const { adm } = useContext(AuthContext);
  const [adminName, setAdminName] = React.useState<string>("");

  const fetchAdminName = async (idAdmin: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/adm/${idAdmin}`, {
        headers: { Authorization: `Bearer ${adm?.token}` },
      });
      const adminCorrespondente = response.data;
      setAdminName(adminCorrespondente.nome);
    } catch (error) {
      console.error(`Erro ao buscar nome do admin ${idAdmin}:`, error);
    }
  };
  fetchAdminName(nomeAdmin);

  const getIcone = () => {
    switch (TipoAlteracao) {
      case "edicao":
        return IconeEdicao;
      case "criacao":
        return IconeCriacao;
      case "delecao":
        return IconeDelecao;
      case "ativacao":
        return IconeAtivacao;
      case "desativacao":
        return IconeDesativacao;
    }
  };

  const getVerboAcao = () => {
    switch (TipoAlteracao) {
      case 'edicao':
        return 'editou';
      case 'criacao':
        return 'cadastrou';
      case 'delecao':
        return 'excluiu';
      case 'ativacao':
        return 'reativou';
      case 'desativacao':
        return 'desativou';
    }
  };

  const getClasseTipoAlteracao = () => {
    switch (TipoAlteracao) {
      case 'edicao':
        return 'edicao';
      case 'criacao':
        return 'criacao';
      case 'delecao':
        return 'delecao';
      case 'ativacao':
        return 'criacao';
      case 'desativacao':
        return 'delecao';
    }
  };

  const formatarTipoAlvo = () => {
    if (TipoAlvo === "projeto") {
      return "projeto";
    } else if (TipoAlvo === "admin") {
      return "Administrador";
    }
    return TipoAlvo;
  };

  const formatarTitulo = () => {
    switch (TipoAlteracao) {
      case 'edicao':
        return 'Edição';
      case 'criacao':
        return 'Criação';
      case 'delecao':
        return 'Exclusão';
      case 'ativacao':
        return 'Ativação';
      case 'desativacao':
        return 'Desativação';
    }
  };

  return (
    <div className="cahi_container">
        <div className="cahi_esq">
            <img src={getIcone()} alt="Ícone de Alteração"/>
        </div>
        <div className="cahi_meio">
            <h2 className={`cahi_titulo ${getClasseTipoAlteracao()}`}>{formatarTitulo()}</h2>
            <p>O administrador {adminName} {getVerboAcao()} o {formatarTipoAlvo()} ID {alvoID}</p>
        </div>
        <div className="cahi_dir">
          <div>
            <h2>Data da Alteração:</h2>
            <div className="cahi_dir_data_dentro">
                <img src={IconeCalendario} />
                <p>{DataAlteracao}</p>
            </div>
          </div>
            <div className="cahi_ver">
              <Link to={`/adm/historico/${alvoID}`}>
              <img src={IconeVer} alt="Ver Histórico" />
              </Link>
            </div>
        </div>
    </div>
  );
};

export default AlteracaoProjeto;