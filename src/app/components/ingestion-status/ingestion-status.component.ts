import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ingestion-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingestion-status.component.html',
  styleUrl: './ingestion-status.component.css'
})
export class IngestionStatusComponent implements OnInit, OnDestroy {
  ingestionTasks: any = {};
  errorMessage: string | null = null;
  private statusSubscription: Subscription | null = null;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.fetchIngestionStatus();
    // Refresh status every 5 seconds
    this.statusSubscription = interval(5000)
      .pipe(switchMap(() => this.documentService.getIngestionStatus()))
      .subscribe({
        next: (data) => {
          this.ingestionTasks = data;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error fetching ingestion status', error);
          this.errorMessage = 'Failed to load ingestion status.';
        }
      });
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  fetchIngestionStatus(): void {
    this.documentService.getIngestionStatus().subscribe({
      next: (data) => {
        this.ingestionTasks = data;
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Error fetching ingestion status', error);
        this.errorMessage = 'Failed to load ingestion status.';
      }
    });
  }

  getTaskIds(): string[] {
    return Object.keys(this.ingestionTasks);
  }
}
