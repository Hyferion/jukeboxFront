import {Component, OnDestroy, OnInit} from '@angular/core';
import {Playlist} from '../model/playlist';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SongService} from '../services/song.service';
import {Song} from '../model/song';
import {PlaylistService} from '../services/playlist.service';
import {UserService} from '../services/user.service';
import {User} from '../model/User';
import {interval, Observable, Subscription, timer} from 'rxjs';


@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.component.html',
  styleUrls: ['./playlist-detail.component.css']
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  searchedSongs: Song[] = [];
  songs: Song[] = [];
  playlist: Playlist;
  search: string;
  songPlaying: Song;
  isPlaylistOwner: boolean;
  playlistOwner: User = null;
  members: User[] = [];
  socket: WebSocket;
  error: string;
  counter;
  private subscription;

  constructor(private route: ActivatedRoute, private songService: SongService, private playlistService: PlaylistService,
              private userService: UserService, private router: Router) {
    this.playlist = new Playlist();
  }

  ngOnInit() {
    this.playlist.identifier = this.route.snapshot.paramMap.get('id');
    this.setSocket();
    this.getPlaylistInfoAndInitialPlay();
    this.getPlaylistMembers();
    this.getDeviceForUser();
    this.search = '';
    this.setCounter(5000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

  }

  getPlaylistInfoAndInitialPlay() {
    this.playlistService.getPlaylistForIdentifier(this.playlist.identifier).subscribe((data: Playlist) => {
      this.playlist = data;
      this.userService.getUser(this.playlist.creator).subscribe((data: User) => {
        this.playlistOwner = data;
      });
      if (this.playlist.creator === localStorage.getItem('id')) {
        this.isPlaylistOwner = true;
      }
      this.initialPlaying();
    });
  }

  initialPlaying() {
    this.songService.getSongsForPlaylist(this.playlist).subscribe((data: Song[]) => {
      this.songs = data;
      this.songs.sort(this.compare);
      this.songs.sort(this.compareVotes);
      this.playFirstInLine();
    });
  }


  getSongsForPlaylistandPlay() {
    this.songService.getSongsForPlaylist(this.playlist).subscribe((data: Song[]) => {
      this.songs = data;
      this.songs.sort(this.compare);
      this.songs.sort(this.compareVotes);
      if (this.checkIfSongHasToBePlayed()) {
        this.playFirstInLine();
      }
    });
  }

  checkIfSongHasToBePlayed() {
    if (this.songs.length > 0) {
      if (this.checkIfSongIsPlaying()) {
        return true;
      }
    }
    return false;
  }


  checkIfSongIsPlaying() {
    for (let i = 0; i < this.songs.length; i++) {
      let date = new Date();
      if (this.songs[i].timePlaying) {
        if (date.getTime() - this.songs[i].timePlaying < this.songs[i].duration) {
          if (this.songPlaying) {
            if (this.songPlaying.spotifyId === this.songs[i].spotifyId) {
              this.songPlaying = this.songs[i];
              this.songs.splice(i, 1);
              return false;
            }
          }
        }
      }
    }
    return true;
  }


  playFirstInLine() {
    for (let i = 0; i < this.songs.length; i++) {
      if (this.checkIfSongShouldBeRemoved(this.songs[i])) {
        this.songs.splice(i, 1);
      }
    }
    this.songService.playSong(this.songs[0]).subscribe((data: JSON) => {
      if (this.songs[0].timePlaying) {
        let date = new Date();
        this.songService.playSong(this.songs[0], date.getTime() - this.songs[0].timePlaying).subscribe((data: JSON) => {
        });
      }
      this.songService.updateSong(this.songs[0], this.playlist).subscribe((data: Song) => {
        this.songs[0] = data;
        this.songPlaying = this.songs[0];
        this.songs.splice(0, 1);
      });
    }, error1 => {
      if (error1.status === 403) {
        this.error = 'You cant listen to the songs because you dont have a premium account, but you can still add songs and vote';
        this.subscription.unsubscribe();
      } else if (error1.status === 404) {
        this.error = 'You dont have an active device, please open spotify on your device';
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  checkIfSongShouldBeRemoved(song: Song) {
    let date = new Date();
    if (song.timePlaying) {
      if (date.getTime() - song.timePlaying > song.duration) {
        this.songService.removeSongFromPlaylist(song).subscribe((data: JSON) => {
        });
        return true;
      }
    }
    return false;
  }


  searchSong(event) {
    this.searchedSongs = [];
    let term = event.target.value;
    if (term !== '') {
      this.songService.searchSong(term).subscribe(
        (data: JSON) => {
          let songs = data['tracks']['items'];
          for (let track of songs) {
            let song = new Song();
            song.id = track['id'];
            song.title = track['name'];
            song.artist = track['artists']['0']['name'];
            song.img = track['album']['images']['1']['url'];
            song.duration = track['duration_ms'];
            this.searchedSongs.push(song);
          }
        }, error => {
          this.router.navigate(['/home']);
        });
    }
  }

  addSongToPlaylist(song: Song) {
    this.search = null;
    this.songService.addSongToPlaylist(song, this.playlist).subscribe((data: JSON) => {
      this.searchedSongs = [];
      this.socket.send(JSON.stringify({
        'message': 'add'
      }));
    });
  }

  removeSongFromPlaylist(song: Song) {
    this.songService.removeSongFromPlaylist(song).subscribe((data: JSON) => {
      this.socket.send(JSON.stringify({
        'message': 'remove'
      }));
    });
  }

  upvoteSong(song: Song) {
    this.songService.voteForSong(song).subscribe((data: JSON) => {
      this.socket.send(JSON.stringify({
        'message': 'add'
      }));
    });
  }


  getPlaylistMembers() {
    this.playlistService.getPlaylistForIdentifier(this.playlist.identifier).subscribe((data: Playlist) => {
      let memberarray = data['members'];
      for (let i = 0; i < memberarray.length; i++) {
        this.getUserInfo(memberarray[i]);
      }
    });
  }


  getUserInfo(id: string) {
    this.userService.getUser(id).subscribe((data: User) => {
      this.members.push(data);
    });
  }


  getDeviceForUser() {
    this.songService.getDeviceForUser().subscribe((data: JSON) => {
      // TODO Show error if no device is found
      localStorage.setItem('device', data['devices'][0]['id']);
    });
  }


  setSocket() {
    this.socket = new WebSocket('ws://157.230.119.71/ws/test/' + this.playlist.identifier);

    this.socket.onopen = () => {
      console.log('WebSockets connection created.');
    };

    this.socket.onmessage = (event) => {
      this.getSongsForPlaylistandPlay();
    };

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.onopen(null);
    }
  }


  setCounter(duration) {
    this.counter = interval(duration);
    this.subscription = this.counter.subscribe(n => {
      this.getSongsForPlaylistandPlay();
    });

  }

  goToPlaylists() {
    this.router.navigate(['/playlist']);
  }

  compare(a, b) {
    if (a.id > b.id) {
      return 1;
    } else {
      return -1;
    }
  }

  isAuthor(song: Song) {
    if (song) {
      return song.user === localStorage.getItem('id');
    }
  }

  compareVotes(a, b) {
    if (a.votes < b.votes) {
      return 1;
    }
    if (a.votes > b.votes) {
      return -1;
    }
    return 0;
  }
}
