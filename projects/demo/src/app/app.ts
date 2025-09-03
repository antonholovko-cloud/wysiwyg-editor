import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WysiwygEditorComponent, EditorConfig } from 'ngx-wysiwyg-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WysiwygEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'Email Template Editor Demo';
  
  // Email template content
  emailContent = '';
  
  // Form example
  form: FormGroup;
  
  // Configuration examples
  defaultConfig: EditorConfig = {
    theme: 'light',
    showBlockPanel: true,
    showPropertiesPanel: true,
    emailWidth: '600px',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif',
    height: '600px'
  };
  
  compactConfig: EditorConfig = {
    theme: 'light',
    showBlockPanel: true,
    showPropertiesPanel: false,
    emailWidth: '500px',
    height: '400px'
  };
  
  // Current selected block
  selectedBlock: any = null;
  
  // HTML output display
  showHtmlOutput = false;
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['Sample Document', Validators.required],
      content: ['<h2>Document Content</h2><p>Enter your document content here...</p>', [Validators.required, Validators.minLength(10)]],
      description: ['This is a sample description.']
    });
  }
  
  onContentChange(content: string): void {
    this.emailContent = content;
    console.log('Email template content changed:', content);
  }
  
  onBlockSelected(block: any): void {
    this.selectedBlock = block;
    console.log('Block selected:', block);
  }
  
  onEditorFocus(): void {
    console.log('Editor focused');
  }
  
  onEditorBlur(): void {
    console.log('Editor blurred');
  }
  
  onFormSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
      alert('Form submitted successfully! Check console for details.');
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
  
  toggleHtmlOutput(): void {
    this.showHtmlOutput = !this.showHtmlOutput;
  }
  
  downloadTemplate(): void {
    if (this.emailContent) {
      const blob = new Blob([this.emailContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  
  copyHtml(): void {
    if (this.emailContent) {
      navigator.clipboard.writeText(this.emailContent).then(() => {
        alert('HTML copied to clipboard!');
      });
    }
  }
}