import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentListComponent } from './document-list.component';
import { DocumentService } from '../../services/document.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    documentServiceSpy = jasmine.createSpyObj('DocumentService', ['getDocuments', 'triggerIngestion', 'deleteDocument', 'downloadDocument']);
    documentServiceSpy.getDocuments.and.returnValue(of([])); // Default mock

    await TestBed.configureTestingModule({
      imports: [DocumentListComponent, CommonModule],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDocuments on ngOnInit', () => {
    expect(documentServiceSpy.getDocuments).toHaveBeenCalled();
  });

  it('should populate documents on successful getDocuments call', () => {
    const dummyDocuments = [{ id: 1, title: 'Doc 1', filename: 'doc1.pdf' }];
    documentServiceSpy.getDocuments.and.returnValue(of(dummyDocuments));

    component.getDocuments();

    expect(component.documents).toEqual(dummyDocuments);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed getDocuments call', () => {
    documentServiceSpy.getDocuments.and.returnValue(throwError(() => new Error('Failed to fetch')));

    component.getDocuments();

    expect(component.documents).toEqual([]);
    expect(component.errorMessage).toBe('Failed to load documents.');
  });

  it('should call triggerIngestion on documentService', () => {
    const documentId = 1;
    documentServiceSpy.triggerIngestion.and.returnValue(of({}));

    component.triggerIngestion(documentId);

    expect(documentServiceSpy.triggerIngestion).toHaveBeenCalledWith(documentId);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed triggerIngestion call', () => {
    const documentId = 1;
    documentServiceSpy.triggerIngestion.and.returnValue(throwError(() => new Error('Failed to trigger')));

    component.triggerIngestion(documentId);

    expect(component.errorMessage).toBe('Failed to trigger ingestion.');
  });

  it('should call deleteDocument on documentService and remove document from list', () => {
    const documentId = 1;
    component.documents = [{ id: 1, title: 'Doc 1', filename: 'doc1.pdf' }];
    documentServiceSpy.deleteDocument.and.returnValue(of({}));

    component.deleteDocument(documentId);

    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith(documentId);
    expect(component.documents.length).toBe(0);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed deleteDocument call', () => {
    const documentId = 1;
    component.documents = [{ id: 1, title: 'Doc 1', filename: 'doc1.pdf' }];
    documentServiceSpy.deleteDocument.and.returnValue(throwError(() => new Error('Failed to delete')));

    component.deleteDocument(documentId);

    expect(component.errorMessage).toBe('Failed to delete document.');
    expect(component.documents.length).toBe(1); // Document should not be removed on failure
  });

  it('should call downloadDocument on documentService and trigger file download', () => {
    const documentId = 1;
    const filename = 'test.txt';
    const dummyBlob = new Blob(['file content'], { type: 'text/plain' });
    documentServiceSpy.downloadDocument.and.returnValue(of(dummyBlob));

    // Mock the necessary browser APIs for file download
    const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('fake-url');
    const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
    const createElementSpy = spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: jasmine.createSpy('click'),
          remove: jasmine.createSpy('remove') // Mock remove method
        } as any; // Cast to any to bypass strict type checking
      }
      return document.createElement(tagName); // Use original for other elements
    });
    const appendChildSpy = spyOn(document.body, 'appendChild');
    const removeChildSpy = spyOn(document.body, 'removeChild');


    component.downloadDocument(documentId, filename);

    expect(documentServiceSpy.downloadDocument).toHaveBeenCalledWith(documentId);
    expect(createObjectURLSpy).toHaveBeenCalledWith(dummyBlob);
    expect(createElementSpy).toHaveBeenCalledWith('a');

    const mockLink = (createElementSpy as jasmine.Spy).calls.first().returnValue;
    expect(mockLink.href).toBe('fake-url');
    expect(mockLink.download).toBe(filename);
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('fake-url');
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed downloadDocument call', () => {
    const documentId = 1;
    const filename = 'test.txt';
    documentServiceSpy.downloadDocument.and.returnValue(throwError(() => new Error('Failed to download')));

    component.downloadDocument(documentId, filename);

    expect(component.errorMessage).toBe('Failed to download document.');
  });
});
