# Search & Filter API Requirements

## Current State Analysis

### Frontend Search Components Status:
✅ **Search Bar UI** - Complete with location, dates, guests
✅ **Category Filters UI** - Complete with category selection
✅ **Advanced Filters UI** - Basic structure exists
❌ **Backend Integration** - Currently non-functional, needs API implementation

### Database Schema Analysis for Search

Based on the database schema, here are the searchable fields:

#### **Properties Table (Main Search Target)**
```sql
-- Location fields
city VARCHAR(100)
state VARCHAR(100) 
country VARCHAR(100)
address_line1 VARCHAR(255)
postal_code VARCHAR(20)
latitude DECIMAL(10,8)
longitude DECIMAL(11,8)

-- Property details
property_type VARCHAR(50)
category VARCHAR(50)
max_guests INTEGER
bedrooms INTEGER
bathrooms INTEGER
base_price DECIMAL(10,2)

-- Availability & booking
instant_book BOOLEAN
minimum_stay INTEGER
status VARCHAR(20) -- DRAFT/ACTIVE/INACTIVE

-- Quality indicators
home_tier VARCHAR(20)
is_guest_favorite BOOLEAN
```

#### **Related Tables for Advanced Search**
```sql
-- Amenities (many-to-many via property_amenities)
amenities.name VARCHAR(100)
amenities.category VARCHAR(50)

-- Host information (via users table)
users.is_super_host BOOLEAN
users.host_rating_average DECIMAL(3,2)
users.host_review_count INTEGER

-- Reviews (for rating filters)
reviews.rating INTEGER
reviews.accuracy_rating INTEGER
reviews.cleanliness_rating INTEGER
-- etc.

-- Availability (for date filtering)
calendar_availability.date DATE
calendar_availability.is_available BOOLEAN
calendar_availability.price_amount DECIMAL(10,2)

-- Auctions (for bidding mode)
auctions.status VARCHAR(20)
auctions.start_date DATE
auctions.end_date DATE
```

## Required API Endpoints

### 1. **Enhanced Property Search API**
**Endpoint:** `GET /api/v1/properties/search`

**Query Parameters:**
```typescript
interface SearchParams {
  // Basic search
  location?: string           // Search in city, state, country, address
  check_in?: string          // YYYY-MM-DD format
  check_out?: string         // YYYY-MM-DD format
  guests?: number            // Total guests (adults + children)
  
  // Pagination
  page?: number              // Default: 1
  limit?: number             // Default: 20, max: 100
  
  // Sorting
  sort_by?: 'price' | 'rating' | 'distance' | 'popularity' | 'newest'
  sort_order?: 'asc' | 'desc'
  
  // Location-based
  latitude?: number          // For distance-based search
  longitude?: number
  radius?: number            // Search radius in km
  
  // Bidding mode
  mode?: 'standard' | 'bidding'  // Filter for auction properties
}
```

**Response:**
```typescript 
interface SearchResponse {
  properties: PropertyCard[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters: {
    available_categories: string[]
    price_range: { min: number, max: number }
    available_amenities: string[]
    location_suggestions: string[]
  }
  search_metadata: {
    query_time_ms: number
    total_found: number
    location_detected?: {
      city: string
      state: string
      country: string
      coordinates?: [number, number]
    }
  }
}
```

### 2. **Advanced Property Filter API**
**Endpoint:** `GET /api/v1/properties/filter`

**Query Parameters:**
```typescript
interface FilterParams extends SearchParams {
  // Price filtering
  min_price?: number
  max_price?: number
  
  // Property characteristics
  property_types?: string[]      // ['apartment', 'house', 'villa']
  categories?: string[]          // ['beach', 'mountain', 'city']
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
  
  // Amenities (from amenities table)
  amenities?: string[]           // ['wifi', 'pool', 'parking']
  amenity_categories?: string[]  // ['basic', 'entertainment', 'safety']
  
  // Host & Quality filters
  superhost_only?: boolean
  instant_book_only?: boolean
  guest_favorites_only?: boolean
  min_rating?: number           // 1-5 stars
  min_review_count?: number
  
  // Booking policies
  cancellation_policies?: string[]  // ['flexible', 'moderate', 'strict']
  min_stay?: number
  max_stay?: number
  
  // Accessibility
  accessible?: boolean
  
  // Special features
  has_pool?: boolean
  has_wifi?: boolean
  has_parking?: boolean
  has_kitchen?: boolean
  has_ac?: boolean
  has_heating?: boolean
  
  // Date-specific pricing
  flexible_dates?: boolean      // Search ±3 days around check_in/out
}
```

