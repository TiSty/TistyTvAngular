import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, delay } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { EpisodioVisualizzato } from 'src/app/Type/EpisodioVisualizzato.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-episodio',
  templateUrl: './pagina-episodio.component.html',
  styleUrls: ['./pagina-episodio.component.scss']
})

export class PaginaEpisodioComponent implements OnInit {
  id: string | null = null
  episodio$!: Observable<IRispostaServer>;
  episodi: EpisodioVisualizzato[]=[]
  card!:EpisodioVisualizzato

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
  
  }


  //OBSERVER PER IL SINGOLO EPISODIO
  private osservoEpisodio() {
    console.log("SONO IN OSSERVO EPISODIO")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        // for (let i = 0; i < elementi.length; i++) {
        const tmpImg: Immagine = {
          src: elementi.src,
          alt: elementi.alt,
        }
        //SE SERVE DECOMMENTA AL BOTTONE
        const bott: Bottone = {
          testo: "Vai al Film",
          title: "Visualizza" + elementi.nome,
          tipo: "button",
          emitId: null,
          link: "/episodio/" + elementi.idEpisodio
        }
        this.card = {
          titolo: elementi.titolo,
          durata: elementi.durata,
          serieTv: elementi.serieTv,
          stagione: elementi.stagione,
          datiEp: elementi.datiEp,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer: elementi.trailer,
          src: elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoepisodio", err),
      complete: () => console.log("%c COMPLETATO episodio", "color:#00aa00")
    }

  }


  ngOnInit(): void {
    if (this.id !== null) {
      console.log("sono nel ramo if di igoninit")
      const episodio$ = this.api.getEpisodio(this.id);
      episodio$.subscribe(this.osservoEpisodio())

      const elencoEpisodio$=this.api.getEpisodiDaSerie(parseInt(this.id))
      elencoEpisodio$.pipe(delay(1000)).subscribe(this.osservoEpisodi())
    }

  }




  elencoEpisodi: Card[] = []
  elencoEpisodio$!: Observable<IRispostaServer>;
  //OBSERVER PER TUTTI GLI EPISODI
  private osservoEpisodi() {
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        console.log("DAti di:  OSSERVO Episodi", elementi)
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai all'episodio",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/episodio/" + elementi[i].idEpisodio
          }
          const card: Card = {
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            testo: elementi[i].datiEp,
            bottone: bott
          }
          this.elencoEpisodi.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoEpisodi", err),
      complete: () => console.log("%c COMPLETATO episodi", "color:#00aa00")
    }
  }




} 
