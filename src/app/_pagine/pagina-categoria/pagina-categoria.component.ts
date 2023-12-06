import { Component, OnInit, booleanAttribute } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, concatMap, delay, forkJoin, map, pipe } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-categoria',
  templateUrl: './pagina-categoria.component.html',
  styleUrls: ['./pagina-categoria.component.scss']
})
export class PaginaCategoriaComponent implements OnInit {

  films: Card[] = []
  seriesTv: Card[] = []

  // elem$!: Observable<IRispostaServer>;


  film$! : Observable<IRispostaServer>;
  serie$! :Observable<IRispostaServer>;
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
      const serie$ = this.api.getSerieTvDaCategoria(parseInt(this.id));
    }

  }

  //OBSERVER
  private osservoFilms() {
    console.log("SONO IN OSSERVO FILM")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/film/" + elementi[i].idCategoria    
          }
          const card: Card = {
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            testo: elementi[i].trama,
            bottone: bott
          }
          this.films.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilms", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }
  }

  private osservoSeriesTv() {
    console.log("SONO IN OSSERVO SERIE")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai alla Serie",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/serieTv/" + elementi[i].idCategoria    
          }
          const card: Card = {
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            testo: elementi[i].trama,
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
}
  










