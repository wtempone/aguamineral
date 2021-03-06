import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PedidoService } from '../../../providers/database/services/pedido';
import { Pedido, PedidoHistorico, DicionarioStatusPedido, StatusPedido } from '../../../providers/database/models/pedido';
import * as moment from 'moment';
import 'moment/locale/pt-br';

@IonicPage()
@Component({
  selector: 'page-pedido-acompanhamento',
  templateUrl: 'pedido-acompanhamento.html',
})
export class PedidoAcompanhamentoPage {
  pedido: Pedido;
  timeLineItens = [];
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,    
    public pedidoSrvc: PedidoService
  ) {
    if (this.navParams.data) {
      this.pedidoSrvc.get(this.navParams.data).subscribe((pedido: Pedido) => {
        this.pedido = pedido;
        this.timeLineItens = [];
        
        this.pedido.historico.map((pedidoHistorico:PedidoHistorico) => {
          
          let dataHistorico = moment(pedidoHistorico.data);
          let dataAtual = moment().format('DDMMYYYY')
          
          let itemHistorico = {
            title: '',
            content: pedido.status == pedidoHistorico.status ? DicionarioStatusPedido[pedidoHistorico.status].MensagemUsuario : '',
            icon: DicionarioStatusPedido[pedidoHistorico.status].icon,
            time: {
              title: DicionarioStatusPedido[pedidoHistorico.status].status,
              subtitle: dataAtual == dataHistorico.format('DDMMYYYY') ? `Hoje às ${dataHistorico.format('HH:mm')}` : `Em ${dataHistorico.format('DD/MM/YYYY')} às ${dataHistorico.format('HH:mm')}`
            }
          }                    
          this.timeLineItens.push(itemHistorico)
        })                
      })
    }  
  }
  
  detalhesPedido() {
    this.navCtrl.push('DetalhesPedidoPage',this.pedido)
  }

}
