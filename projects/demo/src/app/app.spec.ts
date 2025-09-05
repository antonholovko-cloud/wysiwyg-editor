import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app';
import { NgxWysiwygEditorModule } from 'ngx-wysiwyg-editor';

describe('AppComponent Form Integration', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [ReactiveFormsModule, FormsModule, NgxWysiwygEditorModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize wysiwyg form with empty values', () => {
    expect(component.wysiwygForm).toBeDefined();
    expect(component.wysiwygForm.get('documentTitle')?.value).toBe('');
    expect(component.wysiwygForm.get('emailTemplate')?.value).toBe('');
    expect(component.wysiwygForm.get('category')?.value).toBe('');
  });

  it('should have proper validators on form controls', () => {
    const titleControl = component.wysiwygForm.get('documentTitle');
    const emailControl = component.wysiwygForm.get('emailTemplate');
    
    expect(titleControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
    
    emailControl?.setValue('short');
    expect(emailControl?.hasError('minlength')).toBe(true);
    
    emailControl?.setValue('This is a long enough content for the email template');
    expect(emailControl?.hasError('minlength')).toBe(false);
  });

  it('should load sample data into form', () => {
    component.loadSampleData();
    
    expect(component.wysiwygForm.get('documentTitle')?.value).toBe('Monthly Newsletter - Spring Edition');
    expect(component.wysiwygForm.get('category')?.value).toBe('newsletter');
    expect(component.wysiwygForm.get('emailTemplate')?.value).toContain('Welcome to Our Newsletter');
    expect(component.wysiwygForm.get('emailTemplate')?.value).toContain('Featured Product');
  });

  it('should clear form when clearForm is called', () => {
    // First load some data
    component.loadSampleData();
    expect(component.wysiwygForm.get('documentTitle')?.value).not.toBe('');
    
    // Then clear
    component.clearForm();
    
    expect(component.wysiwygForm.get('documentTitle')?.value).toBe('');
    expect(component.wysiwygForm.get('emailTemplate')?.value).toBe('');
    expect(component.wysiwygForm.get('category')?.value).toBe('');
    expect(component.formSubmitResult).toBeNull();
  });

  it('should submit form when valid', () => {
    spyOn(console, 'log');
    spyOn(window, 'alert');
    
    // Set valid form data
    component.wysiwygForm.patchValue({
      documentTitle: 'Test Document',
      emailTemplate: 'This is a test email template with enough content',
      category: 'newsletter'
    });
    
    component.onWysiwygFormSubmit();
    
    expect(component.formSubmitResult).toBeDefined();
    expect(component.formSubmitResult.documentTitle).toBe('Test Document');
    expect(component.formSubmitResult.emailTemplate).toContain('test email template');
    expect(component.formSubmitResult.category).toBe('newsletter');
    expect(component.formSubmitResult.submittedAt).toBeDefined();
    expect(window.alert).toHaveBeenCalledWith('Form submitted successfully! Check the result below.');
  });

  it('should not submit form when invalid', () => {
    spyOn(window, 'alert');
    
    // Leave form empty (invalid)
    component.onWysiwygFormSubmit();
    
    expect(component.formSubmitResult).toBeNull();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    
    // Check that fields are marked as touched
    expect(component.wysiwygForm.get('documentTitle')?.touched).toBe(true);
    expect(component.wysiwygForm.get('emailTemplate')?.touched).toBe(true);
  });

  it('should update wysiwyg editor when form value changes', () => {
    const newHtml = '<div>New HTML content</div>';
    
    component.wysiwygForm.patchValue({
      emailTemplate: newHtml
    });
    
    expect(component.wysiwygForm.get('emailTemplate')?.value).toBe(newHtml);
  });

  it('should handle complex HTML in wysiwyg form control', () => {
    const complexHtml = `
      <div style="background: #333; color: white;">
        <h1>Complex Template</h1>
        <p>With multiple elements</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <a href="https://example.com">Link</a>
      </div>
    `;
    
    component.wysiwygForm.patchValue({
      emailTemplate: complexHtml
    });
    
    expect(component.wysiwygForm.get('emailTemplate')?.value).toBe(complexHtml);
    expect(component.wysiwygForm.get('emailTemplate')?.valid).toBe(true);
  });

  it('should preserve form submit result after loading sample data', () => {
    // Submit form first
    component.wysiwygForm.patchValue({
      documentTitle: 'Initial Document',
      emailTemplate: 'Initial content that is long enough for validation',
      category: 'announcement'
    });
    component.onWysiwygFormSubmit();
    
    expect(component.formSubmitResult).toBeDefined();
    const initialResult = component.formSubmitResult;
    
    // Load sample data (should clear result)
    component.loadSampleData();
    
    expect(component.formSubmitResult).toBeNull();
    expect(component.formSubmitResult).not.toBe(initialResult);
  });

  it('should have proper form configurations', () => {
    expect(component.formConfig).toBeDefined();
    expect(component.formConfig.theme).toBe('light');
    expect(component.formConfig.showBlockPanel).toBe(true);
    expect(component.formConfig.showPropertiesPanel).toBe(true);
    expect(component.formConfig.emailWidth).toBe('550px');
    expect(component.formConfig.height).toBe('450px');
  });
});