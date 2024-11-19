import React, { useContext } from "react";
import "./CardMaterial.css";
import IconeMaterial from "../../img/material.svg";
import IconeEditar from "../../img/editar.svg";
import IconeLixeira from "../../img/lixeira_branco.svg";
import { AuthContext } from "../../hook/ContextAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Toast } from "../Swal/Swal";

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
  const { adm } = useContext(AuthContext); // Acessa o contexto de autenticação
  const navigate = useNavigate();

  // Calcula o valor unitário dividindo o valor total pela quantidade
  const valorUnitario = quantidadeUsada > 0 ? valor / quantidadeUsada : 0;

  // Função para excluir o material
  const excluirMaterial = async () => {
    const result = await Swal.fire({
      title: "Deseja excluir o cadastro deste material?",
      text: "Esta ação não pode ser desfeita.",
      showDenyButton: true,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      width: 620,
      confirmButtonColor: "rgb(224, 40, 86)",
      denyButtonColor: "rgb(0,114,187)",
      heightAuto: false,
      backdrop: true,
      customClass: {
        confirmButton: "confirmButton",
        denyButton: "denyButton",
      },
    });

    if (result.isConfirmed) {
      try {
        // Exclui o material
        await axios.delete(
          `http://localhost:8080/material/deletar/${id}?idAdm=${adm?.id}`,
          {
            headers: {
              Authorization: `Bearer ${adm?.token}`, // Cabeçalho de autorização com token
              "Content-Type": "application/json",
            },
          }
        );

        Toast.fire({
          icon: "success",
          title: "Material excluído com sucesso!",
          position: "top",
          background: "#ffffff",
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.style.marginTop = "32px";
            const progressBar = toast.querySelector(
              ".swal2-timer-progress-bar"
            ) as HTMLElement;
            if (progressBar) {
              progressBar.style.backgroundColor = "#28a745";
            }
          },
        });

        navigate("/"); // Redireciona para uma página temporária
        setTimeout(() => navigate("/adm/relatorio"), 10); // Volta para a página atual após um pequeno delay
      } catch (error) {
        console.error("Erro ao excluir material:", error);
        alert("Erro ao excluir material.");
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
            <p>
              <span>Valor Total:</span> R${valor.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="cama_baixo">
          <p>
            <span>Projeto Associado:</span> {projetoAssociado}
          </p>
          <p>
            <span>QTD. Comprada:</span> {quantidadeUsada}{" "}
            <span className="cama_peca">∙ R${valorUnitario.toFixed(2)}/peça</span>
          </p>
          <p>
            <span>Fornecedor:</span> {fornecedor}
          </p>
          <p className={`cama_descricao ${!descricao ? "nenhum" : ""}`}>
            <span>Descrição:</span> {descricao || "Nenhuma descrição fornecida"}
          </p>

        </div>
      </div>
      <div className="caco_botoes cama">
        <div
          className="caco_botoes botao metade"
          onClick={() => navigate(`/adm/material/editar/${id}`)}
        >
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