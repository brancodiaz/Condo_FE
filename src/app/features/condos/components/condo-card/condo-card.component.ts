import { Component, computed, input, output } from '@angular/core';
import { CondominiumDetailed } from '../../models/condominium.model';

@Component({
  selector: 'app-condo-card',
  standalone: true,
  template: `
    <button
      (click)="select.emit(condo())"
      class="card bg-base-100 shadow-sm hover:shadow-md border border-base-300
             transition-all duration-200 hover:-translate-y-0.5 cursor-pointer
             w-full text-left"
    >
      <div class="card-body p-5">
        <div class="flex items-start gap-4">
          <!-- Condo avatar -->
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            [style.background-color]="avatarBg()"
          >
            <span class="text-lg font-bold text-white">{{ condoInitials() }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-base-content text-base truncate">{{ condo().name }}</h3>
              <span class="badge badge-primary badge-xs">{{ condo().roleName }}</span>
            </div>
            @if (condo().address) {
              <p class="text-sm text-base-content/50 mt-0.5 truncate flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ condo().address }}
              </p>
            }
            @if (condo().totalUnits > 0) {
              <p class="text-xs text-base-content/40 mt-0.5">{{ condo().totalUnits }} unidades</p>
            }
          </div>

          <!-- Arrow indicator -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/30 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  `,
})
export class CondoCardComponent {
  readonly condo = input.required<CondominiumDetailed>();
  readonly select = output<CondominiumDetailed>();

  readonly condoInitials = computed(() => {
    const name = this.condo().name;
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  });

  readonly avatarBg = computed(() => {
    const colors = ['#4a6785', '#6b7b3a', '#8b5e3c', '#5c4b8a', '#3a7b7b', '#7b3a5e'];
    const hash = this.condo().name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  });
}
