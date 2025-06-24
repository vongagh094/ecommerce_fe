This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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
