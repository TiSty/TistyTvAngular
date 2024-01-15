
import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Observer, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})

export class CategorieComponent implements OnInit, OnDestroy {

  elencoCategorie$: Observable<IRispostaServer>
  categorie: Card[] = []
  categoria!: Categorie

  private distruggi$ = new Subject<void>()

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  cardMod!: Categorie

  nomeCategoria: string = ''
  srcCategoria: string = ''
  idCategoria!: number;



  constructor(private api: ApiService) {
    this.elencoCategorie$ = this.api.getCategorie()

  }


  //OBSERVER PER VISUALIZZARE LE CATEGORIE
  private osservoCat() {
    console.log("sono in osservo cat")
    return {
      next: (rit: IRispostaServer) => {
        console.log("NEXT", rit)
        const elementi = rit.data
        for (let i = 0; i < elementi.length; i++) {
          // const tmpImg: Immagine = elementi[i].img
          const tmpImg: Immagine = {
            // src: '../../assets/immagini/FilmAvventura.jpeg' , cosi funziona
            src: elementi[i].src,
            alt: elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai alla Categoria",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/categorie/" + elementi[i].idCategoria,
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
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }



  //PER AGGIUNGERE UNA CATEGORIA 
  aggiungiCategoria() {
    console.log("Aggiungi Categoria", this.nomeCategoria)
    const parametro: Partial<Categorie> = { nome: this.nomeCategoria, src: this.srcCategoria }
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
  private osservatore = {
    next: (ritorno: Categorie) => {
      console.log(ritorno);
      if (ritorno.src !== undefined) {
        const newCard: Card = { titolo: ritorno.nome, immagine: { src: ritorno.src, alt: '' } }
        this.categorie.push(newCard)
      } else {
        console.error('Impossibile creare Categoria')
      }
    },
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }

    //PER MODIFICARE UNA CATEGORIA
    modificaCategoria() {
      console.log("Modifica categoria")
      const parametro: Partial<Categorie> = { nome: this.nomeCategoria, src: this.srcCategoria }
      const id: number = this.idCategoria
      //funzione che sottoscrive un osservable 
      this.obsModificaCategoria(id, parametro).subscribe(this.osservatoreMod)
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
  
    private osservatoreMod = {
      next: () => console.log('Categoria Modificata!'),
      error: (err: string) => console.error(err),
      complete: () => console.log("Completato"),
    }


  //PER ELIMINARE UNA CATEGORIA
  eliminaCategoria(id: number | null) {
    console.log("Categoria eliminata", id)
    if (id !== null) {
      this.obsEliminaCategoria(id).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaCategoria(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteCategorie(idRisorsa).pipe(
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













  //PER MODIFICARE UNA CATEGORIA
  // modificaCategoria() {
    //   console.log("Modifica categoria")
    //   const parametro: Partial<Categorie> = { nome: this.nomeCategoria, src: this.srcCategoria }
    //   const id: number = this.idCategoria
    //   //funzione che sottoscrive un osservable 
    //   this.obsModificaCategoria(id, parametro).subscribe(this.osservatoreMod)
    //  }
    // //funzione per creare un osservatore per modifica categoria
    // obsModificaCategoria(id: number, dati: Partial<Categorie>) {
    //   return this.api.putCategoria(id, dati).pipe(
    //     take(1),
    //     tap(x => console.log("OBS ", x)),
    //     map(x => x.data),
    //     takeUntil(this.distruggi$)
    //   )
    // }
  
    // private osservatoreMod = {
    //   next: (ritorno: Categorie) => {
    //     console.log('Categoria Modificata!')
    //     const catMod: Categorie = { idCategoria: ritorno.idCategoria, nome: ritorno.nome }
    //     this.categorie.push(catMod)
    //   },
    //   error: (err: string) => console.error(err),
    //   complete: () => console.log("Completato"),
    // }
  
  
  
    //PER MODIFICARE UNA CATEGORIA
    // modificaCategoria() {
    //   console.log("Modifica categoria")
    //   const parametro: Partial<Categorie> = {idCategoria:this.cardMod.idCategoria, nome: this.cardMod.nome, src: this.cardMod.src }
    //   const id: number = this.idCategoria
    //   //funzione che sottoscrive un osservable 
    //   this.obsModificaCategoria(id, parametro).subscribe(this.osservatoreMod)
    // }
    // //funzione per creare un osservatore per modifica categoria
    // obsModificaCategoria(id: number, dati: Partial<Categorie>) {
    //   return this.api.putCategoria(id, dati).pipe(
    //     take(1),
    //     tap(x => console.log("OBS ", x)),
    //     map(x => x.data),
    //     takeUntil(this.distruggi$)
    //   )
    // }
    // private osservatoreMod = {
    //   next: (ritorno:Categorie) => {
    //     console.log('Categoria Modificata!')
    //     if (ritorno.src !== undefined) {
    //       const cardMod: Card = { titolo: ritorno.nome, immagine: { src: ritorno.src, alt: '' } }
    //       this.categorie.push(cardMod)
    //     } else {
    //       console.error('Impossibile modificare Categoria')
    //     }
    //   },
    //   error: (err: string) => console.error(err),
    //   complete: () => console.log("Completato"),
    // }