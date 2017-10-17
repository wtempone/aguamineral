import { Endereco } from './geral';
export interface Distribuidor {
  dist_nome: string;
  dist_cnpj: string;
  dist_telefone: string;
  dist_celular: string;
  dist_email: string;
  dist_img: string;
  dist_data: Date;
  dist_update_data: Date;
  dist_status: string;
  dist_online: boolean;
  dist_endereco: Endereco;
}