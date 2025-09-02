# NGX WYSIWYG Editor for .NET

A powerful and customizable WYSIWYG HTML editor for Angular applications integrated with .NET projects.

## Installation

### Via NuGet Package Manager

```bash
Install-Package NgxWysiwygEditor
```

### Via .NET CLI

```bash
dotnet add package NgxWysiwygEditor
```

## Integration with .NET Project

After installing the NuGet package, the Angular library files will be available in your project under:
`wwwroot/lib/ngx-wysiwyg-editor/`

### 1. Include in your Angular Module

```typescript
import { NgxWysiwygEditorModule } from './lib/ngx-wysiwyg-editor/ngx-wysiwyg-editor.mjs';

@NgModule({
  imports: [
    // ... other imports
    NgxWysiwygEditorModule
  ]
})
export class AppModule { }
```

### 2. Use in your component template

```html
<ngx-wysiwyg-editor
  [(ngModel)]="htmlContent"
  [config]="editorConfig">
</ngx-wysiwyg-editor>
```

### 3. Configure in your component

```typescript
export class MyComponent {
  htmlContent = '';
  
  editorConfig = {
    height: '400px',
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['formatBlock', 'blockquote'],
      ['insertUnorderedList', 'insertOrderedList'],
      ['link', 'image']
    ]
  };
}
```

## ASP.NET Core Integration

If you're using ASP.NET Core with Angular, ensure the library is properly referenced in your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "wwwroot/lib/ngx-wysiwyg-editor/fesm2022/ngx-wysiwyg-editor.mjs"
            ]
          }
        }
      }
    }
  }
}
```

## Blazor Integration

For Blazor applications with Angular components, you can reference the editor through JavaScript interop:

```csharp
@page "/editor"
@inject IJSRuntime JS

<div id="angular-editor-container"></div>

@code {
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await JS.InvokeVoidAsync("initializeWysiwygEditor", "angular-editor-container");
        }
    }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| height | string | '300px' | Editor height |
| width | string | '100%' | Editor width |
| minHeight | string | '100px' | Minimum editor height |
| placeholder | string | '' | Placeholder text |
| toolbar | array | [...] | Toolbar button configuration |
| defaultFontSize | string | '3' | Default font size |
| defaultFontName | string | 'Arial' | Default font family |
| uploadUrl | string | null | Image upload endpoint |
| sanitize | boolean | true | Enable HTML sanitization |

## Features

- Rich text editing with formatting options
- Image and link insertion
- HTML source code view
- Customizable toolbar
- Responsive design
- Cross-browser compatibility
- XSS protection with built-in sanitization
- Undo/Redo functionality
- Keyboard shortcuts support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License. See LICENSE file for more details.

## Support

For issues and feature requests, please visit:
https://github.com/yourusername/ngx-wysiwyg-editor/issues

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Version History

See [Release Notes](https://github.com/yourusername/ngx-wysiwyg-editor/releases) for a detailed version history.