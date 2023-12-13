import { Component, Input, OnInit } from '@angular/core';
import { Card } from 'src/app/Type/Card.type';
import { FilmVisualizzato } from 'src/app/Type/FilmVisualizzato.type';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit{
 
  @Input('opzioni') card!:Card;
  
  @Input('optzFilm') film!:FilmVisualizzato;


  ngOnInit() {
    
  }


  clickButton(id:number|null):void{
    console.log("Valore ID " +id)
  }
}
