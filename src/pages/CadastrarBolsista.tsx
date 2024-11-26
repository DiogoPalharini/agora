import MaskedInput from "react-text-mask";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import { Sidebar } from "../components/Sidebar/Sidebar";
import "../styles/CriacaoAdmin.css";
import { useNavigate, useParams } from "react-router-dom";
import { FormEvent, useContext, useState, ChangeEvent, useEffect } from "react";
import { AuthContext } from "../hook/ContextAuth";
import { Toast } from "../components/Swal/Swal";
import axios from "axios";

// Interface para o projeto
interface Projeto {
    id: number;
    referenciaProjeto: string;
    nome: string;
}

const CadastrarBolsista = () => {
    const { adm } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const [projetos, setProjetos] = useState<Projeto[]>([]);

    const [novoBolsista, setnovoBolsista] = useState<{
        nome: string;
        cidade: string;
        cpf: string;
        telefone: string;
        valorBolsa: string;
        duracaoBolsa: string;
        areaAtuacao: string;
        convenio: string;
        projeto: string;
    }>({
        nome: "",
        cidade: "",
        cpf: "",
        telefone: "",
        valorBolsa: "R$ 0,00",
        duracaoBolsa: "",
        areaAtuacao: "",
        convenio: "",
        projeto: "",
    });

    // Busca dados do bolsista para edição
    useEffect(() => {
        const fetchBolsistaData = async () => {
            if (isEditMode) {
                try {
                    const response = await axios.get(`http://localhost:8080/bolsistas/${id}`, {
                        headers: {
                            Authorization: `Bearer ${adm?.token}`,
                        },
                    });
                    setnovoBolsista({
                        ...response.data,
                        valorBolsa: formatCurrency(String(response.data.valorBolsa || "0")),
                    });
                } catch (error) {
                    console.error("Erro ao buscar dados do bolsista:", error);
                    alert("Erro ao carregar os dados do bolsista para edição.");
                }
            }
        };
        fetchBolsistaData();
    }, [id, isEditMode, adm]);

    // Busca projetos e ordena
    useEffect(() => {
        const fetchProjetos = async () => {
            try {
                const response = await axios.get("http://localhost:8080/projeto/listar", {
                    headers: { Authorization: `Bearer ${adm?.token}` },
                });

                const projetosOrdenados = response.data.sort((a: Projeto, b: Projeto) => {
                    const [numA, anoA] = a.referenciaProjeto.split("/").map(Number);
                    const [numB, anoB] = b.referenciaProjeto.split("/").map(Number);

                    if (anoA !== anoB) return anoB - anoA; // Ordem decrescente pelo ano
                    return numA - numB; // Ordem crescente pelo número
                });

                setProjetos(projetosOrdenados);
            } catch (error) {
                console.error("Erro ao buscar projetos:", error);
                alert("Erro ao carregar projetos.");
            }
        };

        fetchProjetos();
    }, [adm]);

    // Função para formatar valores em moeda
    const formatCurrency = (value: string | number) => {
        const stringValue = typeof value === "number" ? value.toFixed(2) : value;
        const numericValue = stringValue.replace(/\D/g, "");
        const formatter = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
        return formatter.format(parseFloat(numericValue) / 100);
    };
    

    // Manipula alterações no formulário
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "valorBolsa") {
            setnovoBolsista((prev) => ({
                ...prev,
                valorBolsa: formatCurrency(value), // Formatado
            }));
        } else {
            setnovoBolsista((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Salva o bolsista
    const salvarBolsista = async (e: FormEvent) => {
        e.preventDefault();
        if (!adm) return;

        if (!novoBolsista.cpf || novoBolsista.cpf.replace(/\D/g, "").length !== 11) {
            alert("CPF incompleto.");
            return;
        }

        if (!novoBolsista.telefone || novoBolsista.telefone.replace(/\D/g, "").length !== 11) {
            alert("Telefone incompleto.");
            return;
        }

        try {
            const bolsistaData = {
                ...novoBolsista,
                valorBolsa: parseFloat(novoBolsista.valorBolsa.replace(/\D/g, "")) / 100,
                cpf: novoBolsista.cpf.replace(/\D/g, ""),
                telefone: novoBolsista.telefone.replace(/\D/g, ""),
                projeto: { id: novoBolsista.projeto },
            };

            let response;

            if (isEditMode) {
                response = await axios.put(`http://localhost:8080/bolsistas/editar/${id}`, bolsistaData, {
                    headers: { Authorization: `Bearer ${adm.token}` },
                    params: { idAdm: adm.id },
                });
            } else {
                response = await axios.post("http://localhost:8080/bolsistas/criarBolsista", bolsistaData, {
                    headers: { Authorization: `Bearer ${adm.token}` },
                    params: { idAdm: adm.id },
                });
            }

            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: response.data.message || (isEditMode ? 'Bolsista editado com sucesso!' : 'Bolsista criado com sucesso!'),
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
            console.error("Erro ao salvar bolsista:", error);
            alert(error.response?.data?.message || "Erro ao salvar bolsista.");
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="criad_container">
                <div className="infopro_cima">
                    <h1 className="infopro_titulo">{isEditMode ? "Editar Bolsista" : "Cadastrar Bolsista"}</h1>
                    <div className="infopro_cima_dir">
                        <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
                    </div>
                </div>

                <form onSubmit={salvarBolsista}>
                    <h2 className="criad_subtitulo">Informações Pessoais</h2>
                    <div className="criad_form_linha">
                        <div className="criad_form_linha_input">
                            <label htmlFor="nome">Nome:</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={novoBolsista.nome}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>
                        <div className="criad_form_linha_input">
                            <label htmlFor="cidade">Cidade:</label>
                            <input
                                type="text"
                                id="cidade"
                                name="cidade"
                                value={novoBolsista.cidade}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>
                    </div>

                    <div className="criad_form_linha baixo">
                        <div className="criad_form_linha_input">
                            <label htmlFor="cpf">CPF:</label>
                            <MaskedInput
                                mask={[/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]}
                                id="cpf"
                                name="cpf"
                                value={novoBolsista.cpf}
                                onChange={handleChange}
                                placeholder="___.___.___-__"
                                required
                            />
                        </div>
                        <div className="criad_form_linha_input">
                            <label htmlFor="telefone">Telefone:</label>
                            <MaskedInput
                                mask={["(", /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
                                id="telefone"
                                name="telefone"
                                value={novoBolsista.telefone}
                                onChange={handleChange}
                                placeholder="(__) _____-____"
                                required
                            />
                        </div>
                    </div>

                    <h2 className="criad_subtitulo top">Informações sobre a Bolsa</h2>
                    <div className="criad_form_linha">
                        <div className="criad_form_linha_input">
                            <label htmlFor="valorBolsa">Valor da Bolsa:</label>
                            <input
                                type="text"
                                id="valorBolsa"
                                name="valorBolsa"
                                value={novoBolsista.valorBolsa}
                                onChange={handleChange}
                                placeholder="R$ 0,00"
                                required
                            />
                        </div>
                        <div className="criad_form_linha_input">
                            <label htmlFor="duracaoBolsa">Duração da Bolsa (em meses):</label>
                            <input
                                type="number"
                                id="duracaoBolsa"
                                name="duracaoBolsa"
                                value={novoBolsista.duracaoBolsa}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>
                    </div>

                    <div className="criad_form_linha baixo">
                        <div className="criad_form_linha_input">
                            <label htmlFor="projeto">Projeto</label>
                            <select
                                id="projeto"
                                name="projeto"
                                value={novoBolsista.projeto}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione um projeto</option>
                                {projetos.map((projeto) => (
                                    <option key={projeto.id} value={projeto.id}>
                                        {`${projeto.referenciaProjeto} - ${projeto.nome}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="criad_form_linha_input">
                            <label htmlFor="areaAtuacao">Área de Atuação:</label>
                            <input
                                type="text"
                                id="areaAtuacao"
                                name="areaAtuacao"
                                value={novoBolsista.areaAtuacao}
                                onChange={handleChange}
                                placeholder="Digite aqui..."
                                required
                            />
                        </div>
                    </div>

                    <div className="criad_botao_cad">
                        <BotaoCTA escrito={isEditMode ? "Salvar Alterações" : "Cadastrar Bolsista"} aparencia="primario" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastrarBolsista;