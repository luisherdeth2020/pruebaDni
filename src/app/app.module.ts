import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AppComponent } from './app.component';
import { ScannerComponent } from './scanner/scanner.component';
import { WebcamModule } from 'ngx-webcam';
import { CamaraComponent } from './camara/camara.component';

@NgModule({
  declarations: [
    AppComponent,
    ScannerComponent,
    CamaraComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WebcamModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
