import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QaService } from './qa.service';
import { AuthService } from './auth.service';

describe('QaService', () => {
  let service: QaService;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authServiceSpy.getToken.and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        QaService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(QaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that no outstanding requests are pending
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a question to the backend and return the answer', () => {
    const dummyQuestion = 'What is the capital of France?';
    const dummyAnswer = { answer: 'Paris' };

    service.getAnswer(dummyQuestion).subscribe(response => {
      expect(response).toEqual(dummyAnswer);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/qa');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.body).toEqual({ question: dummyQuestion });
    req.flush(dummyAnswer);
  });
});
