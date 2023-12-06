import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { sha512 } from 'js-sha512';
import { BehaviorSubject, Observable, Observer, catchError, delay, of, take } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Form1 } from 'src/app/Type/Form1.type';
import { Form2 } from 'src/app/Type/Form2.type';
import { Utente } from 'src/app/Type/Utente.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { RegistrazioneService } from 'src/app/_servizi/registrazione.service';

@Component({
  selector: 'credenziali',
  templateUrl: './credenziali.component.html',
  styleUrls: ['./credenziali.component.scss']
})
export class CredenzialiComponent implements OnInit {

  //variabile per lo stato del bottone della password
  mostraPassword = false;
  reactiveForm: FormGroup
  utente: BehaviorSubject<Utente>
 

  constructor(
    private fb: FormBuilder,
    private utenteService: RegistrazioneService,
    private api: ApiService,
    private router: Router
  ) {
    this.reactiveForm = this.fb.group({
      //validazioni
      'user': ['', [Validators.required, Validators.email, Validators.minLength(5), Validators.maxLength(40)]],
      'password': ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    })
    this.utente = this.utenteService.leggiObsUtente()
    console.log("Utente", this.utente)
  }

  ngOnInit() {

  }

  //funzioni di verifica
  registraDati(): void {
    console.log("sono passato per registra dati del form2")
    //verifica al form
    if (this.reactiveForm.invalid) {
      console.log("Dati non validi")
    } else {
      let user = this.reactiveForm.controls["user"].value
      let password = this.reactiveForm.controls["password"].value
      
      let sale = this.generaSale(16);

      let form1json = localStorage.getItem("form1");
      let form1

      if(form1json !== null){
        form1=JSON.parse(form1json);
      }else{
        console.error("dati non validi nel json1")
      }
      console.log("Dati del form1" , form1)
  
      //creo l'oggetto dati utente
      let form2: Form2 = {
        idUtente: null,
        user: sha512(user),
        password: sha512(password),
        sale: sale,
      };

     
      //creo la stringa json dall'oggetto form2
      let form2json = JSON.stringify(form2);

      //salvo i dati nel local
      localStorage.setItem("form2", form2json);

      console.log("Dati del form2: ", form2)



      this.obsRegistrazione(form1, form2).subscribe(this.osservoRegistrazione)
    }
  }


  //observable
  private obsRegistrazione(form1: Form1, form2: Form2): Observable<IRispostaServer> {
    return this.api.registra(form1, form2).pipe(
      delay(1000),
      take(1),
      catchError((err, caught) => {
        console.log("errore", err, caught)
        const nuovo: IRispostaServer = {
          data: null,
          message: "ERRORE NELLA REGISTRAZIONE",
          error: err
        }
        return of(nuovo)
      }),
    )
  }

  //osservatore
  private osservoRegistrazione() {
    const osservatore: Observer<any> = {
      next: (rit: IRispostaServer) => {
        console.log("RITORNO", rit)
        //reindirizzamento
        this.router.navigateByUrl('accedi')
      },
      error: (err) => {
        console.log("ERRORE in osservoRegistrazione", err)
      },
      complete: () => {
        console.log("COMPLETATO")
      }
    }
    return osservatore
  }






  //funzione per mostrare le password
  gestisciPassword() {
    this.mostraPassword = !this.mostraPassword; // Cambia lo stato del bottone
    const inputPsw = document.querySelectorAll<HTMLInputElement>('input[type="password"]');
    inputPsw.forEach((psw) => {
      psw.type = this.mostraPassword ? 'text' : 'password';
    });
  }

  //funzione per generare un sale casuale
  generaSale(length: number): string {
    const caratteri = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sale = '';
    for (let i = 0; i < length; i++) {
      const indiceCasuale = Math.floor(Math.random() * caratteri.length);
      sale += caratteri.charAt(indiceCasuale);
    }
    return sale;
  }



}





