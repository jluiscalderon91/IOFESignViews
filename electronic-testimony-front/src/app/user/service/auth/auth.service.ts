import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../../global/util/Constant';
import {User} from '../../model/User';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {LocalStorage} from '../../../global/util/LocalStorage';
import {Role} from '../../model/Role';
import {Authority} from '../../model/Authority';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router,
              private http: HttpClient) {
  }

  public login(user: User): Observable<any> {
    return this.http.post<any>(Constant.ROOT + '/login', JSON.stringify(user), {observe: 'response'})
      .pipe(map(response => {
        if (response && response.headers) {
          const token = response.headers.get('Authorization').replace('Bearer ', '');
          const onlyApi = response.headers.get('OnlyApi');
          if (Constant.ONLY_API_OPTION !== onlyApi) {
            localStorage.setItem('token', token);
          }
        }
        return response;
      }));
  }

  public logout() {
    localStorage.clear();
  }

  public isAuthenticated(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }
  }

  public getProfile(): any {
    return LocalStorage.getProfile();
  }

  public getUserRoles(): Role[] {
    return LocalStorage.getUserRoles();
  }

  public hasRole(roleName: string) {
    return this.getUserRoles().find(role => role.name === roleName) !== undefined;
  }

  public getEnterpriseIdView(): any {
    return LocalStorage.getEnterpriseIdView();
  }

  public getEnterpriseId(): any {
    return LocalStorage.getEnterpriseId();
  }

  public getRoles(): any {
    return LocalStorage.getRolesAndAllOption();
  }

  public getParticipanttypes(): any {
    return LocalStorage.getParticipantTypes();
  }

  public getUserAuthorities(): Authority[] {
    return LocalStorage.getUserAuthorities();
  }

  public hasAuthority(code: string) {
    const userAuthorities = this.getUserAuthorities();
    if (userAuthorities) {
      return this.getUserAuthorities().find(authority => authority.code === code) !== undefined;
    }
    return false;
  }
}
