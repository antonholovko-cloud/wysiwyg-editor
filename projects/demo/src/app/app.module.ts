import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app';
import { WysiwygEditorComponent } from '../../../ngx-wysiwyg-editor/src/lib/wysiwyg-editor.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    WysiwygEditorComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }