import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Pedido, PedidoHistorico } from '../../../../providers/database/models/pedido';
import { UsuarioService } from '../../../../providers/database/services/usuario';
import { DistribuidorService } from '../../../../providers/database/services/distribuidor';
import { Distribuidor } from '../../../../providers/database/models/distribuidor';
import { DistribuidorFormaPagamento } from '../../../../providers/database/models/distribuidor-forma-pagamento';
import { FormaPagamento } from '../../../../providers/database/models/forma-pagamento';
import { FormaPagamentoService } from '../../../../providers/database/services/forma-pagamento';
import { TipoPagamentoService } from '../../../../providers/database/services/tipo-pagamento';
import { TipoPagamento } from '../../../../providers/database/models/tipo-pagamento';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { PedidoService } from '../../../../providers/database/services/pedido';
import { Usuario } from '../../../../providers/database/models/usuario';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage/es2015/storage';
import { Endereco } from '../../../../providers/database/models/shared-models';
import { take } from 'rxjs/operator/take';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { App } from 'ionic-angular/components/app/app';

@IonicPage()
@Component({
  selector: 'page-pedido-forma-pagamento',
  templateUrl: 'pedido-forma-pagamento.html',
})
export class PedidoFormaPagamentoPage {
  carrinho: Pedido;
  formasPagamento: FormaPagamento[];
  formaPagamentoStr: string;
  pedido: Pedido;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public usuarioSrvc: UsuarioService,
    public distribuidorSrvc: DistribuidorService,
    public formaPagamentoSrvc: FormaPagamentoService,
    public tipoPagamentoSrvc: TipoPagamentoService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public pedidoSrvc: PedidoService,
    public storage: Storage,
    public modalCtrl: ModalController,
    public app: App
  ) {
    this.storage.get('_PedidoTemporario').then((pedido: Pedido) => {
      this.carrinho = pedido;

      let enderecosPadrao = [];

      if (this.usuarioSrvc.usuarioAtual) {
        enderecosPadrao = this.usuarioSrvc.usuarioAtual.usr_endereco.filter(x => x.padrao == true);
        if (enderecosPadrao.length > 0) {
          this.carrinho.enderecoEntrega = enderecosPadrao[0];
        } else {
          this.carrinho.enderecoEntrega = this.usuarioSrvc.usuarioAtual.usr_endereco[0]
        }
      } else {
        this.storage.get('_EnderecoTemporario').then((endereco: Endereco) => {
          this.carrinho.enderecoEntrega = endereco;
          this.storage.set('_PedidoTemporario', this.carrinho);
        })
      }

      this.distribuidorSrvc.get(this.carrinho.distribuidor.key).take(1).subscribe((distribuidor: Distribuidor) => {
        if (!distribuidor.dist_formas_pagamento) {
          let alert = this.alertCtrl.create({
            title: 'Forma de pagamento não configurada',
            subTitle: 'Não é possível realizar o pedido para esta distribuidora, não há configuração de forma de pagamento.',
            buttons: ['Ok']
          });
          alert.present();
          this.navCtrl.pop();
          return;
        }
        let formasPagamento = distribuidor.dist_formas_pagamento;
        this.formasPagamento = [];
        formasPagamento.map((distFormaPagamento: DistribuidorFormaPagamento) => {
          this.formaPagamentoSrvc.get(distFormaPagamento.key).then((formaPagamento: FormaPagamento) => {
            if (formaPagamento.pag_mnemonico) {
              this.formasPagamento.push(<FormaPagamento>{
                pag_mnemonico: formaPagamento.pag_mnemonico,
                pag_descricao: formaPagamento.pag_descricao,
                pag_img: formaPagamento.pag_img,
                _selecionada: false
              })
            }
          })
        })
      })

    })

  }

  modificarPedido() {
    this.navCtrl.pop();
  }


  changeFormaPagamento($event, iForma) {
    if (iForma == null) return;
    this.carrinho.formaPagamento = this.formasPagamento[iForma];
    if (this.formasPagamento[iForma].pag_mnemonico.toUpperCase() == 'DINHEIRO') {
      let confirm = this.alertCtrl.create({
        title: 'Dinheiro',
        message: 'Precisa de troco para seu pedido?',
        buttons: [
          {
            text: 'Não',
          },
          {
            text: 'Sim',
            handler: () => {
              this.obtemValorTroco();
              //this.usuarioSrvc.updateCarrinho(this.carrinho);
              this.storage.set('_PedidoTemporario', this.carrinho)
              
            }
          }
        ]
      });
      confirm.present();
    } else {
      //this.usuarioSrvc.updateCarrinho(this.carrinho);
      this.storage.set('_PedidoTemporario', this.carrinho)      
    }

  }

  obtemValorTroco() {
    let alert = this.alertCtrl.create({
      title: 'Troco para quanto?',
      message: `Seu pedito deu R$ ${this.carrinho.total}.
                Digite o valor que pagará em dinheiro para que o entregador leve seu troco.`,
      inputs: [
        {
          name: 'troco',
          placeholder: 'R$ 0,00',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Confirmar',
          handler: data => {
            if (data.troco) {
              if (data.troco < this.carrinho.total) {
                this.showToastMessage('O valor para troco não pode ser menor que o valor do pedito.')
                return false;
              } else {
                this.carrinho.troco = data.troco;
              }
            } else {
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  alterarEndereco() {

  }

  enviarPedido() {
    if (!this.carrinho.formaPagamento) {
      this.showToastMessage('Selecione uma forma de pagamento.')
      return;
    }
    if (!this.carrinho.enderecoEntrega) {
      this.showToastMessage('Informe um endereço de entrega.')
      return;
    }
    if (!this.usuarioSrvc.usuarioAtual) {
      this.login();
      return;
    }
    this.gerarPedido().then((pedido) => {
      this.navCtrl.setRoot('PedidoAcompanhamentoPage', pedido.key)
    });
  }

  gerarPedido() {
    let currentDate = firebase.database.ServerValue.TIMESTAMP;
    this.pedido = this.carrinho;
    this.pedido.status = 0;
    this.pedido.dataCriacao = currentDate;
    let usuario = new Usuario();
    if (this.usuarioSrvc.usuarioAtual.key) usuario.key = this.usuarioSrvc.usuarioAtual.key;
    if (this.usuarioSrvc.usuarioAtual.usr_fb_id) usuario.usr_fb_id = this.usuarioSrvc.usuarioAtual.usr_fb_id;
    if (this.usuarioSrvc.usuarioAtual.usr_fb_foto) usuario.usr_fb_foto = this.usuarioSrvc.usuarioAtual.usr_fb_foto;
    if (this.usuarioSrvc.usuarioAtual.usr_nome) usuario.usr_nome = this.usuarioSrvc.usuarioAtual.usr_nome;
    if (this.usuarioSrvc.usuarioAtual.usr_email) usuario.usr_email = this.usuarioSrvc.usuarioAtual.usr_email;
    this.pedido.usuario = usuario;
    this.pedido.historico = [];
    this.pedido.historico.push(<PedidoHistorico>{
      status: 0,
      data: currentDate
    })

    if (!this.usuarioSrvc.usuarioAtual.usr_endereco) {
      this.usuarioSrvc.usuarioAtual.usr_endereco = [];
      this.usuarioSrvc.usuarioAtual.usr_endereco.push(this.pedido.enderecoEntrega);
      const path = `${this.usuarioSrvc.basePath}/${this.usuarioSrvc.usuarioAtual.key}/usr_endereco`;
      this.usuarioSrvc.db.object(path).set(this.usuarioSrvc.usuarioAtual.usr_endereco);
      
    }
    
    //this.usuarioSrvc.removeCarrinho();
    this.storage.set('_PedidoTemporario', undefined)
    return this.pedidoSrvc.create(this.pedido);
  }
  
  login() {
    let modal = this.modalCtrl.create('LoginPage', { message: "NOT_AUTHENTICATED" });    
    modal.present({
      ev: event
    });
  }

  showToastMessage(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present()
  }
}
