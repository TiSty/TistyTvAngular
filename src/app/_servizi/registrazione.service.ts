import { Injectable } from '@angular/core';
import { Utente } from '../Type/Utente.type';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrazioneService {

  static utente: Utente
  //serve per inviare l'oggetto di registrazione ovvero l'oggetto utente con i dati corretti a tutte le pagine dell'applicazione
  private obsUtente$: BehaviorSubject<Utente>
  constructor() {
    //verifico se esiste l'utente
    RegistrazioneService.utente = this.leggiUtenteDalLocalStorage()
    this.obsUtente$ = new BehaviorSubject<Utente>(RegistrazioneService.utente)
  }



  //funzione per leggere l'observable
  leggiObsUtente(){
    return this.obsUtente$
  }
  
  //funzione per emettere il dato che deve arrivare a tutti i componenti
  settaObsUtente(dati:Utente):void{
    RegistrazioneService.utente=dati
    this.obsUtente$.next(dati)
  }




  /**
   * funzione per scrivere i dati (utente) nel local Storage
   * @param utente 
   */
  scriviUtenteSuLocalStorage(utente: Utente): void {
    const tmp: string = JSON.stringify(utente)
    localStorage.setItem("utente", tmp)
  }

  /**
   * funzione per leggere i dati su local storage (verifica di un utente esistente)
   * @returns  un oggetto utente
   */
  leggiUtenteDalLocalStorage():Utente{
    const tmp:string|null = localStorage.getItem("utente")
    let utente:Utente
    if(tmp!==null){
      utente=JSON.parse(tmp)
    } else{
      utente={
        nome:  null,
        cognome:  null,
        dataNascita:  null,
        sesso:  null,
        residenza:  null,
        domicilio:  null,
        ragioneSociale:null,
        cittadinanza:null,

      }
    }
    return utente
  }

}