### 3. **Location Autocomplete API**
**Endpoint:** `GET /api/v1/locations/suggestions`

**Query Parameters:**
```typescript
interface LocationSuggestionsParams {
  query: string              // User input
  limit?: number            // Default: 10
  types?: string[]          // ['city', 'region', 'country', 'property']
  country?: string          // Limit to specific country
}
```

**Response:**
```typescript
interface LocationSuggestionsResponse {
  suggestions: {
    id: string
    name: string
    type: 'city' | 'region' | 'country' | 'property'
    full_name: string        // "Paris, Île-de-France, France"
    coordinates?: [number, number]
    property_count?: number
    popularity_score?: number
  }[]
}
```

### 4. **Property Categories API**
**Endpoint:** `GET /api/v1/properties/categories`

**Response:**
```typescript
interface CategoriesResponse {
  categories: {
    name: string              // 'beach'
    display_name: string      // 'Beach'
    description?: string
    icon_url?: string
    property_count: number
    is_popular: boolean
  }[]
}
```

### 5. **Available Amenities API**
**Endpoint:** `GET /api/v1/amenities`

**Query Parameters:**
```typescript
interface AmenitiesParams {
  category?: string          // Filter by amenity category
  popular_only?: boolean     // Only show popular amenities
}
```

**Response:**
```typescript
interface AmenitiesResponse {
  amenities: {
    id: string
    name: string
    category: string
    icon?: string
    is_popular: boolean
    property_count: number
  }[]
  categories: {
    name: string
    display_name: string
    amenity_count: number
  }[]
}
```

### 6. **Search Filters Metadata API**
**Endpoint:** `GET /api/v1/properties/search-filters`

**Query Parameters:**
```typescript
interface SearchFiltersParams {
  location?: string          // Get filters for specific location
  check_in?: string
  check_out?: string
}
```

**Response:**
```typescript
interface SearchFiltersResponse {
  price_range: {
    min: number
    max: number
    average: number
    currency: string
  }
  property_types: {
    type: string
    display_name: string
    count: number
  }[]
  popular_amenities: {
    id: string
    name: string
    count: number
  }[]
  rating_distribution: {
    [rating: string]: number  // "4.5": 150, "4.0": 200
  }
  availability_calendar: {
    available_dates: string[]
    peak_season: {
      start: string
      end: string
    }[]
  }
}
```

## Backend Implementation Requirements

### 1. **Database Queries**

#### **Main Search Query with Full-Text Search**
```sql
-- Main property search with location, dates, and guests
SELECT DISTINCT p.*,
  u.full_name as host_name,
  u.is_super_host,
  u.host_rating_average,
  AVG(r.rating) as avg_rating,
  COUNT(r.id) as review_count,
  -- Distance calculation if coordinates provided
  CASE 
    WHEN $lat IS NOT NULL AND $lng IS NOT NULL THEN
      ST_Distance(
        ST_Point(p.longitude, p.latitude)::geography,
        ST_Point($lng, $lat)::geography
      ) / 1000
    ELSE NULL
  END as distance_km
FROM properties p
JOIN users u ON p.host_id = u.id
LEFT JOIN reviews r ON p.id = r.property_id AND r.is_visible = true
LEFT JOIN calendar_availability ca ON p.id = ca.property_id
WHERE p.status = 'ACTIVE'
  -- Location search (full-text search on multiple fields)
  AND ($location IS NULL OR (
    p.city ILIKE '%' || $location || '%' OR
    p.state ILIKE '%' || $location || '%' OR
    p.country ILIKE '%' || $location || '%' OR
    p.address_line1 ILIKE '%' || $location || '%'
  ))
  -- Guest capacity
  AND ($guests IS NULL OR p.max_guests >= $guests)
  -- Date availability (if dates provided)
  AND ($check_in IS NULL OR $check_out IS NULL OR NOT EXISTS (
    SELECT 1 FROM calendar_availability ca2 
    WHERE ca2.property_id = p.id 
    AND ca2.date BETWEEN $check_in AND $check_out 
    AND ca2.is_available = false
  ))
GROUP BY p.id, u.full_name, u.is_super_host, u.host_rating_average
ORDER BY 
  CASE WHEN $sort_by = 'price' THEN p.base_price END ASC,
  CASE WHEN $sort_by = 'rating' THEN AVG(r.rating) END DESC,
  CASE WHEN $sort_by = 'distance' THEN distance_km END ASC,
  p.created_at DESC
LIMIT $limit OFFSET $offset;
```

