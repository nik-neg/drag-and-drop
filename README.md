# Enhanced Drag and Drop Board Example

A modern, type-safe implementation of a drag and drop board using Atlassian's Pragmatic Drag and Drop library. This project enhances the official example with improved architecture, better type safety, and a more maintainable folder structure.

## 🚀 Features

- **Type-Safe Implementation**: Enhanced with TypeScript enums and strict typing
- **Modern React Patterns**:
  - Custom hooks for drag and drop logic
  - Context providers for state management
  - Memoized components for better performance
- **Enhanced Architecture**:
  - Clean folder structure
  - Separated concerns
  - Reusable components
- **Advanced Drag and Drop Features**:
  - Column reordering
  - Card reordering within columns
  - Cross-column card movement
  - Custom drag previews
  - Safari-specific optimizations
  - Auto-scrolling support
  - Drop indicators
  - Action menus for cards and columns

## 📁 Project Structure

```
src/
├── assets/         # Static assets
├── components/     # React components
│   ├── action-menu/    # Column and card action menus
│   ├── board/         # Main board component
│   ├── card/          # Card components
│   └── column/        # Column components
├── data/          # Data types and initial state
├── enums/         # TypeScript enums
├── hooks/         # Custom React hooks
├── provider/      # Context providers
└── main.tsx       # Application entry point
```

## 🛠️ Built With

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [@atlaskit/pragmatic-drag-and-drop](https://bitbucket.org/atlassian/pragmatic-drag-and-drop)
- [Vite](https://vitejs.dev/)

## 🎯 Key Improvements

1. **Enhanced Type Safety**

   - Custom enums for state management
   - Strict TypeScript configurations
   - Improved type definitions

2. **Improved Architecture**

   - Separated drag and drop logic into custom hooks
   - Modular component structure
   - Clear separation of concerns

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Based on the [Atlassian Pragmatic Drag and Drop](https://codesandbox.io/p/sandbox/mfrksf?file=%2Fexample.tsx) example
- Enhanced with modern React patterns and TypeScript
