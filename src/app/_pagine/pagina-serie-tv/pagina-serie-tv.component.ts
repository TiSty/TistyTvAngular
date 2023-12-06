import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, delay, map } from 'rxjs';
import { IRispostaServer } from 'src/app/Interfacce/IRispostaServer';
import { SerieTv } from 'src/app/Type/SerieTv.type';
import { ApiService } from 'src/app/_servizi/api.service';

@Component({
  selector: 'pagina-serie-tv',
  templateUrl: './pagina-serie-tv.component.html',
  styleUrls: ['./pagina-serie-tv.component.scss']
})
export class PaginaSerieTvComponent implements OnInit {
 //richiamo per tirare fuori la singola (risorsa) categoria tramite l'id
 id: string | null = null
 risorsa:SerieTv|null=null

 serieTv$!: Observable<IRispostaServer>;

 constructor(private route: ActivatedRoute, private api: ApiService) {
   this.id = this.route.snapshot.paramMap.get("id")
   console.log("ID", this.id)
   if (this.id !== null) {
     this.serieTv$ = this.api.getSerieTv(this.id)
   }

 }

 ngOnInit(): void {
   this.serieTv$.pipe(
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
