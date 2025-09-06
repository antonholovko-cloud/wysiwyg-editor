# NGX WYSIWYG Editor

Demo: https://antonholovko-cloud.github.io/wysiwyg-editor/

<img width="1287" height="658" alt="image" src="https://github.com/user-attachments/assets/850a580f-9ba8-486c-89c0-1f1d7518a68d" />


A powerful and customizable WYSIWYG HTML editor component for Angular applications. This library provides a rich text editing experience with extensive formatting options and a clean, intuitive interface.

## Angular Compatibility

| Angular Version | Library Version | Status |
|-----------------|-----------------|--------|
| 14.x            | 1.0.7+          | ✅ Supported |
| 15.x            | 1.0.7+          | ✅ Supported |
| 16.x            | 1.0.7+          | ✅ Supported |
| 17.x            | 1.0.7+          | ✅ Supported |
| 18.x            | 1.0.7+          | ✅ Supported |
| 19.x            | 1.0.7+          | ✅ Supported |
| 20.x            | 1.0.7+          | ✅ Supported |
| < 14.x          | -               | ❌ Not Supported |

## Features

- **Rich Text Formatting**: Bold, italic, underline, strikethrough
- **Headings**: Support for H1, H2, H3, and paragraph styles
- **Lists**: Ordered and unordered lists with indentation control
- **Alignment**: Left, center, right, and justify text alignment
- **Links and Images**: Insert and manage hyperlinks and images
- **Colors**: Text color and background color customization
- **Padding Controls**: Set custom padding for selected elements
- **Additional Features**:
  - Undo/Redo functionality
  - Horizontal rules
  - Subscript and superscript
  - Clear formatting
  - Paste as plain text
- **Angular Forms Integration**: Full support for reactive and template-driven forms
- **Customizable**: Configure toolbar buttons, height, placeholder, and more
- **Accessible**: Keyboard navigation and ARIA support
- **Sanitized Output**: XSS protection with Angular's DomSanitizer

## Installation

### NPM Installation

```bash
npm install ngx-wysiwyg-editor
```


## Setup

### Import the Module

#### Standalone Component (Angular 14.1+)

```typescript
import { Component } from '@angular/core';
import { WysiwygEditorComponent } from 'ngx-wysiwyg-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WysiwygEditorComponent],
  template: `
    <wysiwyg-editor [(ngModel)]="content"></wysiwyg-editor>
  `
})
export class AppComponent {
  content = '';
}
```

#### Module-based Setup

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxWysiwygEditorModule } from 'ngx-wysiwyg-editor';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    NgxWysiwygEditorModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage Examples

### Basic Usage

```html
<wysiwyg-editor [(ngModel)]="htmlContent"></wysiwyg-editor>
```

```typescript
export class MyComponent {
  htmlContent = '<p>Initial content</p>';
}
```

### With Configuration

```html
<wysiwyg-editor 
  [(ngModel)]="content"
  [config]="editorConfig"
  [disabled]="isDisabled"
  (contentChange)="onContentChange($event)"
  (focus)="onFocus()"
  (blur)="onBlur()">
</wysiwyg-editor>
```

```typescript
import { EditorConfig } from 'ngx-wysiwyg-editor';

export class MyComponent {
  content = '';
  isDisabled = false;
  
  editorConfig: EditorConfig = {
    height: '500px',
    minHeight: '300px',
    maxHeight: '800px',
    placeholder: 'Start writing your content...',
    showToolbar: true,
    defaultParagraphSeparator: 'p'
  };
  
  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
  
  onFocus() {
    console.log('Editor focused');
  }
  
  onBlur() {
    console.log('Editor blurred');
  }
}
```

