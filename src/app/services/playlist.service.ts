import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Playlist} from '../model/playlist';
import {AppComponent} from '../app.component';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  USERID = localStorage.getItem('id');

  constructor(private httpClient: HttpClient) {
  }

  joinPlaylist(identifier: string) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/playlist/addMember', {
      'playlist': identifier,
      'member': localStorage.getItem('id')
    });
  }

  createPlaylist() {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/playlist', {'creator': this.USERID});
  }


  getUserPlaylist() {
    const term = this.USERID.trim();
    const options = this.USERID ? {params: new HttpParams().set('user', term)} : {};
    return this.httpClient.get<Playlist[]>(environment.BACKEND_IP_BASE + '/playlist', options);
  }

  deletePlaylist(playlist: Playlist) {
    return this.httpClient.delete(environment.BACKEND_IP_BASE + '/playlist/' + playlist.identifier);
  }


  getPlaylistForIdentifier(identifier: string) {
    return this.httpClient.get<Playlist>(environment.BACKEND_IP_BASE + '/playlist/' + identifier);
  }
}
