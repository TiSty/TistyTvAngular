import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Utente } from 'src/app/Type/Utente.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

@Component({
  selector: 'menu-principale',
  templateUrl: './menu-principale.component.html',
  styleUrls: ['./menu-principale.component.scss'],
})
export class MenuPrincipaleComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  idUtente!: number
  utente: any
  gianni: string |null = 'ospite'
  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, private utility: UtilityService, private auth: AuthService) {
    // utility.getUtente().subscribe(sub => {
    //   console.log('DI UTENTE NOME ', sub)
    //   if (sub !== null) {
    //     this.gianni = sub
    //   }

    // })
  }


  ngOnInit(): void {
    if(this.auth.leggiAuthDaLocalStorage()!==null){
        this.gianni=this.auth.leggiAuthDaLocalStorage().nome
    }


    this.subscription = this.recuperaId().subscribe({
      next: (rit: any) => {
        // Gestisci la risposta
        console.log('ID utente recuperato:', rit);
        this.idUtente = rit
      },
      error: (err: any) => {
        console.error('Errore in recupera id', err);
      },
      complete: () => {
        console.log('Completato');
      }
    });
  }
  ngOnDestroy(): void {
    // Assicurati di disporre della sottoscrizione quando il componente viene distrutto
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  //CREARE FUNZIONE CHE AL CLICK PER ANDARE IN PAGINA UTENTE RECUPERI L'ID
  recuperaId() {
    // Restituisci direttamente l'observable ottenuto da getIdUtente()
    return this.api.getIdUtente();
  }


  //PER IL FORM DI RICERCA
  cerca() {
    const cercaTitolo = document.getElementById('cercaInput');
    return false;
  }
}
