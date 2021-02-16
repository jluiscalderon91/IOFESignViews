import {Pipe, PipeTransform} from '@angular/core';
import {Constant} from '../../global/util/Constant';

@Pipe({
  name: 'descriptionDocumentType'
})
export class DescriptionDocumentTypePipe implements PipeTransform {

  transform(documentType: any): string {
    switch (Number(documentType)) {
      case Constant.DNI:
        return 'DNI';
      case Constant.CARNE_EXTRANJERIA:
        return 'CARNÉ EXTRANJERÍA';
      case Constant.PASSAPORTE:
        return 'PASAPORTE';
    }
    return 'OTROS';
  }
}
