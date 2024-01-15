import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
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
export class PaginaSerieTvComponent implements OnInit, OnDestroy {
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  serieTv$!: Observable<IRispostaServer>;
  seriesTv: serieTvVisualizzata[] = []
  card!:serieTvVisualizzata

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''


  private distruggi$ = new Subject<void>()

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.elencoSerieTv$ = this.api.getSeriesTv()


    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      this.episodio$ = this.api.getEpisodiDaSerie(parseInt(this.id));
      // this.serieTv$ = this.api.getSerieTv(this.id)
    }
  }

  //OBSERVER SERIE TV SIGNOLA
  private osservoSerieTv() {

    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        console.log("DATI DI: osservo SerieTv", elementi)
        // for (let i = 0; i < elementi.length; i++) {
        const tmpImg: Immagine = {
          src: elementi.src,
          alt: elementi.alt,
        }
        //SE SERVE DECOMMENTA AL BOTTONE
        const bott: Bottone = {
          testo: "Vai alla Serie",
          title: "Visualizza " + elementi.nome,
          tipo: "button",
          emitId: null,
          link: "/serieTv/" + elementi.idSerieTv
        }
        this.card = {
          titolo: elementi.titolo,
          durata: elementi.durata,
          stagioni: elementi.stagioni,
          episodi: elementi.episodi,
          regista: elementi.regista,
          categoria: elementi.categoria,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer: elementi.trailer,
          src: elementi.src,
        }
        

        // }
      },
      errore: (err: any) => console.error("ERRORE in osservoSerieTv", err),
      complete: () => console.log("%c COMPLETATO serieTv", "color:#00aa00")
    }
  }

  ngOnInit(): void {
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF di ngONINit")
      this.serieTv$ = this.api.getSerieTv(this.id);
      this.serieTv$.subscribe(this.osservoSerieTv());
      const episodi$ = this.api.getEpisodiDaSerie(parseInt(this.id));
      episodi$.subscribe(this.osservoEpisodi());
    }
    this.elencoSerieTv$.pipe(delay(1000)).subscribe(this.osservoSeriesTv())
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }


  elencoSerieTv$: Observable<IRispostaServer>
  elencoSeriesTv: Card[] = []

  //OBSERVER ELENCO SERIE
  private osservoSeriesTv() {
    return {
      next: (rit: IRispostaServer) => {
        console.log("DATI DI:osservo SerieSTv", rit)
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
            titolo: elementi[i].titolo,
            bottone: bott
          }
          this.elencoSeriesTv.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO seriesTv", "color:#00aa00") }
    }
  }


  episodii: Card[] = []
  episodio$!: Observable<IRispostaServer>;
  //OBSERVER
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
          this.episodii.push(card)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoEpisodi", err),
      complete: () => console.log("%c COMPLETATO episodi", "color:#00aa00")
    }
  }

  //PER MODIFICARE LA SERIE TV

  titolo: string = ''
  durata!: number
  stagioni!: number
  episodi!: number
  regista: string = ''
  categoria: string = ''
  anno!: number
  trama: string = ''
  trailer: string = ''
  src: string = ''

  modifica() {
    console.log("Sono in modifica serie")
    const parametro: serieTvVisualizzata = {
      titolo: this.titolo,
      durata: this.durata,
      stagioni: this.stagioni,
      episodi: this.episodi,
      regista: this.regista,
      categoria: this.categoria,
      anno: this.anno,
      trama: this.trama,
      trailer: this.trailer,
      src: this.src
    }
    this.obsModificaSerieTv(parametro).subscribe(this.osservatoreMod)
  }


  //funzione per creare un osservatore per modifica SerieTv
  obsModificaSerieTv(dati: serieTvVisualizzata) {
    return this.api.putSerieTvVisualizzata(dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }

  private osservatoreMod = {
    next: () => console.log('SerieTv Modificata!'),
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }















  //FUNZIONI PER UTILIZZARE LA MODAL OFFCANVAS
  open(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );
  }


  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }


  private getDismissReason(reason: any): string {
    switch (reason) {
      case OffcanvasDismissReasons.ESC:
        return 'by pressing ESC';
      case OffcanvasDismissReasons.BACKDROP_CLICK:
        return 'by clicking on the backdrop';
      default:
        return `with: ${reason}`;
    }
  }



}
