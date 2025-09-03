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

| NgxWysiwygEditor Version | Angular Version |
|--------------------------|-----------------|
| 1.0.x                    | 13.0 - 20.x     |

### Required Dependencies

The library requires the following Angular packages:
- `@angular/common`: >=13.0.0 <21.0.0
- `@angular/core`: >=13.0.0 <21.0.0
- `@angular/cdk`: >=13.0.0 <21.0.0 (for drag-and-drop functionality)
- `@angular/forms`: >=13.0.0 <21.0.0
- `@angular/platform-browser`: >=13.0.0 <21.0.0

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

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build ngx-wysiwyg-editor
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/ngx-wysiwyg-editor
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
