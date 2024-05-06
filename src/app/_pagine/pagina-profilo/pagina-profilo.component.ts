import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Utente } from 'src/app/Type/Utente.type';
import { ApiService } from 'src/app/_servizi/api.service';
import { AuthService } from 'src/app/_servizi/auth.service';
import { UtilityService } from 'src/app/_servizi/utility.service';

@Component({
  selector: 'pagina-profilo',
  templateUrl: './pagina-profilo.component.html',
  styleUrls: ['./pagina-profilo.component.scss']
})
export class PaginaProfiloComponent implements OnInit {
  idUtente: string | null = null
  utente: Utente | undefined;

  constructor(private api: ApiService, private route: ActivatedRoute, private utility:UtilityService, private authService:AuthService, private router: Router) {
    // this.idUtente = this.route.snapshot.paramMap.get("id");
    // console.log('IdUtente', this.idUtente);

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idUtente = params.get('id');
      if (this.idUtente !== null) {
        this.visualizzaDati();
      }
    });
  }

  private visualizzaDati(): void {
    console.log('Sono in visualizzaProfilo');
    if (this.idUtente !== null) {
      this.api.getUtente(parseInt(this.idUtente)).subscribe({
        next: (response: IRispostaServer) => {
          const elementi = response.data;
          this.utente = {
            nome: elementi.nome,
            cognome: elementi.cognome,
            dataNascita: elementi.dataNascita,
            sesso: elementi.sesso,
            residenza: elementi.residenza,
            domicilio: elementi.domicilio,
            cittadinanza: elementi.cittadinanza,
            ragioneSociale: elementi.ragioneSociale
          };
          // this.utility.setUtente(this.utente)
        },
        error: (err: any) => console.error('ERRORE in visualizzaDati', err),
        complete: () => console.log('COMPLETATO visualizzaDati')
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}