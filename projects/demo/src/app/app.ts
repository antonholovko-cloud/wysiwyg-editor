import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditorConfig, EmailContent, EmailBlock } from '../../../ngx-wysiwyg-editor/src/lib/wysiwyg-editor.component';
import { WysiwygEditorComponent } from '../../../ngx-wysiwyg-editor/src/lib/wysiwyg-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  @ViewChild('editorComponent') editorComponent!: WysiwygEditorComponent;

  title = 'Email Template Editor Demo';

  // Email template content
  emailContent = '';

  // External blocks management
  externalBlocks: EmailBlock[] = [];
  currentBlocks: EmailBlock[] | null = null;

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

  onContentChange(content: EmailContent): void {
    this.emailContent = content.html;
    console.log('Email template content changed:', content);
    console.log('Blocks:', content.blocks);
    console.log('Settings:', content.settings);
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

  // External Block Management Methods
  onBlocksChange(blocks: EmailBlock[]): void {
    console.log('Blocks changed:', blocks);
  }

  addCustomBlock(): void {
    const customBlock: EmailBlock = {
      id: `custom_${Date.now()}`,
      type: 'text',
      content: {
        content: '<h2>Custom Added Block</h2><p>This block was added programmatically from the demo component.</p>',
        padding: '20px',
        fontSize: '14px',
        lineHeight: '1.6',
        textAlign: 'center',
        cssClass: 'custom-block'
      }
    };

    if (this.editorComponent) {
      const currentBlocks = this.editorComponent.getBlocks();
      this.editorComponent.setBlocks([...currentBlocks, customBlock]);
    }
  }

  loadPresetTemplate(): void {
    const presetBlocks: EmailBlock[] = [
      {
        id: 'preset_header',
        type: 'header',
        content: {
          companyName: 'Demo Company',
          tagline: 'Preset Template Example',
          backgroundColor: '#4CAF50',
          textColor: '#ffffff',
          height: '100px',
          alignment: 'center'
        }
      },
      {
        id: 'preset_text',
        type: 'text',
        content: {
          content: '<h2>Welcome to the Preset Template!</h2><p>This template was loaded programmatically using the external blocks management API.</p>',
          padding: '30px',
          fontSize: '14px',
          lineHeight: '1.8',
          textAlign: 'center'
        }
      },
      {
        id: 'preset_columns',
        type: 'columns',
        content: {
          count: 2,
          gap: '20px',
          columnBackground: '#f0f0f0',
          columns: [
            { content: '<h3>Feature 1</h3><p>Amazing features for your email campaigns.</p>' },
            { content: '<h3>Feature 2</h3><p>Easy to use and customize templates.</p>' }
          ]
        }
      },
      {
        id: 'preset_button',
        type: 'button',
        content: {
          text: 'Get Started',
          url: 'https://example.com',
          backgroundColor: '#4CAF50',
          textColor: '#ffffff',
          borderRadius: '8px',
          padding: '15px 30px',
          fontSize: '18px',
          alignment: 'center'
        }
      }
    ];

    this.externalBlocks = presetBlocks;
  }

  getBlocksFromEditor(): void {
    if (this.editorComponent) {
      this.currentBlocks = this.editorComponent.getBlocks();
      console.log('Retrieved blocks from editor:', this.currentBlocks);
    }
  }

  clearBlocks(): void {
    if (confirm('Are you sure you want to clear all blocks?')) {
      this.externalBlocks = [];
      this.currentBlocks = null;
    }
  }
}
