import { Component, Input } from '@angular/core';
import { cardCarousel } from 'src/app/Type/cardCarousel.type';

@Component({
  selector: 'card-carousel',
  templateUrl: './card-carousel.component.html',
  styleUrls: ['./card-carousel.component.scss']
})
export class CardCarouselComponent {

  @Input ('opzione') cardCarousel!:cardCarousel ;


  clickButton(id:number|null):void{
    console.log("Valore ID " +id)
  }
}
