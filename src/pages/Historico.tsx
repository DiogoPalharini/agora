import "../styles/Historico.css";
import { Sidebar } from "../components/Sidebar/Sidebar";
import IconePesquisar from "../img/pesquisar_cinza.svg";
import IconeSeta from "../img/seta_data.svg"
import CardHistorico from "../components/CardHistorico/CardHistorico";

const Historico = () => {

    return (
        <>
            <Sidebar />
            <div className="hist_container">
                <h2 className="notif_titulo">Histórico de Ações</h2>

                <div className="hist_cima">
                    <div className="hist_pesquisa">
                        <h2>BARRA DE BUSCA</h2>
                        <div className="hist_pesquisa_barra">
                            <div className="hist_pesquisa_esq">
                                <img src={IconePesquisar} />
                            </div>
                            <input type="text" placeholder="Pesquise por um admin ou ID de projeto..."></input>
                        </div>
                    </div>
                    <div className="hist_datas">
                        <div>
                            <h2>INÍCIO</h2>
                            <input type="date" />
                        </div>
                        <img src={IconeSeta} />
                        <div>
                            <h2>FIM</h2>
                            <input type="date" />
                        </div>
                    </div>
                </div>

                <div className="hist_cards">
                    <CardHistorico nomeAdmin="Amanda Carambolas" alvoID={10} TipoAlteracao="criacao" DataAlteracao="14/11/2024" TipoAlvo="projeto"/>
                    <CardHistorico nomeAdmin="Eduardo Novais" alvoID={20} TipoAlteracao="edicao" DataAlteracao="14/11/2024" TipoAlvo="projeto"/>
                    <CardHistorico nomeAdmin="Bruna Paprika" alvoID={30} TipoAlteracao="exclusao" DataAlteracao="14/11/2024" TipoAlvo="projeto"/>
                    <CardHistorico nomeAdmin="Amanda Shnapp" alvoID={40} TipoAlteracao="ativacao" DataAlteracao="14/11/2024" TipoAlvo="admin"/>
                    <CardHistorico nomeAdmin="Glinda Maltezes" alvoID={50} TipoAlteracao="desativacao" DataAlteracao="14/11/2024" TipoAlvo="admin"/>
                </div>
            </div>
        </>
    );
};

export default Historico;
