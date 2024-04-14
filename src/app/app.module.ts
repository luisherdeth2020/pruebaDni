import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AppComponent } from './app.component';
import { ScannerComponent } from './scanner/scanner.component';

@NgModule({
  declarations: [
    AppComponent,
    ScannerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ZXingScannerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
