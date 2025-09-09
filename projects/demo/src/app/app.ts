import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditorConfig } from '../../../ngx-wysiwyg-editor/src/lib/wysiwyg-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'Email Template Editor Demo';

  // Email template content
  emailContent = '';

  // Form example
  form: FormGroup;

  // WYSIWYG Form with editor control
  wysiwygForm: FormGroup;
  formSubmitResult: any = null;

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

  formConfig: EditorConfig = {
    theme: 'light',
    showBlockPanel: true,
    showPropertiesPanel: true,
    emailWidth: '550px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
    height: '450px'
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

    // Initialize WYSIWYG form with proper form control
    this.wysiwygForm = this.fb.group({
      documentTitle: ['', [Validators.required]],
      emailTemplate: ['', [Validators.required, Validators.minLength(20)]],
      category: ['']
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
    debugger
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

  // Form Integration Methods
  onWysiwygFormSubmit(): void {
    if (this.wysiwygForm.valid) {
      this.formSubmitResult = {
        ...this.wysiwygForm.value,
        submittedAt: new Date().toISOString()
      };
      console.log('WYSIWYG Form submitted:', this.formSubmitResult);
      alert('Form submitted successfully! Check the result below.');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.wysiwygForm.controls).forEach(key => {
        this.wysiwygForm.get(key)?.markAsTouched();
      });
      alert('Please fill in all required fields correctly.');
    }
  }

  loadSampleData(): void {
    // Sample email template HTML content
    const sampleEmailHtml = `
      <div style="background-color: #2196F3; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Our Newsletter!</h1>
        <p style="color: white; margin: 10px 0;">Stay updated with our latest news and offers</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333;">Hello Subscriber!</h2>
        <p style="color: #666; line-height: 1.6;">
          We're excited to have you as part of our community. This month, we have some amazing updates
          and exclusive offers just for you.
        </p>
        <div style="margin: 30px 0;">
          <h3 style="color: #2196F3;">Featured Product</h3>
          <p style="color: #666;">
            Check out our latest product that's been getting rave reviews from customers worldwide.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
              Shop Now
            </a>
          </div>
        </div>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2024 Your Company. All rights reserved.
        </p>
      </div>
    `;

    // Set form values including the WYSIWYG editor content
    this.wysiwygForm.patchValue({
      documentTitle: 'Monthly Newsletter - Spring Edition',
      emailTemplate: sampleEmailHtml,
      category: 'newsletter'
    });

    // Clear previous result
    this.formSubmitResult = null;

    console.log('Sample data loaded into form');
  }

  clearForm(): void {
    this.wysiwygForm.reset({
      documentTitle: '',
      emailTemplate: '',
      category: ''
    });
    this.formSubmitResult = null;
    console.log('Form cleared');
  }
}
