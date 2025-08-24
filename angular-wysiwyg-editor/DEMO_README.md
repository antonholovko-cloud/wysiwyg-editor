# WYSIWYG Editor Demo Application

This demo application showcases all features of the ngx-wysiwyg-editor library, including the new padding controls functionality.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the library:**
   ```bash
   npm run build:lib
   ```

3. **Start the demo application:**
   ```bash
   npm run serve:demo
   ```

4. **Open your browser:**
   Navigate to [http://localhost:4200](http://localhost:4200)

## Demo Features

### 1. Basic Editor
- Full toolbar with all available commands
- Default configuration showcase
- HTML output viewer

### 2. Custom Toolbar Configuration
- Example of customized toolbar buttons
- Includes the new padding control (📦)
- Demonstrates selective feature inclusion

### 3. Reactive Forms Integration
- Angular reactive forms with validation
- Form status display
- Error handling demonstration

### 4. Compact Editor
- Minimal toolbar for space-constrained environments
- Essential features only

### 5. Read-Only Editor
- Disabled state demonstration
- Content display without editing capabilities

### 6. Padding Controls Feature ⭐ NEW!
- Dedicated section for testing padding functionality
- Step-by-step instructions
- Visual examples of padding effects

## Testing the Padding Feature

1. Go to the "Padding Controls Feature" section
2. Select any text or element in the editor
3. Click the padding button (📦) in the toolbar
4. Set different values for top, right, bottom, and left padding
5. Click "Apply" to see the padding applied to the selected element

## Available Scripts

- `npm run serve:demo` - Start development server
- `npm run build:demo` - Build demo for production
- `npm run build:lib` - Build the library
- `npm run test:lib` - Run library tests
- `npm run pack:nuget` - Create NuGet package

## Browser Console

The demo application logs various events to the browser console:
- Content changes in each editor
- Focus/blur events
- Form submissions

Open your browser's developer tools to see these logs in action.

## Features Demonstrated

✅ **Text Formatting**: Bold, italic, underline, strikethrough  
✅ **Block Elements**: Headings, paragraphs, lists, horizontal rules  
✅ **Alignment**: Left, center, right, justify  
✅ **Layout**: Indent, outdent, **custom padding (NEW!)**  
✅ **Media**: Links, images  
✅ **Colors**: Text and background colors  
✅ **Editor Features**: Undo/redo, copy/paste  
✅ **Forms Integration**: Angular reactive forms  
✅ **Security**: XSS protection and HTML sanitization  
✅ **Customization**: Custom toolbars and configurations  

## Project Structure

```
projects/demo/
├── src/
│   ├── app/
│   │   ├── app.ts              # Main component
│   │   ├── app.html            # Template with examples
│   │   ├── app.scss            # Demo-specific styles
│   │   └── app.config.ts       # App configuration
│   ├── main.ts                 # Bootstrap file
│   ├── index.html              # HTML entry point
│   └── styles.scss             # Global styles
```

## Next Steps

After testing the demo:
1. Review the implementation in `projects/demo/src/app/`
2. Copy relevant code examples to your own project
3. Customize the editor configuration to match your needs
4. Build and deploy your application with the WYSIWYG editor

For more information, see the main [README.md](README.md) file.