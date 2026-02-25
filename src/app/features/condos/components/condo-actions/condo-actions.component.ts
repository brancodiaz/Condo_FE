import { Component, output } from '@angular/core';

@Component({
  selector: 'app-condo-actions',
  standalone: true,
  template: `
    <section class="mt-10">
      <h2 class="text-lg font-semibold text-base-content mb-4">
        Agregar un nuevo condominio
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          (click)="create.emit()"
          class="btn btn-primary gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear condominio
        </button>

        <button
          (click)="join.emit()"
          class="btn btn-outline btn-primary gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Unirse a uno existente
        </button>
      </div>

      <p class="text-center text-sm text-base-content/40 mt-3">
        Puedes crear hasta 2 condominios gratis.
      </p>
    </section>
  `,
})
export class CondoActionsComponent {
  readonly create = output<void>();
  readonly join = output<void>();
}
