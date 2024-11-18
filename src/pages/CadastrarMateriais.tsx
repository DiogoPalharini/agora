import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hook/Auth';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Swal/Swal';
import BotaoCTA from '../components/BotaoCTA/BotaoCTA';
import { Sidebar } from '../components/Sidebar/Sidebar';
import "../styles/CriacaoAdmin.css";


interface Material {
    id: number;
    nome: string;
    projetoAssociado: { id: number };
    quantidadeUsada: number;
    valor: number;
    fornecedor: string;
    descricao: string;
  }

const CadastrarMateriais: React.FC = () => {
  const { getToken, adm } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    projetoAssociado: '',
    quantidadeUsada: 0, // Inicializando como 0 para evitar erro de tipo
    valor: 0, // Inicializando como 0 para evitar erro de tipo
    fornecedor: '',
    descricao: '',
  });
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMateriais();
  }, []); // Recarrega materiais quando o componente for montado

  const fetchMateriais = async () => {
    const token = getToken();
    if (!token || !adm) {
      alert("Erro de autenticação. Faça login novamente.");
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/materiais', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          idAdm: adm.id,
        },
      });
      setMateriais(response.data);
    } catch (error) {
      console.error('Erro ao listar materiais:', error);
      alert('Erro ao listar materiais.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'quantidadeUsada' || name === 'valor' ? parseFloat(value) || 0 : value, // Garantir que o valor seja numérico
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
      const url = editingMaterial
        ? `http://localhost:8080/api/materiais/editar/${editingMaterial.id}`
        : 'http://localhost:8080/api/materiais';
      const method = editingMaterial ? 'put' : 'post';

      await axios[method](url, {
        nome: formData.nome,
        projetoAssociado: { id: formData.projetoAssociado },
        quantidadeUsada: formData.quantidadeUsada,
        valor: formData.valor,
        fornecedor: formData.fornecedor,
        descricao: formData.descricao,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          idAdm: adm.id,
        },
      });

      Toast.fire({
        icon: 'success',
        title: editingMaterial ? 'Material editado com sucesso!' : 'Material cadastrado com sucesso!',
        position: 'top',
        background: '#ffffff',
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.style.marginTop = '32px';
          const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
          if (progressBar) {
            progressBar.style.backgroundColor = '#28a745';
          }
        }
      });

      fetchMateriais();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      alert('Erro ao salvar material.');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      projetoAssociado: '',
      quantidadeUsada: 0,
      valor: 0,
      fornecedor: '',
      descricao: '',
    });
    setEditingMaterial(null);
  };

  const handleEdit = (material: Material) => {
    setFormData({
      nome: material.nome,
      projetoAssociado: material.projetoAssociado.id.toString(), // Convertendo para string para garantir compatibilidade
      quantidadeUsada: material.quantidadeUsada,
      valor: material.valor,
      fornecedor: material.fornecedor,
      descricao: material.descricao,
    });
    setEditingMaterial(material);
  };

  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token || !adm) {
      alert("Erro de autenticação. Faça login novamente.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/materiais/deletar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          idAdm: adm.id,
        },
      });

      Toast.fire({
        icon: 'success',
        title: 'Material excluído com sucesso!',
        position: 'top',
        background: '#ffffff',
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.style.marginTop = '32px';
          const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
          if (progressBar) {
            progressBar.style.backgroundColor = '#dc3545';
          }
        }
      });

      fetchMateriais();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      alert('Erro ao excluir material.');
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="criad_container">
        <div className="infopro_cima">
          <h1 className="infopro_titulo">{editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}</h1>
          <div className="infopro_cima_dir">
            <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
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
              <label htmlFor="projetoAssociado">Projeto Associado (ID):</label>
              <input
                type="text"
                id="projetoAssociado"
                name="projetoAssociado"
                value={formData.projetoAssociado}
                onChange={handleChange}
                placeholder="Digite o ID do projeto"
                required
              />
            </div>
          </div>

          <div className="criad_form_linha">
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

          <div className="criad_form_linha">
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

            <div className="criad_form_linha_input">
              <label htmlFor="descricao">Descrição:</label>
              <textarea
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
                    escrito={editingMaterial ? "Salvar Alterações" : "Cadastrar Material"} 
                    aparencia="primario" 
                    type="submit" 
                />
            </div>
        </form>

        <h3>Materiais Cadastrados</h3>
        <ul>
          {materiais.map((material) => (
            <li key={material.id}>
              <span>{material.nome}</span>
              <button onClick={() => handleEdit(material)}>Editar</button>
              <button onClick={() => handleDelete(material.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CadastrarMateriais;
