import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BlockService } from '../../services/block.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Block } from '../../models/block.model';
import { BlockFormComponent } from '../../components/block-form/block-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-block-list',
  standalone: true,
  imports: [BlockFormComponent, PaginationComponent, ConfirmDialogComponent, DatePipe],
  templateUrl: './block-list.page.html',
})
export class BlockListPage implements OnInit {
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly blocks = signal<Block[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private blockToDelete: Block | null = null;

  readonly blockForm = viewChild.required(BlockFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    this.loading.set(true);
    this.blockService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.blocks.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los bloques');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadBlocks();
  }

  onCreate(): void {
    this.blockForm().openCreate();
  }

  onEdit(block: Block): void {
    this.blockForm().openEdit(block);
  }

  onDeleteRequest(block: Block): void {
    this.blockToDelete = block;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.blockToDelete) return;
    const id = this.blockToDelete.id;
    this.blockToDelete = null;

    this.blockService.delete(id).subscribe({
      next: () => {
        this.toast.success('Bloque eliminado');
        this.loadBlocks();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el bloque');
      },
    });
  }

  onFormSaved(): void {
    this.loadBlocks();
  }
}
