import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QaInterfaceComponent } from './qa-interface.component';
import { QaService } from '../../services/qa.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('QaInterfaceComponent', () => {
  let component: QaInterfaceComponent;
  let fixture: ComponentFixture<QaInterfaceComponent>;
  let qaServiceSpy: jasmine.SpyObj<QaService>;

  beforeEach(async () => {
    qaServiceSpy = jasmine.createSpyObj('QaService', ['getAnswer']);
    qaServiceSpy.getAnswer.and.returnValue(of({ answer: 'Dummy Answer' })); // Default mock

    await TestBed.configureTestingModule({
      imports: [QaInterfaceComponent, CommonModule, FormsModule],
      providers: [
        { provide: QaService, useValue: qaServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call qaService.getAnswer and set answer on success', () => {
    const question = 'Test question';
    const dummyAnswer = { answer: 'Dummy Answer' };
    qaServiceSpy.getAnswer.and.returnValue(of(dummyAnswer));

    component.question = question;
    component.askQuestion();

    expect(qaServiceSpy.getAnswer).toHaveBeenCalledWith(question);
    expect(component.answer).toBe(dummyAnswer.answer);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed qaService.getAnswer call', () => {
    const question = 'Test question';
    qaServiceSpy.getAnswer.and.returnValue(throwError(() => new Error('API Error')));

    component.question = question;
    component.askQuestion();

    expect(qaServiceSpy.getAnswer).toHaveBeenCalledWith(question);
    expect(component.answer).toBeNull();
    expect(component.errorMessage).toBe('Failed to get answer.');
  });

  it('should set error message if question is empty', () => {
    component.question = '';
    component.askQuestion();

    expect(qaServiceSpy.getAnswer).not.toHaveBeenCalled();
    expect(component.answer).toBeNull();
    expect(component.errorMessage).toBe('Please enter a question.');
  });

  it('should bind question input', () => {
    const questionInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    const testQuestion = 'Another test question';

    questionInput.value = testQuestion;
    questionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.question).toBe(testQuestion);
  });
});