#### **Advanced Filter Query**
```sql
-- Advanced filtering with amenities and complex criteria
SELECT DISTINCT p.*,
  u.full_name as host_name,
  u.is_super_host,
  AVG(r.rating) as avg_rating,
  COUNT(r.id) as review_count,
  array_agg(DISTINCT a.name) as amenities
FROM properties p
JOIN users u ON p.host_id = u.id
LEFT JOIN reviews r ON p.id = r.property_id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
LEFT JOIN amenities a ON pa.amenity_id = a.id
WHERE p.status = 'ACTIVE'
  -- Price range
  AND ($min_price IS NULL OR p.base_price >= $min_price)
  AND ($max_price IS NULL OR p.base_price <= $max_price)
  -- Property type
  AND ($property_types IS NULL OR p.property_type = ANY($property_types))
  -- Categories
  AND ($categories IS NULL OR p.category = ANY($categories))
  -- Bedrooms/Bathrooms
  AND ($min_bedrooms IS NULL OR p.bedrooms >= $min_bedrooms)
  AND ($min_bathrooms IS NULL OR p.bathrooms >= $min_bathrooms)
  -- Superhost filter
  AND ($superhost_only IS NULL OR $superhost_only = false OR u.is_super_host = true)
  -- Instant book
  AND ($instant_book_only IS NULL OR $instant_book_only = false OR p.instant_book = true)
  -- Guest favorites
  AND ($guest_favorites_only IS NULL OR $guest_favorites_only = false OR p.is_guest_favorite = true)
GROUP BY p.id, u.full_name, u.is_super_host
HAVING 
  -- Rating filter
  ($min_rating IS NULL OR AVG(r.rating) >= $min_rating)
  -- Review count filter
  AND ($min_review_count IS NULL OR COUNT(r.id) >= $min_review_count)
  -- Amenities filter (must have ALL specified amenities)
  AND ($amenities IS NULL OR $amenities <@ array_agg(DISTINCT a.name))
ORDER BY p.created_at DESC
LIMIT $limit OFFSET $offset;
```

#### **Location Suggestions Query**
```sql
-- Location autocomplete with ranking
SELECT DISTINCT
  city || ', ' || state || ', ' || country as full_name,
  city,
  state, 
  country,
  COUNT(*) as property_count,
  AVG(latitude) as lat,
  AVG(longitude) as lng
FROM properties 
WHERE status = 'ACTIVE'
  AND (
    city ILIKE $query || '%' OR
    state ILIKE $query || '%' OR
    country ILIKE $query || '%'
  )
GROUP BY city, state, country
ORDER BY property_count DESC, city ASC
LIMIT $limit;
```

### 2. **Performance Optimizations**

#### **Required Database Indexes**
```sql
-- Location search indexes
CREATE INDEX idx_properties_location_search ON properties 
USING gin(to_tsvector('english', city || ' ' || state || ' ' || country));

-- Price and guest filtering
CREATE INDEX idx_properties_price_guests ON properties (base_price, max_guests, status);

-- Date availability lookup
CREATE INDEX idx_calendar_availability_lookup ON calendar_availability (property_id, date, is_available);

-- Amenities filtering
CREATE INDEX idx_property_amenities_lookup ON property_amenities (property_id, amenity_id);

-- Host filtering
CREATE INDEX idx_users_host_filters ON users (is_super_host, host_rating_average);

-- Reviews aggregation
CREATE INDEX idx_reviews_property_rating ON reviews (property_id, rating, is_visible);

-- Geospatial search (if using coordinates)
CREATE INDEX idx_properties_location_gist ON properties USING gist(ST_Point(longitude, latitude));
```

#### **Caching Strategy**
```python
# Cache search results for popular queries
@cache(expire=300)  # 5 minutes
async def search_properties_cached(params: SearchParams):
    return await search_properties(params)

# Cache filter metadata for longer
@cache(expire=3600)  # 1 hour
async def get_search_filters_cached(location: str = None):
    return await get_search_filters(location)

# Cache location suggestions
@cache(expire=7200)  # 2 hours
async def get_location_suggestions_cached(query: str):
    return await get_location_suggestions(query)
```

### 3. **API Implementation Structure**

