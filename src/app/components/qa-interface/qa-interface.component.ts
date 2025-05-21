import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaService } from '../../services/qa.service';

@Component({
  selector: 'app-qa-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qa-interface.component.html',
  styleUrl: './qa-interface.component.css'
})
export class QaInterfaceComponent {
  question: string = '';
  answer: string | null = null;
  errorMessage: string | null = null;

  constructor(private qaService: QaService) { }

  askQuestion(): void {
    this.errorMessage = null;
    this.answer = null;
    if (this.question.trim()) {
      console.log('Asking question:', this.question);
      this.answer = 'Thinking...'; // Display a temporary message
      this.qaService.getAnswer(this.question).subscribe({
        next: (response: { answer: string }) => {
          this.answer = response.answer;
        },
        error: (error: any) => {
          console.error('Error getting answer', error);
          this.errorMessage = 'Failed to get answer.';
          this.answer = null;
        }
      });
    } else {
      this.errorMessage = 'Please enter a question.';
    }
  }
}
