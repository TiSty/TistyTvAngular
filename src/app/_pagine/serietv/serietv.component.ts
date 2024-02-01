import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
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

export class SerietvComponent implements OnInit, OnDestroy {

  elencoSerieTv$: Observable<IRispostaServer>;
  seriesTv: Card[] = []
  private distruggi$ = new Subject<void>()

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

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

  idSerieTv!: number;

  selectedFile: File | undefined;
  fileContent: string | undefined;

  constructor(private api: ApiService, private httpClient: HttpClient) {
    this.elencoSerieTv$ = this.api.getSeriesTv()
  }

  //OBSERVER
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
    this.elencoSerieTv$.pipe(
      delay(1000)
    ).subscribe(this.osservoSerieTv())
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }

  //PER AGGIUNGERE UNA Film
  aggiungiSerieTv() {
    console.log("Aggiungi Film", this.titolo)
    const parametro: Partial<SerieTv> = {
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
    this.obsAddSerieTv(parametro).subscribe(this.osservatore)
  }
  obsAddSerieTv(dati: Partial<SerieTv>) {
    return this.api.postSerieTv(dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }
  private osservatore = {
    next: (ritorno: SerieTv) => {
      console.log(ritorno);
      if (ritorno.src !== undefined) {
        const newCard: Card = {
          id: ritorno.idSerieTv,
          titolo: ritorno.titolo,
          testo: ritorno.trama,
          immagine: { src: ritorno.src, alt: '' }
        }
        this.seriesTv.push(newCard)
      } else {
        console.error('Impossibile creare serieTv')
      }
    },
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }





  //PER ELIMINARE UNA SERIETV
  eliminaSerieTv(id: number | null) {
    console.log("SerieTv eliminata", id)
    if (id !== null) {
      this.obsEliminaSerieTv(id).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaSerieTv(id: number) {
    const idRisorsa = id + ''
    return this.api.deleteSerieTv(idRisorsa).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )
  }
  private osservatoreDelete = {
    next: () => console.log('SerieTv Eliminata!'),
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
  //PER INSERIRE IL FILE DI TIPO SRC
  errore: string = ''
  readonly maxFileNumber: number = 1
  readonly maxFileSize: number = 1
  daCaricare: File[] = []

  //funzione che richiama l'observable della funzione apiService per Upload 
  inviaImg(dati: FormData): Observable<any> {
    return this.api.upload(dati).pipe(
      tap(x => console.log('Dati tap per le immagini', x)),
      take(1),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }


  onChangeInputFile(e: Event): void {
    const elemento = e.currentTarget as HTMLInputElement
    let fileList: FileList | null = elemento.files
    if (fileList && fileList !== null) {
      console.log("FILE: ", fileList)
      this.ctrlFileList(fileList)
    }
  }

  ctrlFileList(fileList: FileList): void {
    if (fileList !== null) {
      if (fileList.length > this.maxFileNumber) {
        this.errore = 'Puoi caricare' + this.maxFileNumber + 'immagine'
      } else {
        for (let i = 0; i < fileList.length; i++) {
          if (!this.ctrlEstensione(fileList[i].name, "jpg")) {
            this.errore = fileList[i].name + 'non ha estensione corretta, solo JPEG'
            break
          }
          else if (!this.ctrlSize(fileList[i].size, this.maxFileSize)) {
            this.errore = fileList[i].name + 'il file è troppo grande(' + Math.round(fileList[i].size / (1024 * 1024)) + 'MB)'
            break
          }
        }
      }
    }
  }

  ctrlEstensione(nome: string, ext: string): boolean {
    const tmp = nome.split(".")
    return (tmp[tmp.length - 1] !== ext) ? false : true
  }
  ctrlSize(size: number, maxSizeMB: number): boolean {
    const tmp = maxSizeMB * 1024 * 1024
    return (size > tmp) ? false : true
  }


  onFileSelected(event: any): void {
    const inputElement = event.target;
    if (inputElement.files && inputElement.files.length > 0) {
      // Ottieni il primo file selezionato
      this.selectedFile = inputElement.files[0];
      // Leggi il contenuto del file come stringa
      this.readfileContent();
    }
  }

  readfileContent(): void {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      // Salva il contenuto del file come stringa
      this.fileContent = e.target?.result as string;
    };
    fileReader.readAsText(this.selectedFile!);
  }

  onUpload(): void {
    if (this.fileContent) {
      const payload = {
        titolo: this.titolo,
        regista: this.regista,
        durata: this.durata,
        stagioni: this.stagioni,
        episodi: this.episodi,
        categoria: this.categoria,
        anno: this.anno,
        trama: this.trama,
        trailer: this.trailer,
        src: this.src
      };

      // Invia la richiesta HTTP POST al server
      this.httpClient.post('http://localhost:4200/api/v1/serieTv', payload).subscribe(response => {
        console.log('File caricato con successo', response);
      }, error => {
        console.error('Errore durante il caricamento del file', error);
      });
    }
  }

}













//PER MODIFICARE UNA SERIETV     TOLTO PERCHE RITENUTO INUTILE, LA MODIFICA SU PUò ESEGUIRE DA DENTRO LA PAGINA DI VISUALIZZAZIONE DEL FILM
// modificaSerieTv() {
//   console.log("Modifica Serie")
//   const parametro: Partial<SerieTv> = {
//     titolo: this.titolo,
//     durata: this.durata,
//     stagioni: this.stagioni,
//     episodi: this.episodi,
//     regista: this.regista,
//     categoria: this.categoria,
//     anno: this.anno,
//     trama: this.trama,
//     trailer: this.trailer,
//     src: this.src
//   }
//   const id: number = this.idSerieTv
//   //funzione che sottoscrive un osservable
//   this.obsModificaSerieTv(id, parametro).subscribe(this.osservatoreMod)
// }
// //funzione per creare un osservatore per modifica SerieTv
// obsModificaSerieTv(id: number, dati: Partial<SerieTv>) {
//   return this.api.putSerieTv(id, dati).pipe(
//     take(1),
//     tap(x => console.log("OBS ", x)),
//     map(x => x.data),
//     takeUntil(this.distruggi$)
//   )
// }

// private osservatoreMod = {
//   next: () => console.log('SerieTv Modificata!'),
//   error: (err: string) => console.error(err),
//   complete: () => console.log("Completato"),
// }