#### **Search Service Class**
```python
class PropertySearchService:
    def __init__(self, db_session):
        self.db = db_session
    
    async def search_properties(self, params: SearchParams) -> SearchResponse:
        # Build dynamic query based on parameters
        query = self._build_search_query(params)
        
        # Execute search with pagination
        results = await self.db.execute(query)
        properties = results.fetchall()
        
        # Get total count for pagination
        total_count = await self._get_search_count(params)
        
        # Build response
        return SearchResponse(
            properties=[self._map_property(p) for p in properties],
            pagination=self._build_pagination(params, total_count),
            filters=await self._get_available_filters(params),
            search_metadata=self._build_metadata(params, len(properties))
        )
    
    def _build_search_query(self, params: SearchParams):
        # Dynamic query building based on provided parameters
        base_query = """
        SELECT DISTINCT p.*, u.full_name as host_name, u.is_super_host,
               AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
        FROM properties p
        JOIN users u ON p.host_id = u.id
        LEFT JOIN reviews r ON p.id = r.property_id
        WHERE p.status = 'ACTIVE'
        """
        
        conditions = []
        query_params = {}
        
        if params.location:
            conditions.append("""
                (p.city ILIKE %(location)s OR 
                 p.state ILIKE %(location)s OR 
                 p.country ILIKE %(location)s)
            """)
            query_params['location'] = f"%{params.location}%"
        
        if params.guests:
            conditions.append("p.max_guests >= %(guests)s")
            query_params['guests'] = params.guests
        
        if params.check_in and params.check_out:
            conditions.append("""
                NOT EXISTS (
                    SELECT 1 FROM calendar_availability ca 
                    WHERE ca.property_id = p.id 
                    AND ca.date BETWEEN %(check_in)s AND %(check_out)s 
                    AND ca.is_available = false
                )
            """)
            query_params['check_in'] = params.check_in
            query_params['check_out'] = params.check_out
        
        if conditions:
            base_query += " AND " + " AND ".join(conditions)
        
        base_query += """
        GROUP BY p.id, u.full_name, u.is_super_host
        ORDER BY p.created_at DESC
        LIMIT %(limit)s OFFSET %(offset)s
        """
        
        query_params['limit'] = params.limit or 20
        query_params['offset'] = ((params.page or 1) - 1) * (params.limit or 20)
        
        return text(base_query), query_params
```

### 4. **Frontend Integration Updates**

#### **Enhanced API Client**
```typescript
// Update lib/api.ts
export const propertyApi = {
  // Enhanced search with all parameters
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return apiWrapper.get<SearchResponse>(`/properties/search?${searchParams}`)
  },

  // Advanced filtering
  filter: async (params: FilterParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return apiWrapper.get<SearchResponse>(`/properties/filter?${searchParams}`)
  },

  // Location suggestions with real API
  getLocationSuggestions: async (query: string, limit = 10) => {
    const searchParams = new URLSearchParams({ query, limit: limit.toString() })
    return apiWrapper.get<LocationSuggestionsResponse>(`/locations/suggestions?${searchParams}`)
  },

  // Get available filters for location
  getSearchFilters: async (location?: string) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : ''
    return apiWrapper.get<SearchFiltersResponse>(`/properties/search-filters${params}`)
  }
}
```

## TODO: Backend Implementation Tasks

### **High Priority**
1. **Implement Property Search API** (`/api/v1/properties/search`)
   - Basic location, date, guest filtering
   - Pagination and sorting
   - Performance optimization with indexes

2. **Implement Location Suggestions API** (`/api/v1/locations/suggestions`)
   - Real-time autocomplete
   - Ranking by property count
   - Caching for performance

3. **Implement Categories API** (`/api/v1/properties/categories`)
   - Dynamic category list from database
   - Property counts per category
   - Popular categories identification

### **Medium Priority**
4. **Implement Advanced Filter API** (`/api/v1/properties/filter`)
   - Price range filtering
   - Amenities filtering
   - Host quality filters

5. **Implement Search Filters Metadata API** (`/api/v1/properties/search-filters`)
   - Dynamic filter options based on search context
   - Price ranges and availability data

### **Low Priority**
6. **Performance Optimizations**
   - Full-text search implementation
   - Geospatial search for distance-based results
   - Advanced caching strategies
   - Search analytics and optimization

### **Database Tasks**
1. **Create Required Indexes** (see Performance Optimizations section)
2. **Optimize Existing Queries** for search performance
3. **Implement Full-Text Search** using PostgreSQL's built-in capabilities
4. **Add Search Analytics Tables** for tracking popular searches

This comprehensive implementation will transform your search functionality from UI-only to fully functional with real database integration, providing users with accurate, fast, and relevant property search results.