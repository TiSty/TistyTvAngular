import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Film } from 'src/app/Type/Film.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit {

  elencoFilms$: Observable<IRispostaServer>;
  dati: Film[]=[]

  constructor(private api: ApiService) {
    this.elencoFilms$ = this.api.getFilms()
  }

  ngOnInit(): void {
    this.elencoFilms$.pipe(
      map(x => x.data)
    ).subscribe({
      next: x => this.dati=x
    })
  }

}
