import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  public links = [
    { location: 'collection', label: 'collection', icon: 'add_to_photos' },
    { location: 'training', label: 'training', icon: 'trending_up' },
    { location: 'preview', label: 'preview', icon: 'photo' },
  ]
}
