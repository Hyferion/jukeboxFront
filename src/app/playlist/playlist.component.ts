import {Component, OnInit} from '@angular/core';
import {PlaylistService} from '../services/playlist.service';
import {Playlist} from '../model/playlist';
import {Song} from '../model/song';
import {SongService} from '../services/song.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  playlists: Playlist[];
  hasPlaylist: boolean;
  identifierPlaylist: string = '';

  constructor(private playlistService: PlaylistService, private router: Router) {
  }

  ngOnInit() {
    // TODO CHECK IF USER IS IN DB, CREATE IF NOT
    this.getUserPlaylists();
  }


  createPlaylist() {
    this.playlistService.createPlaylist().subscribe((data: JSON) => {
      this.getUserPlaylists();
    }, error1 => {
      return this.router.navigateByUrl('home');
    });
  }


  deletePlaylist(playlist: Playlist) {
    this.playlistService.deletePlaylist(playlist).subscribe((data: JSON) => {
      this.getUserPlaylists();
    }, error1 => {
      return this.router.navigateByUrl('home');
    });
  }


  getUserPlaylists() {
    this.playlistService.getUserPlaylist().subscribe((data: Playlist[]) => {
      this.playlists = data;
      this.userHasPlaylist();
    }, error1 => {
      return this.router.navigateByUrl('home');
    });
  }

  joinPlaylist() {
    this.playlistService.joinPlaylist(this.identifierPlaylist).subscribe((data: JSON) => {
      this.getUserPlaylists();
    }, error1 => {
      return this.router.navigateByUrl('home');
    });
  }


  userHasPlaylist() {
    let user = localStorage.getItem('id');
    if (this.playlists.length === 0) {
      this.hasPlaylist = false;
    } else {
      for (let i = 0; i < this.playlists.length; i++) {
        if (this.playlists[i].creator === user) {
          this.hasPlaylist = true;
          return;
        } else {
          this.hasPlaylist = false;
        }
      }
    }
  }

  isCreator(playlist: Playlist) {
    let user = localStorage.getItem('id');
    return playlist.creator === user;
  }
}
