import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { serieTvVisualizzata } from 'src/app/Type/serieTvVisualizzata.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

@Component({
  selector: 'pagina-serie-tv',
  templateUrl: './pagina-serie-tv.component.html',
  styleUrls: ['./pagina-serie-tv.component.scss']
})

export class PaginaSerieTvComponent implements OnInit, OnDestroy {
  @ViewChild('contentModifica') contentModifica!: TemplateRef<any>
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  serieTv$!: Observable<IRispostaServer>;
  seriesTv: serieTvVisualizzata[] = []
  card: serieTvVisualizzata = {
    idSerie: 0,
    titolo: '',
    durata: 0,
    regista: '',
    categoria: '',
    episodi: 0,
    stagioni: 0,
    anno: 0,
    trama: '',
    trailer: '',
    src: '',
  }
  IdCorr = 0
  idSerie!: number

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;

  reactiveFormMod: FormGroup

  private distruggi$ = new Subject<void>()

  constructor(private route: ActivatedRoute, private api: ApiService, private httpClient: HttpClient, private router: Router, private fb: FormBuilder, public auth:AuthService) {
    this.elencoSerieTv$ = this.api.getSeriesTv()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)

    this.reactiveFormMod = this.impostaForm()
  }

  //OBSERVER SERIE TV SIGNOLA
  private osservoSerieTv() {

    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        console.log("DATI DI: osservo SerieTv", elementi)

        //SE SERVE DECOMMENTA AL BOTTONE
        const bott: Bottone = {
          testo: "Vai alla Serie",
          title: "Visualizza " + elementi.nome,
          tipo: "button",
          emitId: null,
          link: "/serieTv/" + elementi.idSerie
        }
        this.card = {
          idSerie: elementi.idSerie,
          titolo: elementi.titolo,
          durata: elementi.durata,
          stagioni: elementi.stagioni,
          episodi: elementi.episodi,
          regista: elementi.regista,
          categoria: elementi.categoria,
          anno: elementi.anno,
          trama: elementi.trama,
          trailer:UtilityService.urlServer()+  elementi.trailer,
          src:UtilityService.urlServer()+  elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoSerieTv", err),
      complete: () => console.log("%c COMPLETATO serieTv", "color:#00aa00")
    }
  }

  impostaForm() {
    const tmp = this.fb.group({
      'titoloMod': [this.card.titolo, [Validators.maxLength(60)]],
      'registaMod': [this.card.regista, [Validators.maxLength(60)]],
      'durataMod': [this.card.durata, [Validators.maxLength(3)]],
      'categoriaMod': [this.card.categoria, [Validators.maxLength(60)]],
      'annoMod': [this.card.anno, [Validators.maxLength(5)]],
      'tramaMod': [this.card.trama, [Validators.maxLength(350)]],
      'episodiMod': [this.card.episodi, [Validators.maxLength(3)]],
      'stagioniMod': [this.card.stagioni, [Validators.maxLength(3)]],
      'filesDaCaricare': ['', []],
    })
    return tmp
  }
  ngOnInit(): void {
    if (this.id !== null) {
      this.route.paramMap.subscribe((ritorno) => {
        if (ritorno.get('id') !== null) {
          const id = ritorno.get('id') as string;
          const serieTv$ = this.api.getSerieTv(id);
          serieTv$.subscribe(this.osservoSerieTv());

          this.episodio$ = this.api.getEpisodiDaSerie(parseInt(id));
          this.episodio$.subscribe(this.osservoEpisodi())

        }
      })
    }
    this.elencoSerieTv$.pipe(delay(1000)).subscribe(this.osservoSeriesTv())
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }


  elencoSerieTv$: Observable<IRispostaServer>
  elencoSeriesTv: Card[] = []
  //OBSERVER ELENCO SERIE
  private osservoSeriesTv() {
    console.log("Sono in osservoSeries")
    return {
      next: (rit: IRispostaServer) => {
        this.elencoSeriesTv = [];
        const elementi = rit.data
        console.log("DATI DI:osservo SerieSTv", rit)
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai alla serie",
            title: "Visualizza " + elementi[i].nome,
            tipo: "button",
            emitId: null,
            link: "/serieTv/" + elementi[i].idSerieTv,
          }
          const card: Card = {
            id: elementi[i].idSerie,
            immagine: tmpImg,
            // testo: elementi[i].trama,
            titolo: elementi[i].titolo,
            bottone: bott
          }
          this.elencoSeriesTv.push(card)
          // console.log(this.elencoSeriesTv)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO seriesTv", "color:#00aa00") }
    }
  }

  episodii: Card[] = []
  episodio$!: Observable<IRispostaServer>;
  //OBSERVER PER ELENCO EPISODI
  private osservoEpisodi() {
    return {
      next: (rit: IRispostaServer) => {
        this.episodii = []
        const elementi = rit.data
        console.log("DAti di:  OSSERVO Episodi", elementi)
        for (let i = 0; i < elementi.length; i++) {
          const tmpImg: Immagine = {
            src: elementi[i].src,
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
          this.episodii.push(card)
          // console.log(this.episodii)
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoEpisodi", err),
      complete: () => console.log("%c COMPLETATO episodi", "color:#00aa00")
    }
  }

  //PER MODIFICARE LA SERIE TV
  titoloMod = ''
  durataMod!: number
  episodiMod!: number
  stagioniMod!: number
  registaMod = ''
  categoriaMod = ''
  annoMod!: number
  tramaMod = ''
  filesDaCaricare = ''

  //PER MODIFICARE UNa serie
  modificaSerieTv(form: HTMLFormElement): void {
    if (this.reactiveFormMod.valid) {
      const formData: FormData = new FormData()
      this.titoloMod = this.reactiveFormMod.value.titoloMod;
      this.registaMod = this.reactiveFormMod.value.registaMod;
      this.durataMod = this.reactiveFormMod.value.durataMod;
      this.categoriaMod = this.reactiveFormMod.value.categoriaMod;
      this.annoMod = this.reactiveFormMod.value.annoMod;
      this.tramaMod = this.reactiveFormMod.value.tramaMod;
      this.episodiMod = this.reactiveFormMod.value.episodiMod;
      this.stagioniMod = this.reactiveFormMod.value.stagioniMod;

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
      if (this.episodiMod !== null && this.episodiMod > 0) {
        formData.append('episodi', this.episodiMod.toString())
      }
      if (this.stagioniMod !== null && this.stagioniMod > 0) {
        formData.append('stagioni', this.stagioniMod.toString())
      }
      if (this.daCaricare !== null) {
        for (let i = 0; i < this.daCaricare.length; i++) {
          formData.append('filesDaCaricare[]', this.daCaricare[i])
        }
      }
      formData.append('_method', 'PUT');
      const obs$ = this.obsModificaSerie(this.IdCorr, formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione modifica serie', ritorno)
          this.fileOk = ritorno

          //devo ricreare la card
          const card2 = {
            idSerie: ritorno.idSerie,
            titolo: ritorno.titolo,
            durata: ritorno.durata,
            stagioni: ritorno.stagioni,
            episodi: ritorno.episodi,
            regista: ritorno.regista,
            categoria: ritorno.categoria,
            anno: ritorno.anno,
            trama: ritorno.trama,
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
  // //funzione per creare un osservatore per modifica serie
  obsModificaSerie(id: number, dati: FormData) {
    return this.api.putSerieVisualizzato(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }
  public apriModifica(id: number): void {
    console.log("ID serie",  this.IdCorr, this.id)
    this.reactiveFormMod = this.impostaForm()
    if(this.id !== null){
        this.IdCorr = parseInt(this.id)
    }
  

    let serie = this.seriesTv.find(elemento => elemento.idSerie === this.IdCorr)
    this.openEnd(this.contentModifica)
  }

  //PER ILIMINARE UNA SERIE
  eliminaSerie() {
    console.log('sono in elimina serie', this.id)
    if (this.id !== null && this.id !== undefined) {
      console.log("Film da eliminare", this.id)
      this.obsEliminaSerie(this.idSerie).subscribe(this.osservatoreDelete)
    } else {
      console.error('Id non valido')
    }
  }

  //funzione per creare un osservatore per elimina categoria
  obsEliminaSerie(id: number) {
    const idSerie = this.id
    console.log('iD in OBS elimina serie', idSerie)
    return this.api.deleteSerieTv(idSerie!.toString()).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      takeUntil(this.distruggi$)
    )

  }

  private osservatoreDelete = {
    next: () => {
      console.log('SerieTv Eliminata!')
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
  eliminaFile(file: File): void {
    this.daCaricare.splice(this.daCaricare.indexOf(file), 1)
    console.log('Elimino Dati', this.daCaricare)
  }



  ricaricaPagina() {
    window.location.reload();
  }
}