### Reactive Forms Integration

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WysiwygEditorComponent } from 'ngx-wysiwyg-editor';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [WysiwygEditorComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <wysiwyg-editor formControlName="content"></wysiwyg-editor>
      <button type="submit" [disabled]="!form.valid">Submit</button>
    </form>
  `
})
export class FormExampleComponent {
  form: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  onSubmit() {
    if (this.form.valid) {
      console.log('Form value:', this.form.value);
    }
  }
}
```

### Custom Toolbar Buttons

```typescript
import { EditorCommand, EditorConfig } from 'ngx-wysiwyg-editor';

export class MyComponent {
  editorConfig: EditorConfig = {
    customButtons: [
      { command: 'bold', icon: 'B', tooltip: 'Bold' },
      { command: 'italic', icon: 'I', tooltip: 'Italic' },
      { command: 'separator' },
      { command: 'formatBlock', value: 'h1', icon: 'H1', tooltip: 'Heading 1' },
      { command: 'formatBlock', value: 'p', icon: 'P', tooltip: 'Paragraph' },
      { command: 'separator' },
      { command: 'createLink', icon: '🔗', tooltip: 'Insert Link', requiresValue: true },
      { command: 'insertImage', icon: '📷', tooltip: 'Insert Image', requiresValue: true },
      { command: 'separator' },
      { command: 'setPadding', icon: '📦', tooltip: 'Set Padding', requiresValue: true },
      { command: 'separator' },
      { command: 'removeFormat', icon: '✖', tooltip: 'Clear Formatting' }
    ]
  };
}
```

### Using Padding Controls

The editor includes a padding control feature that allows users to set custom padding for selected elements:

1. **Select an element** in the editor (text, paragraph, heading, etc.)
2. **Click the padding button** (📦) in the toolbar
3. **Set padding values** for top, right, bottom, and left in the dialog
4. **Click Apply** to apply the padding to the selected element

The padding dialog provides individual controls for:
- **Top padding** (in pixels)
- **Right padding** (in pixels) 
- **Bottom padding** (in pixels)
- **Left padding** (in pixels)

The padding values are applied as inline CSS styles to the selected element and will be preserved in the HTML output.

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `height` | string | '400px' | Editor height |
| `minHeight` | string | '200px' | Minimum editor height |
| `maxHeight` | string | '600px' | Maximum editor height |
| `placeholder` | string | 'Start typing...' | Placeholder text |
| `showToolbar` | boolean | true | Show/hide toolbar |
| `customButtons` | EditorCommand[] | null | Custom toolbar buttons |
| `defaultParagraphSeparator` | string | 'p' | Default block element |

## Available Commands

The following commands can be used in custom toolbar configurations:

- **Text Formatting**: `bold`, `italic`, `underline`, `strikeThrough`
- **Headings**: `formatBlock` with values: `h1`, `h2`, `h3`, `p`
- **Alignment**: `justifyLeft`, `justifyCenter`, `justifyRight`, `justifyFull`
- **Lists**: `insertUnorderedList`, `insertOrderedList`, `indent`, `outdent`
- **Links/Media**: `createLink`, `unlink`, `insertImage`
- **Colors**: `foreColor`, `backColor`
- **Layout**: `setPadding`
- **Other**: `undo`, `redo`, `removeFormat`, `insertHorizontalRule`, `subscript`, `superscript`

## Events

| Event | Type | Description |
|-------|------|-------------|
| `contentChange` | EventEmitter<string> | Emitted when content changes |
| `focus` | EventEmitter<void> | Emitted when editor gains focus |
| `blur` | EventEmitter<void> | Emitted when editor loses focus |

## Building from Source

### Prerequisites

- Node.js (v14 or higher recommended, v22+ also supported)
- npm or yarn
- Angular CLI (v14 or higher)
- Angular 14.0.0 or higher

### Build Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build library
npm run build

# Build library (production)
npm run build:lib

# Run demo application
npm run serve:demo

# Build for NuGet
./scripts/build.sh          # Unix/Linux/macOS
.\scripts\build.ps1         # Windows PowerShell

# Pack NuGet package
./scripts/pack-nuget.sh     # Unix/Linux/macOS
.\scripts\pack-nuget.ps1    # Windows PowerShell
```

## Deployment

### Deploy to npm

```bash
cd dist/ngx-wysiwyg-editor
npm publish
```

### Deploy to NuGet

```bash
# Unix/Linux/macOS
./scripts/deploy-nuget.sh YOUR_API_KEY

# Windows PowerShell
.\scripts\deploy-nuget.ps1 -ApiKey YOUR_API_KEY
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Requirements

- **Angular**: 14.0.0 or higher
- **TypeScript**: 4.7.0 or higher
- **RxJS**: 7.5.0 or higher
- **Zone.js**: 0.11.4 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions, please [create an issue](https://github.com/antonholovko-cloud/wysiwyg-editor/issues) on GitHub.

## Acknowledgments

- Angular team for the amazing framework
- All contributors who help improve this library
