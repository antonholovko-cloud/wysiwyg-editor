import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface EditorCommand {
  command: string;
  value?: string;
  icon?: string;
  tooltip?: string;
  requiresValue?: boolean;
}

export interface EditorConfig {
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
  showToolbar?: boolean;
  customButtons?: EditorCommand[];
  allowedTags?: string[];
  defaultParagraphSeparator?: string;
}

@Component({
  selector: 'wysiwyg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wysiwyg-editor.component.html',
  styleUrls: ['./wysiwyg-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WysiwygEditorComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class WysiwygEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef<HTMLDivElement>;
  @ViewChild('linkUrlInput', { static: false }) linkUrlInput!: ElementRef<HTMLInputElement>;
  
  @Input() config: EditorConfig = {};
  @Input() disabled = false;
  
  @Output() contentChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  
  content = '';
  sanitizedContent: SafeHtml = '';
  showLinkDialog = false;
  linkUrl = '';
  selectedRange: Range | null = null;
  showColorPicker = false;
  selectedColor = '#000000';
  showBackgroundColorPicker = false;
  selectedBackgroundColor = '#ffffff';
  
  defaultCommands: EditorCommand[] = [
    { command: 'undo', icon: '↶', tooltip: 'Undo' },
    { command: 'redo', icon: '↷', tooltip: 'Redo' },
    { command: 'separator' },
    { command: 'bold', icon: 'B', tooltip: 'Bold' },
    { command: 'italic', icon: 'I', tooltip: 'Italic' },
    { command: 'underline', icon: 'U', tooltip: 'Underline' },
    { command: 'strikeThrough', icon: 'S', tooltip: 'Strikethrough' },
    { command: 'separator' },
    { command: 'formatBlock', value: 'h1', icon: 'H1', tooltip: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', icon: 'H2', tooltip: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', icon: 'H3', tooltip: 'Heading 3' },
    { command: 'formatBlock', value: 'p', icon: '¶', tooltip: 'Paragraph' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: '⟵', tooltip: 'Align Left' },
    { command: 'justifyCenter', icon: '↔', tooltip: 'Align Center' },
    { command: 'justifyRight', icon: '⟶', tooltip: 'Align Right' },
    { command: 'justifyFull', icon: '⇔', tooltip: 'Justify' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: '•', tooltip: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', tooltip: 'Numbered List' },
    { command: 'indent', icon: '→', tooltip: 'Increase Indent' },
    { command: 'outdent', icon: '←', tooltip: 'Decrease Indent' },
    { command: 'separator' },
    { command: 'createLink', icon: '🔗', tooltip: 'Insert Link', requiresValue: true },
    { command: 'unlink', icon: '⛓‍💥', tooltip: 'Remove Link' },
    { command: 'insertImage', icon: '🖼', tooltip: 'Insert Image', requiresValue: true },
    { command: 'separator' },
    { command: 'foreColor', icon: 'A', tooltip: 'Text Color', requiresValue: true },
    { command: 'backColor', icon: '🎨', tooltip: 'Background Color', requiresValue: true },
    { command: 'separator' },
    { command: 'removeFormat', icon: '✖', tooltip: 'Clear Formatting' },
    { command: 'separator' },
    { command: 'insertHorizontalRule', icon: '―', tooltip: 'Horizontal Line' },
    { command: 'separator' },
    { command: 'subscript', icon: 'X₂', tooltip: 'Subscript' },
    { command: 'superscript', icon: 'X²', tooltip: 'Superscript' }
  ];
  
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {
    this.initializeConfig();
  }
  
  ngAfterViewInit(): void {
    if (this.editorElement) {
      this.setupEditor();
    }
  }
  
  private initializeConfig(): void {
    this.config = {
      height: '400px',
      minHeight: '200px',
      maxHeight: '600px',
      placeholder: 'Start typing...',
      showToolbar: true,
      defaultParagraphSeparator: 'p',
      ...this.config
    };
  }
  
  private setupEditor(): void {
    const editor = this.editorElement.nativeElement;
    editor.contentEditable = (!this.disabled).toString();
    
    if (this.config.defaultParagraphSeparator) {
      document.execCommand('defaultParagraphSeparator', false, this.config.defaultParagraphSeparator);
    }
    
    editor.addEventListener('input', () => this.onContentChange());
    editor.addEventListener('blur', () => this.onBlur());
    editor.addEventListener('focus', () => this.onFocus());
    editor.addEventListener('paste', (e) => this.onPaste(e));
  }
  
  get commands(): EditorCommand[] {
    return this.config.customButtons || this.defaultCommands;
  }
  
  executeCommand(command: EditorCommand): void {
    if (command.command === 'separator') return;
    
    if (command.command === 'createLink') {
      this.openLinkDialog();
      return;
    }
    
    if (command.command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand('insertImage', false, url);
        this.onContentChange();
      }
      return;
    }
    
    if (command.command === 'foreColor') {
      this.showColorPicker = !this.showColorPicker;
      this.showBackgroundColorPicker = false;
      return;
    }
    
    if (command.command === 'backColor') {
      this.showBackgroundColorPicker = !this.showBackgroundColorPicker;
      this.showColorPicker = false;
      return;
    }
    
    document.execCommand(command.command, false, command.value);
    this.onContentChange();
  }
  
  applyTextColor(): void {
    document.execCommand('foreColor', false, this.selectedColor);
    this.showColorPicker = false;
    this.onContentChange();
  }
  
  applyBackgroundColor(): void {
    document.execCommand('backColor', false, this.selectedBackgroundColor);
    this.showBackgroundColorPicker = false;
    this.onContentChange();
  }
  
  openLinkDialog(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.selectedRange = selection.getRangeAt(0);
      this.showLinkDialog = true;
      this.linkUrl = '';
    }
  }
  
  insertLink(): void {
    if (this.selectedRange && this.linkUrl) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selectedRange);
        document.execCommand('createLink', false, this.linkUrl);
        this.onContentChange();
      }
    }
    this.closeLinkDialog();
  }
  
  closeLinkDialog(): void {
    this.showLinkDialog = false;
    this.linkUrl = '';
    this.selectedRange = null;
  }
  
  private onContentChange(): void {
    const editor = this.editorElement.nativeElement;
    this.content = editor.innerHTML;
    this.sanitizedContent = this.sanitizer.sanitize(1, this.content) || '';
    this.onChange(this.content);
    this.contentChange.emit(this.content);
  }
  
  private onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }
  
  private onFocus(): void {
    this.focus.emit();
  }
  
  private onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      document.execCommand('insertText', false, text);
      this.onContentChange();
    }
  }
  
  writeValue(value: string): void {
    this.content = value || '';
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = this.content;
      this.sanitizedContent = this.sanitizer.sanitize(1, this.content) || '';
    }
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editorElement) {
      this.editorElement.nativeElement.contentEditable = (!isDisabled).toString();
    }
  }
  
  isCommandActive(command: string): boolean {
    return document.queryCommandState(command);
  }
}