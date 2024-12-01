import { useEffect, useState, useContext } from "react";
import "../styles/RelatorioAnual.css"
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import axios from "axios";
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bar } from "react-chartjs-2";
import { AuthContext } from "../hook/ContextAuth";
import IconeDownload from "../img/download.svg";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

ChartJS.defaults.plugins.legend.labels.font = {
    size: 12, // 32px (2rem)
  };
  
  ChartJS.defaults.plugins.title.font = {
    size: 20, // Também ajusta os títulos
  };

interface Bolsista {
    id: number;
    nome: string;
    areaAtuacao: string[];
    projetoId: number;
    convenio: string;
    cidade: string;
    cpf: string;
    telefone: string;
    valorBolsa: string;
    duracaoBolsa: string;
}

interface Convenio {
    id: number;
    nome: string;
    tipoConvenio: string;
    objetivo: string;
    instituicao: string;
    prazo: string;
}

interface Material {
    id: number;
    nome: string;
    quantidadeUsada: number;
    valor: string;
    fornecedor: string;
    descricao: string;
    projeto: string;
}

interface AnaliseProjeto {
    id: number;
    valorGasto: string;
    autor: string;
    informacoesAdicionais: string;
    resultadoObtido: boolean;
    idProjeto: string;
}


export default function RelatorioAnual() {

    const navigate = useNavigate();

    const [bolsistas, setBolsistas] = useState<Bolsista[]>([]);
    const [bolsistasPorArea, setBolsistasPorArea] = useState<Map<string, number>>(new Map());
    const [totalValorBolsas, setTotalValorBolsas] = useState(0);
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [instituicoesPorConvenio, setInstituicoesPorConvenio] = useState<Map<string, number>>(new Map());
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [materiaisPorProjeto, setMateriaisPorProjeto] = useState<Map<string, number>>(new Map());
    const [quantidadePorFornecedor, setQuantidadePorFornecedor] = useState<Map<string, number>>(new Map());
    const [analises, setAnalises] = useState<AnaliseProjeto[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const { adm } = useContext(AuthContext);

    useEffect(() => {
        // Adiciona a classe no-margin ao body
        document.body.classList.add("no-margin");
    
        // Remove a classe no-margin ao desmontar o componente
        return () => {
            document.body.classList.remove("no-margin");
        };
    }, []);
    

    const listarConvenios = async () => {
        try {
            const response = await axios.get("http://localhost:8080/convenio/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            setConvenios(response.data);
        } catch (error) {
            console.error("Erro ao listar convênios:", error);
        }
    };

    const listarAnalises = async () => {
        try {
            const response = await axios.get("http://localhost:8080/analises/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            setAnalises(response.data);
        } catch (error) {
            console.error("Erro ao listar análises de projeto:", error);
        }
    };

    useEffect(() => {
        listarAnalises();
    }, []);


    const contarInstituicoesPorConvenio = async () => {
        try {
            const response = await axios.get("http://localhost:8080/convenio/instituicoes-por-convenio", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setInstituicoesPorConvenio(new Map(Object.entries(response.data)));
        } catch (error) {
            console.error("Erro ao contar instituições por convênio:", error);
        }
    };

    useEffect(() => {
        listarConvenios();
        contarInstituicoesPorConvenio();
    }, []);

    const listarBolsistas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            setBolsistas(response.data);
        } catch (error) {
            console.error("Erro ao listar bolsistas:", error);
        }
    };

    const calcularValorTotal = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/valor-total", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setTotalValorBolsas(response.data);
        } catch (error) {
            console.error("Erro ao calcular valor total:", error);
        }
    };

    const contarBolsistasPorArea = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/por-area", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setBolsistasPorArea(new Map(Object.entries(response.data)));
        } catch (error) {
            console.error("Erro ao contar bolsistas por área de atuação:", error);
        }
    };

    const formatarPrazo = (prazo: string): string => {
        if (!prazo.includes("-")) return prazo; // Fallback if prazo is not in the expected format
        const [ano, mes, dia] = prazo.split("-");
        return `${dia}/${mes}/${ano}`;
    };    

    useEffect(() => {
        listarBolsistas();
        contarBolsistasPorArea();
        calcularValorTotal();
    }, []);

    const listarMateriais = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/listar", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                    "Content-Type": "application/json",
                },
            });
            setMateriais(response.data);
        } catch (error) {
            console.error("Erro ao listar materiais:", error);
        }
    };

    const listarMateriaisPorProjeto = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/materiais-por-projeto", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setMateriaisPorProjeto(new Map(Object.entries(response.data)));
        } catch (error) {
            console.error("Erro ao listar materiais por projeto:", error);
        }
    };

    const listarQuantidadePorFornecedor = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/quantidade-por-fornecedor", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setQuantidadePorFornecedor(new Map(Object.entries(response.data)));
        } catch (error) {
            console.error("Erro ao listar quantidade por fornecedor:", error);
        }
    };

    useEffect(() => {
        listarMateriais();
        listarMateriaisPorProjeto();
        listarQuantidadePorFornecedor();
    }, []);

    const chartDataProjeto = {
        labels: Array.from(materiaisPorProjeto.keys()),
        datasets: [
            {
                label: "Quantidade de Materiais por Projeto",
                data: Array.from(materiaisPorProjeto.values()),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const chartDataFornecedor = {
        labels: Array.from(quantidadePorFornecedor.keys()),
        datasets: [
            {
                label: "Quantidade de Materiais por Fornecedor",
                data: Array.from(quantidadePorFornecedor.values()),
                backgroundColor: "rgba(192, 75, 75, 0.6)",
                borderColor: "rgba(192, 75, 75, 1)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptionsMaterialProjeto = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Materiais por Projeto",
            },
        },
    };

    const chartOptionsMaterialFornecedor = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Materiais por Fornecedor",
            },
        },
    };

    // Prepare data for the chart
    const chartData = {
        labels: Array.from(bolsistasPorArea.keys()), // Areas of atuação
        datasets: [
            {
                label: "Quantidade de Bolsistas",
                data: Array.from(bolsistasPorArea.values()), // Count of bolsistas
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Quantidade de Bolsistas por Área de Atuação",
            },
        },
    };

    const chartDataConvenio = {
        labels: Array.from(instituicoesPorConvenio.keys()), // Instituições
        datasets: [
            {
                label: "Quantidade de Convênios",
                data: Array.from(instituicoesPorConvenio.values()), // Quantidade de convênios
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptionsConvenio = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Quantidade de Convênios por Instituição",
            },
        },
    };

    const downloadAsPDF = async () => {
        if (!containerRef.current) return;
    
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const sections = containerRef.current.querySelectorAll(".relanual_section");
    
            const margin = 10; // Margem inicial
            let currentY = margin; // Posição Y atual na página
    
            for (const section of sections) {
                const sectionEl = section as HTMLElement;
    
                // Adiciona nova página para cada seção
                if (currentY > margin) {
                    pdf.addPage();
                    currentY = margin; // Reseta a posição Y para o topo
                }
    
                // Renderiza a seção inteira
                const canvas = await html2canvas(sectionEl, {
                    scale: 2,
                    backgroundColor: null, // Fundo transparente
                });
                const imgData = canvas.toDataURL("image/png");
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
                if (currentY + imgHeight > pdfHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                }
    
                pdf.addImage(imgData, "PNG", margin, currentY, pdfWidth - 2 * margin, imgHeight);
                currentY += imgHeight + 5;
            }
    
            pdf.save("relatorio-anual.pdf");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        }
    };                    
    
    return (
        <>
            <div className="relanual_cima">
                <div className="rela_gerar">
                    <p>Clique no botão à direita para baixar o relatório anual com todas as informações abaixo.</p>
                    <div className="relanual_extra">
                    <BotaoCTA
                        escrito="Voltar"
                        aparencia="primario"
                        onClick={() => navigate('/adm/relatorio')}
                    />
                    <BotaoCTA
                        img={IconeDownload}
                        escrito="Baixar Relatório"
                        aparencia="primario"
                        cor="verde"
                        onClick={downloadAsPDF}
                    />
                    </div>
                </div>
            </div>
            <div className="relanual_container" ref={containerRef}>
                {/* Seção de Bolsistas */}
                <section className="relanual_section">
                    <h1 className="relanual_title">Bolsistas</h1>
                    {bolsistas.length > 0 ? (
                        <table className="relanual_table">
                            <thead>
                                <tr>
                                    <th>Nome completo</th>
                                    <th>CPF</th>
                                    <th>Telefone</th>
                                    <th>Cidade</th>
                                    <th>Projeto</th>
                                    <th>Área de Atuação</th>
                                    <th>Valor da Bolsa</th>
                                    <th>Duração da Bolsa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bolsistas.map((bolsista) => (
                                    <tr key={bolsista.id}>
                                        <td>{bolsista.nome}</td>
                                        <td>{bolsista.cpf}</td>
                                        <td>{bolsista.telefone}</td>
                                        <td>{bolsista.cidade}</td>
                                        <td>{bolsista.projetoId}</td>
                                        <td>
                                            {Array.isArray(bolsista.areaAtuacao)
                                                ? bolsista.areaAtuacao.join(', ')
                                                : bolsista.areaAtuacao || 'Não especificado'}
                                        </td>
                                        <td>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                parseFloat(bolsista.valorBolsa)
                                            )}
                                        </td>
                                        <td>{bolsista.duracaoBolsa} meses</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Não há nenhum bolsista cadastrado.</p>
                    )}
                    <div className="relanual_summary">
                        <p><strong>Número total de bolsistas:</strong> {bolsistas.length}</p>
                        <p>
                            <strong>Valor total das bolsas:</strong>{' '}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorBolsas)}
                        </p>
                    </div>
                    <div className="relanual_chart">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </section>
    
                {/* Seção de Convênios */}
                <section className="relanual_section">
                    <h1 className="relanual_title">Convênios</h1>
                    {convenios.length > 0 ? (
                        <table className="relanual_convenio_table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo de Convênio</th>
                                    <th>Objetivo</th>
                                    <th>Instituição</th>
                                    <th>Prazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {convenios.map((convenio) => (
                                    <tr key={convenio.id}>
                                        <td>{convenio.nome}</td>
                                        <td>{convenio.tipoConvenio}</td>
                                        <td>{convenio.objetivo}</td>
                                        <td>{convenio.instituicao}</td>
                                        <td>{formatarPrazo(convenio.prazo)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Não há nenhum convênio cadastrado.</p>
                    )}
                    <div className="relanual_convenio_chart">
                        <Bar data={chartDataConvenio} options={chartOptionsConvenio} />
                    </div>
                </section>
    
                {/* Seção de Materiais */}
                <section className="relanual_section">
                    <h1 className="relanual_title">Materiais</h1>
                    {materiais.length > 0 ? (
                        <table className="relanual_material_table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Quantidade Usada</th>
                                    <th>Valor Unitário</th>
                                    <th>Valor Total</th>
                                    <th>Fornecedor</th>
                                    <th>Projeto</th>
                                    <th>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiais.map((material) => {
                                    const valorUnitario = parseFloat(material.valor);
                                    const valorTotalCompra = material.quantidadeUsada * valorUnitario;
    
                                    return (
                                        <tr key={material.id}>
                                            <td>{material.nome}</td>
                                            <td>{material.quantidadeUsada}</td>
                                            <td>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(valorUnitario)}
                                            </td>
                                            <td>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(valorTotalCompra)}
                                            </td>
                                            <td>{material.fornecedor}</td>
                                            <td>{material.projeto}</td>
                                            <td>{material.descricao}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>Não há materiais cadastrados.</p>
                    )}
                    <div className="relanual_material_chart">
                        <Bar data={chartDataProjeto} options={chartOptionsMaterialProjeto} />
                    </div>
                    <div className="relanual_material_chart">
                        <Bar data={chartDataFornecedor} options={chartOptionsMaterialFornecedor} />
                    </div>
                </section>
    
                {/* Seção de Análises de Projeto */}
                <section className="relanual_section">
                    <h1 className="relanual_title">Análises de Projeto</h1>
                    {analises.length > 0 ? (
                        <table className="relanual_analise_table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome do Projeto</th>
                                    <th>Valor Gasto</th>
                                    <th>Autor</th>
                                    <th>Informações Adicionais</th>
                                    <th>Resultado Obtido</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analises.map((analise) => (
                                    <tr key={analise.id}>
                                        <td>{analise.id}</td>
                                        <td>{analise.idProjeto}</td>
                                        <td>
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(parseFloat(analise.valorGasto))}
                                        </td>
                                        <td>{analise.autor}</td>
                                        <td>{analise.informacoesAdicionais}</td>
                                        <td>{analise.resultadoObtido ? 'Sim' : 'Não'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Não há análises de projeto cadastradas.</p>
                    )}
                </section>
            </div>
        </>
    );
};