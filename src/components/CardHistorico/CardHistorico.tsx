import React from "react";
import "./CardHistorico.css";
import IconeCriacao from "../../img/criacao_historico.svg";
import IconeEdicao from "../../img/editar_projeto.svg";
import IconeExclusao from "../../img/lixeira.svg";
import IconeCalendario from "../../img/calendario.svg";
import IconeVer from "../../img/olho_ver.svg"

interface AlteracaoProjetoProps {
  nomeAdmin: string;
  projetoId: number;
  DataAlteracao: string;
  TipoAlteracao: string;
}

const AlteracaoProjeto: React.FC<AlteracaoProjetoProps> = ({ nomeAdmin, projetoId, DataAlteracao, TipoAlteracao }) => {

  const getIcone = () => {
    switch (TipoAlteracao) {
      case "Edição":
        return IconeEdicao;
      case "Criação":
        return IconeCriacao;
      case "Exclusão":
        return IconeExclusao;
    }
  };

  const getVerboAcao = () => {
    switch (TipoAlteracao) {
      case 'Edição':
        return 'editou';
      case 'Criação':
        return 'cadastrou';
      case 'Exclusão':
        return 'excluiu';
    }
  };

  const getClasseTipoAlteracao = () => {
    switch (TipoAlteracao) {
      case 'Edição':
        return 'edicao';
      case 'Criação':
        return 'criacao';
      case 'Exclusão':
        return 'exclusao';
    }
  };

  return (
    <div className="cahi_container">
        <div className="cahi_esq">
            <img src={getIcone()} alt="Ícone de Alteração"/>
        </div>
        <div className="cahi_meio">
            <h2 className={`cahi_titulo ${getClasseTipoAlteracao()}`}>{TipoAlteracao}</h2>
            <p>O administrador {nomeAdmin} {getVerboAcao()} o projeto ID {projetoId}</p>
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