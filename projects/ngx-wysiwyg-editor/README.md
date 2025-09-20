# NgxWysiwygEditor

A powerful, feature-rich Angular email template editor component that provides a drag-and-drop visual interface for creating responsive email templates. Built with modern Angular and designed for seamless integration into any Angular application.

## Features

✨ **Visual Email Builder**
- Drag-and-drop block-based editor
- Real-time preview with device responsiveness (Mobile, Tablet, Desktop)
- Intuitive block management with move, duplicate, and delete operations

🧩 **Rich Content Blocks**
- **Header Block**: Company branding with customizable name and tagline
- **Text Block**: Rich text content with formatting options
- **Image Block**: Image insertion with alt text and linking capabilities
- **Button Block**: Call-to-action buttons with custom styling
- **Column Block**: Multi-column layouts (2, 3, or 4 columns)
- **Social Block**: Social media links with icon support
- **Video Block**: Video embedding with custom thumbnails
- **Divider Block**: Visual separators with styling options
- **Spacer Block**: Adjustable spacing elements
- **HTML Block**: Custom HTML code insertion

🎨 **Advanced Styling**
- Comprehensive style customization for each block
- Color pickers for backgrounds, text, and accents
- Font family and size controls
- Alignment and padding options
- Border radius and margin controls

⚡ **Professional Features**
- Import/Export email templates
- HTML code export for email campaigns
- Responsive design with mobile-first approach
- Properties panel with Content, Style, and Advanced tabs
- CSS class and custom attribute support
- Animation effects and visibility controls
- Debug mode for development

🔧 **Developer Friendly**
- TypeScript support with full type definitions
- Configurable component with flexible API
- Clean, maintainable codebase
- Comprehensive documentation

## Compatibility

NgxWysiwygEditor supports a wide range of Angular versions:

| NgxWysiwygEditor Version | Angular Version | Support Status |
|--------------------------|-----------------|----------------|
| 1.0.6+                   | 14.0 - 20.x     | ✅ Full Support |
| 1.0.0 - 1.0.5            | 13.0 - 20.x     | ⚠️ Legacy       |

### Angular Version Compatibility

| Angular Version | Library Version | Status |
|-----------------|-----------------|--------|
| 14.x            | 1.0.6+          | ✅ Fully Supported |
| 15.x            | 1.0.6+          | ✅ Fully Supported |
| 16.x            | 1.0.6+          | ✅ Fully Supported |
| 17.x            | 1.0.6+          | ✅ Fully Supported |
| 18.x            | 1.0.6+          | ✅ Fully Supported |
| 19.x            | 1.0.6+          | ✅ Fully Supported |
| 20.x            | 1.0.6+          | ✅ Fully Supported |
| < 14.x          | -               | ❌ Not Supported   |

### Required Dependencies

The library requires the following Angular packages:
- `@angular/common`: >=14.0.0 <21.0.0
- `@angular/core`: >=14.0.0 <21.0.0
- `@angular/cdk`: >=14.0.0 <21.0.0 (for drag-and-drop functionality)
- `@angular/forms`: >=14.0.0 <21.0.0
- `@angular/platform-browser`: >=14.0.0 <21.0.0

### TypeScript and RxJS Requirements

- **TypeScript**: 4.7.0 or higher
- **RxJS**: 7.5.0 or higher
- **Zone.js**: 0.11.4 or higher

## Installation

Install the library using npm:

```bash
npm install ngx-wysiwyg-editor
```

Or using yarn:

```bash
yarn add ngx-wysiwyg-editor
```

Make sure you have Angular CDK installed (required for drag-and-drop functionality):

```bash
npm install @angular/cdk
```

## Usage

### Import in Module (Angular 14+)

```typescript
import { NgModule } from '@angular/core';
import { NgxWysiwygEditorModule } from 'ngx-wysiwyg-editor';

@NgModule({
  imports: [
    NgxWysiwygEditorModule
  ]
})
export class AppModule { }
```

### Import as Standalone Component (Angular 14.1+)

```typescript
import { Component } from '@angular/core';
import { WysiwygEditorComponent } from 'ngx-wysiwyg-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WysiwygEditorComponent],
  template: `<wysiwyg-editor [(ngModel)]="content"></wysiwyg-editor>`
})
export class AppComponent {
  content = '';
}
```

## Additional Resources

- [Live Demo](https://antonholovko-cloud.github.io/wysiwyg-editor/)
- [GitHub Repository](https://github.com/antonholovko-cloud/wysiwyg-editor)
- [NPM Package](https://www.npmjs.com/package/ngx-wysiwyg-editor)
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

For issues, questions, or feature requests, please [create an issue](https://github.com/antonholovko-cloud/wysiwyg-editor/issues) on GitHub.
