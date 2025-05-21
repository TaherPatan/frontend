import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authServiceSpy.getToken.and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DocumentService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(DocumentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that no outstanding requests are pending
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload a document', () => {
    const dummyFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const dummyResponse = { id: 1, title: 'test', filename: 'test.txt', upload_time: new Date(), owner_id: 1 };

    service.uploadDocument(dummyFile).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/documents/');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(dummyResponse);
  });

  it('should get a list of documents', () => {
    const dummyDocuments = [
      { id: 1, title: 'Doc 1', filename: 'doc1.pdf', upload_time: new Date(), owner_id: 1 },
      { id: 2, title: 'Doc 2', filename: 'doc2.docx', upload_time: new Date(), owner_id: 1 }
    ];

    service.getDocuments().subscribe(documents => {
      expect(documents.length).toBe(2);
      expect(documents).toEqual(dummyDocuments);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/documents/');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyDocuments);
  });

  it('should get a single document by ID', () => {
    const dummyDocument = { id: 1, title: 'Doc 1', filename: 'doc1.pdf', upload_time: new Date(), owner_id: 1 };
    const documentId = 1;

    service.getDocument(documentId).subscribe(document => {
      expect(document).toEqual(dummyDocument);
    });

    const req = httpTestingController.expectOne(`http://localhost:8000/documents/${documentId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyDocument);
  });

  it('should delete a document by ID', () => {
    const dummyResponse = { message: 'Document deleted' };
    const documentId = 1;

    service.deleteDocument(documentId).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpTestingController.expectOne(`http://localhost:8000/documents/${documentId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyResponse);
  });

  it('should trigger ingestion for a document', () => {
    const dummyResponse = { message: 'Ingestion triggered' };
    const documentId = 1;

    service.triggerIngestion(documentId).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpTestingController.expectOne(`http://localhost:8000/ingest/${documentId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyResponse);
  });

  it('should get ingestion status', () => {
    const dummyStatus = { status: 'running', pending_tasks: 1, completed_tasks: 5 };

    service.getIngestionStatus().subscribe(status => {
      expect(status).toEqual(dummyStatus);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/ingestion/status');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyStatus);
  });

  it('should download a document', () => {
    const dummyBlob = new Blob(['file content'], { type: 'text/plain' });
    const documentId = 1;

    service.downloadDocument(documentId).subscribe(blob => {
      expect(blob).toEqual(dummyBlob);
    });

    const req = httpTestingController.expectOne(`http://localhost:8000/documents/${documentId}/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.responseType).toBe('blob');
    req.flush(dummyBlob);
  });
});
