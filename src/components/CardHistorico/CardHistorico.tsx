import React from "react";
import "./CardHistorico.css";
import IconeCriacao from "../../img/criacao_historico.svg";
import IconeEdicao from "../../img/editar_projeto.svg";
import IconeExclusao from "../../img/lixeira.svg";
import IconeAtivacao from "../../img/unplug_verde.svg"
import IconeDesativacao from "../../img/unplug_vermelho.svg"
import IconeCalendario from "../../img/calendario.svg";
import IconeVer from "../../img/olho_ver.svg"

interface AlteracaoProjetoProps {
  nomeAdmin: string;
  alvoID: number;
  DataAlteracao: string;
  TipoAlteracao: "criacao" | "edicao" | "exclusao" | "ativacao" | "desativacao";
  TipoAlvo: "projeto" | "admin";
}

const AlteracaoProjeto: React.FC<AlteracaoProjetoProps> = ({ nomeAdmin, alvoID, DataAlteracao, TipoAlteracao, TipoAlvo }) => {

  const getIcone = () => {
    switch (TipoAlteracao) {
      case "edicao":
        return IconeEdicao;
      case "criacao":
        return IconeCriacao;
      case "exclusao":
        return IconeExclusao;
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
      case 'exclusao':
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
      case 'exclusao':
        return 'exclusao';
      case 'ativacao':
        return 'criacao';
      case 'desativacao':
        return 'exclusao';
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
      case 'exclusao':
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
            <p>O administrador {nomeAdmin} {getVerboAcao()} o {formatarTipoAlvo()} ID {alvoID}</p>
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
              <img src={IconeVer} />
            </div>
        </div>
    </div>
  );
};

export default AlteracaoProjeto;