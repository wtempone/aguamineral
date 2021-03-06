import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UsuarioService } from '../../../providers/database/services/usuario';
import { PedidoService } from '../../../providers/database/services/pedido';
import { Distribuidor } from '../../../providers/database/models/distribuidor';
import { Pedido,DicionarioStatusPedido } from '../../../providers/database/models/pedido';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { Storage } from '@ionic/storage/es2015/storage';
import { Endereco } from '../../../providers/database/models/shared-models';

@IonicPage()
@Component({
  selector: 'page-meus-pedidos',
  templateUrl: 'meus-pedidos.html',
})
export class MeusPedidosPage {

  pedidos: Pedido[];
  dicionarioStatusPedido = DicionarioStatusPedido;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public pedidoSrvc: PedidoService,
    public usuarioSrvc: UsuarioService,
    public storage: Storage
  ) {
    if (this.usuarioSrvc.usuarioAtual) {
      this.pedidoSrvc.pedidos.subscribe((pedidos: Pedido[]) => {
        this.pedidos = pedidos.filter(x => x.usuario.key == this.usuarioSrvc.usuarioAtual.key).reverse(); 
      })          
    }
  }

  acompanharPedido(pedido) {
    this.navCtrl.push('PedidoAcompanhamentoPage',pedido.$key);
  }

  facaSeuPedido() {
    this.storage.get('_EnderecoTemporario').then((endereco: Endereco) => {
      if (endereco) {
        this.navCtrl.setRoot('PainelPedidosPage')
      } else {
        this.navCtrl.setRoot('WelcomePage')
      }
    })
  
  }
}
