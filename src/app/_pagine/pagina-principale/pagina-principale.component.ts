import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, delay } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card, CardBack, CardFront } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'app-pagina-principale',
  templateUrl: './pagina-principale.component.html',
  styleUrls: ['./pagina-principale.component.scss']
})
export class PaginaPrincipaleComponent implements OnInit {

  elencoFilm$: Observable<IRispostaServer>
  films: Card[] = []

  elencoSerieTv$: Observable<IRispostaServer>;
  seriesTv: Card[] = []

  myInterval: number = 3000;
  activeSlideIndex: number = 0;
  slides: { image: string; text?: string }[] = [
    { image: '../../assets/immagini/FilmAvventura.jpeg' },
    { image: '../../assets/immagini/3Uomini.jpeg' },
    { image: '../../assets/immagini/Chuck.jpeg' },
    { image: '../../assets/immagini/FilmAzione.jpeg' },
    { image: '../../assets/immagini/FilmCommedia.jpeg' },

  ];

  private distruggi$ = new Subject<void>()


  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.elencoFilm$ = this.api.getFilms()
    this.elencoSerieTv$ = this.api.getSeriesTv()
  }

//OBSERVE PER VISUALIZZARE I FILM
  private osservoFilm() {
    console.log("Sono in osservoFilm")
    return {
      next: (rit: IRispostaServer) => {
        console.log("NEXT", rit)
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt,
          }
          const bott: Bottone = {
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/film/" + elementi[i].idFilm,
          }
          const card: Card = {
            id: elementi[i].idFilm,
            immagine: tmpImg,
            testo: elementi[i].trama,
            titolo: elementi[i].titolo,
            bottone: bott
          }
          this.films.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO", "color:#00aa00") }
    }
  }


//OBSERVE PER VISUALIZZARE LE SERIE TV
  private osservoSerieTv() {
    console.log("Sono in osservoSerieTv")
    return {
      next: (rit: IRispostaServer) => {
        console.log("NEXT", rit)
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai alla SerieTv",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/serieTv/" + elementi[i].idSerieTv,
          }
          const card: Card = {
            id: elementi[i].idSerieTv,
            immagine: tmpImg,
            testo: elementi[i].trama,
            titolo: elementi[i].titolo,
            bottone: bott
          }
          this.seriesTv.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoSerieTv", err) },
      complete: () => { console.log("%c COMPLETATO", "color:#00aa00") }
    }
  }



  ngOnInit(): void {
    this.elencoFilm$.subscribe(this.osservoFilm())
    this.elencoSerieTv$.subscribe(this.osservoSerieTv())
  }
}
