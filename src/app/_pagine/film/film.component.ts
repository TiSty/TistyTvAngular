import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Film } from 'src/app/Type/Film.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit, OnDestroy {

  elencoFilm$: Observable<IRispostaServer>
  films: Card[] = []
  private distruggi$ = new Subject<void>()

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  titolo:string=''
  durata!:number
  regista:string=''
  categoria:string=''
  anno!:number
  trama:string=''
  trailer:string=''
  src:string=''

  idFilm!: number;

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.elencoFilm$ = this.api.getFilms()
  }

  //OBSERVER
  private osservoFilm() {
    console.log("Sono in osservoFilm")
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
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/film/" + elementi[i].idFilm,
          }
          const card: Card = {
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

  ngOnInit(): void {
    this.elencoFilm$.pipe(
      delay(1000)
    ).subscribe(this.osservoFilm())
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }

  //PER AGGIUNGERE UN Film
  aggiungiFilm() {
    console.log("Aggiungi Film", this.titolo)
    const parametro: Partial<Film> = {
      titolo: this.titolo,
      durata: this.durata,
      regista: this.regista,
      categoria: this.categoria,
      anno: this.anno,
      trama: this.trama,
      trailer: this.trailer,
      src: this.src
    }
    this.obsAddFilm(parametro).subscribe(this.osservatore)
  }
  obsAddFilm(dati: Partial<Film>) {
    return this.api.postFilm(dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }
  private osservatore = {
    next: (ritorno: Film) => {
      console.log(ritorno);
      if (ritorno.src !== undefined) {
        const newCard: Card = {
          titolo: ritorno.titolo,
          testo: ritorno.trama,
          immagine: { src: ritorno.src, alt: '' }
        }
        this.films.push(newCard)
      } else {
        console.error('Impossibile creare Categoria')
      }
    },
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }









  //PER ELIMINARE UN FILM
  eliminaFilm(id: number | null) {
    console.log("Film eliminato", id)
    if (id !== null) {
      this.obsEliminaFilm(id).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaFilm(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteFilm(idRisorsa).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )
  }
  private osservatoreDelete = {
    next: () => console.log('Film Eliminato!'),
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












  //PER MODIFICARE UN FILM     TOLTO PERCHE RITENUTO INUTILE, LA MODIFICA SU PUò ESEGUIRE DA DENTRO LA PAGINA DI VISUALIZZAZIONE DEL FILM
  // modificaFilm() {
  //   console.log("Modifica Film")
  //   const parametro: Partial<Film> = {
  //     titolo: this.titolo,
  //     durata: this.durata,
  //     regista: this.regista,
  //     categoria: this.categoria,
  //     anno: this.anno,
  //     trama: this.trama,
  //     trailer: this.trailer,
  //     src: this.src
  //   }
  //   const id: number = this.idFilm
  //   //funzione che sottoscrive un osservable 
  //   this.obsModificaFilm(id, parametro).subscribe(this.osservatoreMod)
  // }
  // //funzione per creare un osservatore per modifica Film
  // obsModificaFilm(id: number, dati: Partial<Film>) {
  //   return this.api.putFilm(id, dati).pipe(
  //     take(1),
  //     tap(x => console.log("OBS ", x)),
  //     map(x => x.data),
  //     takeUntil(this.distruggi$)
  //   )
  // }

  // private osservatoreMod = {
  //   next: () => console.log('Film Modificato!'),
  //   error: (err: string) => console.error(err),
  //   complete: () => console.log("Completato"),
  // }