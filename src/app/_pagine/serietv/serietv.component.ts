import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'serietv',
  templateUrl: './serietv.component.html',
  styleUrls: ['./serietv.component.scss']
})

export class  SerietvComponent implements OnInit {

  elencoSeriesTv$: Observable<IRispostaServer>;
  dati: SerieTv[]=[]

  constructor(private api: ApiService) {
    this.elencoSeriesTv$ = this.api.getSeriesTv()
  }

  ngOnInit(): void {
    this.elencoSeriesTv$.pipe(
      map(x => x.data)
    ).subscribe({
      next: x => this.dati=x
    })
  }

}
