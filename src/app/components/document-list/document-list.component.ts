import { Component, OnInit, OnDestroy } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { CommonModule } from '@angular/common';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, DocumentUploadComponent],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  errorMessage: string | null = null;
  private pollingSubscription: Subscription | undefined;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.getDocuments();
    this.startPolling();
  }

  getDocuments(): void {
    console.log('DocumentListComponent: getDocuments() called.');
    this.documentService.getDocuments().pipe(
      switchMap(documents => {
        this.documents = documents.map(document => ({ ...document, ingestionStatus: '' })); // Initialize ingestionStatus to empty string
        if (!documents || documents.length === 0) {
          console.log('DocumentListComponent: Documents array is empty or null.');
          // Optionally set a message for the user if the list is empty
          // For example: if (data && data.length === 0) this.errorMessage = 'No documents found.';
          return []; // Return empty observable if no documents
        }
        console.log('DocumentListComponent: Received documents data:', documents);
        return this.documentService.getIngestionStatus();
      })
    ).subscribe({
      next: (statusData) => {
        console.log('DocumentListComponent: Received ingestion status data:', statusData);
        // Update the status of documents based on the ingestion status response
        this.documents = this.documents.map(document => {
          if (statusData[document.id]) {
            return { ...document, ingestionStatus: statusData[document.id].status };
          }
          return document;
        });
      },
      error: (error) => {
        console.error('DocumentListComponent: Error fetching documents or ingestion status in component:', error);
        this.errorMessage = 'Failed to load documents or ingestion status. Please check console for details.';
      }
    });
  }

  triggerIngestion(documentId: number): void {
    this.documentService.triggerIngestion(documentId).subscribe({
      next: (response) => {
        console.log('Ingestion triggered', response);
        // Update the document status in the list immediately
        this.documents = this.documents.map(document => {
          if (document.id === documentId) {
            return { ...document, ingestionStatus: 'pending' }; // Set status to pending immediately
          }
          return document;
        });
      },
      error: (error) => {
        console.error('Error triggering ingestion', error);
        this.errorMessage = 'Failed to trigger ingestion.';
      }
    });
  }

  deleteDocument(documentId: number): void {
    this.documentService.deleteDocument(documentId).subscribe({
      next: (response) => {
        console.log('Document deleted', response);
        this.documents = this.documents.filter(doc => doc.id !== documentId);
      },
      error: (error) => {
        console.error('Error deleting document', error);
        this.errorMessage = 'Failed to delete document.';
      }
    });
  }

  downloadDocument(documentId: number, filename: string): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading document', error);
        this.errorMessage = 'Failed to download document.';
      }
    });
  }

  private startPolling(): void {
    // Poll every 5 seconds (adjust as needed)
    this.pollingSubscription = interval(5000)
      .pipe(
        switchMap(() => this.documentService.getIngestionStatus())
      )
      .subscribe({
        next: (statusData) => {
          console.log('Polling ingestion status:', statusData);
          // Update the status of documents based on the polling response
          this.documents = this.documents.map(document => {
            if (statusData[document.id]) {
              return { ...document, ingestionStatus: statusData[document.id].status };
            }
            return document;
          });
        },
        error: (error) => {
          console.error('Error polling ingestion status:', error);
          // Handle error if necessary
        }
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
