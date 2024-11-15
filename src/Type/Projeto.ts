export interface Projeto {
    id: number;
    referenciaProjeto: string;
    nome: string;
    empresa: string;
    objeto: string;
    descricao: string;
    coordenador: string;
    valor: string;
    dataInicio: number[];
    dataTermino: number[];
    propostaRelatorio: string;
    contrato: string;
    artigo: string;
    situacao: string;
}