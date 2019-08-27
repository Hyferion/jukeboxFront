import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Song} from '../model/song';
import {Playlist} from '../model/playlist';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  AUTH_TOKEN = localStorage.getItem('access_token');
  USERID = localStorage.getItem('id');

  constructor(private httpClient: HttpClient) {
  }


  searchSong(term: string) {
    term = term.replace(' ', '+');
    const params = {
      params: new HttpParams().set('q', term).set('type', 'track'), headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.AUTH_TOKEN,
      })
    };
    return this.httpClient.get(environment.SPOTIFY_API_BASE + '/search', params);
  }


  addSongToPlaylist(song: Song, playlist: Playlist) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/song', {
      'spotifyId': song.id,
      'title': song.title,
      'artist': song.artist,
      'img': song.img,
      'playlist': playlist.identifier,
      'user': this.USERID,
      'duration': song.duration,
    });
  }

  voteForSong(song: Song) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/vote', {
      'song': song.id,
      'user': this.USERID,
    });
  }

  getSongsForPlaylist(playlist: Playlist) {
    const params = {
      params: new HttpParams().set('playlist', playlist.identifier)
    };
    return this.httpClient.get<Song[]>(environment.BACKEND_IP_BASE + '/song', params);
  }

  removeSongFromPlaylist(song: Song) {
    return this.httpClient.delete(environment.BACKEND_IP_BASE + '/song/' + song.id + '/');
  }

  getDeviceForUser() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.AUTH_TOKEN,
      })
    };
    return this.httpClient.get('https://api.spotify.com/v1/me/player/devices', httpOptions);
  }


  playSong(song: Song, position = 0) {
    const httpOptions = {
      params: new HttpParams().set('device_id', localStorage.getItem('device')),
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.AUTH_TOKEN,
      })
    };
    return this.httpClient.put('https://api.spotify.com/v1/me/player/play', {
      'uris': ['spotify:track:' + song.spotifyId],
      'position_ms': position,
    }, httpOptions);
  }

  updateSong(song: Song, playlist: Playlist) {
    let timePlaying;
    if (song.timePlaying) {
      timePlaying = song.timePlaying;
    } else {
      timePlaying = new Date().getTime();
    }
    return this.httpClient.put<Song>(environment.BACKEND_IP_BASE + '/song/' + song.id + '/', {
      'spotifyId': song.spotifyId,
      'title': song.title,
      'artist': song.artist,
      'img': song.img,
      'playlist': playlist.identifier,
      'user': this.USERID,
      'timePlaying': timePlaying,
      'duration': song.duration,
    });
  }

}
