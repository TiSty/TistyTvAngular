import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';

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

  reactiveForm: FormGroup

  constructor(private api: ApiService, private httpClient: HttpClient, private fb: FormBuilder, public auth: AuthService) {
    this.elencoSerieTv$ = this.api.getSeriesTv()

    this.reactiveForm = this.fb.group({
      'titolo': ['', [Validators.maxLength(60)]],
      'durata': ['', [Validators.maxLength(60)]],
      'regista': ['', [Validators.maxLength(60)]],
      'stagioni': ['', [Validators.maxLength(60)]],
      'episodi': ['', [Validators.maxLength(60)]],
      'categoria': ['', [Validators.maxLength(60)]],
      'anno': ['', [Validators.maxLength(60)]],
      'trama': ['', [Validators.maxLength(60)]],
      'filesDaCaricare': ['', [Validators.required]]
    })
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
            // testo: elementi[i].trama,
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


  errore: string = ''
  readonly maxFileNumber: number = 2
  readonly maxFileSize: number = 2
  readonly maxFileSizeMp4: number = 2
  daCaricare: File[] = []
  fileOk: boolean = false

  //PER AGGIUNGERE UNA Film
  aggiungiSerieTv(form: HTMLFormElement): void {
    if (this.reactiveForm.valid) {
      console.log('dati del form', this.reactiveForm.value)
      const formData: FormData = new FormData()
      //seleziono i vari dati dal form e li inserisco in variabili
      this.titolo = this.reactiveForm.value.titolo;
      this.regista = this.reactiveForm.value.regista;
      this.episodi = this.reactiveForm.value.episodi;
      this.stagioni = this.reactiveForm.value.stagioni;
      this.durata = this.reactiveForm.value.durata;
      this.categoria = this.reactiveForm.value.categoria;
      this.anno = this.reactiveForm.value.anno;
      this.trama = this.reactiveForm.value.trama;

      formData.append('titolo', this.titolo)
      formData.append('regista', this.regista)
      formData.append('durata', this.durata.toString())
      formData.append('stagioni', this.stagioni.toString())
      formData.append('episodi', this.episodi.toString())
      formData.append('categoria', this.categoria)
      formData.append('anno', this.anno.toString())
      formData.append('trama', this.trama)
      for (let i = 0; i < this.daCaricare.length; i++) {
        formData.append('filesDaCaricare[]', this.daCaricare[i])
      } this.obsAddSerieTv(formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione aggiungiCategoria', ritorno)
          this.fileOk = ritorno
          this.seriesTv.push(ritorno)
        },
        error: (err) => {
          console.error('Errore in aggiungi', err)
        },
        complete: () => {
          console.log('Completato')
        }
      });
    } else {
      console.log('form non valido', this.reactiveForm.errors)
    }
  }
  obsAddSerieTv(dati: FormData) {
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
        this.ricaricaPagina()
      } else {
        console.error('Impossibile creare serieTv')
      }
    },
    error: (err: string) => console.error(err),
    complete: () => console.log("Completato"),
  }
  //funzione che richiama l'observable della funzione apiService per Upload 
  inviaFile(dati: FormData): Observable<any> {
    return this.api.uploadFiles(dati).pipe(
      tap(x => console.log('Dati tap per i files', x)),
      take(1),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
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

  onChangeInputFile(e: Event): void {
    const elemento = e.currentTarget as HTMLInputElement;
    const fileList: FileList | null = elemento.files;
    if (fileList && fileList !== null) {
      console.log("FILE: ", fileList);
      this.ctrlFileList(fileList);
    }
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


  eliminaFile(file: File): void {
    this.daCaricare.splice(this.daCaricare.indexOf(file), 1)
    console.log('Elimino Dati', this.daCaricare)
  }



  ricaricaPagina() {
    window.location.reload();
  }


}












