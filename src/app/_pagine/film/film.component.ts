import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Film } from 'src/app/Type/Film.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit {

  elencoFilm$: Observable<IRispostaServer>
  films: Card[] = []
  private distruggi$ = new Subject<void>()


  
  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.elencoFilm$ = this.api.getFilms()
  }

  //OBSERVER
  private osservoFilm(){
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
            bottone: bott
          }
          this.films.push(card)
        }
      },
      error:(err:any)=>{console.log("ERRORE in osservoFilm", err)},
      complete:()=>{console.log("%c COMPLETATO", "color:#00aa00")}
    }
  }

  ngOnInit(): void {
    this.elencoFilm$.pipe(
      delay(1000)
    ).subscribe(this.osservoFilm())

  }
















  //NON LO SO IL PERCHE E NON SO IL COME MAI SONO QUI STI CODICI


  private osservatore = {
    next: (ritorno: Film) => console.log(ritorno),
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }
  private osservatoreDelete = {
    next: () => console.log('Film Eliminata!'),
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }

  aggiungiFilm() {
    console.log("aggiungi Film")
    const parametro: Partial<Film> = { titolo: " " }//qua è dove metto un nome del Film se fosse una Film fissa, ma invece devo fare un form per aggiungere la categoria
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

  modificaFilm() {
    console.log("Modifica Film")
    const parametro: Partial<Film> = { titolo: " " }//qua è dove metto un nome del Film se fosse una film fissa, ma invece devo fare un form per aggiungere il film
    const id: number = 5//mettere l'id del dato da modificare, anche questo deve essere recuperato e modificato del form

    //funzione che crea un osservable 
    this.obsModificaFilm(id, parametro).subscribe(this.osservatore) //l'osservatore VA PERSONALIZZATO
  }
  //funzione per creare un osservatore per modificare Film
  obsModificaFilm(id: number, dati: Partial<Film>) {
    return this.api.putFilm(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }


  idFilm: number | null = null
  eliminaFilm(id: number | null) {
    console.log("Categoria eliminata", id)
    if (id !== null) {
      this.obsEliminaFilm(id).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }

  }

  //funzione per creare un osservatore per modifica Film
  obsEliminaFilm(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteFilm(idRisorsa).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )
  }
}



