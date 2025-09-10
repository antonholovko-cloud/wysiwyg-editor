import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
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

export interface EmailContent {
  html: string;
  blocks: EmailBlock[];
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
export class WysiwygEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('emailCanvas', { static: false }) emailCanvas!: ElementRef<HTMLDivElement>;

  @Input() config: EditorConfig = {};
  @Input() disabled = false;
  @Input() set blocks(value: EmailBlock[]) {
    if (value && Array.isArray(value)) {
      this.emailBlocks = [...value];
      this.renderEmail();
      this.emitChange();
    }
  }
  @Input() set emailSettings(value: any) {
    if (value && typeof value === 'object') {
      this._emailSettings = { ...this._emailSettings, ...value };
      this.renderEmail();
      this.emitChange();
    }
  }
  @Input() set initialContent(value: EmailContent) {
    if (value && typeof value === 'object') {
      if (value.blocks && Array.isArray(value.blocks)) {
        this.emailBlocks = [...value.blocks];
      }
      if (value.settings && typeof value.settings === 'object') {
        this._emailSettings = { ...this._emailSettings, ...value.settings };
      }
      this.renderEmail();
      this.emitChange();
    }
  }

  @Output() contentChange = new EventEmitter<EmailContent>();
  @Output() blockSelected = new EventEmitter<EmailBlock>();
  @Output() blocksChange = new EventEmitter<EmailBlock[]>();

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
  isMobile = false;
  showExportDropdown = false;
  private resizeListener: any;

  // Email settings
  private _emailSettings = {
    width: '600px',
    backgroundColor: '#f4f4f4',
    contentBackgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    textColor: '#333333',
    linkColor: '#2196F3',
    padding: '20px'
  };

  get emailSettings() {
    return this._emailSettings;
  }

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

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeConfig();
    this.loadDefaultTemplate();
    this.checkMobileView();

    // Listen for window resize
    this.resizeListener = () => {
      this.checkMobileView();
    };
    window.addEventListener('resize', this.resizeListener);

