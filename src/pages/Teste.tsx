import React, { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { AuthContext } from "../hook/ContextAuth";

// Registrar componentes do gráfico
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EstatisticasBolsistas: React.FC = () => {
    const { adm } = useContext(AuthContext);
    const [numeroBolsistas, setNumeroBolsistas] = useState<number>(0);
    const [valorTotalBolsa, setValorTotalBolsa] = useState<number>(0);
    const [bolsistasPorArea, setBolsistasPorArea] = useState<{ [key: string]: number }>({});
    const [valorTotalMateriais, setValorTotalMateriais] = useState<number>(0);
    const [materiaisPorProjeto, setMateriaisPorProjeto] = useState<{ [key: string]: number }>({});
    const [quantidadePorFornecedor, setQuantidadePorFornecedor] = useState<{ [key: string]: number }>({});

    // Obter o número total de bolsistas
    const fetchNumeroBolsistas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/numero", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setNumeroBolsistas(response.data);
        } catch (error) {
            console.error("Erro ao buscar o número de bolsistas:", error);
        }
    };

    // Obter o valor total pago em bolsas
    const fetchValorTotalBolsa = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/valor-total", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            const valorTotal = isNaN(parseFloat(response.data)) ? 0 : parseFloat(response.data);
            setValorTotalBolsa(valorTotal);
        } catch (error) {
            console.error("Erro ao buscar o valor total pago em bolsas:", error);
        }
    };

    // Obter a quantidade de bolsistas por área de atuação
    const fetchBolsistasPorArea = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bolsistas/por-area", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setBolsistasPorArea(response.data);
        } catch (error) {
            console.error("Erro ao buscar a quantidade de bolsistas por área:", error);
        }
    };

    // Obter o valor total pago em materiais
    const fetchValorTotalMateriais = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/valor-total", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            const valorTotal = isNaN(parseFloat(response.data.valorTotal)) ? 0 : parseFloat(response.data.valorTotal);
            setValorTotalMateriais(valorTotal);
        } catch (error) {
            console.error("Erro ao buscar o valor total pago em materiais:", error);
        }
    };

    // Obter a quantidade de materiais por projeto
    const fetchMateriaisPorProjeto = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/materiais-por-projeto", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
    
            // A resposta agora é um mapa simples { "Projeto A": 100, "Projeto B": 200 }
            console.log("Dados para o gráfico de Materiais por Projeto:", response.data);
            setMateriaisPorProjeto(response.data);
        } catch (error) {
            console.error("Erro ao buscar os materiais por projeto:", error);
        }
    };    

    // Obter a quantidade de peças compradas por fornecedor
    const fetchQuantidadePorFornecedor = async () => {
        try {
            const response = await axios.get("http://localhost:8080/material/quantidade-por-fornecedor", {
                headers: {
                    Authorization: `Bearer ${adm?.token}`,
                },
            });
            setQuantidadePorFornecedor(response.data);
        } catch (error) {
            console.error("Erro ao buscar a quantidade por fornecedor:", error);
        }
    };

    // Carregar as informações ao montar o componente
    useEffect(() => {
        fetchNumeroBolsistas();
        fetchValorTotalBolsa();
        fetchBolsistasPorArea();
        fetchValorTotalMateriais();
        fetchMateriaisPorProjeto();
        fetchQuantidadePorFornecedor();
    }, []);

    // Configuração dos dados para o gráfico de bolsistas por área
    const dataBolsistas = {
        labels: Object.keys(bolsistasPorArea),
        datasets: [
            {
                label: "Quantidade de Bolsistas",
                data: Object.values(bolsistasPorArea),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Configuração dos dados para o gráfico de materiais por projeto
    const dataMateriaisPorProjeto = {
        labels: Object.keys(materiaisPorProjeto ?? {}),
        datasets: [
            {
                label: "Quantidade de Materiais por Projeto",
                data: Object.values(materiaisPorProjeto ?? {}),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
            },
        ],
    };    

    // Configuração dos dados para o gráfico de quantidade por fornecedor
    const dataQuantidadePorFornecedor = {
        labels: Object.keys(quantidadePorFornecedor),
        datasets: [
            {
                label: "Quantidade de Peças",
                data: Object.values(quantidadePorFornecedor),
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Estatísticas</h1>
            <div>
                <h2>Número Total de Bolsistas: {numeroBolsistas}</h2>
                <h2>Valor Total Pago em Bolsas: R$ {valorTotalBolsa.toFixed(2)}</h2>
                <h2>Valor Total Pago em Materiais: R$ {valorTotalMateriais.toFixed(2)}</h2>
            </div>
            <div style={{ width: "80%", margin: "0 auto" }}>
                <Bar data={dataBolsistas} options={options} />
            </div>
            <div style={{ width: "80%", margin: "20px auto" }}>
                <Bar data={dataMateriaisPorProjeto} options={options} />
            </div>
            <div style={{ width: "80%", margin: "20px auto" }}>
                <Bar data={dataQuantidadePorFornecedor} options={options} />
            </div>
        </div>
    );
};

export default EstatisticasBolsistas;