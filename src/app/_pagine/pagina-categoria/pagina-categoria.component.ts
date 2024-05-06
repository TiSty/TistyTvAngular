import { Component, OnInit, booleanAttribute } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, concatMap, delay, forkJoin, map, pipe } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { UtilityService } from 'src/app/_servizi/utility.service';


@Component({
  selector: 'pagina-categoria',
  templateUrl: './pagina-categoria.component.html',
  styleUrls: ['./pagina-categoria.component.scss']
})
export class PaginaCategoriaComponent implements OnInit {

  films: Card[] = []
  seriesTv: Card[] = []

  private distruggi$ = new Subject<void>()


  film$! : Observable<IRispostaServer>;
  serie$! :Observable<IRispostaServer>;
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null

  constructor(private route: ActivatedRoute, private api: ApiService, private utility:UtilityService) {

    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
      const serie$ = this.api.getSerieTvDaCategoria(parseInt(this.id));
    }
  }

//OBSERVER PER LA SINGOLA CATEGORIA DI FILM
  private osservoFilms() {
    console.log("SONO IN OSSERVO FILM")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: UtilityService.urlServer()+elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/film/" + elementi[i].idFilm    
          }
          const card: Card = {
            id:elementi[i].idFilm ,
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            // testo: elementi[i].trama,
            bottone: bott
          }
          this.films.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilms", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }
  }
  
//OBSERVER PER LA SINGOLA CATEGORIA DI SERIE TV
  private osservoSeriesTv() {
    console.log("SONO IN OSSERVO SERIE")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: UtilityService.urlServer()+elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai alla Serie",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/serieTv/" + elementi[i].idSerieTv   
          }
          const card: Card = {
            id:elementi[i].idSerieTv   ,
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            // testo: elementi[i].trama,
            bottone: bott
          }
          this.seriesTv.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilms", err),
      complete: () => console.log("%c COMPLETATO Serie", "color:#00aa00")
    }
  }








  ngOnInit(): void {
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
      const serie$ = this.api.getSerieTvDaCategoria(parseInt(this.id));
  
      // Subscribe to the film$ observable
      film$.subscribe(this.osservoFilms());
  
      // Subscribe to the serie$ observable
      serie$.subscribe(this.osservoSeriesTv());
    }
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }
}
  










