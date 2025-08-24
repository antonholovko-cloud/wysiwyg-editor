import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WysiwygEditorComponent, EditorConfig, EditorCommand } from 'ngx-wysiwyg-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WysiwygEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'WYSIWYG Editor Demo';
  
  // Basic example
  basicContent = '<h2>Welcome to the WYSIWYG Editor!</h2><p>This is a <strong>powerful</strong> and <em>customizable</em> HTML editor for Angular applications.</p>';
  
  // Form example
  form: FormGroup;
  
  // Custom configuration example
  customContent = '<h3>Custom Editor</h3><p>This editor has a custom toolbar configuration.</p>';
  
  // Configuration examples
  defaultConfig: EditorConfig = {
    height: '300px',
    placeholder: 'Start typing your content here...'
  };
  
  customConfig: EditorConfig = {
    height: '250px',
    minHeight: '200px',
    maxHeight: '400px',
    placeholder: 'Custom editor with limited toolbar...',
    customButtons: [
      { command: 'bold', icon: 'B', tooltip: 'Bold' },
      { command: 'italic', icon: 'I', tooltip: 'Italic' },
      { command: 'underline', icon: 'U', tooltip: 'Underline' },
      { command: 'separator' },
      { command: 'formatBlock', value: 'h1', icon: 'H1', tooltip: 'Heading 1' },
      { command: 'formatBlock', value: 'h2', icon: 'H2', tooltip: 'Heading 2' },
      { command: 'formatBlock', value: 'p', icon: '¶', tooltip: 'Paragraph' },
      { command: 'separator' },
      { command: 'createLink', icon: '🔗', tooltip: 'Insert Link', requiresValue: true },
      { command: 'insertImage', icon: '🖼', tooltip: 'Insert Image', requiresValue: true },
      { command: 'separator' },
      { command: 'setPadding', icon: '📦', tooltip: 'Set Padding', requiresValue: true },
      { command: 'separator' },
      { command: 'foreColor', icon: 'A', tooltip: 'Text Color', requiresValue: true },
      { command: 'removeFormat', icon: '✖', tooltip: 'Clear Formatting' }
    ]
  };
  
  compactConfig: EditorConfig = {
    height: '200px',
    placeholder: 'Compact editor...',
    customButtons: [
      { command: 'bold', icon: 'B', tooltip: 'Bold' },
      { command: 'italic', icon: 'I', tooltip: 'Italic' },
      { command: 'separator' },
      { command: 'createLink', icon: '🔗', tooltip: 'Insert Link', requiresValue: true },
      { command: 'setPadding', icon: '📦', tooltip: 'Set Padding', requiresValue: true }
    ]
  };
  
  // Read-only content
  readOnlyContent = '<h3>Read-Only Editor</h3><p>This editor is <strong>disabled</strong> and shows how content appears in read-only mode.</p><p style="padding: 10px 20px; background-color: #f0f8ff;">This paragraph has custom padding applied!</p>';
  
  // HTML output display
  showHtmlOutput = false;
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['Sample Document', Validators.required],
      content: ['<h2>Document Content</h2><p>Enter your document content here...</p>', [Validators.required, Validators.minLength(10)]],
      description: ['This is a sample description.']
    });
  }
  
  onContentChange(content: string, editorName: string): void {
    console.log(`Content changed in ${editorName}:`, content);
  }
  
  onEditorFocus(editorName: string): void {
    console.log(`${editorName} focused`);
  }
  
  onEditorBlur(editorName: string): void {
    console.log(`${editorName} blurred`);
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
  
  clearContent(property: string): void {
    (this as any)[property] = '';
  }
  
  loadSampleContent(property: string): void {
    const sampleContent = `
      <h1>Sample Document</h1>
      <p>This is a sample document with various formatting options.</p>
      
      <h2>Features Demonstrated:</h2>
      <ul>
        <li><strong>Bold text</strong></li>
        <li><em>Italic text</em></li>
        <li><u>Underlined text</u></li>
        <li><s>Strikethrough text</s></li>
      </ul>
      
      <h3>Lists and Alignment</h3>
      <ol>
        <li>Numbered list item 1</li>
        <li>Numbered list item 2</li>
        <li>Numbered list item 3</li>
      </ol>
      
      <p style="text-align: center;">This paragraph is center-aligned.</p>
      <p style="text-align: right;">This paragraph is right-aligned.</p>
      
      <h3>Links and Images</h3>
      <p>Here's a <a href="https://angular.io">link to Angular</a>.</p>
      
      <h3>Custom Padding</h3>
      <p style="padding: 15px 25px; background-color: #f9f9f9; border: 1px solid #ddd;">
        This paragraph has custom padding: 15px top/bottom and 25px left/right.
      </p>
      
      <hr>
      
      <p>
        <sub>Subscript text</sub> and <sup>superscript text</sup> are also supported.
      </p>
      
      <blockquote style="padding: 10px 20px; background-color: #f0f8ff; border-left: 4px solid #007bff;">
        This is a blockquote with custom styling applied using the padding controls.
      </blockquote>
    `;
    
    (this as any)[property] = sampleContent;
  }
}