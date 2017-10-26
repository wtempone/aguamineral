import { MenuAcesso } from './../models/menu-acesso';
import { MenuService } from './menu';
import { Usuario } from './../models/usuario';
import { PerfilAcesso } from './../models/perfil-acesso';
import { Injectable } from '@angular/core';
import { FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase } from "angularfire2/database";
import { Storage } from '@ionic/storage';
import { PerfilAcessoService } from './perfil-acesso';
import { FuncionalidadeService } from './funcionalidade';
import { AcaoService } from './acao';
import { Funcionalidade } from '../models/funcionalidade';
import { Acao } from '../models/acao';

@Injectable()
export class UsuarioService {
  public basePath: string = '/usuarios';
  public usuarios: FirebaseListObservable<Usuario[]> = null; //  list of objects
  public usuario: FirebaseObjectObservable<Usuario> = null; //   single object
  public usuarioAtual: Usuario;
  public perfis
  constructor(
    private db: AngularFireDatabase,
    private perfilAcessoSrvc: PerfilAcessoService,
    private menuSrvc: MenuService,
    private funcionalidadeSrvc: FuncionalidadeService,
    private acaoSrvc: AcaoService,
    private storage: Storage
  ) {
    this.usuarios = this.db.list(this.basePath);
  }


  loadPerfisAcesso(key) {

    this.get(key).subscribe((usuario: Usuario) => {
      usuario.usr_menus = []
      usuario.usr_funcionalidades = []
      this.storage.set("_keyUsuarioAtual", usuario.$key)
      this.db.list(this.perfilAcessoSrvc.basePath).subscribe((perfis: PerfilAcesso[]) => {
        this.db.list(this.menuSrvc.basePath).subscribe((menus: MenuAcesso[]) => {
          this.db.list(this.funcionalidadeSrvc.basePath).subscribe((funcionalidades: Funcionalidade[]) => {
            var usr_perfis = (<any>Object).entries(usuario.usr_perfis);
              usr_perfis.forEach(([key,value]) => {
              var usr_perfil = perfis.filter(x => x.$key == key)[0];
            
              var per_funcionalidades = (<any>Object).entries(usr_perfil.per_funcionalidades);
              per_funcionalidades.forEach(([keyFuncionlidade,valueFuncionalidade]) => {
                var funcionalidade = funcionalidades.filter(x => x.$key == keyFuncionlidade)[0];
            
                var fun_acoes = (<any>Object).entries(valueFuncionalidade.fun_acoes);
            
                fun_acoes.forEach(([keyAcao, valueAcao]) => {
                  var acoes = (<any>Object).entries(funcionalidade.fun_acoes);
            
                  var acao = acoes.filter(([key, value]) => key == keyAcao);
            
                })
              })
            })
            Object.keys(usuario.usr_perfis).forEach(usr_perfil => {
              let perfil = perfis.filter(x => x.$key == usr_perfil)[0]
              Object.keys(perfil.per_menus).forEach(per_menu => {
                let menu = menus.filter(x => x.$key == per_menu)[0]
                if (usuario.usr_menus.filter(x => x.$key == menu.$key).length == 0) {
                  usuario.usr_menus.push(menu)
                }
              })

              Object.keys(perfil.per_funcionalidades).forEach(per_funcionalidade => {
                let funcionalidade = funcionalidades.filter(x => x.$key == per_funcionalidade)[0]
                if (usuario.usr_funcionalidades.filter(x => x.$key == funcionalidade.$key).length == 0) {
                  usuario.usr_funcionalidades.push(<Funcionalidade>{
                    $key: funcionalidade.$key,
                    fun_mnemonico: funcionalidade.fun_mnemonico,
                    fun_nome: funcionalidade.fun_nome,
                    fun_acoes: []
                  })
                }
              })
              Object.keys(perfil.per_funcionalidades).forEach(keyFuncionalidade => {
                Object.keys(perfil.per_funcionalidades[keyFuncionalidade].fun_acoes).forEach(keyAcao => {
                  if (usuario.usr_funcionalidades.filter(x => x.$key == keyFuncionalidade)[0].fun_acoes.filter(x => x.$key ==
                    Object.keys(funcionalidades.filter(x => x.$key == keyFuncionalidade)[0].fun_acoes)[0]).length == 0) {
                      usuario.usr_funcionalidades.filter(x => x.$key == keyFuncionalidade)[0].fun_acoes.push(
                        funcionalidades.filter(x => x.$key == keyFuncionalidade)[0].fun_acoes[0]);
                  }
                })
              })
            })
            console.log(usuario.usr_menus);
            console.log(usuario.usr_funcionalidades);
            this.usuarioAtual = usuario;
          })
        })
      })
    })
  }
  /*
  loadPerfisAcesso(key) {
    this.get(key).subscribe((usuario: Usuario) => {
      this.usuarioAtual = usuario;
      this.storage.set("_keyUsuarioAtual", this.usuarioAtual.$key)
      this.db.list(`${this.basePath}/${usuario.$key}/usr_perfis`).subscribe((itens) => {
        console.log(`${this.basePath}/${usuario.$key}/usr_perfis`);
        console.log(itens);
        this.perfis = itens.map(perfis => {
          console.log(`/perfis/${perfis.$key}`);
          return this.db.object(`/perfis/${perfis.$key}`)
        });
      })
    })
  }
/*

  loadPerfisAcesso(key) {
    this.get(key).take(1).subscribe((usuario: Usuario) => {
      this.usuarioAtual = usuario;
      this.storage.set("_keyUsuarioAtual", this.usuarioAtual.$key)

      this.db.list(`${this.basePath}/${this.usuarioAtual.$key}/usr_perfis`).subscribe((perfis) => {
        this.usuarioAtual.usr_menus = [];
        this.usuarioAtual.usr_funcionalidades = [];
        perfis.forEach((perfil) => {
          this.perfilAcessoSrvc.getByKey(perfil.$key).take(1).subscribe((perfilAcesso: PerfilAcesso) => {
            //Carrega menus
            Object.keys(perfilAcesso.per_menus).forEach((menuKey: string) => {
              this.menuSrvc.get(menuKey).then((menu: MenuAcesso) => {
                if (this.usuarioAtual.usr_menus.filter(x => x.mnu_page == menu.mnu_page).length == 0) {
                  this.usuarioAtual.usr_menus.push(menu);
                }
              })
            })
            //Carrega funcionalidades            
            Object.keys(perfilAcesso.per_funcionalidades).forEach((funcionalidadeKey: string) => {              
              this.funcionalidadeSrvc.get(funcionalidadeKey).then((funcionalidade: Funcionalidade) => {
                let indFuncionalidade = 0;
                if (this.usuarioAtual.usr_funcionalidades.filter(x => x.fun_mnemonico == funcionalidade.fun_mnemonico).length == 0) {
                  this.usuarioAtual.usr_funcionalidades.push(<Funcionalidade>{
                    fun_mnemonico: funcionalidade.fun_mnemonico,
                    fun_nome: funcionalidade.fun_nome
                  });
                  indFuncionalidade = this.usuarioAtual.usr_funcionalidades.length - 1;
                  this.usuarioAtual.usr_funcionalidades[indFuncionalidade].fun_acoes = []   
                } else {
                  indFuncionalidade = this.usuarioAtual.usr_funcionalidades.findIndex(x => x.fun_mnemonico == funcionalidade.fun_mnemonico)
                }
                //Carrega funcionalidades
                Object.keys(funcionalidade.fun_acoes).forEach((acaoKey: string) => {
                  this.acaoSrvc.get(funcionalidadeKey,acaoKey).then((acao: Acao) => {
                    if (this.usuarioAtual.usr_funcionalidades[indFuncionalidade].fun_acoes.filter(x => x.aca_mnemonico == acao.aca_mnemonico).length == 0) {
                      this.usuarioAtual.usr_funcionalidades[indFuncionalidade].fun_acoes.push(<Acao>{
                        aca_mnemonico: acao.aca_mnemonico,
                        aca_nome: acao.aca_nome
                      })
                    }
                  })
                })
              })
            })
          })
        })
      })
    })
  }
*/
  loadUsuarioAtualByEmail(email) {
    return this.getOnce('usr_email', email).subscribe((res) => {
      if (res.length > 0) {
        let usuario: Usuario = res[0];
        this.usuarioAtual = usuario;
      }
    })
  }

