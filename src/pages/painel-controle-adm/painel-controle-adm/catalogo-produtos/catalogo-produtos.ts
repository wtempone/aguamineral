import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController, AlertController } from 'ionic-angular';
import { MarcaService } from '../../../../providers/database/services/marca';
import { Observable } from 'rxjs/Observable';
import { Marca } from '../../../../providers/database/models/marca';
import { Produto } from '../../../../providers/database/models/produto';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { ProdutoService } from '../../../../providers/database/services/produto';

@IonicPage()
@Component({
  selector: 'page-catalogo-produtos',
  templateUrl: 'catalogo-produtos.html',
})
export class CatalogoProdutosPage {
  catalogo;
  produtos: FirebaseListObservable<Produto[]>;
  marcas: FirebaseListObservable<Marca[]>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public marcaSrvc: MarcaService,
    public produtoSrvc: ProdutoService,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private db: AngularFireDatabase,

  ) {
    this.catalogo = "produtos";
    this.produtos = this.produtoSrvc.produtos;
    this.marcas = this.marcaSrvc.marcas;
  }


  editMarca(marca: Marca) {
    let modal = this.modalCtrl.create('MarcaEditPage', { marca: marca });
    modal.present({
      ev: event
    });
  }

  removerMarca(marca: Marca) {
    let confirm = this.alertCtrl.create({
      title: 'Confirma exclusão',
      message: 'Deseja realmente excluir o registro?',
      buttons: [
        {
          text: 'Não',
        },
        {
          text: 'Sim',
          handler: () => {
            this.marcaSrvc.delete(marca.$key).then(() => {
              ;
              let toast = this.toastCtrl.create({
                message: 'Registro excluído com sucesso',
                duration: 3000,
                position: 'top',
                cssClass: 'toast-success'
              });
              toast.present();
            });
          }
        }
      ]
    });
    confirm.present();
  }

  editProduto(produto: Produto) {
    let modal = this.modalCtrl.create('ProdutoEditPage', { produto: produto });
    modal.present({
      ev: event
    });
  }

  removerProduto(produto: Produto) {
    let confirm = this.alertCtrl.create({
      title: 'Confirma exclusão',
      message: 'Deseja realmente excluir o registro?',
      buttons: [
        {
          text: 'Não',
        },
        {
          text: 'Sim',
          handler: () => {
            this.produtoSrvc.delete(produto.$key).then(() => {
              ;
              let toast = this.toastCtrl.create({
                message: 'Registro excluído com sucesso',
                duration: 3000,
                position: 'top',
                cssClass: 'toast-success'
              });
              toast.present();
            });
          }
        }
      ]
    });
    confirm.present();
  }

  pesquisarProduto(evento) {
    var q = evento.srcElement.value;
    if (!q) {
      this.produtos = this.produtoSrvc.produtos;
    }
    this.produtos =
      this.db.list(this.produtoSrvc.basePath, {
        query: {
          orderByChild: "pro_nome",
          startAt: q
        }
      }
      )
  }


  pesquisarMarca(evento) {
    var q = evento.srcElement.value;
    if (!q) {
      this.marcas = this.marcaSrvc.marcas;
    }
    this.marcas =
      this.db.list(this.marcaSrvc.basePath, {
        query: {
          orderByChild: "mrc_nome",
          startAt: q
        }
      }
      )
  }
}
