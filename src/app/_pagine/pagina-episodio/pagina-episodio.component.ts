import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { EpisodioVisualizzato } from 'src/app/Type/EpisodioVisualizzato.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

@Component({
  selector: 'pagina-episodio',
  templateUrl: './pagina-episodio.component.html',
  styleUrls: ['./pagina-episodio.component.scss']
})

export class PaginaEpisodioComponent implements OnInit, OnDestroy {
  @ViewChild('contentModifica') contentModifica!: TemplateRef<any>
  id: string | null = null
  episodio$!: Observable<IRispostaServer>;
  episodi: EpisodioVisualizzato[] = []
  card: EpisodioVisualizzato = {
    idEpisodio: 0,
    titolo: '',
    serieTv: '',
    durata: 0,
    stagione: 0,
    datiEp: '',
    anno: 0,
    trama: '',
    trailer: '',
    src: ''
  }
  IdCorr = 0
  idEpisodio!: number

  slides: Card[] = []

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;

  private distruggi$ = new Subject<void>()

  reactiveFormMod: FormGroup

  constructor(private route: ActivatedRoute, private api: ApiService, private httpClient: HttpClient, private utility: UtilityService, private fb: FormBuilder, public auth:AuthService) {
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)

    this.reactiveFormMod = this.impostaForm()
  }


  //OBSERVER PER IL SINGOLO EPISODIO
  private osservoEpisodio() {
    console.log("SONO IN OSSERVO EPISODIO")
    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        // for (let i = 0; i < elementi.length; i++) {
        const tmpImg: Immagine = {
          src: elementi.src,
          alt: '',
        }
        //SE SERVE DECOMMENTA AL BOTTONE
        const bott: Bottone = {
          testo: "Vai al Film",
          title: "Visualizza" + elementi.nome,
          tipo: "button",
          emitId: null,
          link: "/episodio/" + elementi.idEpisodio
        }
        this.card = {
          idEpisodio: elementi.idEpisodio,
          titolo: elementi.titolo,
          durata: elementi.durata,
          serieTv: elementi.serieTv,
          stagione: elementi.stagione,
          datiEp: elementi.datiEp,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer: UtilityService.urlServer()+ elementi.trailer,
          src:UtilityService.urlServer()+  elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoepisodio", err),
      complete: () => console.log("%c COMPLETATO episodio", "color:#00aa00")
    }

  }

  impostaForm() {
    const tmp = this.fb.group({
      'titoloMod': [this.card.titolo, [Validators.maxLength(60)]],
      'serieTvMod': [this.card.serieTv, [Validators.maxLength(60)]],
      'durataMod': [this.card.durata, [Validators.maxLength(3)]],
      'annoMod': [this.card.anno, [Validators.maxLength(60)]],
      'stagioneMod': [this.card.stagione, [Validators.maxLength(5)]],
      'episodioMod': [this.card.datiEp, [Validators.maxLength(5)]],
      'tramaMod': [this.card.trama, [Validators.maxLength(350)]],
      'filesDaCaricare': ['', []],
    })
    return tmp
  }

  ngOnInit(): void {
    if (this.id !== null) {
      this.route.paramMap.subscribe((ritorno) => {
        if (ritorno.get('id') !== null) {
          const id = ritorno.get('id') as string;
          const episodio$ = this.api.getEpisodio(id);
          episodio$.subscribe(this.osservoEpisodio())



          const elencoEpisodio$ = this.api.getEpisodiDaEpisodio(parseInt(id))
          elencoEpisodio$.subscribe(this.osservoEpisodi())


        }
      });
    }
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }


  //FUNZIONE PER MODIFICARE L'EPISODIO
  titoloMod = ''
  serieTvMod = ''
  durataMod!: number
  annoMod!: number
  tramaMod = ''
  stagioneMod!: number
  episodioMod = ''
  src = ''
  fileOk: boolean = false
  //PER MODIFICARE UN FILM
  modificaEpisodio(form: HTMLFormElement): void {
    if (this.reactiveFormMod.valid) {
      const formData: FormData = new FormData()
      this.titoloMod = this.reactiveFormMod.value.titoloMod;
      this.serieTvMod = this.reactiveFormMod.value.serieTvMod;
      this.durataMod = this.reactiveFormMod.value.durataMod;
      this.stagioneMod = this.reactiveFormMod.value.stagioneMod;
      this.annoMod = this.reactiveFormMod.value.annoMod;
      this.tramaMod = this.reactiveFormMod.value.tramaMod;
      this.episodioMod = this.reactiveFormMod.value.episodioMod;


      if (this.titoloMod !== null && this.titoloMod !== '') {
        formData.append('titolo', this.titoloMod)
      }
      if (this.serieTvMod !== null && this.serieTvMod !== '') {
        formData.append('serieTv', this.serieTvMod.toString())
      }
      if (this.durataMod !== null && this.durataMod > 0) {
        formData.append('durata', this.durataMod.toString())
      }
      if (this.stagioneMod !== null && this.stagioneMod > 0) {
        formData.append('stagione', this.stagioneMod.toString())
      }
      if (this.annoMod !== null && this.annoMod > 0) {
        formData.append('anno', this.annoMod.toString())
      }
      if (this.tramaMod !== null && this.tramaMod !== '') {
        formData.append('trama', this.tramaMod)
      }
      if (this.episodioMod !== null && this.episodioMod != '') {
        formData.append('episodio', this.episodioMod.toString())
      }
      if (this.daCaricare !== null) {
        for (let i = 0; i < this.daCaricare.length; i++) {
          formData.append('filesDaCaricare[]', this.daCaricare[i])
        }
      }
      formData.append('_method', 'PUT');
      const obs$ = this.obsModificaEp(this.IdCorr, formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione modifica FILM', ritorno)
          this.fileOk = ritorno
          const card2 = {
            idEpisodio: ritorno.idEpisodio,
            titolo: ritorno.titolo,
            durata: ritorno.durata,
            serieTv: ritorno.serieTv,
            stagione: ritorno.stagione,
            datiEp: ritorno.datiEp,
            anno: ritorno.anno,
            trama: ritorno.trama,
            trailer:UtilityService.urlServer()+ ritorno.trailer,
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
  obsModificaEp(id: number, dati: FormData) {
    return this.api.putEpisodioVisualizzato(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }



  public apriModifica(id: number): void {
    console.log("ID FILM", this.id)
    this.reactiveFormMod = this.impostaForm()
    this.IdCorr = id

    let episodio = this.episodi.find(elemento => elemento.idEpisodio === this.IdCorr)
    this.openEnd(this.contentModifica)
  }


  //PER ELIMINARE L'EPISODIO
  eliminaEp() {
    console.log('sono in elimina Episodio', this.id)
    if (this.id !== null && this.id !== undefined) {
      console.log("Episodio da eliminare", this.id)
      this.obsEliminaEp(this.idEpisodio).subscribe(this.osservatoreDelete)
    } else {
      console.error('Id non valido')
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaEp(id: number) {
    const idEpisodio = this.id
    console.log('iD in OBS elimina film', idEpisodio)
    return this.api.deleteEpisodio(idEpisodio!.toString()).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )

  }

  private osservatoreDelete = {
    next: () => {
      console.log('Episodio Eliminato!')
      this.ricaricaPagina()
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



  elencoEpisodi: Card[] = []
  elencoEpisodio$!: Observable<IRispostaServer>;
  //OBSERVER PER TUTTI GLI EPISODI
  private osservoEpisodi() {
    return {
      next: (rit: IRispostaServer) => {
        this.elencoEpisodi = [];
        const elementi = rit.data
        console.log("Dati di:  OSSERVO Episodi", elementi)
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: UtilityService.urlServer() + elementi[i].src,
            alt: elementi[i].alt,
          }
          //SE SERVE DECOMMENTA AL BOTTONE
          const bott: Bottone = {
            testo: "Vai all'episodio",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/episodio/" + elementi[i].idEpisodio
          }
          const card: Card = {
            id: elementi[i].idEpisodio,
            immagine: tmpImg,
            titolo: elementi[i].titolo,
            testo: elementi[i].datiEp,
            bottone: bott
          }
          this.elencoEpisodi.push(card)
          console.log(this.elencoEpisodi)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoEpisodi", err),
      complete: () => console.log("%c COMPLETATO episodi", "color:#00aa00")
    }
  }





  //PER INSERIRE IL FILE DI TIPO SRC
  errore: string = ''
  readonly maxFileNumber: number = 1
  readonly maxFileSize: number = 1
  readonly maxFileSizeMp4: number = 2
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
    const tmp = nome.split(".")
    return (tmp[tmp.length - 1] !== ext) ? false : true
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


  eliminaFile(file: File): void {
    this.daCaricare.splice(this.daCaricare.indexOf(file), 1)
    console.log('Elimino Dati', this.daCaricare)
  }





  //PER RIPRODURRE la Serietv
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

  ricaricaPagina() {
    window.location.reload();
  }


} 
