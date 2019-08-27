import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SongService} from './services/song.service';
import {PlaylistService} from './services/playlist.service';
import {UserService} from './services/user.service';
import {Playlist} from './model/playlist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JukBoxAng';

  constructor(private router: Router) {}


  loggedIn() {
    return localStorage.getItem('access_token') !== null;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigateByUrl('home');
  }
}
