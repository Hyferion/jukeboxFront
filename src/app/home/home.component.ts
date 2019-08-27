import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpotifyauthService} from '../services/spotifyauth.service';
import {UserService} from '../services/user.service';
import {interval} from 'rxjs';
import {User} from '../model/User';
import {AppComponent} from '../app.component';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router,
              private authService: SpotifyauthService, private userService: UserService) {
  }

  // TODO REFACTOR
  ngOnInit() {
    if (this.isAccessTokenpresent()) {
      this.checkIfAccessTokenValid();
    } else {
      this.route.queryParams.subscribe(params => {
        let code = params['code'];
        // Exchange code for token from Server
        this.authService.authSpotify(code).subscribe((data: JSON) => {
          localStorage.setItem('access_token', data['access_token']);
          localStorage.setItem('refresh_token', data['refresh_token']);
          // Get Spotify User ID
          this.authService.getUserID(data['access_token']).subscribe((id: JSON) => {
            localStorage.setItem('id', id['id']);
            localStorage.setItem('displayName', id['display_name']);
            // Get User from Backend
            this.userService.getUser(id['id']).subscribe((user: User) => {
              return this.router.navigateByUrl('playlist');
            }, error => {
              // Create user if it doesn't exist
              this.userService.createUser(id['id'], id['display_name']).subscribe((response: JSON) => {
                return this.router.navigateByUrl('playlist');
              }, error1 => {
              });
            });
          }, error1 => {
            return this.router.navigateByUrl('home');
          });
        });
      });
    }
  }

  checkIfAccessTokenValid() {
    this.authService.getUserID(localStorage.getItem('access_token')).subscribe((id: JSON) => {
      localStorage.setItem('id', id['id']);
      localStorage.setItem('displayName', id['display_name']);
      this.userService.getUser(id['id']).subscribe((user: User) => {
        return this.router.navigateByUrl('playlist');
      }, error => {
        this.userService.createUser(id['id'], id['display_name']).subscribe((response: JSON) => {
          return this.router.navigateByUrl('playlist');
        }, error1 => {
        });
      });
    }, error => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.router.navigateByUrl('home');
    });
  }

  getCode() {
    window.location.href = 'https://accounts.spotify.com/authorize?client_id='
      + environment.CLIENT_ID + '&redirect_uri='
      + environment.REDIRECT_URI + '&response_type=code&scope=user-read-private user-modify-playback-state user-read-playback-state';
  }

  isAccessTokenpresent() {
    return localStorage.getItem('access_token') !== null;
  }

}
