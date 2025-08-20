# Property Rental Platform - Frontend

This is a [Next.js](https://nextjs.org) project for a property rental platform with search, filtering, and booking capabilities.

## Features

- 🏠 **Property Search & Filtering**: Advanced search with location, dates, guests, price range, amenities
- 📱 **Responsive Design**: Mobile-first responsive layout
- 🔍 **Real-time Search**: Location autocomplete and instant search results
- 📄 **Pagination**: Efficient pagination for large result sets
- ❤️ **Favorites System**: Save properties to wishlists
- 🏆 **Host Profiles**: Detailed host information and ratings
- 🔐 **Authentication**: Auth0 integration for secure login
- 🎨 **Modern UI**: Clean, modern interface with Tailwind CSS

## Pre-requisites
* Docker and Docker Compose installed on your machine
* Node.js 18 or higher installed on your machine
* Python 3.10 or higher installed on your machine (for backend)

## Getting Started

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd property-rental-frontend
```

### Step 2: Install dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to false when backend is available

# Auth0 Configuration (optional for development)
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Step 4: Set up backend services (optional)
If you want to run with the full backend:
```bash
./dbup
```
- Remove services if you want to reset the database:
```bash
./dbdown
```

### Step 5: Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Sky-high E-commerce Platform

A Next.js-based platform with three user types: Traveller, Host, and Admin.

## Project Structure

\`\`\`
src/
├── app/                        # Next.js App Router
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Traveller homepage (/)
│   ├── host/                  # Host interface (/host/*)
│   │   ├── layout.tsx         # Host layout with header
│   │   ├── page.tsx           # Host messages dashboard
│   │   ├── properties/
│   │   │   └── page.tsx       # Host properties management
│   │   └── incomes/
│   │       └── page.tsx       # Host income dashboard
│   └── admin/                 # Admin interface (/admin/*)
│       ├── layout.tsx         # Admin layout
│       └── page.tsx           # Admin dashboard
├── components/                 # React components
│   ├── traveller/             # Traveller-specific components
│   │   ├── search-section.tsx
│   │   ├── category-filters.tsx
│   │   ├── hero-section.tsx
│   │   ├── property-grid.tsx
│   │   └── inspiration-section.tsx
│   ├── host/                  # Host-specific components
│   │   ├── host-header.tsx
│   │   └── messaging-interface.tsx
│   ├── admin/                 # Admin-specific components (future)
│   ├── shared/                # Shared components
│   │   └── footer.tsx
│   └── ui/                    # shadcn/ui components
└── lib/                       # Utility functions
    └── utils.ts

# Configuration files (root level)
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── components.json
\`\`\`

## User Types

### Traveller (/)
- Property search and browsing
- Category filtering
- Property booking (future)

### Host (/host/*)
- Messaging with guests
- Property management
- Income tracking

### Admin (/admin/*)
- User management
- Property oversight
- Platform analytics

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React

## API Integration

### Development Mode
The application can run in two modes:

1. **Mock Data Mode** (default): Uses generated mock data for development
   - Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in your environment
   - No backend required
   - Perfect for frontend development and testing

2. **Backend Integration Mode**: Connects to real backend API
   - Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in your environment
   - Requires backend server running on `NEXT_PUBLIC_API_URL`
   - Full functionality with real data

### API Endpoints

The application integrates with the following backend endpoints:

#### Public Endpoints (No Authentication Required)
- `GET /properties/search` - Search properties with filters
- `GET /properties/filter` - Advanced property filtering
- `GET /properties/{id}` - Get property details
- `GET /properties/categories` - List property categories
- `GET /amenities` - List available amenities
- `GET /locations/suggestions` - Location autocomplete
- `GET /properties/search-filters` - Get filter metadata
- `GET /hosts/{id}/profile` - Get host profile

#### Authenticated Endpoints (Login Required)
- `GET /user/profile` - User profile
- `GET /user/wishlists` - User wishlists/favorites
- `POST /user/wishlists/{id}/properties` - Add to favorites
- `DELETE /user/wishlists/{id}/properties/{propertyId}` - Remove from favorites
- `POST /bookings` - Create booking
- `GET /user/bookings` - User bookings
- `POST /bids` - Place bid on auction
- `GET /user/conversations` - User messages

### Search & Filtering Features

#### Basic Search Parameters
- `location` - Search by city, state, or country
- `check_in` / `check_out` - Date range filtering
- `guests` - Number of guests
- `page` / `limit` - Pagination

#### Advanced Filtering
- Price range (`min_price`, `max_price`)
- Property types (`property_types[]`)
- Categories (`categories[]`)
- Amenities (`amenities[]`)
- Host filters (`superhost_only`, `instant_book_only`)
- Rating filters (`min_rating`, `min_review_count`)
- Room requirements (`min_bedrooms`, `min_bathrooms`)

#### Response Format
```typescript
interface SearchResponse {
  properties: PropertyCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    available_categories: string[];
    price_range: { min: number; max: number };
    available_amenities: string[];
    location_suggestions: string[];
  };
  search_metadata: {
    query_time_ms: number;
    total_found: number;
    location_detected?: LocationInfo;
  };
}
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage
│   ├── search/            # Search results page
│   └── property/[id]/     # Property details page
├── components/            # React components
│   ├── shared/           # Reusable components
│   ├── traveller/        # Guest-facing components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
│   ├── use-property-search.ts
│   └── use-pagination.ts
├── lib/                  # Utilities and configurations
│   ├── api/              # API client and mock data
│   ├── auth0.ts          # Authentication
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
```

## Key Components

### Search & Filtering
- `SearchSection` - Main search interface
- `CategoryFilters` - Property category filtering
- `PropertyGrid` - Property display grid
- `Pagination` - Pagination controls

### Property Display
- `PropertyCard` - Individual property card
- `PropertyGallery` - Image gallery
- `PropertyDetails` - Detailed property information
- `PropertyHeader` - Property title and basic info

### Hooks
- `usePaginatedPropertySearch` - Search with pagination
- `usePropertyDetails` - Property details fetching
- `usePagination` - Generic pagination logic

## Development Guidelines

### Adding New API Endpoints
1. Define types in `src/types/index.ts`
2. Add API function to `src/lib/api.ts`
3. Add mock data to `src/lib/api/mock-data.ts`
4. Create custom hook if needed
5. Update components to use new endpoint

### Error Handling
- All API calls include proper error handling
- Fallback to mock data in development mode
- User-friendly error messages
- Retry mechanisms for failed requests

### Performance Considerations
- Lazy loading for large lists
- Image optimization with Next.js Image
- Pagination for large datasets
- Skeleton loading states
- Efficient re-renders with React hooks

## Troubleshooting

### Common Issues

1. **Pagination not showing**: Check that `totalItems > itemsPerPage`
2. **API errors**: Verify `NEXT_PUBLIC_API_URL` is correct
3. **Mock data not loading**: Ensure `NEXT_PUBLIC_USE_MOCK_DATA=true`
4. **Authentication issues**: Check Auth0 configuration

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show API calls, pagination state, and other debug information in the browser console.