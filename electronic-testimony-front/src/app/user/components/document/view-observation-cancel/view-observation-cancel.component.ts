import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Observationcancel} from '../../../model/Observationcancel';
import {Comment} from '../../../model/Comment';
import {Constant} from '../../../../global/util/Constant';
import {CommentType} from '../../../../global/util/enum/CommentType';
import {DocumentState} from '../../../../global/util/DocumentState';
import {Document} from '../../../model/Document';

@Component({
  selector: 'app-view-observation-cancel',
  templateUrl: './view-observation-cancel.component.html',
  styleUrls: ['./view-observation-cancel.component.css']
})
export class ViewObservationCancelComponent implements OnInit {

  public document: any;
  public observationcancel: Observationcancel;
  public title = 'Comentarios';
  public comments: Comment[] = [];

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.document._more && this.document._more.commentsInfo) {
      const commentsInfo = this.document._more.commentsInfo;
      commentsInfo.forEach(commInfo => {
        const comment: Comment = {
          type: commInfo.observed === Constant.OBSERVED ? CommentType.Observation : CommentType.Comment,
          actioner: commInfo.author,
          createAt: commInfo.createAt,
          description: commInfo.description
        };
        this.comments.push(comment);
      });
    }

    if (this.observationcancel !== null && this.observationcancel !== undefined) {
      let comment: Comment;
      if (this.wasCanceled(this.document)) {
        comment = {
          type: CommentType.Cancellation,
          actioner: this.observationcancel._more.fullnameCancellator,
          createAt: this.observationcancel.createAt,
          description: this.observationcancel.description
        };
      } else if (this.wasModified(this.document)) {
        comment = {
          type: CommentType.Modification,
          actioner: this.observationcancel._more.fullnameCancellator,
          createAt: this.observationcancel.createAt,
          description: this.observationcancel.description
        };
      }
      this.comments.push(comment);
    }
  }

  public accept() {
    this.activeModal.close();
  }

  public getBadgeTextBy(comment: any): string {
    if (CommentType.Comment === comment.type) {
      return 'badge-info';
    } else if (CommentType.Observation === comment.type) {
      return 'badge-warning';
    } else if (CommentType.Cancellation === comment.type) {
      return 'badge-danger';
    } else if (CommentType.Modification === comment.type) {
      return 'custom-badge-modified';
    }
  }

  public getCommentTypeTextBy(comment: any): string {
    if (CommentType.Comment === comment.type) {
      return 'Comentario';
    } else if (CommentType.Observation === comment.type) {
      return 'Observación';
    } else if (CommentType.Cancellation === comment.type) {
      return 'Anulación';
    } else if (CommentType.Modification === comment.type) {
      return 'Modificación';
    }
  }

  public wasCanceled(document: any): boolean {
    return Constant.INACTIVE === document.active || DocumentState.CANCELED === document.stateId;
  }

  public wasModified(document: Document): boolean {
    return Constant.ACTIVE === document.active && DocumentState.MODIFIED === document.stateId;
  }
}
