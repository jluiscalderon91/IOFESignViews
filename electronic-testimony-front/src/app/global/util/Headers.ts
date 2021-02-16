import {HttpHeaders} from '@angular/common/http';

export class Headers {
  public static contentType = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
}
