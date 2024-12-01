export const formatarCampo = (_tipo: string, key: string, value: any): string => {
    if (value === undefined || value === null) return `${key}: Não disponível`;
  
    const formatarData = (data: string): string => {
      if (!data || !data.includes("-")) return "Data inválida";
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    };
  
    const excluirCampos = ["senha", "isSenhaRedefinida", "tokenRedefinicao"];
  
    // Ignorar campos indesejados
    if (excluirCampos.includes(key)) return "";
  
    // Lógica de formatação baseada no tipo
    switch (key) {
    case "referenciaProjeto":
        return `Referência Projeto: ${value}`;
    case "nome":
        return `Nome: ${value}`;
    case "email":
        return `E-mail: ${value}`;
    case "cpf":
        return `CPF: ${value}`;
    case "telefone":
        return `Telefone: ${value}`;
    case "empresa":
        return `Empresa: ${value}`;
    case "objeto":
        return `Objeto: ${value}`;
    case "descricao":
        return `Descrição: ${value}`;
    case "coordenador":
        return `Coordenador: ${value}`;
    case "ocultarValor":
        return `Valor foi ocultado: ${value ? "Sim" : "Não"}`;
    case "ocultarEmpresa":
        return `Empresa foi ocultada: ${value ? "Sim" : "Não"}`;
    case "valor":
        return `Valor: R$ ${value}`;
    case "dataInicio":
        return `Data de Início: ${formatarData(value)}`;
    case "dataTermino":
        return `Data de Término: ${formatarData(value)}`;
    case "situacao":
        return `Situação: ${value}`;
    case "dataCadastro":
        return `Data de Cadastro: ${formatarData(value)}`;
    case "ativo":
        return `Ativo: ${value ? "Sim" : "Não"}`;
    case "tipo":
        return `Tipo: ${value === "1" ? "Super Administrador" : "Administrador Normal"}`;
    default:
        return `${key}: ${value}`;
    }
  };  