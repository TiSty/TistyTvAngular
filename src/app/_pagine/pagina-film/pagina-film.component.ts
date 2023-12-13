import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, delay, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Film } from 'src/app/Type/Film.type';
import { FilmVisualizzato } from 'src/app/Type/FilmVisualizzato.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-film',
  templateUrl: './pagina-film.component.html',
  styleUrls: ['./pagina-film.component.scss']
})
export class PaginaFilmComponent implements OnInit {
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  film$!: Observable<IRispostaServer>;
  films: FilmVisualizzato[] = []

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.elencoFilm$ = this.api.getFilms()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
    }

  }

  //OBSERVER
  private osservoFilm() {
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
          const card: FilmVisualizzato = {
            titolo: elementi[i].titolo,
            durata: elementi[i].durata,
            regista: elementi[i].regista,
            categoria: elementi[i].categoria,
            anno: elementi[i].anno,
            trama: elementi[i].trama,
            trailer: elementi[i].trailer,
            src: elementi[i].src,
          }
          this.films.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilm", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }

  }

  ngOnInit(): void {
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF di ngONINit")
    const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
    film$.subscribe(this.osservoFilm());
    }
    this.elencoFilm$.pipe(delay(1000)).subscribe(this.osservoFilms())
  }





  elencoFilm$: Observable<IRispostaServer>
  elencofilms: Card[] = []

  //OBSERVER
  private osservoFilms(){
    console.log("Sono in osservoFilm")
    return{
      next:(rit:IRispostaServer)=>{
        console.log("NEXT", rit)
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg:Immagine={
            src: elementi[i].src ,
            alt:elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/film/" + elementi[i].idFilm  , 
          }
          const card: Card = {
            immagine: tmpImg,
            testo: elementi[i].trama,
            titolo: elementi[i].nome,
            bottone: undefined
          }
          this.elencofilms.push(card)
        }
      },
      error:(err:any)=>{console.log("ERRORE in osservoFilm", err)},
      complete:()=>{console.log("%c COMPLETATO", "color:#00aa00")}
    }
  }
}
