import React from 'react';
import "./CardMaterial.css";
import IconeMaterial from "../../img/material.svg"
import IconeEditar from "../../img/editar.svg";
import IconeLixeira from "../../img/lixeira_branco.svg";
import { useNavigate } from 'react-router-dom';

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
  nome,
  projetoAssociado,
  quantidadeUsada,
  valor,
  fornecedor,
  descricao
}) => {
  
  // Calcula o valor unitário dividindo o valor total pela quantidade
  const valorUnitario = quantidadeUsada > 0 ? valor / quantidadeUsada : 0;

  const navigate = useNavigate();

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
                <p><span>Quantidade Comprada:</span> {quantidadeUsada} <span className="cama_peca">∙ R${valorUnitario.toFixed(0)}/peça</span></p>
                <p><span>Fornecedor:</span> {fornecedor}</p>
                <p className="cama_descricao"><span>Descrição:</span> {descricao}</p>
            </div> 
        </div>
        <div className="caco_botoes cama">
            <div className="caco_botoes botao metade" onClick={() => navigate(`/adm/relatorio`)}>
                <img src={IconeEditar} alt="Ícone Editar" />
            </div>
            <div className="caco_botoes botao metade excluir">
                <img src={IconeLixeira} alt="Ícone Lixeira" />
            </div>
        </div>
    </div>
  );
};

export default CardMaterial;