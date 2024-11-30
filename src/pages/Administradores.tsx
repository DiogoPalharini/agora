import { useContext, useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import "../styles/Administradores.css"
import { AuthContext } from "../hook/ContextAuth";
import { AdmProps } from "../Type/Adm";
import axios from "axios";
import BotaoCTA from "../components/BotaoCTA/BotaoCTA";
import IconEditar from "../img/editar.svg"
import IconVer from "../img/ver.svg"
import IconUnplug from "../img/unplug.svg"
import UserAdd from "../img/user_add.svg"
import { useNavigate } from "react-router-dom";
import { Toast } from '../components/Swal/Swal'

export const Administradores = () => {

    const { adm } = useContext(AuthContext);
    const [adms, setAdms] = useState<AdmProps[]>([]);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchAdms = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/adm/listar`, {
                    headers: { Authorization: `Bearer ${adm?.token}` },
                });
                setAdms(response.data || null);
            } catch (error) {
                console.error('Erro ao carregar o projeto:', error);
            }
        };

        fetchAdms();
    }, []);

    const HandleEdit = (id: any) => {
        navigate(`/editarAdmin/${id}`);
    };

    const toggleAtivo = async (id: number, currentStatus: boolean) => {
        try {
            const novoStatus = !currentStatus; // Inverte o status atual
            await axios.patch(
                `http://localhost:8080/adm/atualizarStatus/${id}/${adm?.id}`,
                { ativo: novoStatus },
                {
                    headers: { Authorization: `Bearer ${adm?.token}` },
                }
            );
    
            // Atualiza o estado do administrador individualmente após a resposta
            setAdms((prevAdms) =>
                prevAdms.map((adm) =>
                    adm.id === id ? { ...adm, ativo: novoStatus } : adm
                )
            );

            Toast.fire({
                icon: 'success',
                title: novoStatus ? 'Administrador ativado com sucesso!' : 'Administrador desativado com sucesso!',
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
        } catch (error) {
            console.error("Erro ao atualizar o status do administrador:", error);
            Toast.fire({
                icon: 'error',
                title: 'Erro ao atualizar o status do administrador.'
            });
        }
    };
    
    
    

    return (
        <div className="admin_container">

            <Sidebar />
            <h1 className="notif_titulo">Administradores</h1>

            <div className="container_admin">
                {adms.map((adm) => (
                    <div className="admin_card_container" key={adm.id}>
                        
                        <div className="admin_card_inicio">
                            <div className="admin_card_esq">
                                <img src="../src/img/foto_perfil_admin.svg" />
                            </div>
                            <div className="admin_card_dir">
                                <p>{adm.nome}</p>
                                <p><span>{adm.email}</span></p>
                            </div>
                        </div>
                        <div className="container-detalhes-desativar">
                            <div className="admin_botao_acoes editar" onClick={() => HandleEdit(adm.id)}>
                                <img src={IconEditar} alt="Editar" />
                                <h2>Editar</h2>
                            </div>
                            <div className="admin_botao_acoes ver " onClick={() => navigate(`/adm/informacoes/${adm.id}`)}>
                                <img src={IconVer} />
                                <h2>Ver</h2>
                            </div>
                            <div className={`admin_botao_acoes ${adm.ativo ? "desativo" : "ativo"}`} onClick={() => adm.id && toggleAtivo(adm.id, adm.ativo)}>
                                <img src={IconUnplug} alt="Toggle Ativo" />
                                <h2>{adm.ativo ? "Desativ." : "Ativar"}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin_botao_cadastro">
                <BotaoCTA img={UserAdd} escrito="Cadastrar Novo Admin" aparencia="primario" link="/adm/cadastrar-administrador"/>
            </div>

        </div>
    )}