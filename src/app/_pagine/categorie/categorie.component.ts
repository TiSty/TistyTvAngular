
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Observer, Subject, delay, map, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from 'src/app/_servizi/utility.service';


@Component({
  selector: 'categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})

export class CategorieComponent implements OnInit, OnDestroy {

  @ViewChild('contentModifica') contentModifica!: TemplateRef<any>
  elencoCategorie$: Observable<IRispostaServer>
  categorie: Card[] = []
  categoria!: Categorie
  idSel = 0;

  selectedFile: File | undefined;
  fileContent: string | undefined;

  private distruggi$ = new Subject<void>()

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = ''


  cardMod!: Categorie

  nomeCategoria: string = ''
  srcCategoria: string = ''
  idCategoria!: number;

  reactiveForm: FormGroup



  constructor(private api: ApiService, private route: ActivatedRoute, private httpClient: HttpClient, private fb: FormBuilder,) {
    this.elencoCategorie$ = this.api.getCategorie()

    this.reactiveForm = this.fb.group({
      'nomeCategoria': [null, [Validators.required, Validators.maxLength(60)]],
      'srcCategoria': ['', []],
    })
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
            id: elementi[i].idCategoria,
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
    const formData: FormData = new FormData
    for (let i = 0; i < this.daCaricare.length; i++) {
      formData.append("filesDaCaricare[]", this.daCaricare[i])
    }
    const obs$ = this.inviaImg(formData).subscribe(
      {
        next: (ritorno) => { console.log("Ritorno dell'immagine", ritorno) },
        error: (err) => console.error(err),
        complete: () => console.log("completato")
      }
    )
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
        const newCard: Card = { id: ritorno.idCategoria, titolo: ritorno.nome, immagine: { src: ritorno.src, alt: '' } }
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
    console.log("Sono in Modifica categoria")
    const parametro: Partial<Categorie> = { nome: this.nomeCategoria, src: this.srcCategoria }
    const id: number = this.idSel
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

  public apriModifica(id: number): void {
    console.log("ID;", id, this.categorie);
    this.idSel = id;

    let cat = this.categorie.find(elemento => elemento.id == this.idSel);

    if (cat !== undefined && cat.titolo !== null && cat.titolo !== undefined && cat.immagine !== null && cat.immagine !== undefined) {
      this.nomeCategoria = cat.titolo;
      this.srcCategoria = cat.immagine.src;
    }
    this.openEnd(this.contentModifica)
  }



  //PER ELIMINARE UNA CATEGORIA
  eliminaCategoria(id: number) {
    console.log("Sono in elimina Categoria", id)
    if (id !== null && id !== undefined) {
      id = this.idSel
      console.log("Categoria eliminata", id)
      this.obsEliminaCategoria(this.idSel).subscribe(this.osservatoreDelete)//l'osservatore VA PERSONALIZZATO
    } else {
      console.error('Id non valido')
    }
  }
  //funzione per creare un osservatore per elimina categoria
  obsEliminaCategoria(id: number) {
    id = this.idSel
    return this.api.deleteCategorie(id.toString()).pipe(
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





  //PER INSERIRE IL FILE DI TIPO SRC
  errore: string = ''
  readonly maxFileNumber: number = 1
  readonly maxFileSize: number = 1
  daCaricare: File[] = []

  //funzione che richiama l'observable della funzione apiService per Upload 
  inviaImg(dati: FormData): Observable<any> {
    // let formData: FormData = UtilityService.impostaFormData(nuovo);
    // if (this.srcCategoria !== null) formData.append('Image', this.srcCategoria);
    // formData.append('_method', "PUT");
    // this.obsAddCategoria(??).subscribe(this.osservatore);
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
        nomeCategoria: this.nomeCategoria,
        srcCategoria: this.fileContent
      };

      // Invia la richiesta HTTP POST al server
      this.httpClient.post('http://localhost:4200/api/v1/categorie', payload)
        .subscribe(response => {
          console.log('File caricato con successo', response);
        }, error => {
          console.error('Errore durante il caricamento del file', error);
        });
    }
  }







  // let formData: FormData = UtiliService.impostaFormData(nuovo);
  // if (this.img !== null) formData.append('Image', this.img);
  // if (this.img2 !== null) formData.append('Image2', this.img2);
  // if (this.video !== null) formData.append('Video', this.video);
  // formData.append('_method', "PUT");
  // this.obsModifica(this.datiFilm.idFilm, formData).subscribe(this.osservoModifica());





}






