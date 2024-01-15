import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
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
export class PaginaFilmComponent implements OnInit, OnDestroy {
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  film$!: Observable<IRispostaServer>;
  films: FilmVisualizzato[] = []

  card!: FilmVisualizzato

  idFilm!: number
  private distruggi$ = new Subject<void>()



  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''



  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder) {
    this.elencoFilm$ = this.api.getFilms()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)



    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      // const film$ = this.api.getFilmDaCategoria(parseInt(this.id));
    }


  }

  //OBSERVER PER IL FILM SINGOLO
  private osservoFilm() {
    console.log("SONO IN OSSERVO FILM")
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
          link: "/film/" + elementi.idFilm
        }
        this.card = {
          titolo: elementi.titolo,
          durata: elementi.durata,
          regista: elementi.regista,
          categoria: elementi.categoria,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer: elementi.trailer,
          src: elementi.src,
        }
        // this.films.push(card)
        // }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilm", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }

  }

  ngOnInit(): void {
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF di ngONINit")
      const film$ = this.api.getFilm(this.id);
      film$.subscribe(this.osservoFilm());

      // const elencoFilm$ = this.api.getFilmDaCategoria(parseInt(this.id));
      // elencoFilm$.subscribe(this.osservoFilms())
    }
    this.elencoFilm$.pipe(delay(1000)).subscribe(this.osservoFilms())
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }





  elencoFilm$: Observable<IRispostaServer>
  elencofilms: Card[] = []


  //OBSERVER PER L'ELENCO DEI FILM
  private osservoFilms() {
    console.log("Sono in osservoFilms")
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
          this.elencofilms.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO", "color:#00aa00") }
    }
  }







  //NON FUNZIONA PERCHE CRA UN NUOVO FILM AL POSTO DI AGGIORNARE QUELLO ESISTENTE
  modificaFilm() {
    console.log("Modifica Film")
    const parametro: FilmVisualizzato = {
      titolo: this.card.titolo,
      durata: this.card.durata,
      regista: this.card.regista,
      categoria: this.card.categoria,
      anno: this.card.anno,
      trama: this.card.trama,
      trailer: this.card.trailer,
      src: this.card.src
    }

    //   //funzione che sottoscrive un osservable 
    this.obsModificaFilm(parametro).subscribe(this.osservatoreMod)
  }
  //funzione per creare un osservatore per modifica Film
  obsModificaFilm(dati: FilmVisualizzato) {
    return this.api.putFilmVisualizzato(dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }

  private osservatoreMod = {
    next: (ritorno: FilmVisualizzato) => {
      console.log('Film Modificato!')
      const filmMod: FilmVisualizzato = {
        titolo: ritorno.titolo,
        durata: ritorno.durata,
        regista: ritorno.regista,
        categoria: ritorno.categoria,
        anno: ritorno.anno,
        trama: ritorno.trama,
        trailer: ritorno.trailer,
        src: ritorno.src,
      }
      this.films.push(filmMod)
    },
    error: (err: string) => console.error('impossibile modificare film ', err),
    complete: () => console.log("Completato"),
  }




//  NON TROVA L'ID FILM
  eliminaFilm() {
    console.log('film eliminato', this.idFilm)
    if (this.idFilm !== null || undefined) {
      this.obsEliminaCategoria(this.idFilm).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaCategoria(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteFilm(idRisorsa).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )
  }
  private osservatoreDelete = {
    next: () => console.log('Categoria Eliminata!'),
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







// SOLUZIONE CHE NON FUNZIONA  
  // modificaFilm() {
  //   console.log("Modifica Film")
  //   const parametro: FilmVisualizzato = {
  //     idFilm: this.idFilm,
  //     titolo: this.card.titolo,
  //     durata: this.card.durata,
  //     regista: this.card.regista,
  //     categoria: this.card.categoria,
  //     anno: this.card.anno,
  //     trama: this.card.trama,
  //     trailer: this.card.trailer,
  //     src: this.card.src
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
  //     next: (ritorno : FilmVisualizzato) => {
  //       console.log('Film Modificato!')
  //       const filmMod:FilmVisualizzato = {
  //         titolo: ritorno.titolo,
  //         durata: ritorno.durata,
  //         regista: ritorno.regista,
  //         categoria: ritorno.categoria,
  //         anno: ritorno.anno,
  //         trama: ritorno.trama,
  //         trailer: ritorno.trailer,
  //         src: ritorno.src,
  //       }
  //       this.films.push(filmMod)
  //     },
  //     error: (err: string) => console.error('impossibile modificare film ', err),
  //   complete: () => console.log("Completato"),
  //   }

