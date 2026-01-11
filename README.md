# Etsy Bulk Listings Manager

Modern, full-stack frontend application for managing Etsy multi-store product listings and content generation.

## Features

- 🎨 **Multi-Store Management**: Create customized listings for multiple Etsy stores from a single product image
- 📝 **AI Content Editor**: Per-store title, tags, and description editing with character counters
- 🖼️ **Image Management**: Drag-and-drop image upload with infographic template support
- 👁️ **Image Preview**: Style-specific preview cards with infographic overlay options
- 📊 **GetVela Export**: CSV export with customizable field mapping
- 💾 **State Management**: Data persistence across store tabs

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn/UI components
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header bar
│   ├── ProductWorkspace.tsx # Main workspace
│   ├── ImageUpload.tsx     # Image upload component
│   ├── ContentEditor.tsx   # Content editing form
│   ├── ImagePreview.tsx    # Image preview cards
│   └── MappingTable.tsx   # GetVela export table
├── lib/
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript types
```

## Usage

1. **Upload Images**: Drag and drop or browse to upload your main product image and infographic template
2. **Select Store**: Click on store tabs (Mağaza A, B, C) to switch between stores
3. **Edit Content**: 
   - Enter title (max 140 characters)
   - Add up to 13 tags (max 20 characters each)
   - Write description (templates auto-added)
4. **Preview Images**: View style-specific previews with infographic overlay option
5. **Export**: Configure field mappings and export to CSV for GetVela

## Customization

### Adding New Stores

Edit `defaultStores` array in `components/ProductWorkspace.tsx`:

```typescript
const defaultStores: Store[] = [
  {
    id: "store-d",
    name: "Mağaza D",
    style: "Modern",
    aboutTemplate: "Your about text...",
    shippingTemplate: "Your shipping text...",
    returnTemplate: "Your return text...",
  },
]
```

### Styling

The app uses Tailwind CSS with a custom color palette. Modify `app/globals.css` to change the theme colors.

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

