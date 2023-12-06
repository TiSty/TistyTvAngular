
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Observer, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';


@Component({
  selector: 'categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})

export class CategorieComponent implements OnInit, OnDestroy {

  elencoCategorie$: Observable<IRispostaServer>
  categorie: Card[]=[]
  // dati: Categorie[] = []
  private distruggi$ = new Subject<void>()


  constructor(private api: ApiService) {
    this.elencoCategorie$ = this.api.getCategorie()
  }


   //OBSERVER
   private osservoCat() {
    console.log("sono in osservo cat")
    return {
      next: (rit: IRispostaServer) => {
        console.log("NEXT", rit)
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          // const tmpImg: Immagine = elementi[i].img
          const tmpImg:Immagine={
            // src: '../../assets/immagini/FilmAvventura.jpeg' , cosi funziona
            src: elementi[i].src ,
            alt:elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai al Film",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/categorie/" + elementi[i].idCategoria  , 
          }
          const card: Card = {
            immagine: tmpImg,
            testo: '',
            titolo: elementi[i].nome,
            bottone: bott
          }
          this.categorie.push(card)
        }

      },
      error: (err: any) => {
        console.error("errore", err)
      },
      complete: () => {
        console.log("%c COMPLETATO", "color:#00aa00")
      }
    }
  }



  ngOnInit(): void {
    this.elencoCategorie$.pipe(
      delay(1000)
    ).subscribe(this.osservoCat())

    //   map(x => x.data)
    // ).subscribe({
    //   next: x => this.dati = x
    // })
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }






























 




 














//NON LO SO IL PERCHE E NON SO IL COME MAI SONO QUI STI CODICI


  private osservatore = {
    next: (ritorno: Categorie) => console.log(ritorno),
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }
  private osservatoreDelete = {
    next: () => console.log('Categoria Eliminata!'),
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }

  aggiungiCategoria() {
    console.log("aggiungi categoria")
    const parametro: Partial<Categorie> = { nome: " " }//qua è dove metto un nome della categoria se fosse una categoria fissa, ma invece devo fare un form per aggiungere la categoria
    this.obsAddCategoria(parametro).subscribe(this.osservatore)
  }


  obsAddCategoria(dati: Partial<Categorie>) {
    return this.api.postCategoria(dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),

      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }

  modificaCategoria() {
    console.log("Modifica categoria")
    const parametro: Partial<Categorie> = { nome: " " }//qua è dove metto un nome della categoria se fosse una categoria fissa, ma invece devo fare un form per aggiungere la categoria
    const id: number = 5//mettere l'id del dato da modificare, anche questo deve essere recuperato e modificato del form

    //funzione che crea un osservable 
    this.obsModificaCategoria(id, parametro).subscribe(this.osservatore) //l'osservatore VA PERSONALIZZATO
  }
  //funzione per creare un osservatore per modifica categoria
  obsModificaCategoria(id: number, dati: Partial<Categorie>) {
    return this.api.putCategoria(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }


  idCategoria: number | null = null
  eliminaCategoria(id: number | null) {
    console.log("Categoria eliminata", id)
    if (id !== null) {
      this.obsEliminaCategoria(id).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }

  }

  //funzione per creare un osservatore per modifica categoria
  obsEliminaCategoria(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteCategorie(idRisorsa).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )
  }
}

