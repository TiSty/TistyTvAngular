import { Component } from '@angular/core';
import { Utente } from 'src/app/Type/Utente.type';

@Component({
  selector: 'pagina-profilo',
  templateUrl: './pagina-profilo.component.html',
  styleUrls: ['./pagina-profilo.component.scss']
})
export class PaginaProfiloComponent {
  dati:Utente={
    nome:'',
    cognome:'',
    dataNascita:'',
    sesso:0 , 
    residenza: '',
    domicilio: '',
    cittadinanza: '',
    ragioneSociale: 0,
  }

  constructor(){
    //creare un apiGEtPRofilo che ritorna i dati
  }


}
