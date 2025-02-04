import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import axios from 'axios';
import '../styles/InformacoesProjeto.css';
import { AuthContext } from '../hook/ContextAuth';
import { Toast } from '../components/Swal/Swal';
import Swal from 'sweetalert2';
import BotaoCTA from '../components/BotaoCTA/BotaoCTA';
import IconeLixeira from "../img/lixeira.svg"
import IconeEditar from "../img/editar_projeto.svg"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import BaixarPDF from "../img/baixar_pdf.svg"
import BaixarExcel from "../img/baixar_excel.svg"
import Logo from "../img/logotipo_FAPG_azul.svg"
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

interface Arquivo {
    id: number;
    nomeArquivo: string;
    tipoDocumento: string;
}

interface Projeto {
    id: number;
    referenciaProjeto: string;
    nome: string;
    empresa: string;
    objeto: string;
    descricao: string;
    coordenador: string;
    ocultarValor: boolean;
    ocultarEmpresa: boolean;
    valor: number;
    dataInicio: number[];
    dataTermino: number[];
}

const InformacoesProjeto = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const projeto: Projeto = location.state;
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const { adm } = useContext(AuthContext);

    useEffect(() => {
        if (projeto?.id) {
            axios.get(`http://localhost:8080/arquivos/projeto/${projeto.id}`, {
                headers: {
                    Authorization: `Bearer ${adm?.token}`
                }
            })
            .then(response => setArquivos(response.data))
            .catch(error => console.error(error));
        }
    }, [projeto, adm]);

    const downloadArquivo = (arquivoId: number, nomeArquivo: string) => {
        axios.get(`http://localhost:8080/arquivos/download/${arquivoId}`, {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${adm?.token}`
            }
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nomeArquivo);
            document.body.appendChild(link);
            link.click();
        })
        .catch((error) => {
            console.error('Erro ao baixar arquivo:', error);
        });
    };

    const formatarData = (dataArray: number[]): string => {
        if (Array.isArray(dataArray) && dataArray.length === 3) {
            return new Date(dataArray[0], dataArray[1] - 1, dataArray[2]).toLocaleDateString('pt-BR');
        }
        return 'Data inválida';
    };

    const formatarValor = (valor: number | string) => {
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
        return valorNumerico.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\s/g, '');
    };

    const gerarPDF = async () => {
        // Selecionar os elementos a serem ocultados e estilizados
        const infoproTitulo = document.querySelector('.infopro_titulo') as HTMLElement;
        const infoproCima = document.querySelector('.infopro_cima') as HTMLElement;
        const infoproCimaDir = document.querySelector('.infopro_cima_dir') as HTMLElement;
        const arquivosContainer = document.querySelector('.infopro_arquivos') as HTMLElement;
        const infoproGerar = document.querySelector('.infopro_gerar') as HTMLElement;
        const infoLogo = document.querySelector('.infopro_pdf_logo') as HTMLElement
    
        // Adicionar classe temporária ao título para aplicar estilos com !important
        if (infoproTitulo) infoproTitulo.classList.add('infopro_pdf_titulo');

        if (infoLogo) infoLogo.style.display = 'block';
    
        // Aplicar estilos temporários
        if (infoproCima) infoproCima.style.background = 'none';
    
        // Ocultar as divs
        if (infoproCimaDir) infoproCimaDir.style.display = 'none';
        if (arquivosContainer) arquivosContainer.style.display = 'none';
        if (infoproGerar) infoproGerar.style.display = 'none';
    
        const elemento = document.querySelector('.infopro_container') as HTMLElement;
        if (!elemento) return;
    
        const pdf = new jsPDF('p', 'mm', 'a4');
        const larguraPDF = pdf.internal.pageSize.getWidth() - 10;
        const alturaPDF = pdf.internal.pageSize.getHeight() - 10;
    
        try {
            // Capturar o elemento como canvas
            const canvas = await html2canvas(elemento);
            const imgData = canvas.toDataURL('image/png');
            const imgAltura = (canvas.height * larguraPDF) / canvas.width;
            let posY = 0;
    
            // Adicionar a imagem ao PDF, lidando com múltiplas páginas
            while (posY < imgAltura) {
                pdf.addImage(imgData, 'PNG', 5, 5 - posY, larguraPDF, imgAltura);
                posY += alturaPDF;
                if (posY < imgAltura) pdf.addPage();
            }
    
            // Salvar o PDF
            pdf.save('informacoes_projeto.pdf');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            // Remover a classe temporária e restaurar a visibilidade dos elementos
            if (infoproTitulo) infoproTitulo.classList.remove('infopro_pdf_titulo');
            if (infoproCima) infoproCima.style.background = '';
            if (infoproCimaDir) infoproCimaDir.style.display = 'flex';
            if (arquivosContainer) arquivosContainer.style.display = 'flex';
            if (infoproGerar) infoproGerar.style.display = 'flex';
            if (infoLogo) infoLogo.style.display = 'none';
        }
    };


    const gerarExcel = async () => {
        const infoproTitulo = document.querySelector('.infopro_titulo') as HTMLElement;
        const infoproCima = document.querySelector('.infopro_cima') as HTMLElement;
        const infoproCimaDir = document.querySelector('.infopro_cima_dir') as HTMLElement;
        const arquivosContainer = document.querySelector('.infopro_arquivos') as HTMLElement;
        const infoproGerar = document.querySelector('.infopro_gerar') as HTMLElement;
        const infoLogo = document.querySelector('.infopro_pdf_logo') as HTMLElement;
    
        // Aplicar estilos temporários
        if (infoproTitulo) infoproTitulo.classList.add('infopro_pdf_titulo');
        if (infoLogo) infoLogo.style.display = 'block';
        if (infoproCima) infoproCima.style.background = 'none';
        if (infoproCimaDir) infoproCimaDir.style.display = 'none';
        if (arquivosContainer) arquivosContainer.style.display = 'none';
        if (infoproGerar) infoproGerar.style.display = 'none';
    
        const elemento = document.querySelector('.infopro_container') as HTMLElement;
        if (!elemento) return;
    
        try {
            // Inicializar workbook e worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Informações');
    
            // Configurar colunas
            worksheet.columns = [{ width: 50 }];
    
            const titulos = elemento.querySelectorAll('.infopro_info_titulo');
            const textos = elemento.querySelectorAll('.infopro_info_texto');
    
            titulos.forEach((titulo, index) => {
                const texto = textos[index]?.textContent?.trim() || '';
    
                // Adicionar título com fundo azul
                const tituloRow = worksheet.addRow([titulo.textContent?.trim() || '']);
                tituloRow.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0000FF' }, // Fundo azul
                };
                tituloRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFF' } }; // Texto branco
                tituloRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
                // Adicionar texto correspondente
                if (texto) {
                    const textoRow = worksheet.addRow([texto]);
                    textoRow.getCell(1).font = { color: { argb: '000000' } }; // Texto preto
                    textoRow.getCell(1).alignment = { horizontal: 'left', vertical: 'top' };
                }
    
                // Adicionar uma linha vazia para espaçamento
                worksheet.addRow([]);
            });
    
            // Gerar o arquivo Excel
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'informacoes_projeto.xlsx';
            link.click();
        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
        } finally {
            // Restaurar os estilos originais
            if (infoproTitulo) infoproTitulo.classList.remove('infopro_pdf_titulo');
            if (infoproCima) infoproCima.style.background = '';
            if (infoproCimaDir) infoproCimaDir.style.display = 'flex';
            if (arquivosContainer) arquivosContainer.style.display = 'flex';
            if (infoproGerar) infoproGerar.style.display = 'flex';
            if (infoLogo) infoLogo.style.display = 'none';
        }
    };
    
    
    
    
    

    
    const deletarProjeto = () => {
        if (adm?.tipo === 2) {
            // Administrador tipo 2 faz a solicitação de exclusão
            Swal.fire({
                title: 'Deseja solicitar a exclusão do projeto?',
                text: 'Esta ação não pode ser desfeita.',
                showDenyButton: true,
                confirmButtonText: 'Sim',
                denyButtonText: 'Não',
                width: 620,
                confirmButtonColor: 'rgb(224, 40, 86)',
                denyButtonColor: 'rgb(0,114,187)',
                heightAuto: false,
                backdrop: true,
                customClass: {
                    confirmButton: 'confirmButton',
                    denyButton: 'denyButton',
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Prepara um objeto completo de informações do projeto
                    const informacaoProjeto = {
                        id: projeto.id,
                        referenciaProjeto: projeto.referenciaProjeto,
                        empresa: projeto.empresa,
                        objeto: projeto.objeto,
                        descricao: projeto.descricao,
                        coordenador: projeto.coordenador,
                        ocultarValor: projeto.ocultarValor,
                        ocultarEmpresa: projeto.ocultarEmpresa,
                        valor: projeto.valor,
                        dataInicio: projeto.dataInicio,
                        dataTermino: projeto.dataTermino,
                    };
    
                    axios.post(`http://localhost:8080/permissao/solicitarExclusao`, {
                        adminSolicitanteId: adm.id,
                        informacaoProjeto: JSON.stringify(informacaoProjeto),
                    }, {
                        headers: {
                            Authorization: `Bearer ${adm.token}`
                        }
                    })
                    .then(() => {
                        Toast.fire({
                            icon: 'success',
                            title: "Solicitação de exclusão enviada com sucesso!",
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
                        navigate("/");
                    })
                    .catch(error => console.error('Erro ao solicitar exclusão do projeto:', error));
                }
            });
    
        } else {
            // Se o administrador não for do tipo 2, deleta o projeto diretamente
            Swal.fire({
                title: 'Deseja deletar o projeto?',
                text: 'Esta ação não pode ser desfeita.',
                showDenyButton: true,
                confirmButtonText: 'Sim',
                denyButtonText: 'Não',
                width: 420,
                confirmButtonColor: 'rgb(224, 40, 86)',
                denyButtonColor: 'rgb(0,114,187)',
                heightAuto: false,
                backdrop: true,
                customClass: {
                    confirmButton: 'confirmButton',
                    denyButton: 'denyButton',
                }
            }).then((result) => {
                if (result.isConfirmed) {

                    axios.delete(`http://localhost:8080/projeto/excluir`, {
                        data: {
                            id: projeto.id,
                            admAlterador: adm?.id
                        },
                        headers: {
                            Authorization: `Bearer ${adm?.token}`
                        }
                    })
                    .then(() => {
                        Toast.fire({
                            icon: 'success',
                            title: "Projeto deletado com sucesso!",
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
                        navigate("/");
                    })
                    .catch(error => console.error('Erro ao deletar o projeto:', error));
                }
            });
        }
    };
    
        

    const editarProjeto = () => {
        navigate(`/projeto/editar/${projeto.id}`);
    };

    return (
        <>
            <Sidebar />
            <div className={`infopro_container ${adm ? 'menor' : ''}`}>
            <img className='infopro_pdf_logo' src={Logo} alt="logo" />
                <div className="infopro_cima">
                    <h1 className="infopro_titulo">Informações do Projeto</h1>
                    <div className="infopro_cima_dir">
                        { adm && (
                            <>
                                {adm.tipo === 1 && ( // Apenas para administradores tipo 1
                                <BotaoCTA img={IconeLixeira} escrito="Deletar" aparencia="secundario" cor="vermelho" onClick={deletarProjeto} />
                                )}
                                <BotaoCTA img={IconeEditar} escrito="Editar" aparencia="secundario" cor="cor_primario"  onClick={editarProjeto} />
                            </>
                        )}
                        <BotaoCTA img="/src/img/voltar.svg" escrito="Voltar" aparencia="primario" onClick={() => navigate(-1)} />
                    </div>
                </div>

                <div className="infopro_info">
                    <div>
                        <p className="infopro_info_titulo">Referência e Nome do projeto</p>
                        <p className="infopro_info_texto">{projeto.referenciaProjeto} - {projeto.nome}</p>
                    </div>

                    { adm ? (
                        <div>
                            <p className="infopro_info_titulo">Empresa</p>
                            <p className="infopro_info_texto">{projeto.empresa}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="infopro_info_titulo">Empresa</p>
                            {projeto.ocultarEmpresa && (
                                <p className="infopro_info_oculto">Informação indisponível ao público.</p>
                            )}
                            <p className={`infopro_info_texto ${projeto.ocultarEmpresa ? "infopro_ocultado" : ""}`}> {projeto.ocultarEmpresa ? "" : projeto.empresa} </p>
                        </div>

                    )}

                    <div>
                        <p className="infopro_info_titulo">Objeto</p>
                        <p className="infopro_info_texto">{projeto.objeto}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Descrição</p>
                        <p className="infopro_info_texto">{projeto.descricao}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Coordenador</p>
                        <p className="infopro_info_texto">{projeto.coordenador}</p>
                    </div>

                    {adm ? (
                        <div>
                            <p className="infopro_info_titulo">Valor do Projeto</p>
                            <p className="infopro_info_texto">{formatarValor(projeto.valor)}</p>
                        </div>
                        ) : (
                        <div>
                            <p className="infopro_info_titulo">Valor do Projeto</p>
                            {projeto.ocultarValor && (
                            <p className="infopro_info_oculto">Informação indisponível ao público.</p>
                            )}
                            <p className="infopro_info_texto"> {projeto.ocultarValor ? '' : formatarValor(projeto.valor)} </p>
                        </div>
                    )}


                    <div>
                        <p className="infopro_info_titulo">Data de início</p>
                        <p className="infopro_info_texto">{formatarData(projeto.dataInicio)}</p>
                    </div>
                    <div>
                        <p className="infopro_info_titulo">Data de término</p>
                        <p className="infopro_info_texto">{formatarData(projeto.dataTermino)}</p>
                    </div>

                    <div className='infopro_arquivos'>
                        <p className="infopro_info_titulo">Arquivos do projeto</p>
                        {arquivos.length > 0 ? (
                            <div className="infopro_arquivos_container">
                                {arquivos.map(arquivo => (
                                    <div className="infopro_arquivo_item" key={arquivo.id} onClick={() => downloadArquivo(arquivo.id, arquivo.nomeArquivo)}>
                                        <h2>{arquivo.tipoDocumento}</h2>
                                        <p>{arquivo.nomeArquivo}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="infopro_nenhum">Nenhum arquivo disponível.</p>
                        )}
                    </div>
                    <div className="infopro_gerar">
                        <BotaoCTA img={BaixarPDF} escrito="Exportar para PDF" aparencia="primario" onClick={gerarPDF} />
                        <BotaoCTA img={BaixarExcel} escrito="Exportar para Excel" aparencia="primario" cor="verde" onClick={gerarExcel} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default InformacoesProjeto;