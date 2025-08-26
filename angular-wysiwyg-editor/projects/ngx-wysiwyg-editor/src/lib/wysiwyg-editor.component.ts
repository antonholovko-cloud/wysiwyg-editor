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
  showPaddingDialog = false;
  paddingAll = '';
  paddingTop = '0';
  paddingRight = '0';
  paddingBottom = '0';
  paddingLeft = '0';
  selectedElementForPadding: HTMLElement | null = null;
  showDocumentPaddingDialog = false;
  documentPaddingAll = '';
  documentPaddingTop = '12';
  documentPaddingRight = '12';
  documentPaddingBottom = '12';
  documentPaddingLeft = '12';
  showPreview = false;
  showHtmlDialog = false;
  htmlContent = '';
  
  defaultCommands: EditorCommand[] = [
    { command: 'undo', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>', tooltip: 'Undo' },
    { command: 'redo', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>', tooltip: 'Redo' },
    { command: 'separator' },
    { command: 'bold', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>', tooltip: 'Bold' },
    { command: 'italic', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>', tooltip: 'Italic' },
    { command: 'underline', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>', tooltip: 'Underline' },
    { command: 'strikeThrough', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2m8.2 3.7c.3.4.4.8.4 1.3 0 2.9-2.7 3.6-5.3 3.6-2.3 0-4.4-.3-6.2-.9M4 11.5h16"/></svg>', tooltip: 'Strikethrough' },
    { command: 'separator' },
    { command: 'formatBlock', value: 'h1', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8m-8-6v12m8-12v12m9-12-3 8.5V20m3 0h-6"/></svg>', tooltip: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8m-8-6v12m8-12v12m4-16h4a2 2 0 012 2v2a2 2 0 01-2 2h-4v8h6"/></svg>', tooltip: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8m-8-6v12m8-12v12m4-16h4a2 2 0 012 2v2a2 2 0 01-2 2m0 0h-4m4 0a2 2 0 012 2v2a2 2 0 01-2 2h-4"/></svg>', tooltip: 'Heading 3' },
    { command: 'formatBlock', value: 'p', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-5-14h5a4 4 0 110 8h-5"/></svg>', tooltip: 'Paragraph' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>', tooltip: 'Align Left' },
    { command: 'justifyCenter', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="7" y2="6"></line><line x1="21" y1="14" x2="7" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>', tooltip: 'Align Center' },
    { command: 'justifyRight', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>', tooltip: 'Align Right' },
    { command: 'justifyFull', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>', tooltip: 'Justify' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>', tooltip: 'Bullet List' },
    { command: 'insertOrderedList', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>', tooltip: 'Numbered List' },
    { command: 'indent', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 3 16"></polyline><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="18" x2="11" y2="18"></line></svg>', tooltip: 'Increase Indent' },
    { command: 'outdent', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"></polyline><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="18" x2="11" y2="18"></line></svg>', tooltip: 'Decrease Indent' },
    { command: 'separator' },
    { command: 'createLink', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>', tooltip: 'Insert Link', requiresValue: true },
    { command: 'unlink', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path><line x1="8" y1="2" x2="8" y2="5"></line><line x1="2" y1="8" x2="5" y2="8"></line><line x1="16" y1="19" x2="16" y2="22"></line><line x1="19" y1="16" x2="22" y2="16"></line></svg>', tooltip: 'Remove Link' },
    { command: 'insertImage', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>', tooltip: 'Insert Image', requiresValue: true },
    { command: 'separator' },
    { command: 'foreColor', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 19h2.5l1.12-3h6.75l1.13 3H20L15 5h-4zm1 2.67L14.5 14h-5l2.5-6.33z"/><rect x="4" y="20" width="16" height="3" fill="currentColor"/></svg>', tooltip: 'Text Color', requiresValue: true },
    { command: 'backColor', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16.24 3.56 4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.01 4.01 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0z"/><path d="M4.91 13.08 8 16.17"/><path d="M2 20 7 15" stroke-width="3"/></svg>', tooltip: 'Background Color', requiresValue: true },
    { command: 'separator' },
    { command: 'removeFormat', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>', tooltip: 'Clear Formatting' },
    { command: 'separator' },
    { command: 'insertHorizontalRule', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line></svg>', tooltip: 'Horizontal Line' },
    { command: 'separator' },
    { command: 'subscript', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 5 8 8m-8 0 8-8"/><path d="M15 18h1.5c.5 0 1-.2 1.3-.6.4-.3.6-.7.6-1.2 0-.3-.1-.6-.4-.9-.2-.2-.5-.3-.8-.3-.4 0-.7.1-.9.4"/></svg>', tooltip: 'Subscript' },
    { command: 'superscript', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 19 8-8m-8 0 8 8"/><path d="M15 6h1.5c.5 0 1-.2 1.3-.6.4-.3.6-.7.6-1.2 0-.3-.1-.6-.4-.9-.2-.2-.5-.3-.8-.3-.4 0-.7.1-.9.4"/></svg>', tooltip: 'Superscript' },
    { command: 'separator' },
    { command: 'setPadding', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>', tooltip: 'Set Element Padding', requiresValue: true },
    { command: 'setDocumentPadding', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M6 2v4m12-4v4M6 18v4m12-4v4M2 6h4m12 0h4M2 18h4m12 0h4" stroke-dasharray="1 1"/></svg>', tooltip: 'Set Document Padding', requiresValue: true },
    { command: 'separator' },
    { command: 'insertHTML', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>', tooltip: 'Insert HTML', requiresValue: true },
    { command: 'separator' },
    { command: 'preview', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>', tooltip: 'Preview', requiresValue: false }
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
  
  getSafeHtml(html: string | undefined): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
    
    if (command.command === 'setPadding') {
      this.openPaddingDialog();
      return;
    }
    
    if (command.command === 'setDocumentPadding') {
      this.openDocumentPaddingDialog();
      return;
    }
    
    if (command.command === 'insertHTML') {
      this.openHtmlDialog();
      return;
    }
    
    if (command.command === 'preview') {
      this.openPreview();
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
  
  openPaddingDialog(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.startContainer as Node;
      
      // Find the closest element node
      while (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = element.parentNode!;
      }
      
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        this.selectedElementForPadding = element as HTMLElement;
        
        // Get current padding values
        const computedStyle = window.getComputedStyle(this.selectedElementForPadding);
        this.paddingTop = this.extractPixelValue(computedStyle.paddingTop);
        this.paddingRight = this.extractPixelValue(computedStyle.paddingRight);
        this.paddingBottom = this.extractPixelValue(computedStyle.paddingBottom);
        this.paddingLeft = this.extractPixelValue(computedStyle.paddingLeft);
        
        // Set paddingAll to the top value if all paddings are the same
        if (this.paddingTop === this.paddingRight && 
            this.paddingTop === this.paddingBottom && 
            this.paddingTop === this.paddingLeft) {
          this.paddingAll = this.paddingTop;
        } else {
          this.paddingAll = '';
        }
        
        this.showPaddingDialog = true;
      }
    }
  }
  
  private extractPixelValue(value: string): string {
    return value.replace('px', '') || '0';
  }
  
  applyPadding(): void {
    if (this.selectedElementForPadding) {
      const paddingStyle = `${this.paddingTop}px ${this.paddingRight}px ${this.paddingBottom}px ${this.paddingLeft}px`;
      this.selectedElementForPadding.style.padding = paddingStyle;
      this.onContentChange();
    }
    this.closePaddingDialog();
  }
  
  closePaddingDialog(): void {
    this.showPaddingDialog = false;
    this.paddingAll = '';
    this.paddingTop = '0';
    this.paddingRight = '0';
    this.paddingBottom = '0';
    this.paddingLeft = '0';
    this.selectedElementForPadding = null;
  }
  
  onPaddingAllChange(): void {
    if (this.paddingAll !== '') {
      this.paddingTop = this.paddingAll;
      this.paddingRight = this.paddingAll;
      this.paddingBottom = this.paddingAll;
      this.paddingLeft = this.paddingAll;
    }
  }
  
  openDocumentPaddingDialog(): void {
    const editor = this.editorElement.nativeElement;
    const computedStyle = window.getComputedStyle(editor);
    
    this.documentPaddingTop = this.extractPixelValue(computedStyle.paddingTop);
    this.documentPaddingRight = this.extractPixelValue(computedStyle.paddingRight);
    this.documentPaddingBottom = this.extractPixelValue(computedStyle.paddingBottom);
    this.documentPaddingLeft = this.extractPixelValue(computedStyle.paddingLeft);
    
    if (this.documentPaddingTop === this.documentPaddingRight && 
        this.documentPaddingTop === this.documentPaddingBottom && 
        this.documentPaddingTop === this.documentPaddingLeft) {
      this.documentPaddingAll = this.documentPaddingTop;
    } else {
      this.documentPaddingAll = '';
    }
    
    this.showDocumentPaddingDialog = true;
  }
  
  applyDocumentPadding(): void {
    const editor = this.editorElement.nativeElement;
    const paddingStyle = `${this.documentPaddingTop}px ${this.documentPaddingRight}px ${this.documentPaddingBottom}px ${this.documentPaddingLeft}px`;
    editor.style.padding = paddingStyle;
    this.closeDocumentPaddingDialog();
  }
  
  closeDocumentPaddingDialog(): void {
    this.showDocumentPaddingDialog = false;
  }
  
  onDocumentPaddingAllChange(): void {
    if (this.documentPaddingAll !== '') {
      this.documentPaddingTop = this.documentPaddingAll;
      this.documentPaddingRight = this.documentPaddingAll;
      this.documentPaddingBottom = this.documentPaddingAll;
      this.documentPaddingLeft = this.documentPaddingAll;
    }
  }
  
  openHtmlDialog(): void {
    this.showHtmlDialog = true;
    this.htmlContent = '';
  }
  
  insertHtml(): void {
    if (this.htmlContent) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.htmlContent;
        
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.onContentChange();
      } else {
        const editor = this.editorElement.nativeElement;
        const currentContent = editor.innerHTML;
        editor.innerHTML = currentContent + this.htmlContent;
        this.onContentChange();
      }
    }
    this.closeHtmlDialog();
  }
  
  closeHtmlDialog(): void {
    this.showHtmlDialog = false;
    this.htmlContent = '';
  }
  
  openPreview(): void {
    this.showPreview = true;
  }
  
  closePreview(): void {
    this.showPreview = false;
  }
  
  getPreviewContent(): string {
    const editor = this.editorElement.nativeElement;
    return editor.innerHTML;
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