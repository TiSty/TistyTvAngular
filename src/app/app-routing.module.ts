import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './_pagine/home/home.component';
import { AccediComponent } from './_pagine/accedi/accedi.component';
import { ErroreComponent } from './_pagine/errore/errore.component';
import { RegistrazioneComponent } from './_pagine/registrazione/registrazione.component';
import { CredenzialiComponent } from './_pagine/credenziali/credenziali.component';
import { PaginaPrincipaleComponent } from './_pagine/pagina-principale/pagina-principale.component';
import { FilmComponent } from './_pagine/film/film.component';
import { SerietvComponent } from './_pagine/serietv/serietv.component';
import { CategorieComponent } from './_pagine/categorie/categorie.component';
import { PaginaCategoriaComponent } from './_pagine/pagina-categoria/pagina-categoria.component';
import { PaginaFilmComponent } from './_pagine/pagina-film/pagina-film.component';
import { PaginaSerieTvComponent } from './_pagine/pagina-serie-tv/pagina-serie-tv.component';
import { PaginaProfiloComponent } from './_pagine/pagina-profilo/pagina-profilo.component';
import { PaginaEpisodioComponent } from './_pagine/pagina-episodio/pagina-episodio.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component:HomeComponent},
  { path: 'home', component:HomeComponent},
  { path: 'accedi', component:AccediComponent},
  { path: 'registrazione', component:RegistrazioneComponent},
  { path: 'credenziali', component:CredenzialiComponent},
  { path: 'utente/:id', component:PaginaProfiloComponent},


  // { path: 'paginaProfilo', component:PaginaProfiloComponent},
  // { path: 'paginaProfilo/:id', component:PaginaProfiloComponent},

  
  { path: 'paginaPrincipale', component:PaginaPrincipaleComponent,canActivate: [AuthGuard]} ,
  { path: 'categorie', component:CategorieComponent,canActivate: [AuthGuard]} ,
  { path: 'categorie/:id', component:PaginaCategoriaComponent,canActivate: [AuthGuard]} ,
  { path: 'film', component:FilmComponent,canActivate: [AuthGuard]} ,
  { path: 'film/:id', component:PaginaFilmComponent,canActivate: [AuthGuard]} ,
  { path: 'serieTv', component:SerietvComponent,canActivate: [AuthGuard]} ,
  { path: 'serieTv/:id', component:PaginaSerieTvComponent,canActivate: [AuthGuard]} ,
  { path: 'episodio/:id', component:PaginaEpisodioComponent,canActivate: [AuthGuard]} ,


  { path: '**', component:ErroreComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
