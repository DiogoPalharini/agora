import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hook/Auth";
import { Toast } from "../components/Swal/Swal";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { Sidebar } from "../components/Sidebar/Sidebar";
import "../styles/CriacaoAdmin.css";

const CadastrarMateriais: React.FC = () => {
  const { getToken, adm } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    nome: "",
    projetoAssociado: "",
    quantidadeUsada: 0,
    valor: 0,
    fornecedor: "",
    descricao: "",
  });

  const [projetos, setProjetos] = useState<{ id: number; referenciaProjeto: string }[]>([]);

  useEffect(() => {
    let isMounted = true; // Controle para evitar atualizações após desmontagem do componente
  
    const fetchProjetos = async () => {
      const token = getToken();
      if (!token || !adm) {
        alert("Erro de autenticação. Faça login novamente.");
        return;
      }
  
      try {
        const response = await axios.get("http://localhost:8080/projeto/listar", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (isMounted) {
          setProjetos(response.data); // Atualiza o estado somente se o componente ainda estiver montado
        }
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        alert("Erro ao carregar os projetos.");
      }
    };
  
    const fetchMaterial = async () => {
      if (!isEditMode) return;
  
      const token = getToken();
      if (!token || !adm) {
        alert("Erro de autenticação. Faça login novamente.");
        return;
      }
  
      try {
        const response = await axios.get(`http://localhost:8080/material/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (isMounted) {
          const materialData = response.data;
          setFormData((prevData) => ({
            ...prevData, // Garante que somente dados carregados sejam atualizados
            nome: materialData.nome,
            projetoAssociado: materialData.projetoAssociado.id.toString(),
            quantidadeUsada: materialData.quantidadeUsada,
            valor: materialData.valor,
            fornecedor: materialData.fornecedor,
            descricao: materialData.descricao || "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados do material:", error);
        alert("Erro ao carregar os dados do material para edição.");
      }
    };
  
    fetchProjetos();
    fetchMaterial();
  
    return () => {
      isMounted = false; // Define como falso para evitar atualizações após desmontagem
    };
  }, [id, isEditMode]);
  
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "quantidadeUsada" || name === "valor"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token || !adm) {
      alert("Erro de autenticação. Faça login novamente.");
      return;
    }

    try {
      const url = isEditMode
        ? `http://localhost:8080/material/editar/${id}`
        : "http://localhost:8080/material";
      const method = isEditMode ? "put" : "post";

      await axios[method](
        url,
        {
          nome: formData.nome,
          projetoAssociado: { id: formData.projetoAssociado },
          quantidadeUsada: formData.quantidadeUsada,
          valor: formData.valor,
          fornecedor: formData.fornecedor,
          descricao: formData.descricao,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            idAdm: adm.id,
          },
        }
      );

      Toast.fire({
        icon: "success",
        title: isEditMode
          ? "Material editado com sucesso!"
          : "Material cadastrado com sucesso!",
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

      navigate("/adm/relatorio");
    } catch (error) {
      console.error("Erro ao salvar material:", error);
      alert("Erro ao salvar material.");
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="criad_container">
        <div className="infopro_cima">
          <h1 className="infopro_titulo">
            {isEditMode ? "Editar Material" : "Cadastrar Novo Material"}
          </h1>
          <div className="infopro_cima_dir">
            <BotaoCTA
              img="/src/img/voltar.svg"
              escrito="Voltar"
              aparencia="primario"
              onClick={() => navigate(-1)}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="criad_form_linha">
            <div className="criad_form_linha_input">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite aqui..."
                required
              />
            </div>

            <div className="criad_form_linha_input">
              <label htmlFor="projetoAssociado">Projeto Associado:</label>
              <select
                id="projetoAssociado"
                name="projetoAssociado"
                value={formData.projetoAssociado}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um projeto</option>
                {projetos.map((projeto) => (
                  <option key={projeto.id} value={projeto.id}>
                    {projeto.referenciaProjeto}
                  </option>
                ))}
              </select>
            </div>

            <div className="criad_form_linha_input">
              <label htmlFor="fornecedor">Fornecedor:</label>
              <input
                type="text"
                id="fornecedor"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                placeholder="Fornecedor do material"
                required
              />
            </div>
          </div>

          <div className="criad_form_linha baixo">
            <div className="criad_form_linha_input">
              <label htmlFor="quantidadeUsada">Quantidade Usada:</label>
              <input
                type="number"
                id="quantidadeUsada"
                name="quantidadeUsada"
                value={formData.quantidadeUsada}
                onChange={handleChange}
                placeholder="Quantidade usada"
                required
              />
            </div>

            <div className="criad_form_linha_input">
              <label htmlFor="valor">Valor:</label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Valor do material"
                required
              />
            </div>
          </div>

          <div className="criad_form_linha baixo">
            <div className="criad_form_linha_input tudo">
              <label htmlFor="descricao">Descrição:</label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição do material"
              />
            </div>
          </div>

          <div className="criad_botao_cad">
            <BotaoCTA
              escrito={
                isEditMode ? "Salvar Alterações" : "Cadastrar Material"
              }
              aparencia="primario"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarMateriais;