import { Component } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.css'
})
export class DocumentUploadComponent {
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  errorMessage: string | null = null;

  constructor(private documentService: DocumentService) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.uploadSuccess = false;
    this.errorMessage = null;
  }

  uploadDocument(): void {
    if (this.selectedFile) {
      this.documentService.uploadDocument(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Upload successful', response);
          this.uploadSuccess = true;
          this.selectedFile = null; // Clear the selected file after successful upload
        },
        error: (error) => {
          console.error('Upload failed', error);
          this.errorMessage = 'File upload failed. Please try again.';
        }
      });
    }
  }
}
