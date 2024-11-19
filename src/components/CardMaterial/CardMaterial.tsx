import React, { useContext } from 'react';
import "./CardMaterial.css";
import IconeMaterial from "../../img/material.svg";
import IconeEditar from "../../img/editar.svg";
import IconeLixeira from "../../img/lixeira_branco.svg";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../../hook/ContextAuth"; // Importando o contexto de autenticação

interface CardMaterialProps {
  id: number;
  nome: string;
  projetoAssociado: string;
  quantidadeUsada: number;
  valor: number;
  fornecedor: string;
  descricao: string;
}

const CardMaterial: React.FC<CardMaterialProps> = ({
  id,
  nome,
  projetoAssociado,
  quantidadeUsada,
  valor,
  fornecedor,
  descricao,
}) => {
  const navigate = useNavigate();
  const { adm } = useContext(AuthContext); // Obtém o administrador do contexto

  // Calcula o valor unitário dividindo o valor total pela quantidade
  const valorUnitario = quantidadeUsada > 0 ? valor / quantidadeUsada : 0;

  // Função para excluir o material
  const excluirMaterial = async () => {
    if (!adm?.token || !adm?.id) {
      alert("Você não está autorizado a realizar esta ação.");
      return;
    }

    if (window.confirm("Tem certeza de que deseja excluir este material?")) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/materiais/deletar/${id}`, {
          headers: {
            Authorization: `Bearer ${adm.token}`,
            "Content-Type": "application/json",
          },
          params: {
            idAdm: adm.id, // Envia o ID do administrador como parâmetro
          },
        });
        alert(response.data.message); // Exibe a mensagem de sucesso
        window.location.reload(); // Atualiza a página para refletir a exclusão
      } catch (error: any) {
        console.error("Erro ao excluir material:", error);
        alert(error.response?.data?.message || "Erro ao excluir material.");
      }
    }
  };

  return (
    <div className="cama_container">
      <div>
        <div className="cama_cima">
          <img src={IconeMaterial} alt="Ícone Material" />
          <div className="cama_cima_info">
            <h2>{nome}</h2>
            <p><span>Valor Total:</span> R${valor.toFixed(2)}</p>
          </div>
        </div>
        <div className="cama_baixo">
          <p><span>Projeto Associado:</span> {projetoAssociado}</p>
          <p><span>QTD. Comprada:</span> {quantidadeUsada} <span className="cama_peca">∙ R${valorUnitario.toFixed(2)}/peça</span></p>
          <p><span>Fornecedor:</span> {fornecedor}</p>
          <p className="cama_descricao"><span>Descrição:</span> {descricao}</p>
        </div> 
      </div>
      <div className="caco_botoes cama">
        <div className="caco_botoes botao metade" onClick={() => navigate(`/adm/materiais/editar/${id}`)}>
          <img src={IconeEditar} alt="Ícone Editar" />
        </div>
        <div className="caco_botoes botao metade excluir" onClick={excluirMaterial}>
          <img src={IconeLixeira} alt="Ícone Lixeira" />
        </div>
      </div>
    </div>
  );
};

export default CardMaterial;