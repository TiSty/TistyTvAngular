import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, delay, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { serieTvVisualizzata } from 'src/app/Type/serieTvVisualizzata.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-serie-tv',
  templateUrl: './pagina-serie-tv.component.html',
  styleUrls: ['./pagina-serie-tv.component.scss']
})
export class PaginaSerieTvComponent implements OnInit {
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  serieTv$!: Observable<IRispostaServer>;
  seriesTv: serieTvVisualizzata[] = []

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.elencoSerieTv$ = this.api.getSeriesTv()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      const serieTv$ = this.api.getSerieTvDaCategoria(parseInt(this.id))
    }
  }

  //OBSERVER
  private osservoSerieTv() {
    console.log("SONO IN OSSERVO SerieTv")
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
          const card: serieTvVisualizzata = {
            titolo: elementi[i].titolo,
            durata: elementi[i].durata,
            stagioni: elementi[i].stagioni,
            episodi: elementi[i].episodi,
            regista: elementi[i].regista,
            categoria: elementi[i].categoria,
            anno: elementi[i].anno,
            trama: elementi[i].trama,
            trailer: elementi[i].trailer,
            src: elementi[i].src,
          }
          this.seriesTv.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoSerieTv", err),
      complete: () => console.log("%c COMPLETATO serieTv", "color:#00aa00")
    }
  }

  ngOnInit(): void {
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF di ngONINit")
      const serieTv$ = this.api.getSerieTvDaCategoria(parseInt(this.id));
      serieTv$.subscribe(this.osservoSerieTv());
    }
    this.elencoSerieTv$.pipe(delay(1000)).subscribe(this.osservoSeriesTv())
  }


  elencoSerieTv$: Observable<IRispostaServer>
  elencoSeriesTv: Card[] = []

  //OBSERVER
  private osservoSeriesTv() {
    console.log("Sono in osservoSeriesTv")
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
            testo: "Vai alla serie",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/serieTv/" + elementi[i].idSerieTv,
          }
          const card: Card = {
            immagine: tmpImg,
            testo: elementi[i].trama,
            titolo: elementi[i].nome,
            bottone: undefined
          }
          this.elencoSeriesTv.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO", "color:#00aa00") }
    }
  }
}
