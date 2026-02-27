import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of, map, catchError } from 'rxjs';
import { BlockService } from '../../blocks/services/block.service';
import { UnitService } from '../../units/services/unit.service';
import { MaintenancePaymentService } from '../../maintenance/services/maintenance-payment.service';
import { IncidentService } from '../../incidents/services/incident.service';
import { ReservationService } from '../../common-areas/services/reservation.service';
import { AnnouncementService } from '../../announcements/services/announcement.service';
import { AdminStats, OwnerStats, TenantStats } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly blockService = inject(BlockService);
  private readonly unitService = inject(UnitService);
  private readonly paymentService = inject(MaintenancePaymentService);
  private readonly incidentService = inject(IncidentService);
  private readonly reservationService = inject(ReservationService);
  private readonly announcementService = inject(AnnouncementService);

  loadAdminStats(): Observable<AdminStats> {
    return forkJoin({
      units: this.unitService.getPagedSummary(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
      blocks: this.blockService.getAll(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
      pendingPayments: this.paymentService.getPending().pipe(
        map(r => r.length),
        catchError(() => of(-1)),
      ),
      openIncidents: this.incidentService.getAll(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
    }).pipe(
      map(({ units, blocks, pendingPayments, openIncidents }) => ({
        totalUnits: units,
        totalBlocks: blocks,
        pendingPayments,
        openIncidents,
      })),
    );
  }

  loadOwnerStats(): Observable<OwnerStats> {
    return forkJoin({
      pendingPayments: this.paymentService.getPending().pipe(
        map(r => r.length),
        catchError(() => of(-1)),
      ),
      reservations: this.reservationService.getAll(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
      announcements: this.announcementService.getAll(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
    });
  }

  loadTenantStats(): Observable<TenantStats> {
    return forkJoin({
      pendingPayments: this.paymentService.getPending().pipe(
        map(r => r.length),
        catchError(() => of(-1)),
      ),
      announcements: this.announcementService.getAll(1, 1).pipe(
        map(r => r.totalCount),
        catchError(() => of(-1)),
      ),
    });
  }
}
