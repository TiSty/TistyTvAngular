import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap, throwError } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Film } from 'src/app/Type/Film.type';
import { FilmVisualizzato } from 'src/app/Type/FilmVisualizzato.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

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

  card: FilmVisualizzato={
    idFilm:0,
    titolo: '',
    durata: 0,
    regista: '',
    categoria: '',
    anno:0,
    trama:'',
    trailer: '',
    src:  '',
  }
  IdCorr = 0

  idFilm!: number
  private distruggi$ = new Subject<void>()

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;
  reactiveFormMod: FormGroup

  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private UtilityService : UtilityService, public auth:AuthService
  ) {
    this.elencoFilm$ = this.api.getFilms()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)

    this.reactiveFormMod = this.impostaForm()
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
          trailer:UtilityService.urlServer()+  elementi.trailer,
          src: UtilityService.urlServer()+ elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoFilm", err),
      complete: () => console.log("%c COMPLETATO Film", "color:#00aa00")
    }
  }

  impostaForm() {
    const tmp= this.fb.group({
      'titoloMod': [this.card.titolo, [Validators.maxLength(60)]],
      'registaMod': [this.card.regista, [Validators.maxLength(60)]],
      'durataMod': [this.card.durata, [Validators.maxLength(3)]],
      'categoriaMod': [this.card.categoria, [Validators.maxLength(60)]],
      'annoMod': [this.card.anno, [Validators.maxLength(5)]],
      'tramaMod': [this.card.trama, [Validators.maxLength(350)]],
      'filesDaCaricare': ['', []],
    })
    return tmp;
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



  titoloMod = ''
  durataMod!: number
  registaMod = ''
  categoriaMod = ''
  annoMod!: number
  tramaMod = ''
  filesDaCaricare = ''
  //PER MODIFICARE UN FILM
  modificaFilm(form: HTMLFormElement): void {
    if (this.reactiveFormMod.valid) {
      const formData: FormData = new FormData()
      this.titoloMod = this.reactiveFormMod.value.titoloMod;
      this.registaMod = this.reactiveFormMod.value.registaMod;
      this.durataMod = this.reactiveFormMod.value.durataMod;
      this.categoriaMod = this.reactiveFormMod.value.categoriaMod;
      this.annoMod = this.reactiveFormMod.value.annoMod;
      this.tramaMod = this.reactiveFormMod.value.tramaMod;

      if (this.titoloMod !== null && this.titoloMod !== '') {
        formData.append('titolo', this.titoloMod)
      }
      if (this.registaMod !== null && this.registaMod !== '') {
        formData.append('regista', this.registaMod)
      }
      if (this.durataMod !== null && this.durataMod > 0) {
        formData.append('durata', this.durataMod.toString())
      }
      if (this.categoriaMod !== null && this.categoriaMod !== '') {
        formData.append('categoria', this.categoriaMod)
      }
      if (this.annoMod !== null && this.annoMod > 0) {
        formData.append('anno', this.annoMod.toString())
      }
      if (this.tramaMod !== null && this.tramaMod !== '') {
        formData.append('trama', this.tramaMod)
      }

      if (this.daCaricare !== null) {
        for (let i = 0; i < this.daCaricare.length; i++) {
          formData.append('filesDaCaricare[]', this.daCaricare[i])
        }
      }
      formData.append('_method', 'PUT');
      const obs$ = this.obsModificaFilm(this.IdCorr, formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione modifica FILM', ritorno)
          this.fileOk = ritorno
          const card2 = {
            idFilm: ritorno.idFilm,
            titolo: ritorno.titolo,
            durata: ritorno.durata,
            regista: ritorno.regista,
            categoria: ritorno.categoria,
            anno:ritorno.anno,
            trama:ritorno.trama,
            trailer: UtilityService.urlServer()+ ritorno.trailer,
            src: UtilityService.urlServer()+ ritorno.src,
          }
          this.card= card2
          
        },
        error: (err) => {
          console.error('Errore in Modifica', err)
        },
        complete: () => {
          console.log('Completato')
        }
      });
    } else {
      console.log('form non valido', this.reactiveFormMod.errors)
    }
  }
  // //funzione per creare un osservatore per modifica film
  obsModificaFilm(id: number, dati: FormData) {
    return this.api.putFilmVisualizzato(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }


  public apriModifica(id: number): void {
    console.log("ID FILM", this.id)
    this.reactiveFormMod=this.impostaForm()
    this.IdCorr = id

    let film = this.films.find(elemento => elemento.idFilm === this.IdCorr)
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
    next: () => {
      console.log('Film Eliminato!')
      this.router.navigate(['film']);
    },
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
  readonly maxFileNumber: number = 2
  readonly maxFileSize: number = 2
  readonly maxFileSizeMp4: number = 2
  daCaricare: File[] = []
  fileOk: boolean = false

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
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const isImage = this.ctrlEstensione(file.name, "jpg, jpeg");
        const isMp4 = this.controllaEstensioneMp4(file.name, "mp4");
        if (!isImage && !isMp4) {
          this.errore = file.name + ' non ha estensione corretta, solo JPEG o MP4';
          break;
        } else if (isImage && !this.ctrlSize(file.size, this.maxFileSize)) {
          this.errore = file.name + ' il file è troppo grande (' + Math.round(file.size / (1024 * 1024)) + 'MB)';
          break;
        } else if (isMp4 && !this.ctrlSizeMp4(file.size, this.maxFileSizeMp4)) {
          this.errore = file.name + ' il file è troppo grande (' + Math.round(file.size / (4080 * 4080)) + 'MB)';
          break;
        } else if (!this.ctrlInArray(file)) {
          this.daCaricare.push(file);
        }
      }
      console.log('FILE INSERITI', this.daCaricare);
    }
  }

  ctrlEstensione(nome: string, ext: string): boolean {
    const estensioniPermesse = ["jpg", "jpeg"]; // Aggiungi "jpeg" all'elenco delle estensioni permesse
    const tmp = nome.split(".");
    const estensione = tmp[tmp.length - 1].toLowerCase(); // Converte l'estensione in minuscolo per la comparazione
    return estensioniPermesse.includes(estensione); // Verifica se l'estensione è tra quelle permesse
  }
  controllaEstensioneMp4(nome: string, ext: string): boolean {
    const estensioniPermesse = ["mp4"];
    const tmp = nome.split(".");
    const estensione = tmp[tmp.length - 1].toLowerCase();
    return estensioniPermesse.includes(estensione);
  }
  ctrlSize(size: number, maxSizeMB: number): boolean {
    const tmp = maxSizeMB * 1024 * 1024
    return (size > tmp) ? false : true
  }

  ctrlSizeMp4(size: number, maxSizeMB: number): boolean {
    const tmp = maxSizeMB * 3072 * 3072
    return (size > tmp) ? false : true
  }
  ctrlInArray(file: File): boolean {
    return false
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

  eliminaFile(file: File): void {
    this.daCaricare.splice(this.daCaricare.indexOf(file), 1)
    console.log('Elimino Dati', this.daCaricare)
  }

  ricaricaPagina() {
    window.location.reload();
  }


}















