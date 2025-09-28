# E-Commerce Website

A modern, full-featured e-commerce platform built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and SQLite.

## Features

### 🏪 Marketplace
- **Homepage** with hero section, product grid, and category browsing
- **Product showcase** with responsive design (2-4 columns)
- **Category filtering** for easy product discovery
- **Search functionality** for products

### 👥 User Authentication
- **Dual authentication system** for buyers and sellers
- **Buyer login/register** with shopping-focused features
- **Seller login/register** with business account setup
- **Role-based redirects** (sellers → dashboard, buyers → homepage)

### 🛒 Shopping Experience
- **Shopping cart** with item management
- **Quantity updates** and item removal
- **Cart persistence** across sessions
- **Checkout process** (placeholder implementation)

### 📊 Seller Dashboard
- **Product management** (add, edit, delete)
- **Sales analytics** and revenue tracking
- **Inventory management** with stock status
- **Seller performance metrics**

### 🎨 Design & UI
- **Responsive design** optimized for all devices
- **Modern UI components** using shadcn/ui
- **Tailwind CSS** for consistent styling
- **Accessible components** with proper ARIA labels

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image component

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── buyer/         # Buyer login/register
│   │   └── seller/        # Seller login/register
│   ├── cart/              # Shopping cart page
│   ├── seller/            # Seller-specific pages
│   │   └── dashboard/     # Seller dashboard
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx        # Navigation component
│   ├── Footer.tsx        # Footer component
│   ├── HeroSection.tsx   # Homepage hero
│   ├── ProductGrid.tsx   # Product display grid
│   └── CategoriesSection.tsx  # Category browsing
├── lib/                  # Utilities and configurations
│   ├── db.ts            # Database connection
│   └── utils.ts         # Utility functions
└── prisma/              # Database schema and migrations
    └── schema.prisma    # Prisma schema definition
```

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User's full name
- `role`: BUYER or SELLER
- `products`: Related products (for sellers)

### Product Model
- `id`: Unique identifier
- `name`: Product name
- `description`: Product description
- `price`: Product price
- `imageUrl`: Product image URL
- `category`: Product category
- `sellerId`: Reference to seller

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # .env file is already configured with:
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Features Overview

### Navigation
- **Fixed top navbar** with logo, search, and user actions
- **Responsive design** with mobile-friendly menu
- **Cart icon** with item count badge
- **Quick access** to login/register for both user types

### Homepage
- **Hero section** with call-to-action buttons
- **Category grid** with icons and hover effects
- **Featured products** with ratings and pricing
- **Product cards** with add-to-cart functionality

### Authentication
- **Form validation** and error handling
- **Toggle between login/register** modes
- **Role-specific redirects** after authentication
- **Cross-links** between buyer and seller portals

### Shopping Cart
- **Item management** with quantity controls
- **Real-time calculations** for subtotal, tax, and shipping
- **Free shipping threshold** notification
- **Responsive layout** for mobile and desktop

### Seller Dashboard
- **Analytics cards** showing key metrics
- **Product management** with CRUD operations
- **Sales tracking** and performance data
- **Inventory status** indicators

## Customization

### Adding New Categories
Edit the categories array in `src/components/CategoriesSection.tsx`:

```typescript
const categories = [
  {
    name: 'Your Category',
    icon: YourIcon,
    href: '/category/your-category',
    color: 'bg-your-color'
  },
  // ... existing categories
]
```

### Styling
- **Global styles**: `src/app/globals.css`
- **Component styles**: Use Tailwind CSS classes
- **Theme colors**: Configure in `tailwind.config.js`
- **Custom components**: Extend shadcn/ui components

### Database Changes
1. **Update schema**: Edit `prisma/schema.prisma`
2. **Generate client**: Run `npx prisma generate`
3. **Push changes**: Run `npx prisma db push`

## Future Enhancements

### Authentication
- [ ] Implement NextAuth.js for complete authentication
- [ ] Add password reset functionality
- [ ] Social login integration (Google, GitHub)
- [ ] Email verification system

### E-commerce Features
- [ ] Payment processing (Stripe integration)
- [ ] Order management system
- [ ] Inventory tracking
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering

### Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] Order analytics
- [ ] Site configuration panel

### Performance
- [ ] Image optimization and CDN
- [ ] Caching strategies
- [ ] Database optimization
- [ ] SEO improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

Built with ❤️ using Next.js 14 and modern web technologies.
