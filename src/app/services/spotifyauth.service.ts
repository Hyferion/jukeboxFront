import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaderResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppComponent} from '../app.component';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyauthService {
  constructor(private httpClient: HttpClient) {
  }

  authSpotify(code: string) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/authSpotify', {'code': code});
  }

  refreshAuthSpotify(refreshToken: string) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/refreshSpotify', {'refreshToken': refreshToken});
  }

  getUserID(token) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token,
      })
    };
    return this.httpClient.get(environment.SPOTIFY_API_BASE + '/me', httpOptions);
  }
}
