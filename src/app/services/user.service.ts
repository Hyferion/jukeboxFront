import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/User';
import {AppComponent} from '../app.component';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) {
  }


  getUser(id: string) {
    return this.httpClient.get<User>(environment.BACKEND_IP_BASE + '/user/' + id);
  }

  createUser(id: string, displayName: string) {
    return this.httpClient.post(environment.BACKEND_IP_BASE + '/user', {'userid': id, 'display_name': displayName});
  }
}
