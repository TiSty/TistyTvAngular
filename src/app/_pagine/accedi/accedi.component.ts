import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Observer, Subject, catchError, delay, of, take, takeUntil } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Auth } from 'src/app/Type/Auth.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

@Component({
  selector: 'app-accedi',
  templateUrl: './accedi.component.html',
  styleUrls: ['./accedi.component.scss']
})
export class AccediComponent implements OnInit, OnDestroy {

  reactiveForm: FormGroup
  //variabile che richiama il subject dell'api service
  auth: BehaviorSubject<Auth>
  //per l'eliminazione dei dati
  private distruggi$ = new Subject<void>()
  //per fare un elemento grafico per il processo di invio dati (loading dati)
  stoControllando: boolean = false



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private api: ApiService,
    private router: Router
  ) {
    this.reactiveForm = this.fb.group({
      'user': ['', [Validators.required, Validators.email, Validators.minLength(5), Validators.maxLength(40)]],//validazioni
      'password': ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    })

    this.auth = this.authService.leggiObsAuth()
    console.log("AUTH", this.auth)
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.distruggi$.next()
  }

  accedi(): void {
    //uniamo osservable e osservatore
    if (this.reactiveForm.invalid) {
      console.log("Form non valido")
    } else {
      let user = this.reactiveForm.controls["user"].value
      let password = this.reactiveForm.controls["password"].value

      this.stoControllando = true //fa il caricamento

      this.obsLogin(user, password).subscribe(this.osservoLogin())
      console.log("Accedi", user, password)

    }
  }

  //funzione per creare l'observable che chiama il login   (richiamo dell'osservable)
  private obsLogin(user: string, password: string): Observable<IRispostaServer> {
    return this.api.login(user, password).pipe(
      delay(1000),
      take(1),
      catchError((err, caught) => {
        console.log("errore", err, caught)
        const nuovo: IRispostaServer = {
          data: null,
          message: "ERRORE LOGIN",
          error: err
        }
        return of(nuovo)
      }),
      takeUntil(this.distruggi$)
    )
  }

  //funzione per creare l'osservatore (observer)
  private osservoLogin() {
    const osservatore: Observer<any> = {

      next: (rit: IRispostaServer) => {
        console.log("RITORNO", rit)
        if (rit.data !== null && rit.message !== null) {
          const tk: string = rit.data.tk

          const contenutoToken:any = UtilityService.leggiToken(tk)

          const auth: Auth = {
            token: tk,
            nome: contenutoToken.data.nome,
            idRuolo: contenutoToken.data.idRuolo,
            idStato: contenutoToken.data.idStato,
            idUtente: contenutoToken.data.idUtente,
            potere: contenutoToken.data.potere
          }
          
          this.authService.settaObsAuth(auth)
          this.authService.scriviAuthSuLocalStorage(auth)
          //posso mettere anche delle rotte per il reindirizzamento
          this.router.navigateByUrl('/paginaPrincipale')
        }
      },


      error: (err) => {
        console.log("ERRORE", err)
        const auth: Auth = {
          token: null,
          nome: null,
          idRuolo: null,
          idUtente: null,
          idStato: null,
          potere: null,
        }
        this.authService.settaObsAuth(auth)
        this.stoControllando = false //per il caricamento
      },
      complete: () => {
        this.stoControllando = false //per il caricamento
        console.log("COMPLETATO")
      }
    }
    return osservatore
  }



}