    // Listen for clicks to close dropdown
    document.addEventListener('click', (event) => {
      if (this.showExportDropdown) {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('.export-dropdown');
        if (!dropdown) {
          this.showExportDropdown = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  ngAfterViewInit(): void {
    this.renderEmail();
    // Set initial device preview
    setTimeout(() => {
      this.updatePreviewSize();
    }, 100);
  }

  private checkMobileView(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // On mobile, close panel by default when switching from desktop
    if (this.isMobile && !wasMobile) {
      this.showBlockPanel = false;
    }
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
    const emailWidth = parseInt(this.emailSettings.width) || 600;

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <style type="text/css">
          /* Reset styles for better email client compatibility */
          body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }

          /* Main body styles */
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: ${this.emailSettings.backgroundColor} !important;
            font-family: ${this.emailSettings.fontFamily} !important;
            font-size: ${this.emailSettings.fontSize} !important;
            color: ${this.emailSettings.textColor} !important;
          }

          /* Link styles */
          a {
            color: ${this.emailSettings.linkColor};
            text-decoration: underline;
          }

          /* Responsive styles */
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .mobile-full-width {
              width: 100% !important;
              max-width: 100% !important;
            }
            .mobile-padding {
              padding: 10px !important;
            }
          }

          /* Hide elements for preview mode */
          ${!isPreview ? `.block-wrapper { border: 1px dashed #ddd; margin: 2px 0; }` : ''}
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${this.emailSettings.backgroundColor}; font-family: ${this.emailSettings.fontFamily}; font-size: ${this.emailSettings.fontSize}; color: ${this.emailSettings.textColor};">
        <!-- Email Container Table -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${this.emailSettings.backgroundColor};">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="${emailWidth}" class="email-container" style="max-width: ${emailWidth}px; background-color: ${this.emailSettings.contentBackgroundColor};">
                <tr>
                  <td>
                    ${blocks}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Helper function to properly encode and format URLs for SendGrid
  private formatUrlForEmail(url: string | undefined): string {
    if (!url || url === '#') return '#';
    
    // If URL doesn't have protocol, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    // Encode special characters except those needed for URL structure
    // SendGrid handles its own tracking parameters, so we keep URLs clean
    return url.replace(/[<>"]/g, (char) => {
      const entities: {[key: string]: string} = {
        '<': '%3C',
        '>': '%3E',
        '"': '%22'
      };
      return entities[char] || char;
    });
  }

  // Helper function to create bulletproof button HTML for better SendGrid compatibility
  private createBulletproofButton(content: any): string {
    const url = this.formatUrlForEmail(content.url);
    const buttonBgColor = content.backgroundColor || '#2196F3';
    const buttonTextColor = content.textColor || '#ffffff';
    const buttonText = content.text || 'Click Here';
    const borderRadius = content.borderRadius || '4px';
    const fontSize = content.fontSize || '16px';
    const padding = content.padding || '12px 24px';
    
    // Parse padding for VML
    const paddingParts = padding.split(' ');
    const verticalPadding = parseInt(paddingParts[0]) || 12;
    const horizontalPadding = parseInt(paddingParts[1] || paddingParts[0]) || 24;
    
    // Calculate line height based on font size for better proportions
    const lineHeight = parseInt(fontSize) * 1.2;
    const buttonHeight = verticalPadding * 2 + lineHeight;
    
    return `
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:${buttonHeight}px;v-text-anchor:middle;width:${buttonText.length * 8 + horizontalPadding * 2}px;" arcsize="${parseInt(borderRadius) * 10}%" stroke="f" fillcolor="${buttonBgColor}">
        <w:anchorlock/>
        <center>
      <![endif]-->
      <a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color:${buttonBgColor};border-radius:${borderRadius};color:${buttonTextColor};display:inline-block;font-family:Arial,sans-serif;font-size:${fontSize};font-weight:bold;line-height:${lineHeight}px;text-align:center;text-decoration:none;width:auto;-webkit-text-size-adjust:none;padding:${padding};mso-padding-alt:0px;">${buttonText}</a>
      <!--[if mso]>
        </center>
      </v:roundrect>
      <![endif]-->
    `;
  }

  renderBlock(block: EmailBlock): string {
    const content = block.content || {};
    const shouldRender = this.shouldRenderBlock(content);
    const isPreview = this.viewMode === 'preview';

    if (!shouldRender) {
      return '';
    }

    let blockContent = '';

    switch (block.type) {
      case 'header':
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${content.backgroundColor || '#2196F3'};">
            <tr>
              <td align="${content.alignment || 'center'}" style="padding: 20px; color: ${content.textColor || '#ffffff'};">
                <h1 style="margin: 0; font-size: 28px; font-family: Arial, sans-serif; font-weight: bold; color: ${content.textColor || '#ffffff'};">
                  ${content.companyName || 'Your Company'}
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; color: ${content.textColor || '#ffffff'}; opacity: 0.9;">
                  ${content.tagline || 'Your tagline here'}
                </p>
              </td>
            </tr>
          </table>
        `;
        break;

      case 'text':
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: ${content.padding || '20px'}; text-align: ${content.textAlign || 'left'}; font-size: ${content.fontSize || '14px'}; line-height: ${content.lineHeight || '1.6'}; font-family: Arial, sans-serif;">
                ${content.content || '<p>Enter your text content here.</p>'}
              </td>
            </tr>
          </table>
        `;
        break;

      case 'image':
        const imageWidth = content.width === '100%' ? '100%' : (parseInt(content.width) || 600);
        const imageUrl = this.formatUrlForEmail(content.link);
        const hasLink = content.link && content.link !== '#';
        
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="${content.alignment || 'center'}" style="padding: ${content.padding || '10px'};">
                ${hasLink ? `<a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; border: none; outline: none;">` : ''}
                <img src="${content.src || 'https://via.placeholder.com/600x300'}" alt="${content.alt || 'Image'}"
                     style="display: block; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                     width="${imageWidth}">
                ${hasLink ? '</a>' : ''}
              </td>
            </tr>
          </table>
        `;
        break;

      case 'button':
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="${content.alignment || 'center'}" style="padding: 20px;">
                ${this.createBulletproofButton(content)}
              </td>
            </tr>
          </table>
        `;
        break;

      case 'divider':
        const dividerColor = content.color || '#e0e0e0';
        const dividerThickness = parseInt(content.thickness) || 1;
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: ${content.margin || '20px 0'};">
                <table cellpadding="0" cellspacing="0" border="0" width="${content.width || '100%'}" align="center">
                  <tr>
                    <td style="border-top: ${dividerThickness}px ${content.style || 'solid'} ${dividerColor}; font-size: 0; line-height: 0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
        break;

      case 'columns':
        const columnCount = content.count || 2;
        const columnWidth = Math.floor(100 / columnCount);
        const gapValue = parseInt(content.gap) || 20;
        const bgColor = content.columnBackground || '#f9f9f9';
        const columnCells = content.columns?.map((column: any, index: number) =>
          `<td width="${columnWidth}%" valign="top" style="padding: 0 ${gapValue / 2}px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding: 15px; background-color: ${bgColor}; border: 1px dashed #ddd; font-family: Arial, sans-serif; font-size: 14px;">
                  ${column.content || `<p style="color: #999; margin: 0;">Column ${index + 1} content</p>`}
                </td>
              </tr>
            </table>
          </td>`
        ).join('') || '';

        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    ${columnCells}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
        break;

      case 'spacer':
        const spacerHeight = parseInt(content.height) || 30;
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="font-size: 0; line-height: 0; height: ${spacerHeight}px;">
                &nbsp;
              </td>
            </tr>
          </table>
        `;
        break;

      case 'video':
        // For email clients, we'll use a static thumbnail with a play button overlay
        const videoUrl = this.formatUrlForEmail(content.videoUrl);
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px;">
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; position: relative; text-decoration: none; border: none; outline: none;">
                  <img src="${content.thumbnail || 'https://via.placeholder.com/600x340'}" alt="Video thumbnail"
                       style="display: block; max-width: 500px; width: 100%; height: auto; border: 0; -ms-interpolation-mode: bicubic;">
                  <!--[if !mso]><!-->
                  <div style="position: absolute; top: 50%; left: 50%; width: 60px; height: 60px; margin-left: -30px; margin-top: -30px; background-color: ${content.playButtonBackground || 'rgba(0,0,0,0.7)'}; border-radius: ${content.playButtonStyle === 'circle' ? '30px' : '8px'};">
                    <!-- Play button triangle -->
                  </div>
                  <!--<![endif]-->
                </a>
              </td>
            </tr>
          </table>
        `;
        break;

      case 'social':
        const socialIcons = content.platforms?.map((platform: any) => {
          const socialUrl = this.formatUrlForEmail(platform.url);
          return `<td style="padding: 0 ${parseInt(content.spacing) / 2 || 5}px;">
            <a href="${socialUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; font-size: ${content.iconSize || '32px'}; color: inherit; border: none; outline: none;">
              ${platform.icon || '📱'}
            </a>
          </td>`;
        }).join('') || '';

        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="${content.alignment || 'center'}" style="padding: 20px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${socialIcons}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
        break;

      case 'html':
        blockContent = `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td>
                ${content.code || content.html || '<!-- Custom HTML content -->'}
              </td>
            </tr>
          </table>
        `;
        break;

      default:
        return '';
    }

    // Wrap each block in a table with optional border for edit mode
    const borderStyle = !isPreview ? 'border: 1px dashed #ddd; margin: 2px 0;' : '';
    const wrapperTable = `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="block-wrapper" style="${borderStyle}">
        <tr>
          <td>
            ${blockContent}
          </td>
        </tr>
      </table>
    `;

    // Wrap with block markers for parsing
    return `<!-- block:${block.type}:start -->${wrapperTable}<!-- block:${block.type}:end -->`;
  }

  // UI Actions
  toggleBlockPanel(): void {
    this.showBlockPanel = !this.showBlockPanel;

    // On mobile, open with blocks tab by default
    if (this.isMobile && this.showBlockPanel) {
      this.activeTab = 'blocks';
    }
  }

  togglePropertiesPanel(): void {
    this.showPropertiesPanel = !this.showPropertiesPanel;
  }

  showSettingsTab(): void {
    this.activeTab = 'settings';
    this.showBlockPanel = true;
  }

  closeMobilePanel(): void {
    if (this.isMobile) {
      this.showBlockPanel = false;
    }
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

  // Export dropdown methods
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportToClipboard(): void {
    const html = this.generateEmailHtml();
    navigator.clipboard.writeText(html).then(() => {
      // Show success feedback
      this.showNotification('HTML copied to clipboard successfully!');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      this.showNotification('Failed to copy to clipboard. Please try again.');
    });
    this.showExportDropdown = false;
  }

  exportToFile(): void {
    const html = this.generateEmailHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showExportDropdown = false;
  }

  // Legacy method for backward compatibility
  exportHtml(): void {
    this.exportToFile();
  }

  private showNotification(message: string): void {
    // Simple notification implementation
    // You could replace this with a more sophisticated notification system
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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

  // Public API methods for external block management
  getBlocks(): EmailBlock[] {
    return [...this.emailBlocks];
  }

  setBlocks(blocks: EmailBlock[]): void {
    if (blocks && Array.isArray(blocks)) {
      this.emailBlocks = [...blocks];
      this.selectedBlock = null;
      this.selectedBlockIndex = -1;
      this.renderEmail();
      this.emitChange();
    }
  }

  addBlockAtIndex(block: EmailBlock, index: number): void {
    if (block && index >= 0 && index <= this.emailBlocks.length) {
      this.emailBlocks.splice(index, 0, block);
      this.renderEmail();
      this.emitChange();
    }
  }

  removeBlockAtIndex(index: number): void {
    if (index >= 0 && index < this.emailBlocks.length) {
      this.emailBlocks.splice(index, 1);
      if (this.selectedBlockIndex === index) {
        this.selectedBlock = null;
        this.selectedBlockIndex = -1;
      }
      this.renderEmail();
      this.emitChange();
    }
  }

  updateBlockAtIndex(index: number, block: EmailBlock): void {
    if (block && index >= 0 && index < this.emailBlocks.length) {
      this.emailBlocks[index] = block;
      if (this.selectedBlockIndex === index) {
        this.selectedBlock = block;
      }
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
    if (value === this.content && this.emailBlocks.length > 0) {
      // No change needed if same value and blocks exist
      return;
    }

    this.content = value || '';

    // If we receive HTML content, try to parse it into blocks
    if (value && value.trim()) {
      this.parseHtmlToBlocks(value);
    } else {
      // Clear blocks if no value
      this.emailBlocks = [];
      this.selectedBlock = null;
      this.selectedBlockIndex = -1;
    }

    // Trigger change detection and update the preview
    this.cdr.detectChanges();

    // Update the preview after change detection
    setTimeout(() => {
      this.renderEmail();
      this.cdr.detectChanges();
    }, 0);
  }

  private parseHtmlToBlocks(html: string): void {
    // Try to extract blocks from the HTML content
    // This is a simplified parser - in production, you'd want a more robust solution
    this.emailBlocks = [];

    // Check if it's our generated HTML with block markers
    const blockMatches = html.match(/<!-- block:(\w+):start -->([\s\S]*?)<!-- block:\w+:end -->/g);

    if (blockMatches && blockMatches.length > 0) {
      // Parse our marked blocks
      blockMatches.forEach(match => {
        const typeMatch = match.match(/<!-- block:(\w+):start -->/);
        const contentMatch = match.match(/<!-- block:\w+:start -->([\s\S]*?)<!-- block:\w+:end -->/);

        if (typeMatch && contentMatch) {
          const type = typeMatch[1];
          const blockHtml = contentMatch[1];
          const block = this.parseBlockFromHtml(type, blockHtml);
          if (block) {
            this.emailBlocks.push(block);
          }
        }
      });
    } else {
      // Fallback: Create a single HTML block with the entire content
      // Use 'code' property as that's what the template expects
      const htmlBlock: EmailBlock = {
        id: this.generateId(),
        type: 'html',
        content: {
          ...this.blockTemplates['html'],
          code: html  // Use 'code' property, not 'html'
        },
        settings: {}
      };
      this.emailBlocks.push(htmlBlock);
    }
  }

  private parseBlockFromHtml(type: string, html: string): EmailBlock | null {
    const block: EmailBlock = {
      id: this.generateId(),
      type: type as any,
      content: { ...this.blockTemplates[type] },
      settings: {}
    };

    // Parse content based on block type
    switch (type) {
      case 'text':
        // For text blocks, use 'content' property
        block.content.content = html.trim();
        break;
      case 'html':
        // For HTML blocks, use 'code' property
        block.content.code = html;
        break;
      case 'header':
        // Extract company name and tagline from header HTML
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/);
        if (h1Match) block.content.companyName = h1Match[1];
        if (pMatch) block.content.tagline = pMatch[1];
        break;
      // Add more block type parsers as needed
      default:
        // For unknown types, try to use as HTML block
        block.type = 'html';
        block.content = { ...this.blockTemplates['html'], code: html };
        break;
    }

    return block;
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

    // Emit comprehensive content model
    const emailContent: EmailContent = {
      html: html,
      blocks: [...this.emailBlocks],
      settings: this.emailSettings
    };
    this.contentChange.emit(emailContent);

    // Also emit blocks separately for backward compatibility
    this.blocksChange.emit([...this.emailBlocks]);
  }

  // Public method to get current email content on demand
  getEmailContent(): EmailContent {
    return {
      html: this.generateEmailHtml(),
      blocks: [...this.emailBlocks],
      settings: { ...this.emailSettings }
    };
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
