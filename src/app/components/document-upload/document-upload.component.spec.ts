import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentUploadComponent } from './document-upload.component';
import { DocumentService } from '../../services/document.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('DocumentUploadComponent', () => {
  let component: DocumentUploadComponent;
  let fixture: ComponentFixture<DocumentUploadComponent>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    documentServiceSpy = jasmine.createSpyObj('DocumentService', ['uploadDocument']);
    documentServiceSpy.uploadDocument.and.returnValue(of({})); // Default mock

    await TestBed.configureTestingModule({
      imports: [DocumentUploadComponent, CommonModule],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedFile on file selection', () => {
    const testFile = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [testFile] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(testFile);
    expect(component.uploadSuccess).toBeFalse();
    expect(component.errorMessage).toBeNull();
  });

  it('should call documentService.uploadDocument and set uploadSuccess on success', () => {
    const testFile = new File([''], 'test.txt', { type: 'text/plain' });
    component.selectedFile = testFile;
    documentServiceSpy.uploadDocument.and.returnValue(of({}));

    component.uploadDocument();

    expect(documentServiceSpy.uploadDocument).toHaveBeenCalledWith(testFile);
    expect(component.uploadSuccess).toBeTrue();
    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed uploadDocument call', () => {
    const testFile = new File([''], 'test.txt', { type: 'text/plain' });
    component.selectedFile = testFile;
    documentServiceSpy.uploadDocument.and.returnValue(throwError(() => new Error('Upload failed')));

    component.uploadDocument();

    expect(documentServiceSpy.uploadDocument).toHaveBeenCalledWith(testFile);
    expect(component.uploadSuccess).toBeFalse();
    expect(component.errorMessage).toBe('File upload failed. Please try again.');
    expect(component.selectedFile).toBe(testFile); // File should not be cleared on failure
  });

  it('should disable upload button when no file is selected', () => {
    const uploadButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(uploadButton.disabled).toBeTrue();

    const testFile = new File([''], 'test.txt', { type: 'text/plain' });
    component.selectedFile = testFile;
    fixture.detectChanges();
    expect(uploadButton.disabled).toBeFalse();
  });
});
