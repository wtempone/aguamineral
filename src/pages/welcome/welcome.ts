import { Storage } from '@ionic/storage';
import { DistribuidorService } from './../../providers/database/services/distribuidor';
import { Distribuidor } from './../../providers/database/models/distribuidor';
import { Endereco } from './../../providers/database/models/shared-models';
import { UsuarioService } from './../../providers/database/services/usuario';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { Usuario } from '../../providers/database/models/usuario';

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public usuarioSrvc: UsuarioService,
    public http: Http,
    public distribuidorSrvc: DistribuidorService,
    public storage: Storage
  ) { }
  detail(event) {
    console.log('event', event);

  }
  selectEndereco(endereco) {
    console.log(endereco);
    console.log(this.usuarioSrvc.usuarioAtual);

    this.updateEndereco(endereco);
    this.navCtrl.push('PainelPedidosPage')
  }

  updateEndereco(endereco: Endereco) {
    this.storage.get("_UsuarioAtual").then((usuario: Usuario) => {
      console.log(usuario);
    })

    if (this.usuarioSrvc.usuarioAtual) {
      if (!this.usuarioSrvc.usuarioAtual.usr_endereco) this.usuarioSrvc.usuarioAtual.usr_endereco = [];
      this.usuarioSrvc.usuarioAtual.usr_endereco.push(endereco);
      const path = `${this.usuarioSrvc.basePath}/${this.usuarioSrvc.usuarioAtual.key}/usr_endereco`;
      this.usuarioSrvc.db.object(path).set(this.usuarioSrvc.usuarioAtual.usr_endereco);
      this.storage.set("_EnderecoTemporario", undefined);     
      this.storage.set("_UsuarioAtual", this.usuarioSrvc.usuarioAtual);
    } else {
      this.storage.set("_EnderecoTemporario", endereco);     
    }
  }

  ngOnInit() {
    if (this.usuarioSrvc.usuarioAtual) {
      if (this.usuarioSrvc.usuarioAtual.usr_endereco)
        this.navCtrl.setRoot('PainelPedidosPage')
    } else {
      this.storage.get("_EnderecoTemporario").then((endereco: Endereco) => {
        if (endereco )
          this.navCtrl.setRoot('PainelPedidosPage')
      });           
    }
  }

  signupDistribuidora() {
    if (this.usuarioSrvc.usuarioAtual) {
      this.navCtrl.setRoot('PainelPedidosPage')
    } else {
      this.modalCtrl.create('LoginPage', { message: "NOT_AUTHENTICATED" }).present();
    }
  }
}
