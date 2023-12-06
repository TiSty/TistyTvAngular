import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, delay, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { Film } from 'src/app/Type/Film.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-film',
  templateUrl: './pagina-film.component.html',
  styleUrls: ['./pagina-film.component.scss']
})
export class PaginaFilmComponent implements OnInit{
  //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
  id: string | null = null
  risorsa:Film|null=null

  film$!: Observable<IRispostaServer>;

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.id = this.route.snapshot.paramMap.get("id")
    console.log("ID", this.id)
    if (this.id !== null) {
      this.film$ = this.api.getFilm(this.id)
    }

  }

  ngOnInit(): void {
    this.film$.pipe(
      map(x => x.data),
      delay(1000),
    ).subscribe({
      next: x => {
        console.log(x)
        this.risorsa = x
      }
    })
  }

}
