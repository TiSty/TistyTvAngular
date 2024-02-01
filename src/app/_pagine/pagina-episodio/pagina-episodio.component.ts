import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { EpisodioVisualizzato } from 'src/app/Type/EpisodioVisualizzato.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';

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
  card!: EpisodioVisualizzato
  IdCorr = 0
  idEpisodio!: number

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''

  selectedFile: File | undefined;
  fileContent: string | undefined;

  private distruggi$ = new Subject<void>()


  constructor(private route: ActivatedRoute, private api: ApiService, private httpClient: HttpClient) {
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)

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
          alt: elementi.alt,
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
          trailer: elementi.trailer,
          src: elementi.src,
        }
      },
      errore: (err: any) => console.error("ERRORE in osservoepisodio", err),
      complete: () => console.log("%c COMPLETATO episodio", "color:#00aa00")
    }

  }


  ngOnInit(): void {
    if (this.id !== null) {
      this.route.paramMap.subscribe((ritorno) => {
        if (ritorno.get('id') !== null) {
          const id = ritorno.get('id') as string;
          const episodio$ = this.api.getEpisodio(id);
          episodio$.subscribe(this.osservoEpisodio())

          const elencoEpisodio$ = this.api.getEpisodiDaSerie(parseInt(id))       //DA APPROFONDIRE PERCHE
          elencoEpisodio$.pipe(delay(1000)).subscribe(this.osservoEpisodi())    // MI RICARCA SEMPRE UN SACCO DI EPISODI
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }


  //FUNZIONE PER MODIFICARE L'EPISODIO
  titolo = ''
  serieTv = ''
  durata!: number
  anno!: number
  trama = ''
  stagione!: number
  datiEp = ''
  src = ''
  modificaEpisodio() {
    console.log("Sono in modifica episodio", this.IdCorr)
    const parametro: Partial<EpisodioVisualizzato> = {
      serieTv: this.card.serieTv,
      titolo: this.card.titolo,
      durata: this.card.durata,
      stagione: this.card.stagione,
      datiEp: this.card.datiEp,
      anno: this.card.anno,
      trama: this.card.trama,
      trailer: this.card.trailer,
      src: this.card.src
    }
    this.obsModificaEp(this.IdCorr, parametro).subscribe(this.osservatoreMod)
  }


  //funzione per creare un osservatore per modifica SerieTv
  obsModificaEp(id: number, dati: Partial<EpisodioVisualizzato>) {
    let idEpisodio = this.id
    console.log('ID in obsModificaEp:', idEpisodio);
    return this.api.putEpisodioVisualizzato(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }

  private osservatoreMod = {
    next: () => {
      console.log('episodio Modificato!')
    },
    error: (err: string) => console.error('impossibile modificare episodio', err),
    complete: () => console.log("Completato"),
  }
  public apriModifica(id: number): void {
    console.log("ID FILM", this.id)
    this.IdCorr = id

    let episodio = this.episodi.find(elemento => elemento.idEpisodio === this.IdCorr)
    if (episodio !== undefined && episodio.titolo !== null && episodio.titolo !== undefined &&
      episodio.durata !== null && episodio.durata !== undefined &&
      episodio.stagione !== null && episodio.stagione !== undefined &&
      episodio.datiEp !== null && episodio.datiEp !== undefined &&
      episodio.anno !== null && episodio.anno !== undefined &&
      episodio.trama !== null && episodio.trama !== undefined &&
      episodio.trailer !== null && episodio.trailer !== undefined &&
      episodio.src !== null && episodio.src !== undefined) {

      this.titolo = episodio.titolo,
        this.serieTv = episodio.serieTv,
        this.durata = episodio.durata,
        this.anno = episodio.anno,
        this.trama = episodio.trama,
        this.stagione = episodio.stagione,
        this.datiEp = episodio.datiEp,
        this.src = episodio.src
    }
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
    next: () => console.log('Episodio Eliminato!'),
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
          this.elencoEpisodi.push(card)
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
        durata: this.card.durata,
        stagione: this.card.stagione,
        datiEp: this.card.datiEp,
        anno: this.card.anno,
        trama: this.card.trama,
        src: this.card.src
      };

      // Invia la richiesta HTTP POST al server
      this.httpClient.post('http://localhost:4200/api/v1/episodio', payload)
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
