import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FuncionalidadeEditPage } from './funcionalidade-edit';

@NgModule({
  declarations: [
    FuncionalidadeEditPage,
  ],
  imports: [
    IonicPageModule.forChild(FuncionalidadeEditPage),
    TranslateModule.forChild(),        
  ],
})
export class FuncionalidadeEditPageModule {}
