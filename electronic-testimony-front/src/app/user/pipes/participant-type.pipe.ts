import {Pipe, PipeTransform} from '@angular/core';
import {ParticipantType} from '../../global/util/enum/ParticipantType';

@Pipe({
  name: 'descriptionParticipantType'
})
export class DescriptionParticipantTypePipe implements PipeTransform {

  transform(participantType: any): string {
    switch (participantType) {
      case ParticipantType.User:
        return 'Usuario';
      case ParticipantType.InvitedUser:
        return 'Usuario invitado';
      case ParticipantType.Invited:
        return 'Invitado';
    }
  }
}
