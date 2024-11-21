import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { Sidebar } from "../components/Sidebar/Sidebar";
import "../styles/CriacaoAdmin.css";
import { useNavigate, useParams } from "react-router-dom";
import { FormEvent, useContext, useState, ChangeEvent, useEffect } from "react";
import { AuthContext } from "../hook/ContextAuth";
import { Toast } from "../components/Swal/Swal";
import axios from "axios";

const CadastrarAnalise = () => {
    const { adm } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);

    const [novoAnalise, setNovoAnalise] = useState({
        valorGasto: "",
        autor: "",
        informacoesAdicionais: "",
        resultadoObtido: false,
        idProjeto: "",
    });

    useEffect(() => {
        const fetchAnaliseData = async () => {
            if (isEditMode) {
                try {
                    const response = await axios.get(`http://localhost:8080/analises/listar/${id}`, {
                        headers: {
                            Authorization: `Bearer ${adm?.token}`,
                        },
                    });

                    const analiseData = response.data;
                    setNovoAnalise(analiseData);
                } catch (error) {
                    console.error("Erro ao buscar dados da Análise:", error);
                    alert("Erro ao carregar os dados da Análise para edição.");
                }
            }
        };
        fetchAnaliseData();
    }, [id, isEditMode, adm]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNovoAnalise((prev) => ({
            ...prev,
            [name]: name === "resultadoObtido" ? value === "true" : value, // Converte o valor booleano
        }));
    };

    const salvarAnalise = async (e: FormEvent) => {
        e.preventDefault();
        if (!adm) return;
    
        try {
            const analiseData = {
                valorGasto: parseFloat(novoAnalise.valorGasto),
                autor: novoAnalise.autor,
                informacoesAdicionais: novoAnalise.informacoesAdicionais,
                resultadoObtido: Boolean(novoAnalise.resultadoObtido),
                idProjeto: novoAnalise.idProjeto,
            };
    
            let response;
            if (isEditMode) {
                response = await axios.put(`http://localhost:8080/analises/editar/${id}`, analiseData, {
                    headers: { Authorization: `Bearer ${adm.token}` },
                });
            } else {
                response = await axios.post("http://localhost:8080/analises/criar", analiseData, {
                    headers: { Authorization: `Bearer ${adm.token}` },
                });
            }
    
            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: response.data.message || (isEditMode ? "Análise editada com sucesso!" : "Análise cadastrada com sucesso!"),
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
                navigate("/adm/relatorio");
            } else {
                throw new Error(response.data.message || "Erro inesperado.");
            }
        } catch (error: any) {
            console.error("Erro ao salvar análise:", error);
            if (error.response) {
                alert(error.response.data?.message || "Erro ao salvar análise.");
            }
        }
    };    

    return (
        <div>
            <Sidebar />
            <div className="criad_container">
                <div className="infopro_cima">
                    <h1 className="infopro_titulo">{isEditMode ? "Editar Análise" : "Cadastrar Análise"}</h1>
                    <div className="infopro_cima_dir">
                        <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
                    </div>
                </div>

                <form onSubmit={salvarAnalise}>
                    <div className="criad_form_linha">
                        <div className="criad_form_linha_input">
                            <label htmlFor="idProjeto">Referência do Projeto:</label>
                            <input
                                type="text"
                                id="idProjeto"
                                name="idProjeto"
                                value={novoAnalise.idProjeto}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>

                        <div className="criad_form_linha_input">
                            <label htmlFor="valorGasto">Valor Gasto:</label>
                            <input
                                type="text"
                                id="valorGasto"
                                name="valorGasto"
                                value={novoAnalise.valorGasto}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>

                        <div className="criad_form_linha_input maior">
                            <label htmlFor="autor">Autor:</label>
                            <input
                                type="text"
                                id="autor"
                                name="autor"
                                value={novoAnalise.autor}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>
                    </div>

                    <div className="criad_form_linha baixo">
                        <div className="criad_form_linha_input tudo">
                            <label htmlFor="informacoesAdicionais">Depoimento:</label>
                            <textarea
                                className="cana_textarea"
                                id="informacoesAdicionais"
                                name="informacoesAdicionais"
                                value={novoAnalise.informacoesAdicionais}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>

                        <div className="criad_form_linha_input">
                            <label>Projeto alcançou a meta?</label>
                            <div className="criad_form_radio_container">
                                <div className="criad_form_radio">
                                <label>
                                    <input
                                        type="radio"
                                        name="resultadoObtido"
                                        value="true"
                                        checked={novoAnalise.resultadoObtido === true}
                                        onChange={handleChange}
                                        required
                                    />
                                    Sim
                                </label>
                                </div>
                                <div className="criad_form_radio">
                                <label>
                                    <input
                                        type="radio"
                                        name="resultadoObtido"
                                        value="false"
                                        checked={novoAnalise.resultadoObtido === false}
                                        onChange={handleChange}
                                    />
                                    Não
                                </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="criad_botao_cad">
                        <BotaoCTA escrito={isEditMode ? "Salvar Alterações" : "Cadastrar Análise"} aparencia="primario" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastrarAnalise;