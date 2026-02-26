import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';
import { IncidentTypeService } from '../../services/incident-type.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { BlockService } from '../../../blocks/services/block.service';
import { Incident } from '../../models/incident.model';

interface ComboItem {
  id: number | string;
  value: string;
}

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar incidente' : 'Nuevo incidente' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          @if (!isEdit()) {
            <div class="form-control">
              <label class="label" for="incType">
                <span class="label-text">Tipo de incidente</span>
              </label>
              <select
                id="incType"
                formControlName="incidentTypeId"
                class="select select-bordered w-full"
                [class.select-error]="form.controls.incidentTypeId.touched && form.controls.incidentTypeId.invalid"
              >
                <option [ngValue]="null" disabled>Seleccionar tipo</option>
                @for (t of incidentTypes(); track t.id) {
                  <option [value]="t.id">{{ t.value }}</option>
                }
              </select>
              @if (form.controls.incidentTypeId.touched && form.controls.incidentTypeId.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">El tipo es obligatorio</span>
                </label>
              }
            </div>
          }

          <div class="form-control">
            <label class="label" for="incTitle">
              <span class="label-text">Titulo</span>
            </label>
            <input
              id="incTitle"
              type="text"
              formControlName="title"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.title.touched && form.controls.title.invalid"
              placeholder="Titulo del incidente"
            />
            @if (form.controls.title.touched && form.controls.title.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El titulo es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="incDescription">
              <span class="label-text">Descripcion</span>
            </label>
            <textarea
              id="incDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              [class.textarea-error]="form.controls.description.touched && form.controls.description.invalid"
              placeholder="Describe el incidente en detalle"
              rows="4"
            ></textarea>
            @if (form.controls.description.touched && form.controls.description.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La descripcion es obligatoria</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="incBlock">
              <span class="label-text">Bloque (opcional)</span>
            </label>
            <select
              id="incBlock"
              formControlName="blockId"
              class="select select-bordered w-full"
            >
              <option [ngValue]="null">Todo el condominio</option>
              @for (block of blocks(); track block.id) {
                <option [value]="block.id">{{ block.value }}</option>
              }
            </select>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                formControlName="isPublic"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text">Incidente publico (visible para todos los residentes)</span>
            </label>
          </div>

          @if (errorMessage()) {
            <div role="alert" class="alert alert-error">
              <span class="text-sm">{{ errorMessage() }}</span>
            </div>
          }

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="close()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ isEdit() ? 'Guardar cambios' : 'Reportar incidente' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class IncidentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly incidentService = inject(IncidentService);
  private readonly incidentTypeService = inject(IncidentTypeService);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly incidentTypes = signal<ComboItem[]>([]);
  readonly blocks = signal<ComboItem[]>([]);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    incidentTypeId: [null as number | null, [Validators.required]],
    title: ['', [Validators.required, Validators.maxLength(250)]],
    description: ['', [Validators.required]],
    blockId: [null as string | null],
    isPublic: [false],
  });

  ngOnInit(): void {
    this.loadComboData();
  }

  private loadComboData(): void {
    this.incidentTypeService.getComboList().subscribe({
      next: (items) => this.incidentTypes.set(items),
    });
    this.blockService.getAll(1, 100).subscribe({
      next: (res) => this.blocks.set(res.items.map((b) => ({ id: b.id, value: b.name }))),
    });
  }

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ incidentTypeId: null, blockId: null, isPublic: false });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(incident: Incident): void {
    this.isEdit.set(true);
    this.editId = incident.id;
    this.errorMessage.set('');
    this.form.patchValue({
      incidentTypeId: incident.incidentTypeId,
      title: incident.title,
      description: incident.description,
      blockId: incident.blockId ?? null,
      isPublic: incident.isPublic,
    });
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const raw = this.form.getRawValue();

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Incidente actualizado' : 'Incidente reportado');
      this.saved.emit();
      this.close();
    };

    const onError = (err: any) => {
      this.loading.set(false);
      this.errorMessage.set(
        err.error?.message ?? 'Ocurrio un error. Intente de nuevo.',
      );
    };

    if (this.isEdit()) {
      this.incidentService.update(this.editId!, {
        title: raw.title,
        description: raw.description,
        blockId: raw.blockId || null,
        isPublic: raw.isPublic,
      }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.incidentService.create({
        incidentTypeId: raw.incidentTypeId!,
        title: raw.title,
        description: raw.description,
        blockId: raw.blockId || null,
        isPublic: raw.isPublic,
      }).subscribe({ next: onSuccess, error: onError });
    }
  }
}
