import { Component, OnInit } from '@angular/core';
import { Observable, Subject, delay, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'serietv',
  templateUrl: './serietv.component.html',
  styleUrls: ['./serietv.component.scss']
})

export class  SerietvComponent implements OnInit {

  elencoSerieTv$: Observable<IRispostaServer>;
  seriesTv: Card[]=[]
  private distruggi$ = new Subject<void>()

  constructor(private api: ApiService) {
    this.elencoSerieTv$ = this.api.getSeriesTv()
  }

    //OBSERVER
    private osservoSerieTv(){
      console.log("Sono in osservoSerieTv")
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
              testo: "Vai alla SerieTv",
              title: "Visualizza " + elementi[i].nome,
              tipo: "button",
              emitId: null,
              link: "/serieTv/" + elementi[i].idSerieTv  , 
            }
            const card: Card = {
              immagine: tmpImg,
              testo: elementi[i].trama,
              titolo: elementi[i].titolo,
              bottone: bott
            }
            this.seriesTv.push(card)
          }
        },
        error:(err:any)=>{console.log("ERRORE in osservoSerieTv", err)},
        complete:()=>{console.log("%c COMPLETATO", "color:#00aa00")}
      }
    }

    ngOnInit(): void {
      this.elencoSerieTv$.pipe(
        delay(1000)
      ).subscribe(this.osservoSerieTv())
  
    }
  

}
