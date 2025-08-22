import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { WysiwygEditorComponent, EditorConfig } from './wysiwyg-editor.component';

describe('WysiwygEditorComponent', () => {
  let component: WysiwygEditorComponent;
  let fixture: ComponentFixture<WysiwygEditorComponent>;
  let editorElement: HTMLElement;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WysiwygEditorComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WysiwygEditorComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
    editorElement = fixture.nativeElement.querySelector('.wysiwyg-editor-content');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default config', () => {
    expect(component.config.height).toBe('400px');
    expect(component.config.minHeight).toBe('200px');
    expect(component.config.maxHeight).toBe('600px');
    expect(component.config.placeholder).toBe('Start typing...');
    expect(component.config.showToolbar).toBe(true);
  });

  it('should apply custom config', () => {
    const customConfig: EditorConfig = {
      height: '500px',
      placeholder: 'Custom placeholder',
      showToolbar: false
    };
    
    component.config = customConfig;
    component.ngOnInit();
    
    expect(component.config.height).toBe('500px');
    expect(component.config.placeholder).toBe('Custom placeholder');
    expect(component.config.showToolbar).toBe(false);
  });

  it('should render toolbar when showToolbar is true', () => {
    component.config.showToolbar = true;
    fixture.detectChanges();
    
    const toolbar = fixture.nativeElement.querySelector('.wysiwyg-toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should hide toolbar when showToolbar is false', () => {
    component.config.showToolbar = false;
    fixture.detectChanges();
    
    const toolbar = fixture.nativeElement.querySelector('.wysiwyg-toolbar');
    expect(toolbar).toBeFalsy();
  });

  it('should set contentEditable based on disabled state', () => {
    component.disabled = false;
    component.ngAfterViewInit();
    expect(editorElement.contentEditable).toBe('true');
    
    component.setDisabledState(true);
    expect(editorElement.contentEditable).toBe('false');
  });

  it('should emit contentChange event on content change', () => {
    spyOn(component.contentChange, 'emit');
    
    const testContent = '<p>Test content</p>';
    editorElement.innerHTML = testContent;
    editorElement.dispatchEvent(new Event('input'));
    
    expect(component.contentChange.emit).toHaveBeenCalledWith(testContent);
  });

  it('should emit blur event on blur', () => {
    spyOn(component.blur, 'emit');
    
    editorElement.dispatchEvent(new Event('blur'));
    
    expect(component.blur.emit).toHaveBeenCalled();
  });

  it('should emit focus event on focus', () => {
    spyOn(component.focus, 'emit');
    
    editorElement.dispatchEvent(new Event('focus'));
    
    expect(component.focus.emit).toHaveBeenCalled();
  });

  it('should execute bold command', () => {
    spyOn(document, 'execCommand');
    
    const boldCommand = component.defaultCommands.find(cmd => cmd.command === 'bold');
    if (boldCommand) {
      component.executeCommand(boldCommand);
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
    }
  });

  it('should execute italic command', () => {
    spyOn(document, 'execCommand');
    
    const italicCommand = component.defaultCommands.find(cmd => cmd.command === 'italic');
    if (italicCommand) {
      component.executeCommand(italicCommand);
      expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
    }
  });

  it('should execute formatBlock command with value', () => {
    spyOn(document, 'execCommand');
    
    const h1Command = component.defaultCommands.find(cmd => cmd.command === 'formatBlock' && cmd.value === 'h1');
    if (h1Command) {
      component.executeCommand(h1Command);
      expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h1');
    }
  });

  it('should open link dialog on createLink command', () => {
    // Create a selection first
    const selection = window.getSelection();
    const range = document.createRange();
    const textNode = document.createTextNode('test');
    editorElement.appendChild(textNode);
    range.selectNodeContents(textNode);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    const linkCommand = component.defaultCommands.find(cmd => cmd.command === 'createLink');
    if (linkCommand) {
      component.executeCommand(linkCommand);
      expect(component.showLinkDialog).toBe(true);
    }
  });

  it('should insert link with URL', () => {
    spyOn(document, 'execCommand');
    
    const selection = window.getSelection();
    const range = document.createRange();
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    component.selectedRange = range;
    component.linkUrl = 'https://example.com';
    component.insertLink();
    
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
    expect(component.showLinkDialog).toBe(false);
  });

  it('should close link dialog', () => {
    component.showLinkDialog = true;
    component.linkUrl = 'test';
    component.selectedRange = document.createRange();
    
    component.closeLinkDialog();
    
    expect(component.showLinkDialog).toBe(false);
    expect(component.linkUrl).toBe('');
    expect(component.selectedRange).toBeNull();
  });

  it('should show color picker on foreColor command', () => {
    const colorCommand = component.defaultCommands.find(cmd => cmd.command === 'foreColor');
    if (colorCommand) {
      component.executeCommand(colorCommand);
      expect(component.showColorPicker).toBe(true);
    }
  });

  it('should apply text color', () => {
    spyOn(document, 'execCommand');
    
    component.selectedColor = '#ff0000';
    component.applyTextColor();
    
    expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    expect(component.showColorPicker).toBe(false);
  });

  it('should show background color picker on backColor command', () => {
    const bgColorCommand = component.defaultCommands.find(cmd => cmd.command === 'backColor');
    if (bgColorCommand) {
      component.executeCommand(bgColorCommand);
      expect(component.showBackgroundColorPicker).toBe(true);
    }
  });

  it('should apply background color', () => {
    spyOn(document, 'execCommand');
    
    component.selectedBackgroundColor = '#00ff00';
    component.applyBackgroundColor();
    
    expect(document.execCommand).toHaveBeenCalledWith('backColor', false, '#00ff00');
    expect(component.showBackgroundColorPicker).toBe(false);
  });

  it('should handle paste event and insert plain text', () => {
    spyOn(document, 'execCommand');
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    
    Object.defineProperty(pasteEvent.clipboardData, 'getData', {
      value: () => 'Pasted text'
    });
    
    spyOn(pasteEvent, 'preventDefault');
    
    editorElement.dispatchEvent(pasteEvent);
    
    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'Pasted text');
  });

  it('should write value to editor', () => {
    const testHtml = '<p>Test HTML content</p>';
    component.writeValue(testHtml);
    
    expect(component.content).toBe(testHtml);
    expect(editorElement.innerHTML).toBe(testHtml);
  });

  it('should register onChange callback', () => {
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    const testContent = '<p>New content</p>';
    editorElement.innerHTML = testContent;
    editorElement.dispatchEvent(new Event('input'));
    
    expect(onChangeFn).toHaveBeenCalledWith(testContent);
  });

  it('should register onTouched callback', () => {
    const onTouchedFn = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouchedFn);
    
    editorElement.dispatchEvent(new Event('blur'));
    
    expect(onTouchedFn).toHaveBeenCalled();
  });

  it('should check if command is active', () => {
    spyOn(document, 'queryCommandState').and.returnValue(true);
    
    const isActive = component.isCommandActive('bold');
    
    expect(document.queryCommandState).toHaveBeenCalledWith('bold');
    expect(isActive).toBe(true);
  });

  it('should not execute separator command', () => {
    spyOn(document, 'execCommand');
    
    const separatorCommand = { command: 'separator' };
    component.executeCommand(separatorCommand);
    
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('should prompt for image URL on insertImage command', () => {
    spyOn(window, 'prompt').and.returnValue('https://example.com/image.jpg');
    spyOn(document, 'execCommand');
    
    const imageCommand = component.defaultCommands.find(cmd => cmd.command === 'insertImage');
    if (imageCommand) {
      component.executeCommand(imageCommand);
      expect(window.prompt).toHaveBeenCalledWith('Enter image URL:');
      expect(document.execCommand).toHaveBeenCalledWith('insertImage', false, 'https://example.com/image.jpg');
    }
  });

  it('should handle null prompt response for image', () => {
    spyOn(window, 'prompt').and.returnValue(null);
    spyOn(document, 'execCommand');
    
    const imageCommand = component.defaultCommands.find(cmd => cmd.command === 'insertImage');
    if (imageCommand) {
      component.executeCommand(imageCommand);
      expect(document.execCommand).not.toHaveBeenCalled();
    }
  });

  it('should sanitize content', () => {
    const unsafeContent = '<script>alert("XSS")</script><p>Safe content</p>';
    editorElement.innerHTML = unsafeContent;
    editorElement.dispatchEvent(new Event('input'));
    
    expect(component.content).toBe(unsafeContent);
    expect(component.sanitizedContent).toBeTruthy();
  });

  it('should handle empty value in writeValue', () => {
    component.writeValue('');
    
    expect(component.content).toBe('');
    expect(editorElement.innerHTML).toBe('');
  });

  it('should handle null value in writeValue', () => {
    component.writeValue(null as any);
    
    expect(component.content).toBe('');
    expect(editorElement.innerHTML).toBe('');
  });

  it('should open padding dialog on setPadding command', () => {
    // Create a selection first
    const selection = window.getSelection();
    const range = document.createRange();
    const textNode = document.createTextNode('test');
    editorElement.appendChild(textNode);
    range.selectNodeContents(textNode);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    const paddingCommand = component.defaultCommands.find(cmd => cmd.command === 'setPadding');
    if (paddingCommand) {
      component.executeCommand(paddingCommand);
      expect(component.showPaddingDialog).toBe(true);
    }
  });

  it('should apply padding to selected element', () => {
    const testElement = document.createElement('p');
    testElement.textContent = 'Test paragraph';
    editorElement.appendChild(testElement);
    
    component.selectedElementForPadding = testElement;
    component.paddingTop = '10';
    component.paddingRight = '15';
    component.paddingBottom = '20';
    component.paddingLeft = '25';
    
    component.applyPadding();
    
    expect(testElement.style.padding).toBe('10px 15px 20px 25px');
    expect(component.showPaddingDialog).toBe(false);
  });

  it('should close padding dialog', () => {
    component.showPaddingDialog = true;
    component.paddingTop = '10';
    component.paddingRight = '15';
    component.paddingBottom = '20';
    component.paddingLeft = '25';
    component.selectedElementForPadding = document.createElement('div');
    
    component.closePaddingDialog();
    
    expect(component.showPaddingDialog).toBe(false);
    expect(component.paddingTop).toBe('0');
    expect(component.paddingRight).toBe('0');
    expect(component.paddingBottom).toBe('0');
    expect(component.paddingLeft).toBe('0');
    expect(component.selectedElementForPadding).toBeNull();
  });

  it('should extract pixel values correctly', () => {
    const extractMethod = (component as any).extractPixelValue;
    
    expect(extractMethod('10px')).toBe('10');
    expect(extractMethod('0px')).toBe('0');
    expect(extractMethod('')).toBe('0');
  });
});