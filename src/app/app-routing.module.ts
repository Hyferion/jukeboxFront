import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PlaylistComponent} from './playlist/playlist.component';
import {PlaylistDetailComponent} from './playlist-detail/playlist-detail.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'playlist', component: PlaylistComponent},
  {path: 'playlist/:id', component: PlaylistDetailComponent, data: { animation: 'playlist'}},
  {path: '**', component: HomeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {


}
