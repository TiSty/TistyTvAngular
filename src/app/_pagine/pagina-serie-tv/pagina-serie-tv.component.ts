import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { serieTvVisualizzata } from 'src/app/Type/serieTvVisualizzata.type';
import { ApiService } from 'src/app/_servizi/api.service';

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
  card!: serieTvVisualizzata
  IdCorr = 0
  idSerie!: number

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;

  private distruggi$ = new Subject<void>()

  constructor(private route: ActivatedRoute, private api: ApiService, private httpClient: HttpClient) {
    this.elencoSerieTv$ = this.api.getSeriesTv()
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      console.log("SONO NEL RAMO IF")
      this.episodio$ = this.api.getEpisodiDaSerie(parseInt(this.id));
    }
  }

  //OBSERVER SERIE TV SIGNOLA
  private osservoSerieTv() {

    return {
      next: (rit: IRispostaServer) => {
        const elementi = rit.data
        console.log("DATI DI: osservo SerieTv", elementi)
        // for (let i = 0; i < elementi.length; i++) {
        const tmpImg: Immagine = {
          src: elementi.src,
          alt: elementi.alt,
        }
        //SE SERVE DECOMMENTA AL BOTTONE
        const bott: Bottone = {
          testo: "Vai alla Serie",
          title: "Visualizza " + elementi.nome,
          tipo: "button",
          emitId: null,
          link: "/serieTv/" + elementi.idSerieTv
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
          trailer: elementi.trailer,
          src: elementi.src,
        }


        // }
      },
      errore: (err: any) => console.error("ERRORE in osservoSerieTv", err),
      complete: () => console.log("%c COMPLETATO serieTv", "color:#00aa00")
    }
  }



  ngOnInit(): void {
    if (this.id !== null) {
      this.route.paramMap.subscribe((ritorno) => {
        if (ritorno.get('id') !== null) {
          const id = ritorno.get('id') as string;
          this.serieTv$ = this.api.getSerieTv(id);
          this.serieTv$.subscribe(this.osservoSerieTv());
        }
      })
    }
    const episodi$ = this.api.getEpisodi();      //DFA MODIFICARE PE4RCHE SI VEDONO T
    episodi$.subscribe(this.osservoEpisodi());   //TUTTI GLI EP AL POSTO DI SOLO QUELLI INTERESSATI

    this.elencoSerieTv$.pipe(delay(1000)).subscribe(this.osservoSeriesTv())
  }
  ngOnDestroy(): void {
    this.distruggi$.next()
  }


  elencoSerieTv$: Observable<IRispostaServer>
  elencoSeriesTv: Card[] = []

  //OBSERVER ELENCO SERIE
  private osservoSeriesTv() {
    return {
      next: (rit: IRispostaServer) => {
        console.log("DATI DI:osservo SerieSTv", rit)
        const elementi = rit.data
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
            id: elementi[i].idSerieTv,
            immagine: tmpImg,
            testo: elementi[i].trama,
            titolo: elementi[i].titolo,
            bottone: bott
          }
          this.elencoSeriesTv.push(card)
        }
      },
      error: (err: any) => { console.log("ERRORE in osservoFilm", err) },
      complete: () => { console.log("%c COMPLETATO seriesTv", "color:#00aa00") }
    }
  }


  episodii: Card[] = []
  episodio$!: Observable<IRispostaServer>;
  //OBSERVER
  private osservoEpisodi() {
    return {
      next: (rit: IRispostaServer) => {
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
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoEpisodi", err),
      complete: () => console.log("%c COMPLETATO episodi", "color:#00aa00")
    }
  }


  //PER MODIFICARE LA SERIE TV
  titolo = ''
  durata!: number
  episodi!: number
  stagioni!: number
  regista = ''
  categoria = ''
  anno!: number
  trama = ''
  trailer = ''
  src = ''


  modificaSerie() {
    console.log("Sono in modifica serie id", this.id)
    console.log('Dati da modificare:', this.card);
    const parametro: Partial<serieTvVisualizzata> = {
      titolo: this.card.titolo,
      durata: this.card.durata,
      stagioni: this.card.stagioni,
      episodi: this.card.episodi,
      regista: this.card.regista,
      categoria: this.card.categoria,
      anno: this.card.anno,
      trama: this.card.trama,
      trailer: this.card.trailer,
      src: this.card.src
    }
    this.obsModificaSerieTv(this.IdCorr, parametro).subscribe(this.osservatoreMod)
  }


  //funzione per creare un osservatore per modifica SerieTv
  obsModificaSerieTv(id: number, dati: Partial<serieTvVisualizzata>) {
    let idSerie = this.id
    console.log('ID in obs modifica serie', idSerie)
    return this.api.putSerieTvVisualizzata(parseInt(idSerie!), dati).pipe(
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
    error: (err: string) => console.error('impossibile modificare serie tv', err),
    complete: () => console.log("Completato"),
  }


  public apriModifica(id: number): void {
    console.log("ID serie", this.id)
    this.IdCorr = id

    let serie = this.seriesTv.find(elemento => elemento.idSerie === this.IdCorr)
    if (serie !== undefined && serie.titolo !== null && serie.titolo !== undefined &&
      serie.durata !== null && serie.durata !== undefined &&
      serie.episodi !== null && serie.episodi !== undefined &&
      serie.stagioni !== null && serie.stagioni !== undefined &&
      serie.regista !== null && serie.regista !== undefined &&
      serie.categoria !== null && serie.categoria !== undefined &&
      serie.anno !== null && serie.anno !== undefined &&
      serie.trama !== null && serie.trama !== undefined &&
      serie.trailer !== null && serie.trailer !== undefined &&
      serie.src !== null && serie.src !== undefined) {

      this.titolo = serie.titolo,
        this.durata = serie.durata,
        this.episodi = serie.episodi,
        this.stagioni = serie.stagioni,
        this.regista = serie.regista,
        this.categoria = serie.categoria,
        this.anno = serie.anno,
        this.trama = serie.trama
        this.trailer = serie.trailer,
        this.src = serie.src
    }
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
    next: () => console.log('Serie Eliminata!'),
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
        titolo: this.card.titolo,
        regista: this.card.regista,
        durata: this.card.durata,
        stagioni: this.card.stagioni,
        episodi: this.card.episodi,
        categoria: this.card.categoria,
        anno: this.card.anno,
        trama: this.card.trama,
        trailer: this.card.trailer,
        src: this.card.src
      };

      // Invia la richiesta HTTP POST al server
      this.httpClient.post('http://localhost:4200/api/v1/serieTv', payload)
        .subscribe(response => {
          console.log('File caricato con successo', response);
        }, error => {
          console.error('Errore durante il caricamento del file', error);
        });
    }
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




}
