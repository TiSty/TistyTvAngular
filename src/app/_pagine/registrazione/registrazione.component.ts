import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Form1 } from 'src/app/Type/Form1.type';
import { Utente } from 'src/app/Type/Utente.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { RegistrazioneService } from 'src/app/_servizi/registrazione.service';

@Component({
  selector: 'registrazione',
  templateUrl: './registrazione.component.html',
  styleUrls: ['./registrazione.component.scss']
})
export class RegistrazioneComponent implements OnInit {

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
      'nome': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      'cognome': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      'dataNascita': ['', [Validators.required]],
      'sesso': ['', [Validators.required]],
      'residenza': ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      'domicilio': ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      'cittadinanza': ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      'ragioneSociale': ['', [Validators.required]],
    })
    this.utente = this.utenteService.leggiObsUtente()
    console.log("Utente", this.utente)
  }

  ngOnInit() {

  }


  //FUNZIONI DI VERIFICA
  registraDati():void {
    console.log("sono passato per registraDati del form1")
    //verifica al form
    if (this.reactiveForm.invalid) {
      console.log("Dati non validi")
    } else {
      let nome = this.reactiveForm.controls["nome"].value
      let cognome = this.reactiveForm.controls["cognome"].value

      let dataNascita = this.reactiveForm.controls["dataNascita"].value
      let sesso = this.reactiveForm.controls["sesso"].value

      let residenza = this.reactiveForm.controls["residenza"].value
      let domicilio = this.reactiveForm.controls["domicilio"].value

      let cittadinanza = this.reactiveForm.controls["cittadinanza"].value
      let ragioneSociale = this.reactiveForm.controls["ragioneSociale"].value

      //creo l'oggetto dati utente
      let form1: Form1 = {
        nome: nome,
        cognome: cognome,
        dataNascita: dataNascita,
        sesso: sesso,
        residenza:residenza,
        domicilio: domicilio,
        ragioneSociale: ragioneSociale,
        cittadinanza: cittadinanza,
      };
      
      //creo la stringa json dall'oggetto form1
      let form1json = JSON.stringify(form1);
      //salvo i dati nel local
      localStorage.setItem("form1", form1json);
      
      // console.log("Dati:", form1)

      // this.api.registrazioneUtente(form1)

      this.router.navigateByUrl('/credenziali')
    }

  }

 


}




//LOGICA PER RECUPERARE L'ID APPENA REGISTRATO
// utenteRegistrato:any
// this.api.registrazioneUtente(datiUtente).subscribe((risposta)=> {
//   this.utenteRegistrato = risposta;
//   if (this.utenteRegistrato.idUtente) {
//     const idUtente = this.utenteRegistrato.idUtente;
//     console.log('IdutenteRrgistrato:', idUtente);
//     console.log("Dati:", datiUtente);
//     localStorage.setItem('idUtente:', idUtente);
//     this.router.navigateByUrl('/credenziali')
//   } else {
//     alert('errore!')
//   }
// });
// //creo la stringa json dall'oggetto datiutente
// let datiUtenteJSON = JSON.stringify(datiUtente);
// //salvo i dati nel local
// localStorage.setItem("datiUtente", datiUtenteJSON);



