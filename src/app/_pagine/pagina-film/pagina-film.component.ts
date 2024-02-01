import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap, throwError } from 'rxjs';
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


  @ViewChild('contentModifica') contentModifica!: TemplateRef<any>
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  film$!: Observable<IRispostaServer>;
  films: FilmVisualizzato[] = []

  card!: FilmVisualizzato
  IdCorr = 0

  idFilm!: number
  private distruggi$ = new Subject<void>()



  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;

  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, private httpClient: HttpClient) {
    this.elencoFilm$ = this.api.getFilms()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
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
          idFilm: elementi.idFilm,
          titolo: elementi.titolo,
          durata: elementi.durata,
          regista: elementi.regista,
          categoria: elementi.categoria,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer: elementi.trailer,
          src: elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilm", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }
  }

  ngOnInit(): void {
    if (this.id !== null) {
      this.route.paramMap.subscribe((ritorno) => {
        if (ritorno.get('id') !== null) {
          const id = ritorno.get('id') as string;
          const film$ = this.api.getFilm(id);
          film$.subscribe(this.osservoFilm());
        }
      });
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
            id: elementi[i].idFilm,
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



  titolo = ''
  durata!: number
  regista = ''
  categoria = ''
  anno!: number
  trama = ''
  trailer = ''
  src = ''


  modificaFilm() {
    console.log("sono in modifica film id ", this.IdCorr)
    console.log('Dati da modificare:', this.card);
    const parametro: Partial<FilmVisualizzato> = {
      titolo: this.card.titolo,
      durata: this.card.durata,
      regista: this.card.regista,
      categoria: this.card.categoria,
      anno: this.card.anno,
      trama: this.card.trama,
      trailer: this.card.trailer,
      src: this.card.src
    }
    this.obsModificaFilm(this.IdCorr, parametro).subscribe(this.osservatoreMod)
  }

  obsModificaFilm(id: number, dati: Partial<FilmVisualizzato>) {
    let idFilm = this.id
    console.log('ID in obsModificaFilm:', idFilm);
    console.log('Dati in obsModificaFilm:', idFilm, dati);
    return this.api.putFilmVisualizzato(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }



  private osservatoreMod = {
    next: () => {
      console.log('Film Modificato!')
    },
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }


  public apriModifica(id: number): void {
    console.log("ID FILM", this.id)
    this.IdCorr = id

    let film = this.films.find(elemento => elemento.idFilm === this.IdCorr)
    if (film !== undefined && film.titolo !== null && film.titolo !== undefined &&
      film.durata !== null && film.durata !== undefined &&
      film.regista !== null && film.regista !== undefined &&
      film.categoria !== null && film.categoria !== undefined &&
      film.anno !== null && film.anno !== undefined &&
      film.trama !== null && film.trama !== undefined &&
      film.trailer !== null && film.trailer !== undefined &&
      film.src !== null && film.src !== undefined) {

      this.titolo = film.titolo,
        this.durata = film.durata,
        this.regista = film.regista,
        this.categoria = film.categoria,
        this.anno = film.anno,
        this.trama = film.trama,
        this.trailer = film.trailer,
        this.src = film.src
    }
    this.openEnd(this.contentModifica)
  }

  eliminaFilm() {
    console.log('sono in elimina film', this.id)
    if (this.id !== null && this.id !== undefined) {
      console.log("Film da eliminare", this.id)
      this.obsEliminaFilm(this.idFilm).subscribe(this.osservatoreDelete)
    } else {
      console.error('Id non valido')
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaFilm(id: number) {
    const idFilm = this.id
    console.log('iD in OBS elimina film', idFilm)
    return this.api.deleteFilm(idFilm!.toString()).pipe(
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
    // console.log('IDFILM:' , this.id)
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
        categoria: this.categoria,
        anno: this.anno,
        trama: this.trama,
        trailer: this.trailer,
        src: this.src
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

  //PER RIPRODURRE IL FILM
  openVideo() {
    // Sostituisci "percorso/al/tuo/video.mp4" con il percorso effettivo del tuo video
    const videoUrl = "../../assets/video/trailer.mp4";

    // Apri una nuova finestra/popup con il video a tutto schermo
    const newWindow = window.open(videoUrl, '_blank', 'fullscreen=yes');

    // Aggiungi la gestione degli errori se necessario
    if (!newWindow) {
      console.error('Impossibile aprire una nuova finestra/popup.');
    }
  }

}















