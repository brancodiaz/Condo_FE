import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full sm:max-w-lg">
        <h3 class="text-lg font-bold">{{ title() }}</h3>
        <p class="py-4 text-base-content/70">{{ message() }}</p>
        <div class="modal-action">
          <button class="btn btn-ghost" (click)="close()">Cancelar</button>
          <button class="btn btn-error" (click)="onConfirm()">
            {{ confirmText() }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input('Confirmar accion');
  readonly message = input('Esta seguro de que desea continuar?');
  readonly confirmText = input('Eliminar');
  readonly confirmed = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }
}
