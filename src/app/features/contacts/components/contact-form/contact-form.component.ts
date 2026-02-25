import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportantContactService } from '../../services/important-contact.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ImportantContact } from '../../models/important-contact.model';
import { BlockService } from '../../../blocks/services/block.service';

interface ComboItem {
  id: string;
  value: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar contacto' : 'Nuevo contacto' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="contactName">
              <span class="label-text">Nombre del contacto</span>
            </label>
            <input
              id="contactName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Juan Perez - Gasfitero"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="contactTypeName">
              <span class="label-text">Tipo de contacto</span>
            </label>
            <input
              id="contactTypeName"
              type="text"
              formControlName="contactTypeName"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.contactTypeName.touched && form.controls.contactTypeName.invalid"
              placeholder="Ej: Gasfitero, Electricista, Policia..."
              list="contactTypeList"
            />
            <datalist id="contactTypeList">
              @for (type of contactTypeNames(); track type) {
                <option [value]="type"></option>
              }
            </datalist>
            @if (form.controls.contactTypeName.touched && form.controls.contactTypeName.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El tipo es obligatorio</span>
              </label>
            }
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="contactPhone">
                <span class="label-text">Telefono</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                formControlName="phoneNumber"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid"
                placeholder="999-999-999"
              />
              @if (form.controls.phoneNumber.touched && form.controls.phoneNumber.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">El telefono es obligatorio</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="contactEmail">
                <span class="label-text">Email (opcional)</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                formControlName="email"
                class="input input-bordered w-full"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="contactDescription">
              <span class="label-text">Descripcion (opcional)</span>
            </label>
            <textarea
              id="contactDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              placeholder="Informacion adicional sobre el contacto"
              rows="2"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label" for="contactBlockId">
              <span class="label-text">Bloque (opcional - dejar vacio para todo el condominio)</span>
            </label>
            <select
              id="contactBlockId"
              formControlName="blockId"
              class="select select-bordered w-full"
            >
              <option [ngValue]="null">Todo el condominio</option>
              @for (block of blocks(); track block.id) {
                <option [value]="block.id">{{ block.value }}</option>
              }
            </select>
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
              {{ isEdit() ? 'Guardar cambios' : 'Registrar contacto' }}
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
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ImportantContactService);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly blocks = signal<ComboItem[]>([]);
  readonly contactTypeNames = signal<string[]>([]);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    contactTypeName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    email: [''],
    description: [''],
    blockId: [null as string | null],
  });

  ngOnInit(): void {
    this.loadBlocks();
    this.loadContactTypes();
  }

  private loadBlocks(): void {
    this.blockService.getAll(1, 100).subscribe({
      next: (res) => {
        this.blocks.set(
          res.items.map((b) => ({ id: b.id, value: b.name }))
        );
      },
    });
  }

  private loadContactTypes(): void {
    this.contactService.getContactTypeNames().subscribe({
      next: (types) => this.contactTypeNames.set(types),
    });
  }

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ blockId: null });
    this.errorMessage.set('');
    this.loadContactTypes();
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(contact: ImportantContact): void {
    this.isEdit.set(true);
    this.editId = contact.id;
    this.errorMessage.set('');
    this.loading.set(true);
    this.loadContactTypes();

    this.contactService.getById(contact.id).subscribe({
      next: (detail) => {
        this.form.patchValue({
          name: detail.name,
          contactTypeName: detail.contactTypeName,
          phoneNumber: detail.phoneNumber,
          email: detail.email ?? '',
          description: detail.description ?? '',
          blockId: detail.blockId ?? null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los datos del contacto');
        this.loading.set(false);
        this.close();
      },
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

    const data = {
      ...raw,
      email: raw.email || null,
      description: raw.description || null,
      blockId: raw.blockId || null,
    };

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Contacto actualizado' : 'Contacto registrado (pendiente de aprobacion)');
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
      this.contactService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.contactService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
