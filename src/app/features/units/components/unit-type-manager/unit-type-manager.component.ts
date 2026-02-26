import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnitTypeService } from '../../services/unit-type.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UnitType } from '../../models/unit.model';

@Component({
  selector: 'app-unit-type-manager',
  standalone: true,
  imports: [FormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Tipos de unidad</h3>

        <!-- Add new -->
        <div class="flex gap-2 mb-4">
          <input
            type="text"
            class="input input-bordered input-sm flex-1"
            placeholder="Nuevo tipo (ej: Apartamento)"
            [(ngModel)]="newTypeName"
            (keydown.enter)="onCreate()"
          />
          <button
            class="btn btn-primary btn-sm"
            [disabled]="!newTypeName.trim()"
            (click)="onCreate()"
          >
            Agregar
          </button>
        </div>

        <!-- List -->
        @if (loading()) {
          <div class="flex justify-center py-4">
            <span class="loading loading-spinner loading-sm"></span>
          </div>
        } @else if (types().length === 0) {
          <p class="text-sm text-base-content/40 text-center py-4">
            No hay tipos de unidad. Crea el primero.
          </p>
        } @else {
          <ul class="space-y-1 max-h-60 overflow-y-auto">
            @for (type of types(); track type.id) {
              <li class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-base-200">
                @if (editingId() === type.id) {
                  <input
                    type="text"
                    class="input input-bordered input-xs flex-1"
                    [(ngModel)]="editName"
                    (keydown.enter)="onSaveEdit(type)"
                    (keydown.escape)="cancelEdit()"
                  />
                  <button class="btn btn-ghost btn-xs" (click)="onSaveEdit(type)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-xs" (click)="cancelEdit()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                } @else {
                  <span class="flex-1 text-sm">{{ type.name }}</span>
                  <button class="btn btn-ghost btn-xs" (click)="startEdit(type)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" (click)="onDelete(type)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                }
              </li>
            }
          </ul>
        }

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="close()">Cerrar</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class UnitTypeManagerComponent implements OnInit {
  private readonly unitTypeService = inject(UnitTypeService);
  private readonly toast = inject(ToastService);

  readonly changed = output<void>();
  readonly types = signal<UnitType[]>([]);
  readonly loading = signal(false);
  readonly editingId = signal<number | null>(null);

  newTypeName = '';
  editName = '';

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  ngOnInit(): void {
    this.loadTypes();
  }

  open(): void {
    this.loadTypes();
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  loadTypes(): void {
    this.loading.set(true);
    this.unitTypeService.getAll(1, 50).subscribe({
      next: (res) => {
        this.types.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar tipos de unidad');
        this.loading.set(false);
      },
    });
  }

  onCreate(): void {
    const name = this.newTypeName.trim();
    if (!name) return;

    this.unitTypeService.create({ name }).subscribe({
      next: () => {
        this.toast.success('Tipo creado');
        this.newTypeName = '';
        this.loadTypes();
        this.changed.emit();
      },
      error: (err: any) => this.toast.error(err.error?.message ?? 'Error al crear tipo'),
    });
  }

  startEdit(type: UnitType): void {
    this.editingId.set(type.id);
    this.editName = type.name;
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editName = '';
  }

  onSaveEdit(type: UnitType): void {
    const name = this.editName.trim();
    if (!name) return;

    this.unitTypeService.update(type.id, { id: type.id, name }).subscribe({
      next: () => {
        this.toast.success('Tipo actualizado');
        this.cancelEdit();
        this.loadTypes();
        this.changed.emit();
      },
      error: (err: any) => this.toast.error(err.error?.message ?? 'Error al actualizar'),
    });
  }

  onDelete(type: UnitType): void {
    this.unitTypeService.delete(type.id).subscribe({
      next: () => {
        this.toast.success('Tipo eliminado');
        this.loadTypes();
        this.changed.emit();
      },
      error: (err: any) => this.toast.error(err.error?.message ?? 'Error al eliminar'),
    });
  }
}
