import { Injectable } from '@angular/core';
import { Auth } from '../Type/Auth.type';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //definialmo una variabile
  static auth:Auth
  //creo una variabile per observable
  private obsAuth$:BehaviorSubject<Auth> //serve per inviare l'oggetto di login ovvero l'oggetto auth con i dati corretti a tutte le pagine dell'applicazione

  constructor() { 
    //al primo login verifico se esiste il profilo
    AuthService.auth=this.leggiAuthDaLocalStorage()
    this.obsAuth$=new BehaviorSubject<Auth>(AuthService.auth)
  }

  //funzione per leggere l'observable
  leggiObsAuth(){
    return this.obsAuth$
  }
  //funzione per emettere il dato che deve arrivare a tutti i componenti
  settaObsAuth(dati:Auth):void{
    AuthService.auth=dati
    this.obsAuth$.next(dati)
  }





    /**
     * funzione per scrivere i dati (auth) dal local storage
     * @param auth  oggetto auth da scrivere 
     */
    scriviAuthSuLocalStorage(auth:Auth):void{
      const tmp:string=JSON.stringify(auth) //prendo il valore dal formato auth e diventa una stringa json
      localStorage.setItem("auth",tmp) //inserisco i dati nel local storage    si utilizza il modo chiave=auth | valore=tmp
    }

    /**
     * funzione per leggere i dati (se presenti) auth dal local storage
     * @returns un oggetto auth
     */
    leggiAuthDaLocalStorage():Auth{
      const tmp:string|null = localStorage.getItem("auth") //dato che sto cercando dal local storage(chaive=auth)
      let auth:Auth
      if(tmp!==null){
        auth=JSON.parse(tmp)
      } else {
        auth={
          idUtente:null,
          idRuolo:null,
          idStato:null,
          token:null,
          nome:null,
          potere:null
        }
      }
      return auth
    }
}
