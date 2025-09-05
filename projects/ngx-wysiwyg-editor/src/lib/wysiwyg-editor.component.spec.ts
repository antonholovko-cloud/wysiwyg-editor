import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WysiwygEditorComponent, EditorConfig, EmailBlock } from './wysiwyg-editor.component';

describe('WysiwygEditorComponent', () => {
  let component: WysiwygEditorComponent;
  let fixture: ComponentFixture<WysiwygEditorComponent>;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WysiwygEditorComponent, FormsModule, DragDropModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WysiwygEditorComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default config', () => {
    expect(component.config.theme).toBe('light');
    expect(component.config.showBlockPanel).toBe(true);
    expect(component.config.showPropertiesPanel).toBe(true);
    expect(component.config.emailWidth).toBe('600px');
    expect(component.config.backgroundColor).toBe('#f4f4f4');
    expect(component.config.fontFamily).toBe('Arial, sans-serif');
  });

  it('should apply custom config', () => {
    const customConfig: EditorConfig = {
      theme: 'dark',
      showBlockPanel: false,
      showPropertiesPanel: false,
      emailWidth: '800px',
      backgroundColor: '#000000'
    };
    
    component.config = customConfig;
    component.ngOnInit();
    
    expect(component.config.theme).toBe('dark');
    expect(component.showBlockPanel).toBe(false);
    expect(component.showPropertiesPanel).toBe(false);
    expect(component.emailSettings.width).toBe('800px');
    expect(component.emailSettings.backgroundColor).toBe('#000000');
  });

  it('should load default template on init', () => {
    component.ngOnInit();
    
    expect(component.emailBlocks.length).toBeGreaterThan(0);
    expect(component.emailBlocks[0].type).toBe('header');
    expect(component.emailBlocks[1].type).toBe('text');
    expect(component.emailBlocks[2].type).toBe('button');
  });

  it('should generate unique block IDs', () => {
    const id1 = (component as any).generateId();
    const id2 = (component as any).generateId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('should add a new block', () => {
    const initialLength = component.emailBlocks.length;
    
    component.addBlock('text');
    
    expect(component.emailBlocks.length).toBe(initialLength + 1);
    expect(component.emailBlocks[component.emailBlocks.length - 1].type).toBe('text');
  });

  it('should duplicate a block', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'text',
      content: { content: 'Test content' }
    };
    component.emailBlocks = [block];
    
    component.duplicateBlock(block, 0);
    
    expect(component.emailBlocks.length).toBe(2);
    expect(component.emailBlocks[1].type).toBe('text');
    expect(component.emailBlocks[1].content.content).toBe('Test content');
    expect(component.emailBlocks[1].id).not.toBe(block.id);
  });

  it('should delete a block', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' },
      { id: '3', type: 'button' }
    ];
    
    component.deleteBlock(1);
    
    expect(component.emailBlocks.length).toBe(2);
    expect(component.emailBlocks[0].id).toBe('1');
    expect(component.emailBlocks[1].id).toBe('3');
  });

  it('should move block up', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    
    component.moveBlockUp(1);
    
    expect(component.emailBlocks[0].id).toBe('2');
    expect(component.emailBlocks[1].id).toBe('1');
  });

  it('should move block down', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    
    component.moveBlockDown(0);
    
    expect(component.emailBlocks[0].id).toBe('2');
    expect(component.emailBlocks[1].id).toBe('1');
  });

  it('should select a block', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'text',
      content: { content: 'Test' }
    };
    spyOn(component.blockSelected, 'emit');
    
    component.selectBlock(block, 0);
    
    expect(component.selectedBlock).toBe(block);
    expect(component.selectedBlockIndex).toBe(0);
    expect(component.currentBlockProperties).toEqual(block.content);
    expect(component.blockSelected.emit).toHaveBeenCalledWith(block);
  });

  it('should toggle block panel', () => {
    component.showBlockPanel = true;
    
    component.toggleBlockPanel();
    expect(component.showBlockPanel).toBe(false);
    
    component.toggleBlockPanel();
    expect(component.showBlockPanel).toBe(true);
  });

  it('should toggle properties panel', () => {
    component.showPropertiesPanel = true;
    
    component.togglePropertiesPanel();
    expect(component.showPropertiesPanel).toBe(false);
    
    component.togglePropertiesPanel();
    expect(component.showPropertiesPanel).toBe(true);
  });

  it('should update email settings', () => {
    component.updateEmailSetting('width', '700px');
    
    expect(component.emailSettings.width).toBe('700px');
  });

  it('should update block property', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'text',
      content: { content: 'Original' }
    };
    component.selectedBlock = block;
    
    component.updateBlockProperty('content', 'Updated');
    
    expect(block.content.content).toBe('Updated');
  });

  it('should handle columns count update', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'columns',
      content: {
        count: 2,
        columns: [
          { content: 'Column 1' },
          { content: 'Column 2' }
        ]
      }
    };
    component.selectedBlock = block;
    component.currentBlockProperties = { ...block.content };
    
    component.updateColumnsCount(3);
    
    expect(block.content.count).toBe(3);
    expect(block.content.columns.length).toBe(3);
  });

  it('should update column content', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'columns',
      content: {
        count: 2,
        columns: [
          { content: 'Original 1' },
          { content: 'Original 2' }
        ]
      }
    };
    component.selectedBlock = block;
    component.currentBlockProperties = { ...block.content };
    
    component.updateColumnContent(0, 'Updated content');
    
    expect(block.content.columns[0].content).toBe('Updated content');
  });

  it('should update social platform', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'social',
      content: {
        platforms: [
          { name: 'facebook', url: '#', icon: '📘' }
        ]
      }
    };
    component.selectedBlock = block;
    component.currentBlockProperties = { ...block.content };
    
    component.updateSocialPlatform(0, 'url', 'https://facebook.com');
    
    expect(block.content.platforms[0].url).toBe('https://facebook.com');
  });

  it('should generate email HTML', () => {
    component.emailBlocks = [
      {
        id: '1',
        type: 'header',
        content: {
          companyName: 'Test Company',
          tagline: 'Test Tagline',
          backgroundColor: '#2196F3',
          textColor: '#ffffff',
          height: '120px',
          alignment: 'center'
        }
      }
    ];
    
    const html = (component as any).generateEmailHtml();
    
    expect(html).toContain('Test Company');
    expect(html).toContain('Test Tagline');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should render header block correctly', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'header',
      content: {
        companyName: 'My Company',
        tagline: 'My Tagline',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        height: '100px',
        alignment: 'left'
      }
    };
    
    const html = component.renderBlock(block);
    
    expect(html).toContain('My Company');
    expect(html).toContain('My Tagline');
    expect(html).toContain('background-color: #000000');
  });

  it('should render text block correctly', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'text',
      content: {
        content: '<p>Test paragraph</p>',
        padding: '20px',
        fontSize: '16px',
        lineHeight: '1.5',
        textAlign: 'center'
      }
    };
    
    const html = component.renderBlock(block);
    
    expect(html).toContain('Test paragraph');
    expect(html).toContain('padding: 20px');
    expect(html).toContain('font-size: 16px');
  });

  it('should render button block correctly', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'button',
      content: {
        text: 'Click Me',
        url: 'https://example.com',
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
        borderRadius: '5px',
        padding: '10px 20px',
        fontSize: '18px',
        alignment: 'center'
      }
    };
    
    const html = component.renderBlock(block);
    
    expect(html).toContain('Click Me');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('background-color: #ff0000');
  });

  it('should save template to localStorage', () => {
    spyOn(localStorage, 'setItem');
    spyOn(window, 'alert');
    
    component.saveTemplate();
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'email-template',
      jasmine.any(String)
    );
    expect(window.alert).toHaveBeenCalledWith('Template saved successfully!');
  });

  it('should load template from localStorage', () => {
    const template = {
      blocks: [{ id: '1', type: 'header' as const }],
      settings: { width: '700px' },
      timestamp: new Date().toISOString()
    };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(template));
    
    component.loadTemplate();
    
    expect(component.emailBlocks).toEqual(template.blocks as EmailBlock[]);
    expect(component.emailSettings.width).toBe('700px');
  });

  it('should clear all blocks with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    component.selectedBlock = component.emailBlocks[0];
    component.selectedBlockIndex = 0;
    
    component.clearAll();
    
    expect(component.emailBlocks.length).toBe(0);
    expect(component.selectedBlock).toBeNull();
    expect(component.selectedBlockIndex).toBe(-1);
  });

  it('should not clear blocks if user cancels', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.emailBlocks = [
      { id: '1', type: 'header' }
    ];
    
    component.clearAll();
    
    expect(component.emailBlocks.length).toBe(1);
  });

  it('should export HTML', () => {
    const clickSpy = jasmine.createSpy('click');
    const anchor = document.createElement('a');
    anchor.click = clickSpy;
    spyOn(document, 'createElement').and.returnValue(anchor);
    
    component.exportHtml();
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should emit contentChange event', () => {
    spyOn(component.contentChange, 'emit');
    
    component.addBlock('text');
    
    expect(component.contentChange.emit).toHaveBeenCalled();
  });

  it('should write value for ControlValueAccessor', () => {
    const testValue = '<html>Test</html>';
    
    component.writeValue(testValue);
    
    expect(component.content).toBe(testValue);
  });

  it('should parse HTML and create blocks when writeValue is called', () => {
    const htmlWithMarkers = `
      <!-- block:header:start -->
      <div><h1>Test Company</h1><p>Test Tagline</p></div>
      <!-- block:header:end -->
      <!-- block:text:start -->
      <div>Some text content</div>
      <!-- block:text:end -->
    `;
    
    component.writeValue(htmlWithMarkers);
    
    expect(component.emailBlocks.length).toBe(2);
    expect(component.emailBlocks[0].type).toBe('header');
    expect(component.emailBlocks[0].content.companyName).toBe('Test Company');
    expect(component.emailBlocks[0].content.tagline).toBe('Test Tagline');
    expect(component.emailBlocks[1].type).toBe('text');
  });

  it('should create HTML block for non-marked HTML content', () => {
    const plainHtml = '<div>Plain HTML content without markers</div>';
    
    component.writeValue(plainHtml);
    
    expect(component.emailBlocks.length).toBe(1);
    expect(component.emailBlocks[0].type).toBe('html');
    expect(component.emailBlocks[0].content.html).toBe(plainHtml);
  });

  it('should clear blocks when writeValue receives empty value', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    component.selectedBlock = component.emailBlocks[0];
    component.selectedBlockIndex = 0;
    
    component.writeValue('');
    
    expect(component.emailBlocks.length).toBe(0);
    expect(component.selectedBlock).toBeNull();
    expect(component.selectedBlockIndex).toBe(-1);
  });

  it('should clear blocks when writeValue receives null', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' }
    ];
    
    component.writeValue(null as any);
    
    expect(component.emailBlocks.length).toBe(0);
  });

  it('should update view when writeValue is called', () => {
    spyOn(component as any, 'renderEmail');
    
    component.writeValue('<div>Test</div>');
    
    expect((component as any).renderEmail).toHaveBeenCalled();
  });

  it('should include block markers in generated HTML', () => {
    const block: EmailBlock = {
      id: 'test-id',
      type: 'header',
      content: {
        companyName: 'Test Co',
        tagline: 'Tagline',
        backgroundColor: '#000',
        textColor: '#fff',
        height: '100px',
        alignment: 'center'
      }
    };
    
    const html = component.renderBlock(block);
    
    expect(html).toContain('<!-- block:header:start -->');
    expect(html).toContain('<!-- block:header:end -->');
  });

  it('should handle form value updates in reactive forms', () => {
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    // Simulate form setting a new value
    const newHtml = '<div>New content from form</div>';
    component.writeValue(newHtml);
    
    expect(component.content).toBe(newHtml);
    expect(component.emailBlocks.length).toBe(1);
    expect(component.emailBlocks[0].type).toBe('html');
  });

  it('should emit changes when blocks are modified', () => {
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    component.addBlock('text');
    
    expect(onChangeFn).toHaveBeenCalled();
    const emittedHtml = onChangeFn.calls.mostRecent().args[0];
    expect(emittedHtml).toContain('<!-- block:text:start -->');
    expect(emittedHtml).toContain('<!-- block:text:end -->');
  });

  it('should preserve block content when parsing and regenerating', () => {
    const originalBlock: EmailBlock = {
      id: '1',
      type: 'text',
      content: { content: 'Test content here' }
    };
    component.emailBlocks = [originalBlock];
    
    // Generate HTML
    const generatedHtml = (component as any).generateEmailHtml();
    
    // Clear and parse back
    component.writeValue(generatedHtml);
    
    // Should have recreated the block
    expect(component.emailBlocks.length).toBeGreaterThan(0);
    // The content should be preserved (though structure might be in HTML block)
    expect(component.content).toContain('Test content');
  });

  it('should register onChange callback', () => {
    const onChangeFn = jasmine.createSpy('onChange');
    
    component.registerOnChange(onChangeFn);
    component.addBlock('text');
    
    expect(onChangeFn).toHaveBeenCalled();
  });

  it('should register onTouched callback', () => {
    const onTouchedFn = jasmine.createSpy('onTouched');
    
    component.registerOnTouched(onTouchedFn);
    
    expect(component.onTouched).toBe(onTouchedFn);
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
    
    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  it('should get safe HTML', () => {
    const html = '<p>Test</p>';
    spyOn(sanitizer, 'bypassSecurityTrustHtml');
    
    component.getSafeHtml(html);
    
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
  });

  it('should get block icon', () => {
    expect(component.getBlockIcon('header')).toBe('📰');
    expect(component.getBlockIcon('text')).toBe('📝');
    expect(component.getBlockIcon('unknown')).toBe('📄');
  });

  it('should get block label', () => {
    expect(component.getBlockLabel('header')).toBe('Header');
    expect(component.getBlockLabel('text')).toBe('Text');
    expect(component.getBlockLabel('unknown')).toBe('unknown');
  });

  it('should handle drag start', () => {
    component.onDragStarted();
    
    expect(component.isDragging).toBe(true);
  });

  it('should handle drag end', () => {
    component.isDragging = true;
    
    component.onDragEnded();
    
    expect(component.isDragging).toBe(false);
  });

  it('should not move block up if at start', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    
    component.moveBlockUp(0);
    
    expect(component.emailBlocks[0].id).toBe('1');
  });

  it('should not move block down if at end', () => {
    component.emailBlocks = [
      { id: '1', type: 'header' },
      { id: '2', type: 'text' }
    ];
    
    component.moveBlockDown(1);
    
    expect(component.emailBlocks[1].id).toBe('2');
  });
});