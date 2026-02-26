import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Announcement } from '../../models/announcement.model';
import { BlockService } from '../../../blocks/services/block.service';

interface ComboItem {
  id: string;
  value: string;
}

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar anuncio' : 'Nuevo anuncio' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="announcementTitle">
              <span class="label-text">Titulo</span>
            </label>
            <input
              id="announcementTitle"
              type="text"
              formControlName="title"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.title.touched && form.controls.title.invalid"
              placeholder="Titulo del anuncio"
            />
            @if (form.controls.title.touched && form.controls.title.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El titulo es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="announcementContent">
              <span class="label-text">Contenido</span>
            </label>
            <textarea
              id="announcementContent"
              formControlName="content"
              class="textarea textarea-bordered w-full"
              [class.textarea-error]="form.controls.content.touched && form.controls.content.invalid"
              placeholder="Contenido del anuncio"
              rows="4"
            ></textarea>
            @if (form.controls.content.touched && form.controls.content.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El contenido es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Alcance</span>
            </label>
            <div class="flex gap-4">
              <label class="label cursor-pointer gap-2">
                <input
                  type="radio"
                  formControlName="scope"
                  value="CONDOMINIUM"
                  class="radio radio-primary radio-sm"
                />
                <span class="label-text">Todo el condominio</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input
                  type="radio"
                  formControlName="scope"
                  value="BLOCK"
                  class="radio radio-primary radio-sm"
                />
                <span class="label-text">Bloque</span>
              </label>
            </div>
          </div>

          @if (form.controls.scope.value === 'BLOCK') {
            <div class="form-control">
              <label class="label" for="announcementBlockId">
                <span class="label-text">Bloque</span>
              </label>
              <select
                id="announcementBlockId"
                formControlName="blockId"
                class="select select-bordered w-full"
                [class.select-error]="form.controls.blockId.touched && form.controls.blockId.invalid"
              >
                <option [ngValue]="null" disabled>Seleccionar bloque</option>
                @for (block of blocks(); track block.id) {
                  <option [value]="block.id">{{ block.value }}</option>
                }
              </select>
              @if (form.controls.blockId.touched && form.controls.blockId.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">El bloque es obligatorio</span>
                </label>
              }
            </div>
          }

          @if (errorMessage()) {
            <div role="alert" class="alert alert-error">
              <span class="text-sm">{{ errorMessage() }}</span>
            </div>
          }

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="close()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="submitLoading()">
              @if (submitLoading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ isEdit() ? 'Guardar cambios' : 'Publicar anuncio' }}
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
export class AnnouncementFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly announcementService = inject(AnnouncementService);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly submitLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly blocks = signal<ComboItem[]>([]);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(250)]],
    content: ['', [Validators.required]],
    scope: ['CONDOMINIUM', [Validators.required]],
    blockId: [null as string | null],
  });

  ngOnInit(): void {
    this.loadBlocks();
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

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ scope: 'CONDOMINIUM', blockId: null });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(announcement: Announcement): void {
    this.isEdit.set(true);
    this.editId = announcement.id;
    this.errorMessage.set('');
    this.form.patchValue({
      title: announcement.title,
      content: announcement.content,
      scope: announcement.scope,
      blockId: announcement.blockId ?? null,
    });
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onSubmit(): void {
    if (this.form.controls.scope.value === 'BLOCK' && !this.form.controls.blockId.value) {
      this.form.controls.blockId.setErrors({ required: true });
      this.form.controls.blockId.markAsTouched();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.errorMessage.set('');
    const raw = this.form.getRawValue();

    const data = {
      title: raw.title,
      content: raw.content,
      scope: raw.scope,
      blockId: raw.scope === 'BLOCK' ? raw.blockId : null,
    };

    const onSuccess = () => {
      this.submitLoading.set(false);
      this.toast.success(this.isEdit() ? 'Anuncio actualizado' : 'Anuncio publicado');
      this.saved.emit();
      this.close();
    };

    const onError = (err: any) => {
      this.submitLoading.set(false);
      this.errorMessage.set(
        err.error?.message ?? 'Ocurrio un error. Intente de nuevo.',
      );
    };

    if (this.isEdit()) {
      this.announcementService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.announcementService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
