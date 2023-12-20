import { Component } from '@angular/core';

@Component({
  selector: 'menu-principale',
  templateUrl: './menu-principale.component.html',
  styleUrls: ['./menu-principale.component.scss'],
})
export class MenuPrincipaleComponent {

  cerca() {
    const cercaTitolo = document.getElementById('cercaInput');


    return false;
  }

}
