import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-between mt-4">
        <p class="text-sm text-base-content/50">
          Mostrando {{ startItem() }}-{{ endItem() }} de {{ totalCount() }}
        </p>
        <div class="join">
          <button
            class="join-item btn btn-sm"
            [disabled]="pageNumber() <= 1"
            (click)="pageChange.emit(pageNumber() - 1)"
          >
            &laquo;
          </button>
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <button class="join-item btn btn-sm btn-disabled">...</button>
            } @else {
              <button
                class="join-item btn btn-sm"
                [class.btn-active]="page === pageNumber()"
                (click)="pageChange.emit(page)"
              >
                {{ page }}
              </button>
            }
          }
          <button
            class="join-item btn btn-sm"
            [disabled]="pageNumber() >= totalPages()"
            (click)="pageChange.emit(pageNumber() + 1)"
          >
            &raquo;
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly pageNumber = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  readonly startItem = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.pageNumber() - 1) * this.pageSize() + 1;
  });

  readonly endItem = computed(() =>
    Math.min(this.pageNumber() * this.pageSize(), this.totalCount()),
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1); // ellipsis
    pages.push(total);

    return pages;
  });
}
