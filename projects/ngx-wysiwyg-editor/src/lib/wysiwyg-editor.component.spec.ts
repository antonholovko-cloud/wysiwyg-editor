import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WysiwygEditorComponent, EmailBlock } from './wysiwyg-editor.component';

describe('WysiwygEditorComponent - Block Wrapper Issue', () => {
  let component: WysiwygEditorComponent;
  let fixture: ComponentFixture<WysiwygEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WysiwygEditorComponent, FormsModule, DragDropModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WysiwygEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Block Wrapper Classes', () => {
    it('should not create nested block-wrapper classes on multiple renders', () => {
      // Create a simple text block
      const testBlock: EmailBlock = {
        id: 'test-block-1',
        type: 'text',
        content: {
          content: '<p>Test content</p>',
          cssClass: 'custom-class'
        }
      };

      // First render
      const firstRender = component.renderBlock(testBlock);
      const firstWrapperCount = (firstRender.match(/block-wrapper/g) || []).length;
      
      // Should have exactly one block-wrapper
      expect(firstWrapperCount).toBe(1);
      expect(firstRender).toContain('class=\"block-wrapper custom-class\"');

      // Second render (simulating re-render scenario)
      const secondRender = component.renderBlock(testBlock);
      const secondWrapperCount = (secondRender.match(/block-wrapper/g) || []).length;
      
      // Should still have exactly one block-wrapper, not nested
      expect(secondWrapperCount).toBe(1);
      expect(secondRender).toContain('class=\"block-wrapper custom-class\"');
      
      // The two renders should be identical
      expect(firstRender).toBe(secondRender);
    });

    it('should handle custom CSS classes without duplication', () => {
      const testBlock: EmailBlock = {
        id: 'test-block-2',
        type: 'header',
        content: {
          companyName: 'Test Company',
          tagline: 'Test Tagline',
          cssClass: 'header-custom'
        }
      };

      const rendered = component.renderBlock(testBlock);
      
      // Should have exactly one instance of each class
      expect((rendered.match(/block-wrapper/g) || []).length).toBe(1);
      expect((rendered.match(/header-custom/g) || []).length).toBe(1);
      expect(rendered).toContain('class=\"block-wrapper header-custom\"');
    });

    it('should handle visibility classes correctly', () => {
      const testBlock: EmailBlock = {
        id: 'test-block-3',
        type: 'button',
        content: {
          text: 'Click Me',
          url: '#',
          visibility: 'desktop-only'
        }
      };

      const rendered = component.renderBlock(testBlock);
      
      // Should have exactly one block-wrapper and one visibility class
      expect((rendered.match(/block-wrapper/g) || []).length).toBe(1);
      expect((rendered.match(/visibility-desktop-only/g) || []).length).toBe(1);
      expect(rendered).toContain('class=\"block-wrapper visibility-desktop-only\"');
    });

    it('should handle multiple classes without nesting wrappers', () => {
      const testBlock: EmailBlock = {
        id: 'test-block-4',
        type: 'image',
        content: {
          src: 'test.jpg',
          alt: 'Test Image',
          cssClass: 'image-custom another-class',
          visibility: 'mobile-only'
        }
      };

      const rendered = component.renderBlock(testBlock);
      
      // Should have exactly one block-wrapper
      expect((rendered.match(/block-wrapper/g) || []).length).toBe(1);
      expect(rendered).toContain('class=\"block-wrapper image-custom another-class visibility-mobile-only\"');
    });

    it('should not create nested wrappers when block content already contains wrapper', () => {
      // Simulate a block that might already have wrapper HTML from previous render
      const testBlock: EmailBlock = {
        id: 'test-block-5',
        type: 'html',
        content: {
          code: '<div class=\"existing-wrapper\">Some content</div>'
        }
      };

      const rendered = component.renderBlock(testBlock);
      
      // Should have exactly one block-wrapper (the outer one we add)
      // and one existing-wrapper (from the content)
      expect((rendered.match(/block-wrapper/g) || []).length).toBe(1);
      expect((rendered.match(/existing-wrapper/g) || []).length).toBe(1);
      
      // The block-wrapper should be the outer wrapper
      expect(rendered.indexOf('block-wrapper')).toBeLessThan(rendered.indexOf('existing-wrapper'));
    });
  });

  describe('getWrapperClasses method', () => {
    it('should return basic wrapper class when no additional classes', () => {
      const classes = component.getWrapperClasses({});
      expect(classes).toBe('block-wrapper');
    });

    it('should append custom CSS class', () => {
      const classes = component.getWrapperClasses({ cssClass: 'custom' });
      expect(classes).toBe('block-wrapper custom');
    });

    it('should append visibility class', () => {
      const classes = component.getWrapperClasses({ visibility: 'mobile-only' });
      expect(classes).toBe('block-wrapper visibility-mobile-only');
    });

    it('should combine multiple classes correctly', () => {
      const classes = component.getWrapperClasses({ 
        cssClass: 'custom another', 
        visibility: 'desktop-only' 
      });
      expect(classes).toBe('block-wrapper custom another visibility-desktop-only');
    });
  });
});