  exists(field: string, value: string, key?): Promise<boolean> {
    return new Promise(resolve => {
      this.db.list(this.basePath, {
        query: {
          orderByChild: field,
          equalTo: value,
          limitToFirst: 1
        }
      }
      ).take(1).subscribe((res) => {
        if (res.length > 0) {
          if (key) {
            if (res[0].$key == key)
              resolve(false);
            else
              resolve(true);
          }
          else
            resolve(true);

        } else {
          resolve(false);
        }
      });
    })
  }

  getList(query = {}): FirebaseListObservable<Usuario[]> {
    this.usuarios = this.db.list(this.basePath, { query: query });
    return this.usuarios;
  }

  get(key: string): FirebaseObjectObservable<Usuario> {
    const itemPath = `${this.basePath}/${key}`;
    this.usuario = this.db.object(itemPath)
    return this.usuario
  }

  getOnce(field: string, value: string) {
    return this.db.list(this.basePath, {
      query: {
        orderByChild: field,
        equalTo: value,
        limitToFirst: 1
      }
    }
    ).take(1);
  }

  create(usuario: Usuario) {
    //this.updateMenu(usuario)
    return new Promise(resolve => {
      this.usuarios.push(usuario).then((usuarioCriado) => {
        this.addPerfil(usuarioCriado.key, 'USR')
        resolve(usuarioCriado.key)
      });
    })
  }


  update(key: string, value: any) {
    //this.updateMenu(value);
    return new Promise(resolve => {
      this.usuarios.update(key, value).then(usuarioAlterado => {
        resolve(key);
      });
    });
  }

  addPerfil(key: string, mnemonico: string) {
    return this.perfilAcessoSrvc.getByMnemonico(this.perfilAcessoSrvc.PERFIL_UsuarioPadrao).then((perfil: PerfilAcesso) => {
      const path = `${this.basePath}/${key}/usr_perfis/${Object.keys(perfil)[0]}`
      return this.db.object(path).set(true);
    })
  }

  delete(key: string): void {
    this.usuarios.remove(key)
      .catch(error => this.handleError(error))
  }

  private handleError(error) {
    console.log(error)
  }
}