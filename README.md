# Warm Mug Coffee - Neo-Brutalism Theme

A complete coffee shop e-commerce website with a bold Neo-Brutalism design and dark/light mode support.

## 🎨 Design Features

### Neo-Brutalism Style
- **Bold, thick borders** (3px solid black/cream)
- **Hard shadows** (no blur, offset shadows like `6px 6px 0px #000`)
- **Bright, saturated colors** (yellow, pink, blue, green, red, purple)
- **Chunky typography** (Space Grotesk font, uppercase headings)
- **High contrast** between elements
- **Playful but bold** aesthetic
- **No gradients** - flat design with strong visual impact

### Dark/Light Mode
- **Toggle button** in header (Sun/Moon icon)
- **Persistent preference** saved to localStorage
- **Smooth transitions** between themes
- **Custom color palettes** for both modes:
  - Light mode: Warm cream background, bold accents
  - Dark mode: Dark background, bright accents

## 🚀 Features

### Core Functionality
- ✅ Product catalog with 6 sample coffees
- ✅ Shopping cart with add/remove/update quantities
- ✅ Cart sidebar with real-time total calculation
- ✅ Dark/light mode toggle
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Sticky header with cart count badge
- ✅ Product categories (Single Origin, Blend, Decaf)
- ✅ Hover animations and interactions

### Neo-Brutalism Components
- **Cards**: Thick borders, hard shadows, hover lift effect
- **Buttons**: Bold borders, hard shadows, active press effect
- **Inputs**: Thick borders, focus state with shadow change
- **Badges**: Bright colors, uppercase text, thick borders
- **Headings**: Extra bold, uppercase, tight letter spacing

## 🎯 Color Palette

### Light Mode
```css
--bg-primary: #fef3c7 (warm cream)
--bg-secondary: #ffffff (white)
--bg-tertiary: #fde68a (light yellow)
--text-primary: #1a1a1a (near black)
--border-color: #1a1a1a (black)
--accent-yellow: #fbbf24
--accent-pink: #ec4899
--accent-blue: #3b82f6
--accent-green: #10b981
--accent-red: #ef4444
```

### Dark Mode
```css
--bg-primary: #1a1a1a (dark)
--bg-secondary: #2d2d2d (dark gray)
--bg-tertiary: #404040 (medium gray)
--text-primary: #fef3c7 (cream)
--border-color: #fef3c7 (cream)
```

## 🛠️ Technical Implementation

### Theme System
- **ThemeContext**: React Context API for global theme state
- **CSS Variables**: All colors defined as CSS custom properties
- **Data Attributes**: `data-theme="light"` or `data-theme="dark"` on HTML
- **LocalStorage**: Persists user preference across sessions

### Key Files
- `src/context/ThemeContext.tsx` - Theme provider and hook
- `src/index.css` - Neo-Brutalism CSS with theme variables
- `src/App.tsx` - Main app with all components
- `index.html` - Font imports and meta tags

### Typography
- **Font**: Space Grotesk (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800, 900
- **Headings**: Uppercase, extra bold (900), tight letter spacing
- **Body**: Regular weight, readable sizes

## 📱 Responsive Design

- **Mobile**: Single column layout, stacked elements
- **Tablet**: 2-column product grid
- **Desktop**: 3-column product grid, sidebar cart

## 🎨 Customization

### Adding New Colors
Edit `src/index.css`:
```css
:root {
  --accent-orange: #f97316;
}
```

### Creating New Components
Use the Neo-Brutalism classes:
```tsx
<div className="nb-card p-4">
  <h2 className="nb-heading text-2xl">Title</h2>
  <button className="nb-button px-4 py-2">Click Me</button>
</div>
```

### Available Classes
- `.nb-card` - Card with border and shadow
- `.nb-button` - Primary button (yellow background)
- `.nb-button-secondary` - Secondary button (white background)
- `.nb-input` - Input field with border
- `.nb-heading` - Bold uppercase heading
- `.nb-badge` - Small badge/tag
- `.nb-badge-pink`, `.nb-badge-blue`, etc. - Colored badges

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 🎯 Next Steps

To expand this into a full e-commerce platform, add:

1. **Backend Integration**
   - Supabase for database and authentication
   - Product management
   - Order processing

2. **Additional Pages**
   - Product detail pages
   - Checkout flow
   - User accounts
   - Admin dashboard

3. **Advanced Features**
   - Search and filtering
   - Product reviews
   - Wishlist/favorites
   - Order tracking
   - Email notifications

4. **Payment Integration**
   - Stripe or PayPal
   - Multiple payment methods
   - Secure checkout

## 📝 License

This project is a demonstration of Neo-Brutalism design principles applied to e-commerce.

## 🎨 Design Inspiration

Neo-Brutalism is characterized by:
- Raw, unpolished aesthetic
- Bold, uncompromising design choices
- High contrast and visual impact
- Rejection of minimalism
- Playful use of color and typography

This implementation brings these principles to life in a modern web application while maintaining usability and accessibility.
