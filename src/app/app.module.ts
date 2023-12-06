import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './_pagine/home/home.component';
import { NavbarComponent } from './_componenti/navbar/navbar.component';
import { FooterComponent } from './_componenti/footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccediComponent } from './_pagine/accedi/accedi.component';
import { ErroreComponent } from './_pagine/errore/errore.component';
import { RegistrazioneComponent } from './_pagine/registrazione/registrazione.component';
import { CredenzialiComponent } from './_pagine/credenziali/credenziali.component';
import { PaginaPrincipaleComponent } from './_pagine/pagina-principale/pagina-principale.component';
import { MenuPrincipaleComponent } from './_componenti/menu-principale/menu-principale.component';
import { CardComponent } from './_componenti/card/card.component';
import { FilmComponent } from './_pagine/film/film.component';
import { SerietvComponent } from './_pagine/serietv/serietv.component';
import { CategorieComponent } from './_pagine/categorie/categorie.component';
import { HTTP_INTERCEPTORS, HttpClientModule,  } from '@angular/common/http';
import { PaginaCategoriaComponent } from './_pagine/pagina-categoria/pagina-categoria.component';
import { PaginaFilmComponent } from './_pagine/pagina-film/pagina-film.component';
import { PaginaSerieTvComponent } from './_pagine/pagina-serie-tv/pagina-serie-tv.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthIntercept } from './_intercettatori/auth.inteceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    AccediComponent,
    ErroreComponent,
    RegistrazioneComponent,
    CredenzialiComponent,
    PaginaPrincipaleComponent,
    MenuPrincipaleComponent,
    CardComponent,
    FilmComponent,
    SerietvComponent,
    CategorieComponent,
    PaginaCategoriaComponent,
    PaginaFilmComponent,
    PaginaSerieTvComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthIntercept, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
