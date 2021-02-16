import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'jobDescription'
})
export class JobDescriptionPipe implements PipeTransform {

  transform(person: any): string {
    if (person._more) {
      return person._more.jobDescription;
    }
    return '';
  }
}
