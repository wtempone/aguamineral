import { TranslateService } from '@ngx-translate/core';
import { ModalController, ToastController, AlertController } from 'ionic-angular';
import { UsuarioService } from './usuario';
import { Injectable } from '@angular/core';
import { FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase } from "angularfire2/database";

import { Marca } from '../database-providers';

@Injectable()
export class MarcaService {
  private basePath: string = '/marcas';
  public marcas: FirebaseListObservable<Marca[]> = null; //  list of objects
  public marca: FirebaseObjectObservable<Marca> = null; //   single object
  constructor(
    private db: AngularFireDatabase,
    private usuarioSrvc: UsuarioService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {
    this.marcas = this.db.list(this.basePath);
  }

  getList(query = {}): FirebaseListObservable<Marca[]> {
    this.marcas = this.db.list(this.basePath, { query: query });
    return this.marcas;
  }

  get(key: string): FirebaseObjectObservable<Marca> {
    const itemPath = `${this.basePath}/${key}`;
    this.marca = this.db.object(itemPath)
    return this.marca
  }

  getOnce(field: string, value: string) {
    return this.db.list(this.basePath).$ref.orderByChild(field).equalTo(value).limitToFirst(1).once('value');
  }

  create(Marca: Marca) {
    return this.marcas.push(Marca)
  }

  update(key: string, value: any) {
    return this.marcas.update(key, value);
  }

  delete(key: string): void {
    this.marcas.remove(key)
      .catch(error => this.handleError(error))
  }

  deleteAll(): void {
    this.marcas.remove()
      .catch(error => this.handleError(error))
  }

  private handleError(error) {
    console.log(error)
  }
}