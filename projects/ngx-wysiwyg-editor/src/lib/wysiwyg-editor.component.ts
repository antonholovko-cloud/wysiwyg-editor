import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

export interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'columns' | 'social' | 'spacer' | 'video' | 'html';
  content?: any;
  settings?: any;
}

export interface EditorConfig {
  theme?: 'light' | 'dark';
  showBlockPanel?: boolean;
  showPropertiesPanel?: boolean;
  emailWidth?: string;
  backgroundColor?: string;
  fontFamily?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}

@Component({
  selector: 'wysiwyg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
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
  @ViewChild('emailCanvas', { static: false }) emailCanvas!: ElementRef<HTMLDivElement>;

  @Input() config: EditorConfig = {};
  @Input() disabled = false;

  @Output() contentChange = new EventEmitter<string>();
  @Output() blockSelected = new EventEmitter<EmailBlock>();

  // Editor state
  emailBlocks: EmailBlock[] = [];
  selectedBlock: EmailBlock | null = null;
  selectedBlockIndex: number = -1;
  content = '';

  // UI state
  showBlockPanel = true;
  showPropertiesPanel = true;
  activeTab: 'blocks' | 'settings' = 'blocks';
  activePropertiesTab: 'content' | 'style' | 'advanced' = 'content';
  isDragging = false;
  devicePreview: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  viewMode: 'edit' | 'preview' = 'edit';

  // Email settings
  emailSettings = {
    width: '600px',
    backgroundColor: '#f4f4f4',
    contentBackgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    textColor: '#333333',
    linkColor: '#2196F3',
    padding: '20px'
  };

  // Available blocks
  availableBlocks = [
    { type: 'header', icon: '📰', label: 'Header', description: 'Logo and navigation' },
    { type: 'text', icon: '📝', label: 'Text', description: 'Paragraph text block' },
    { type: 'image', icon: '🖼️', label: 'Image', description: 'Single image' },
    { type: 'button', icon: '🔲', label: 'Button', description: 'Call-to-action button' },
    { type: 'divider', icon: '➖', label: 'Divider', description: 'Horizontal line' },
    { type: 'columns', icon: '⬜', label: 'Columns', description: 'Multi-column layout' },
    { type: 'social', icon: '👥', label: 'Social', description: 'Social media links' },
    { type: 'spacer', icon: '⬜', label: 'Spacer', description: 'Empty space' },
    { type: 'video', icon: '▶️', label: 'Video', description: 'Video thumbnail with link' },
    { type: 'html', icon: '</>', label: 'HTML', description: 'Custom HTML code' }
  ];

  // Block templates
  blockTemplates: { [key: string]: any } = {
    header: {
      logo: '',
      companyName: 'Your Company',
      tagline: 'Your tagline here',
      backgroundColor: '#2196F3',
      textColor: '#ffffff',
      height: '120px',
      alignment: 'center'
    },
    text: {
      content: '<p>Enter your text content here. You can format it with <strong>bold</strong>, <em>italic</em>, and more.</p>',
      padding: '20px',
      fontSize: '14px',
      lineHeight: '1.6',
      textAlign: 'left'
    },
    image: {
      src: 'https://via.placeholder.com/600x300',
      alt: 'Image description',
      width: '100%',
      alignment: 'center',
      padding: '10px',
      link: ''
    },
    button: {
      text: 'Click Here',
      url: '#',
      backgroundColor: '#2196F3',
      textColor: '#ffffff',
      borderRadius: '4px',
      padding: '12px 24px',
      fontSize: '16px',
      alignment: 'center',
      width: 'auto'
    },
    divider: {
      style: 'solid',
      width: '100%',
      color: '#e0e0e0',
      thickness: '1px',
      margin: '20px 0'
    },
    columns: {
      count: 2,
      gap: '20px',
      columns: [
        { content: '<h3>Column 1</h3><p>This is the content for the first column. You can add any HTML content here.</p>' },
        { content: '<h3>Column 2</h3><p>This is the content for the second column. You can add any HTML content here.</p>' }
      ]
    },
    social: {
      platforms: [
        { name: 'facebook', url: '#', icon: '📘' },
        { name: 'twitter', url: '#', icon: '🐦' },
        { name: 'instagram', url: '#', icon: '📷' },
        { name: 'linkedin', url: '#', icon: '💼' }
      ],
      alignment: 'center',
      iconSize: '32px',
      spacing: '10px'
    },
    spacer: {
      height: '30px'
    },
    video: {
      thumbnail: 'https://via.placeholder.com/600x340',
      videoUrl: '#',
      playButtonStyle: 'circle',
      playButtonColor: '#ffffff',
      playButtonBackground: 'rgba(0,0,0,0.7)'
    },
    html: {
      code: '<!-- Enter your custom HTML here -->'
    }
  };

  // Property editors for each block type
  currentBlockProperties: any = {};

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initializeConfig();
    this.loadDefaultTemplate();
  }

  ngAfterViewInit(): void {
    this.renderEmail();
    // Set initial device preview
    setTimeout(() => {
      this.updatePreviewSize();
    }, 100);
  }

  private initializeConfig(): void {
    this.config = {
      theme: 'light',
      showBlockPanel: true,
      showPropertiesPanel: true,
      emailWidth: '600px',
      backgroundColor: '#f4f4f4',
      fontFamily: 'Arial, sans-serif',
      ...this.config
    };

    this.showBlockPanel = this.config.showBlockPanel !== false;
    this.showPropertiesPanel = this.config.showPropertiesPanel !== false;

    if (this.config.emailWidth) {
      this.emailSettings.width = this.config.emailWidth;
    }
    if (this.config.backgroundColor) {
      this.emailSettings.backgroundColor = this.config.backgroundColor;
    }
    if (this.config.fontFamily) {
      this.emailSettings.fontFamily = this.config.fontFamily;
    }
  }

  private loadDefaultTemplate(): void {
    // Load a basic email template
    this.emailBlocks = [
      {
        id: this.generateId(),
        type: 'header',
        content: { ...this.blockTemplates['header'] }
      },
      {
        id: this.generateId(),
        type: 'text',
        content: {
          ...this.blockTemplates['text'],
          content: '<h2>Welcome to Our Newsletter!</h2><p>Thank you for subscribing. We\'re excited to share our latest updates with you.</p>'
        }
      },
      {
        id: this.generateId(),
        type: 'button',
        content: { ...this.blockTemplates['button'] }
      }
    ];
  }

  private generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Drag and drop handlers
  onDragStarted(): void {
    this.isDragging = true;
  }

  onDragEnded(): void {
    this.isDragging = false;
  }

  drop(event: CdkDragDrop<EmailBlock[]>): void {
    moveItemInArray(this.emailBlocks, event.previousIndex, event.currentIndex);
    this.renderEmail();
    this.emitChange();
  }

  // Block management
  addBlock(blockType: string): void {
    // Deep clone the template for proper initialization
    const template = JSON.parse(JSON.stringify(this.blockTemplates[blockType]));

    const newBlock: EmailBlock = {
      id: this.generateId(),
      type: blockType as any,
      content: template
    };

    if (this.selectedBlockIndex >= 0) {
      // Insert after selected block
      this.emailBlocks.splice(this.selectedBlockIndex + 1, 0, newBlock);
    } else {
      // Add at the end
      this.emailBlocks.push(newBlock);
    }

    this.selectBlock(newBlock, this.emailBlocks.length - 1);
    this.renderEmail();
    this.emitChange();
  }

  duplicateBlock(block: EmailBlock, index: number): void {
    const duplicatedBlock: EmailBlock = {
      id: this.generateId(),
      type: block.type,
      content: { ...block.content }
    };

    this.emailBlocks.splice(index + 1, 0, duplicatedBlock);
    this.renderEmail();
    this.emitChange();
  }

  deleteBlock(index: number): void {
    this.emailBlocks.splice(index, 1);
    this.selectedBlock = null;
    this.selectedBlockIndex = -1;
    this.renderEmail();
    this.emitChange();
  }

  moveBlockUp(index: number): void {
    if (index > 0) {
      const temp = this.emailBlocks[index];
      this.emailBlocks[index] = this.emailBlocks[index - 1];
      this.emailBlocks[index - 1] = temp;
      this.selectedBlockIndex = index - 1;
      this.renderEmail();
      this.emitChange();
    }
  }

  moveBlockDown(index: number): void {
    if (index < this.emailBlocks.length - 1) {
      const temp = this.emailBlocks[index];
      this.emailBlocks[index] = this.emailBlocks[index + 1];
      this.emailBlocks[index + 1] = temp;
      this.selectedBlockIndex = index + 1;
      this.renderEmail();
      this.emitChange();
    }
  }

  selectBlock(block: EmailBlock | null, index: number): void {
    this.selectedBlock = block;
    this.selectedBlockIndex = index;
    this.currentBlockProperties = block ? { ...block.content } : {};

    if (block) {
      this.blockSelected.emit(block);
      this.showPropertiesPanel = true;
      this.activePropertiesTab = 'content';
    }
  }

  // Property updates (handled by enhanced version below)

  updateEmailSetting(property: string, value: any): void {
    (this.emailSettings as any)[property] = value;
    this.renderEmail();
    this.emitChange();
  }

  // Rendering
  renderEmail(): void {
    if (!this.emailCanvas) return;

    const html = this.generateEmailHtml();
    this.content = html;

    // Update preview iframe if in preview mode
    if (this.viewMode === 'preview') {
      const iframe = this.emailCanvas.nativeElement.querySelector('.email-preview');

      //@ts-ignore
      if (iframe && iframe.contentDocument) {

        //@ts-ignore
        iframe.contentDocument.open();

        //@ts-ignore
        iframe.contentDocument.write(html);

        //@ts-ignore
        iframe.contentDocument.close();

        // Apply device preview size
        this.updatePreviewSize();
      }
    }
  }

  private generateEmailHtml(): string {
    const blocks = this.emailBlocks.map(block => this.renderBlock(block)).join('');
    const isPreview = this.viewMode === 'preview';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: ${this.emailSettings.backgroundColor};
            font-family: ${this.emailSettings.fontFamily};
            font-size: ${this.emailSettings.fontSize};
            color: ${this.emailSettings.textColor};
          }
          .email-container {
            max-width: ${this.emailSettings.width};
            margin: 0 auto;
            background-color: ${this.emailSettings.contentBackgroundColor};
          }
          a { color: ${this.emailSettings.linkColor}; }
          img { max-width: 100%; height: auto; }
          .block-wrapper {
            position: relative;
            ${!isPreview ? 'transition: all 0.3s;' : ''}
          }
          ${!isPreview ? `.block-wrapper:hover {
            outline: 2px dashed #2196F3;
            outline-offset: -2px;
          }` : ''}

          /* Animation keyframes */
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slide-down {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes zoom-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          /* Visibility classes - handled by device preview mode instead of media queries */
          .visibility-hidden { display: none !important; }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${blocks}
        </div>
      </body>
      </html>
    `;
  }

  renderBlock(block: EmailBlock): string {
    const content = block.content || {};

    // Handle advanced properties
    const advancedStyles = this.getAdvancedStyles(content);
    const advancedAttributes = this.getAdvancedAttributes(content);
    const wrapperClasses = this.getWrapperClasses(content);
    const shouldRender = this.shouldRenderBlock(content);

    if (!shouldRender) {
      return '';
    }

    switch (block.type) {
      case 'header':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="background-color: ${content.backgroundColor}; color: ${content.textColor}; text-align: ${content.alignment}; padding: 20px; min-height: ${content.height}; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <h1 style="margin: 0; font-size: 28px;">${content.companyName}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${content.tagline}</p>
          </div>
        `;

      case 'text':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="padding: ${content.padding}; text-align: ${content.textAlign}; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <div style="font-size: ${content.fontSize}; line-height: ${content.lineHeight};">
              ${content.content}
            </div>
          </div>
        `;

      case 'image':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="text-align: ${content.alignment}; padding: ${content.padding}; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            ${content.link ? `<a href="${content.link}">` : ''}
            <img src="${content.src}" alt="${content.alt}" style="width: ${content.width}; height: auto;">
            ${content.link ? '</a>' : ''}
          </div>
        `;

      case 'button':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="text-align: ${content.alignment}; padding: 20px; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <a href="${content.url}" style="display: inline-block; background-color: ${content.backgroundColor}; color: ${content.textColor}; padding: ${content.padding}; text-decoration: none; border-radius: ${content.borderRadius}; font-size: ${content.fontSize};">
              ${content.text}
            </a>
          </div>
        `;

      case 'divider':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="padding: 0; margin: ${content.margin}; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <hr style="border: none; border-top: ${content.thickness} ${content.style} ${content.color}; width: ${content.width}; margin: 0 auto;">
          </div>
        `;

      case 'columns':
        const columnWidth = `${100 / content.count}%`;
        const gapValue = parseInt(content.gap) || 20;
        const bgColor = content.columnBackground || '#f9f9f9';
        const columnsList = content.columns.map((column: any) =>
          `<div style="width: ${columnWidth}; padding: 0 ${gapValue / 2}px; display: inline-block; vertical-align: top; box-sizing: border-box; font-size: 14px;">
            <div style="padding: 15px; background: ${bgColor}; border: 1px dashed #ddd; min-height: 100px; border-radius: 4px;">
              ${column.content || '<p style="color: #999;">Click to edit column content</p>'}
            </div>
          </div>`
        ).join('');
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="padding: 20px; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <div style="width: 100%; font-size: 0;">
              ${columnsList}
            </div>
          </div>
        `;

      case 'spacer':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="height: ${content.height}; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
          </div>
        `;

      case 'video':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="text-align: center; padding: 20px; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            <div style="position: relative; display: inline-block;">
              <img src="${content.thumbnail}" alt="Video thumbnail" style="width: 100%; max-width: 500px; height: auto;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: ${content.playButtonBackground}; border-radius: ${content.playButtonStyle === 'circle' ? '50%' : '8px'}; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="width: 0; height: 0; border-left: 20px; ${content.playButtonColor}; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
              </div>
            </div>
          </div>
        `;

      case 'social':
        const icons = content.platforms.map((platform: any) =>
          `<a href="${platform.url}" style="text-decoration: none; margin: 0 ${content.spacing};">
            <span style="font-size: ${content.iconSize};">${platform.icon}</span>
          </a>`
        ).join('');
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="text-align: ${content.alignment}; padding: 20px; ${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            ${icons}
          </div>
        `;

      case 'html':
        return `
          <div class="${wrapperClasses}" ${advancedAttributes} style="${advancedStyles}">
            ${content.customCSS ? `<style>${content.customCSS}</style>` : ''}
            ${content.code}
          </div>
        `;

      default:
        return '';
    }
  }

  // UI Actions
  toggleBlockPanel(): void {
    this.showBlockPanel = !this.showBlockPanel;
  }

  togglePropertiesPanel(): void {
    this.showPropertiesPanel = !this.showPropertiesPanel;
  }

  // Device preview methods
  setDevicePreview(device: 'mobile' | 'tablet' | 'desktop'): void {
    this.devicePreview = device;
    this.updatePreviewSize();
    // Re-render to apply visibility changes based on new device mode
    this.renderEmail();
  }

  // View mode methods
  setViewMode(mode: 'edit' | 'preview'): void {
    this.viewMode = mode;
    if (mode === 'preview') {
      // Hide panels when in preview mode
      this.showBlockPanel = false;
      this.showPropertiesPanel = false;
      setTimeout(() => {
        this.renderEmail();
      }, 100);
    } else {
      // Restore panels when in edit mode
      this.showBlockPanel = true;
    }
  }

  updatePreviewSize(): void {
    if (!this.emailCanvas) return;

    const container = this.emailCanvas.nativeElement;
    const iframe = container.querySelector('.email-preview');

    if (iframe && this.viewMode === 'preview') {
      // The container already handles the width via getDeviceWidth()
      // Just ensure the iframe fills its container
      //@ts-ignore
      iframe.style.width = '100%';
      //@ts-ignore
      iframe.style.height = '600px';
      //@ts-ignore
      iframe.style.display = 'block';
    }
  }

  getDeviceWidth(): string {
    switch (this.devicePreview) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '100%';
      default:
        return '100%';
    }
  }

  exportHtml(): void {
    const html = this.generateEmailHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all blocks?')) {
      this.emailBlocks = [];
      this.selectedBlock = null;
      this.selectedBlockIndex = -1;
      this.renderEmail();
      this.emitChange();
    }
  }

  // Template management
  saveTemplate(): void {
    const template = {
      blocks: this.emailBlocks,
      settings: this.emailSettings,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('email-template', JSON.stringify(template));
    alert('Template saved successfully!');
  }

  loadTemplate(): void {
    const saved = localStorage.getItem('email-template');
    if (saved) {
      const template = JSON.parse(saved);
      this.emailBlocks = template.blocks;
      this.emailSettings = template.settings;
      this.renderEmail();
      this.emitChange();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.content = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private emitChange(): void {
    const html = this.generateEmailHtml();
    this.onChange(html);
    this.contentChange.emit(html);
  }

  // Utility methods
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Advanced properties helper methods
  getAdvancedStyles(content: any): string {
    let styles = '';

    if (content.customMargin) {
      styles += `margin: ${content.customMargin}; `;
    }

    // Use device preview mode instead of window width for better preview accuracy
    const isMobileView = this.devicePreview === 'mobile';
    const isTabletView = this.devicePreview === 'tablet';
    const isDesktopView = this.devicePreview === 'desktop';

    if (content.mobileWidth && isMobileView) {
      styles += `width: ${content.mobileWidth}; `;
    }

    if (content.visibility === 'hidden') {
      styles += 'display: none; ';
    } else if (content.visibility === 'mobile-only' && !isMobileView) {
      styles += 'display: none; ';
    } else if (content.visibility === 'tablet-only' && !isTabletView) {
      styles += 'display: none; ';
    } else if (content.visibility === 'desktop-only' && !isDesktopView) {
      styles += 'display: none; ';
    }

    if (content.animation && content.animation !== 'none') {
      const delay = content.animationDelay || 0;
      styles += `animation: ${content.animation} 0.5s ease-in-out ${delay}ms; `;
    }

    return styles;
  }

  getAdvancedAttributes(content: any): string {
    let attributes = '';

    if (content.blockId) {
      attributes += `id="${content.blockId}" `;
    }

    if (content.customAttributes) {
      const lines = content.customAttributes.split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          attributes += `${line.trim()} `;
        }
      });
    }

    if (content.debugMode) {
      attributes += `data-debug="true" `;
    }

    return attributes;
  }

  getWrapperClasses(content: any): string {
    let classes = 'block-wrapper';

    if (content.cssClass) {
      classes += ` ${content.cssClass}`;
    }

    if (content.visibility) {
      classes += ` visibility-${content.visibility}`;
    }

    if (content.animation && content.animation !== 'none') {
      classes += ` animated ${content.animation}`;
    }

    return classes;
  }

  shouldRenderBlock(content: any): boolean {
    // Check if block should be excluded from export
    if (content.excludeFromExport) {
      return false;
    }

    // Check display condition (simplified - in real implementation, you'd evaluate the condition)
    if (content.displayCondition && content.displayCondition.trim()) {
      // For demo purposes, we'll just show the block
      // In a real implementation, you'd evaluate the condition
      console.log('Display condition:', content.displayCondition);
    }

    return true;
  }

  getBlockIcon(type: string): string {
    const block = this.availableBlocks.find(b => b.type === type);
    return block ? block.icon : '📄';
  }

  getBlockLabel(type: string): string {
    const block = this.availableBlocks.find(b => b.type === type);
    return block ? block.label : type;
  }

  // Columns management methods
  updateColumnsCount(newCount: number): void {
    if (!this.selectedBlock || this.selectedBlock.type !== 'columns') return;

    const currentColumns = this.selectedBlock.content.columns || [];
    const newColumns = [];

    // Keep existing columns and add new empty ones if needed
    for (let i = 0; i < newCount; i++) {
      if (i < currentColumns.length) {
        newColumns.push(currentColumns[i]);
      } else {
        newColumns.push({
          content: `<h3>Column ${i + 1}</h3><p>This is the content for column ${i + 1}. You can add any HTML content here.</p>`
        });
      }
    }

    this.selectedBlock.content.count = parseInt(newCount as any);
    this.selectedBlock.content.columns = newColumns;
    this.currentBlockProperties.count = newCount;
    this.currentBlockProperties.columns = [...newColumns];

    this.renderEmail();
    this.emitChange();
  }

  updateColumnContent(columnIndex: number, content: string): void {
    if (!this.selectedBlock || this.selectedBlock.type !== 'columns') return;

    if (this.selectedBlock.content.columns && this.selectedBlock.content.columns[columnIndex]) {
      this.selectedBlock.content.columns[columnIndex].content = content;
      this.currentBlockProperties.columns[columnIndex].content = content;
      this.renderEmail();
      this.emitChange();
    }
  }

  // Social media management
  updateSocialPlatform(platformIndex: number, property: string, value: any): void {
    if (!this.selectedBlock || this.selectedBlock.type !== 'social') return;

    if (this.selectedBlock.content.platforms && this.selectedBlock.content.platforms[platformIndex]) {
      this.selectedBlock.content.platforms[platformIndex][property] = value;
      this.currentBlockProperties.platforms[platformIndex][property] = value;
      this.renderEmail();
      this.emitChange();
    }
  }

  // Enhanced block property update with special handling
  updateBlockProperty(property: string, value: any): void {
    if (this.selectedBlock) {
      if (!this.selectedBlock.content) {
        this.selectedBlock.content = {};
      }
      this.selectedBlock.content[property] = value;
      this.currentBlockProperties[property] = value;

      // Special handling for certain properties
      if (this.selectedBlock.type === 'columns' && property === 'gap') {
        // Ensure gap is applied to all columns
        this.renderEmail();
      }

      this.renderEmail();
      this.emitChange();
    }
  }
}
