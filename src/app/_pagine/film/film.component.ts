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
import { HttpClient } from '@angular/common/http';
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

  selectedFile: File | undefined;
  fileContent: string | undefined;

  constructor(private api: ApiService, private route: ActivatedRoute, private httpClient: HttpClient) {
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
            id:elementi[i].idFilm,
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
          id:ritorno.idFilm,
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
        durata:this.durata,
        categoria:this.categoria,
        anno:this.anno,
        trama:this.trama,
        trailer:this.trailer,
        src:this.src
      };

      // Invia la richiesta HTTP POST al server
      this.httpClient.post('http://localhost:4200/api/v1/film', payload)
        .subscribe(response => {
          console.log('File caricato con successo', response);
        }, error => {
          console.error('Errore durante il caricamento del file', error);
        });
    }
  }

}









  













