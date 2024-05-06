
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Observer, Subject, concatMap, delay, map, switchMap, take, takeUntil, tap } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Bottone } from 'src/app/Type/Bottone.type';
import { Card } from 'src/app/Type/Card.type';
import { Categorie } from 'src/app/Type/Categorie.type';
import { Immagine } from 'src/app/Type/Immagine.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from 'src/app/_servizi/utility.service';
import { AuthService } from 'src/app/_servizi/auth.service';


@Component({
  selector: 'categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss'],
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

  nomeCategoria!: string
  imgCat!: Blob | null

  nomeFile!: string
  srcCategoria!: Blob | null
  idCategoria!: number;
  nomeCategoriaMod!: string
  srcCategoriaMod!: Blob | null

  reactiveFormAgg: FormGroup
  reactiveFormMod: FormGroup





  constructor(public auth: AuthService,private api: ApiService, private route: ActivatedRoute, private httpClient: HttpClient, private fb: FormBuilder, private service: UtilityService
  ) {

    console.log("AUTH", AuthService.auth)
    this.elencoCategorie$ = this.api.getCategorie();

    this.reactiveFormAgg = this.fb.group({
      'nomeCategoria': ['', [Validators.maxLength(60)]],
      'imgCat': ['', [Validators.required]]
    })

    this.reactiveFormMod = this.fb.group({
      'nomeCategoriaMod': ['', [Validators.maxLength(60)]],
      'imgCat': ['', []]
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

          const tmpImg: Immagine = {
            src: elementi[i].src,
            alt: elementi[i].alt
          }
          const bott: Bottone = {
            testo: "Vai alla Categoria",
            title: elementi[i].nome,
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


  //PER AGGIUNGERE/CREARE UNA CATEGORIA
  errore: string = ''
  readonly maxFileNumber: number = 2
  readonly maxFileSize: number = 2
  daCaricare: File[] = []
  fileOk: boolean = false

  aggiungiCategoria(form: HTMLFormElement): void {
    if (this.reactiveFormAgg.valid) {
      console.log('dati del form', this.reactiveFormAgg.value)
      const formData: FormData = new FormData()
      this.nomeCategoria = this.reactiveFormAgg.value.nomeCategoria;
      formData.append('nome', this.nomeCategoria)
      formData.append('imgCat[]', this.daCaricare[0])  // imgCat è IL NOME CON CUI ARRIVA AL SERVEr 
      this.obsAddCategoria(formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione aggiungiCategoria', ritorno)
          this.fileOk = ritorno
          //devo ricreare la card!!
          const tmpImg: Immagine = {
            src: UtilityService.urlServer() + ritorno.src,
            alt: ritorno.alt
          }
          const bott: Bottone = {
            testo: "Vai alla Categoria",
            title: ritorno.nome,
            tipo: "button",
            emitId: null,
            link: "/categorie/" + ritorno.idCategoria,
          }
          const card: Card = {
            id: ritorno.idCategoria,
            immagine: tmpImg,
            testo: '',
            titolo: ritorno.nome,
            bottone: bott
          }
          this.categorie.push(card)
        },
        error: (err) => {
          console.error('Errore in aggiungi', err)
        },
        complete: () => {
          console.log('Completato')
        }
      });
    } else {
      console.log('form non valido', this.reactiveFormAgg.errors)
    }
  }
  obsAddCategoria(dati: FormData) {
    return this.api.postCategoria(dati).pipe(
      take(1),
      tap(x => console.log("OBS addCategoria", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }



  //PER MODIFICARE UNA CATEGORIA
  modificaCategoria(form: HTMLFormElement): void {
    if (this.reactiveFormMod.valid) {
      const formData: FormData = new FormData()
      this.nomeCategoriaMod = this.reactiveFormMod.value.nomeCategoriaMod;
      formData.append('nome', this.nomeCategoriaMod)
      if (this.daCaricareMod.length > 0) {
        formData.append('imgCat', this.daCaricareMod[0])
      }
      formData.append('_method', 'PUT');
      const obs$ = this.obsModificaCategoria(this.idSel, formData).subscribe({
        next: (ritorno) => {
          console.log('ritorno della funzione Modifica Categoria', ritorno)
          this.fileOk = ritorno
          const tmpImg: Immagine = {
            src: UtilityService.urlServer() + ritorno.src,
            alt: ""
          }
          // Filtra l'array delle categorie per trovare quella con l'id corrispondente
          const categoriaDaModificare = this.categorie.filter(categoria => categoria.id === this.idSel)[0];
          if (categoriaDaModificare !== undefined) {
            categoriaDaModificare.titolo = ritorno.nome; // Aggiorna il nome della categoria
            categoriaDaModificare.immagine = tmpImg; // Aggiorna l'immagine della categoria
          }
        },
        error: (err) => {
          console.error('Errore in MODIFICA', err)
        },
        complete: () => {
          console.log('Completato')
        }
      });
    } else {
      console.log('form non valido', this.reactiveFormMod.errors)
    }
  }

  // //funzione per creare un osservatore per modifica categoria
  obsModificaCategoria(id: number, dati: FormData) {
    return this.api.putCategoria(id, dati).pipe(
      take(1),
      tap(x => console.log("OBS ", x)),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }

  public apriModifica(id: number): void {
    console.log("ID;", id, this.categorie);
    this.idSel = id;

    let cat = this.categorie.find(elemento => elemento.id == this.idSel);
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
    next: () => {
      console.log('Categoria Eliminata!');
      // Naviga alla stessa pagina dopo la modifica
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

  ricaricaPagina() {
    window.location.reload();
  }




  //funzione che richiama l'observable della funzione apiService per Upload 
  inviaImg(dati: FormData): Observable<any> {
    return this.api.upload(dati).pipe(
      tap(x => console.log('Dati tap per le immagini', x)),
      take(1),
      map(x => x.data),
      takeUntil(this.distruggi$)
    )
  }
  ctrlFileList(fileList: FileList): void {
    if (fileList !== null) {
      if (fileList.length > this.maxFileNumber) {
        this.errore = 'Puoi caricare' + this.maxFileNumber + 'immagine'
      } else {
        for (let i = 0; i < fileList.length; i++) {
          if (!this.ctrlEstensione(fileList[i].name, "jpg, jpeg")) {
            this.errore = fileList[i].name + 'non ha estensione corretta, solo JPEG'
            break
          }
          else if (!this.ctrlSize(fileList[i].size, this.maxFileSize)) {
            this.errore = fileList[i].name + 'il file è troppo grande(' + Math.round(fileList[i].size / (1024 * 1024)) + 'MB)'
            break
          }
          else if (!this.ctrlInArray(fileList[i])) {
            this.daCaricare.push(fileList[i])
          }
        }
        console.log('FILE INSERITI', this.daCaricare)
      }
    }
  }

  ctrlEstensione(nome: string, ext: string): boolean {
    const estensioniPermesse = ["jpg", "jpeg"]; // Aggiungi "jpeg" all'elenco delle estensioni permesse
    const tmp = nome.split(".");
    const estensione = tmp[tmp.length - 1].toLowerCase(); // Converte l'estensione in minuscolo per la comparazione
    return estensioniPermesse.includes(estensione); // Verifica se l'estensione è tra quelle permesse
  }

  ctrlSize(size: number, maxSizeMB: number): boolean {
    const tmp = maxSizeMB * 1024 * 1024
    return (size > tmp) ? false : true
  }
  ctrlInArray(file: File): boolean {
    return false
  }

  //PER L'AGGIUNTA
  onChangeInputFile2(e: Event): void {
    const elemento = e.currentTarget as HTMLInputElement
    let fileList: FileList | null = elemento.files
    if (fileList && fileList !== null) {
      console.log("FILE: ", fileList)
      this.ctrlFileList(fileList)
    }
  }


  daCaricareMod: File[] = []
  //PER LA MODIFICA
  onChangeInputFile(e: Event): void {
    const elemento = e.currentTarget as HTMLInputElement
    let fileList: FileList | null = elemento.files
    if (fileList && fileList !== null) {
      console.log("FILE: ", fileList)
      this.ctrlFileList2(fileList)
    }
  }


  ctrlFileList2(fileList: FileList): void {
    if (fileList !== null) {
      if (fileList.length > this.maxFileNumber) {
        this.errore = 'Puoi caricare' + this.maxFileNumber + 'immagine'
      } else {
        for (let i = 0; i < fileList.length; i++) {
          if (!this.ctrlEstensione(fileList[i].name, "jpg, jpeg")) {
            this.errore = fileList[i].name + 'non ha estensione corretta, solo JPEG'
            break
          }
          else if (!this.ctrlSize(fileList[i].size, this.maxFileSize)) {
            this.errore = fileList[i].name + 'il file è troppo grande(' + Math.round(fileList[i].size / (1024 * 1024)) + 'MB)'
            break
          }
          else if (!this.ctrlInArray(fileList[i])) {
            this.daCaricareMod.push(fileList[i])
          }
        }
        console.log('FILE INSERITI', this.daCaricareMod)
      }
    }
  }



}


