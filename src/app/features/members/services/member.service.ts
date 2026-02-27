import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  MemberResponse,
  PendingInvitationResponse,
  InviteMemberRequest,
  InviteMemberResponse,
  ManualRegisterMemberRequest,
  ValidateInvitationResponse,
  AcceptInvitationRequest,
} from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/members`;
  private readonly invitationsUrl = `${environment.apiUrl}/invitations`;

  getMembers(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<MemberResponse>> {
    return this.http.get<PaginatedResponse<MemberResponse>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getPendingInvitations(): Observable<PendingInvitationResponse[]> {
    return this.http.get<PendingInvitationResponse[]>(`${this.apiUrl}/pending-invitations`);
  }

  invite(request: InviteMemberRequest): Observable<InviteMemberResponse> {
    return this.http.post<InviteMemberResponse>(`${this.apiUrl}/invite`, request);
  }

  manualRegister(request: ManualRegisterMemberRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/manual-register`, request);
  }

  resendInvitation(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/resend`, {});
  }

  cancelInvitation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cancel-invitation`);
  }

  removeMember(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/remove`);
  }

  validateToken(token: string): Observable<ValidateInvitationResponse> {
    return this.http.get<ValidateInvitationResponse>(`${this.invitationsUrl}/validate/${token}`);
  }

  acceptInvitation(request: AcceptInvitationRequest): Observable<void> {
    return this.http.post<void>(`${this.invitationsUrl}/accept`, request);
  }
}
