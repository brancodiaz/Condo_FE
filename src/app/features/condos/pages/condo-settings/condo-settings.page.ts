import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CondominiumService } from '../../services/condominium.service';
import { CondoContextService } from '../../../../core/services/condo-context.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CondominiumResponse } from '../../models/condominium.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-condo-settings',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-4 md:p-6">
      <h1 class="text-2xl font-bold text-base-content mb-6">Configuracion del condominio</h1>

      @if (loadingData()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (condo()) {
        <!-- General info form -->
        <div class="card bg-base-100 border border-base-300 mb-6">
          <div class="card-body">
            <h2 class="card-title text-base">Informacion general</h2>

            <form [formGroup]="form" (ngSubmit)="onSave()" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label" for="settingsName">
                    <span class="label-text">Nombre</span>
                  </label>
                  <input
                    id="settingsName"
                    type="text"
                    formControlName="name"
                    class="input input-bordered w-full"
                    [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
                  />
                  @if (form.controls.name.touched && form.controls.name.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">El nombre es obligatorio</span>
                    </label>
                  }
                </div>

                <div class="form-control">
                  <label class="label" for="settingsCountry">
                    <span class="label-text">Pais</span>
                  </label>
                  <input
                    id="settingsCountry"
                    type="text"
                    formControlName="country"
                    class="input input-bordered w-full"
                    [class.input-error]="form.controls.country.touched && form.controls.country.invalid"
                  />
                  @if (form.controls.country.touched && form.controls.country.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">El pais es obligatorio</span>
                    </label>
                  }
                </div>
              </div>

              <div class="form-control">
                <label class="label" for="settingsAddress">
                  <span class="label-text">Direccion</span>
                </label>
                <input
                  id="settingsAddress"
                  type="text"
                  formControlName="address"
                  class="input input-bordered w-full"
                  [class.input-error]="form.controls.address.touched && form.controls.address.invalid"
                />
                @if (form.controls.address.touched && form.controls.address.hasError('required')) {
                  <label class="label">
                    <span class="label-text-alt text-error">La direccion es obligatoria</span>
                  </label>
                }
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    formControlName="hasBlocks"
                    class="checkbox checkbox-primary checkbox-sm"
                  />
                  <span class="label-text">Tiene bloques / edificios</span>
                </label>
              </div>

              <!-- Readonly fields -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-base-300">
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Plan</p>
                  <p class="text-sm font-medium">{{ condo()!.planId || 'Gratuito' }}</p>
                </div>
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Fecha de creacion</p>
                  <p class="text-sm font-medium">{{ condo()!.createdAt | date:'mediumDate' }}</p>
                </div>
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Total de unidades</p>
                  <p class="text-sm font-medium">{{ condo()!.totalUnits }}</p>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="btn btn-primary" [disabled]="saving() || form.pristine">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="card bg-base-100 border border-error/30">
          <div class="card-body">
            <h2 class="card-title text-base text-error">Zona peligrosa</h2>
            <p class="text-sm text-base-content/60">
              Eliminar el condominio es una accion permanente. Se eliminaran todos los datos asociados.
            </p>
            <div class="mt-3">
              @if (!confirmDelete()) {
                <button class="btn btn-error btn-outline btn-sm" (click)="confirmDelete.set(true)">
                  Eliminar condominio
                </button>
              } @else {
                <div class="flex items-center gap-3">
                  <span class="text-sm text-error font-medium">Estas seguro?</span>
                  <button class="btn btn-error btn-sm" (click)="onDelete()" [disabled]="deleting()">
                    @if (deleting()) {
                      <span class="loading loading-spinner loading-sm"></span>
                    }
                    Si, eliminar
                  </button>
                  <button class="btn btn-ghost btn-sm" (click)="confirmDelete.set(false)">Cancelar</button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CondoSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly condoService = inject(CondominiumService);
  private readonly condoContext = inject(CondoContextService);
  private readonly toast = inject(ToastService);

  readonly condo = signal<CondominiumResponse | null>(null);
  readonly loadingData = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly confirmDelete = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    address: ['', [Validators.required, Validators.maxLength(250)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
    hasBlocks: [true],
  });

  private get condoId(): string {
    return this.route.parent?.snapshot.params['condoId'] ?? '';
  }

  ngOnInit(): void {
    this.loadCondo();
  }

  private loadCondo(): void {
    this.loadingData.set(true);
    this.condoService.getById(this.condoId).subscribe({
      next: (condo) => {
        this.condo.set(condo);
        this.form.patchValue({
          name: condo.name,
          address: condo.address,
          country: condo.country,
          hasBlocks: condo.includeBlocks,
        });
        this.form.markAsPristine();
        this.loadingData.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar la configuracion');
        this.loadingData.set(false);
      },
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = this.form.getRawValue();

    this.condoService.update(this.condoId, data).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Configuracion actualizada');
        this.form.markAsPristine();
        this.loadCondo();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? 'Error al guardar');
      },
    });
  }

  onDelete(): void {
    this.deleting.set(true);
    this.condoService.delete(this.condoId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.toast.success('Condominio eliminado');
        this.router.navigate(['/condos']);
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error(err.error?.message ?? 'Error al eliminar');
        this.confirmDelete.set(false);
      },
    });
  }
}
