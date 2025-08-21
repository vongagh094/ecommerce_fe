The apis relevant to properties grid, view details is currently so messed up, i want to clean everything and re implement



# Properties API Documentation

## Overview

The Properties API provides comprehensive functionality for searching, filtering, and retrieving property information in the e-commerce platform. This API supports property discovery, detailed property views, category browsing, and location-based searches with advanced filtering capabilities.

**Base URL:** `http://localhost:8000/api/v1/properties`

**API Version:** v1

**Authentication:** Most endpoints are public (no authentication required)

---

## Table of Contents

1. [Property Search API](#1-property-search-api)

2. [Advanced Property Filtering API](#2-advanced-property-filtering-api)

3. [Category Browsing API](#3-category-browsing-api)

4. [Property Details API](#4-property-details-api)

5. [Categories List API](#5-categories-list-api)

6. [Amenities List API](#6-amenities-list-api)

7. [Location Suggestions API](#7-location-suggestions-api)

8. [Health Check API](#8-health-check-api)

9. [Data Models](#9-data-models)

10. [Error Handling](#10-error-handling)

11. [Examples](#11-examples)

---

## 1. Property Search API

### Endpoint

```

GET /api/v1/properties/search

```

### Description

Search properties by location, dates, and guest count with basic filtering capabilities. This is the primary endpoint for property discovery and supports pagination.

### Authentication

**Public** - No authentication required

### Query Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `location` | string | No | - | City, state, country, or address to search in |

| `check_in` | string | No | - | Check-in date in YYYY-MM-DD format |

| `check_out` | string | No | - | Check-out date in YYYY-MM-DD format |

| `guests` | integer | No | - | Number of guests (minimum: 1) |

| `page` | integer | No | 1 | Page number for pagination (minimum: 1) |

| `limit` | integer | No | 20 | Items per page (minimum: 1, maximum: 100) |

### Request Example

```http

GET /api/v1/properties/search?location=New%20York&guests=2&check_in=2024-03-15&check_out=2024-03-20&page=1&limit=10

```

### Response Format

#### Success Response (200 OK)

```json

{

  "properties": [

    {

      "id": 123,

      "title": "Luxury Manhattan Apartment",

      "images": [

        {

          "id": "uuid-string",

          "image_url": "https://example.com/image1.jpg",

          "alt_text": "Living room view",

          "is_primary": true,

          "display_order": 1

        }

      ],

      "base_price": 250.00,

      "location": {

        "city": "New York",

        "state": "NY",

        "country": "USA"

      },

      "rating": {

        "average": 4.8,

        "count": 127

      },

      "property_type": "apartment",

      "max_guests": 4,

      "is_guest_favorite": true,

      "host": {

        "id": "456",

        "full_name": "John Smith",

        "is_super_host": true

      }

    }

  ],

  "pagination": {

    "page": 1,

    "limit": 10,

    "total": 45,

    "has_more": true

  },

  "status_code": 200

}

```

### Business Logic

1. **Location Filtering**: Searches across city, state, country, and address fields using case-insensitive partial matching

2. **Guest Capacity**: Filters properties where `max_guests >= requested_guests`

3. **Date Availability**: Currently placeholder - will check calendar availability in future implementation

4. **Pagination**: Implements offset-based pagination with metadata

5. **Eager Loading**: Optimizes database queries by loading related images and host data

6. **Rating Calculation**: Aggregates review ratings (currently returns placeholder data)

### Performance Considerations

- Database indexes on location fields (city, state, country)

- Eager loading prevents N+1 query problems

- Pagination limits memory usage

- Query optimization for large datasets

---

## 2. Advanced Property Filtering API

### Endpoint

```

GET /api/v1/properties/filter

```

### Description

Filter properties with advanced criteria including price range, property types, amenities, ratings, and more. Extends the basic search functionality with comprehensive filtering options.

### Authentication

**Public** - No authentication required

### Query Parameters

#### Basic Search Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `location` | string | No | - | City, state, country, or address |

| `check_in` | string | No | - | Check-in date (YYYY-MM-DD) |

| `check_out` | string | No | - | Check-out date (YYYY-MM-DD) |

| `guests` | integer | No | - | Number of guests (≥ 1) |

#### Advanced Filter Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `min_price` | float | No | - | Minimum price per night (≥ 0) |

| `max_price` | float | No | - | Maximum price per night (≥ 0) |

| `property_types` | array[string] | No | - | Property types to include |

| `amenities` | array[string] | No | - | Amenity IDs to filter by |

| `cancellation_policy` | array[string] | No | - | Cancellation policies |

| `instant_book` | boolean | No | - | Only instant bookable properties |

| `min_rating` | float | No | - | Minimum rating (0-5) |

| `bedrooms` | integer | No | - | Minimum number of bedrooms (≥ 0) |

| `bathrooms` | integer | No | - | Minimum number of bathrooms (≥ 0) |

| `categories` | array[string] | No | - | Property categories |

#### Pagination Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `page` | integer | No | 1 | Page number (≥ 1) |

| `limit` | integer | No | 20 | Items per page (1-100) |

### Property Types

- `apartment`

- `house`

- `cabin`

- `villa`

- `condo`

- `townhouse`

- `loft`

- `studio`

### Property Categories

- `amazing_views`

- `cabins`

- `family`

- `beachfront`

- `luxury`

- `unique_stays`

- `countryside`

- `city_center`

### Request Example

```http

GET /api/v1/properties/filter?location=California&min_price=100&max_price=500&property_types=apartment&property_types=house&instant_book=true&min_rating=4.0&bedrooms=2&page=1&limit=20

```

### Response Format

Same as Property Search API response format.

### Business Logic

1. **Cumulative Filtering**: All filters are applied cumulatively (AND logic)

2. **Price Range**: Filters based on `base_price` field

3. **Property Types**: Supports multiple types with OR logic

4. **Categories**: Supports multiple categories with OR logic

5. **Instant Book**: Boolean filter for immediate booking capability

6. **Room Filters**: Minimum bedroom/bathroom requirements

7. **Rating Filter**: Based on aggregated review ratings (placeholder)

8. **Amenities Filter**: Joins with property_amenities table (placeholder)

---

## 3. Category Browsing API

### Endpoint

```

GET /api/v1/properties/categories/{category_name}

```

### Description

Browse properties by specific category with optional location and date filtering. Useful for category-based property discovery.

### Authentication

**Public** - No authentication required

### Path Parameters

| Parameter | Type | Required | Description |

|-----------|------|----------|-------------|

| `category_name` | string | Yes | Category name (e.g., "amazing_views", "cabins") |

### Query Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `location` | string | No | - | Location filter |

| `check_in` | string | No | - | Check-in date (YYYY-MM-DD) |

| `check_out` | string | No | - | Check-out date (YYYY-MM-DD) |

| `guests` | integer | No | - | Number of guests (≥ 1) |

| `page` | integer | No | 1 | Page number (≥ 1) |

| `limit` | integer | No | 20 | Items per page (1-100) |

### Request Example

```http

GET /api/v1/properties/categories/amazing_views?location=California&guests=4&page=1&limit=15

```

### Response Format

Same as Property Search API response format.

### Business Logic

1. **Category Filtering**: Exact match on property category field

2. **Optional Filters**: Location and guest filters can be applied

3. **Status Filter**: Only shows active properties

4. **Pagination**: Standard pagination with metadata

---

## 4. Property Details API

### Endpoint

```

GET /api/v1/properties/{property_id}

```

### Description

Retrieve comprehensive details for a specific property including all related information such as images, amenities, host details, reviews, and active auctions.

### Authentication

**Public** - No authentication required

### Path Parameters

| Parameter | Type | Required | Description |

|-----------|------|----------|-------------|

| `property_id` | integer | Yes | Unique property identifier |

### Request Example

```http

GET /api/v1/properties/123

```

### Response Format

#### Success Response (200 OK)

```json

{

  "id": 123,

  "title": "Luxury Manhattan Apartment",

  "description": "Beautiful apartment in the heart of Manhattan with stunning city views...",

  "property_type": "apartment",

  "category": "city_center",

  "max_guests": 4,

  "bedrooms": 2,

  "bathrooms": 2,

  "location": {

    "address_line1": "123 Broadway",

    "city": "New York",

    "state": "NY",

    "country": "USA",

    "postal_code": "10001",

    "latitude": 40.7589,

    "longitude": -73.9851

  },

  "pricing": {

    "base_price": 250.00,

    "cleaning_fee": 50.00,

    "service_fee": 7.50

  },

  "policies": {

    "cancellation_policy": "flexible",

    "instant_book": true,

    "minimum_stay": 2,

    "check_in_time": "3:00 PM",

    "check_out_time": "11:00 AM"

  },

  "images": [

    {

      "id": "uuid-string",

      "image_url": "https://example.com/image1.jpg",

      "alt_text": "Living room view",

      "is_primary": true,

      "display_order": 1

    }

  ],

  "amenities": [

    {

      "id": "uuid-string",

      "name": "WiFi",

      "category": "internet"

    }

  ],

  "highlights": [

    {

      "id": 1,

      "title": "Great location",

      "subtitle": "95% of recent guests gave the location a 5-star rating",

      "icon": "location"

    }

  ],

  "house_rules": [

    {

      "id": 1,

      "rule_type": "general",

      "title": "No smoking",

      "description": "Smoking is not allowed anywhere on the property"

    }

  ],

  "location_descriptions": [

    {

      "id": 1,

      "description_type": "neighborhood",

      "title": "The neighborhood",

      "description": "Located in the vibrant heart of Manhattan..."

    }

  ],

  "host": {

    "id": 456,

    "full_name": "John Smith",

    "profile_image_url": "https://example.com/host.jpg",

    "is_super_host": true,

    "host_about": "I love hosting guests and sharing my city...",

    "host_review_count": 89,

    "host_rating_average": 4.9,

    "created_at": "2020-01-15T10:30:00Z"

  },

  "reviews": {

    "total_reviews": 127,

    "average_rating": 4.8,

    "rating_breakdown": {

      "accuracy": 4.9,

      "cleanliness": 4.8,

      "communication": 4.9,

      "location": 4.9,

      "value": 4.7,

      "checking": 4.8

    },

    "recent_reviews": []

  },

  "availability_calendar": {

    "available_dates": [],

    "blocked_dates": [],

    "price_calendar": []

  },

  "active_auctions": [

    {

      "id": "auction-uuid",

      "start_date": "2024-04-01",

      "end_date": "2024-04-07",

      "auction_start_time": "2024-03-25T10:00:00Z",

      "auction_end_time": "2024-03-30T18:00:00Z",

      "starting_price": 200.00,

      "current_highest_bid": 275.00,

      "minimum_bid": 250.00,

      "total_bids": 12,

      "status": "ACTIVE"

    }

  ]

}

```

#### Error Response (404 Not Found)

```json

{

  "error": {

    "code": "NOT_FOUND",

    "message": "Property not found",

    "details": {

      "resource": "Property",

      "identifier": "123"

    }

  },

  "status_code": 404

}

```

### Business Logic

1. **Comprehensive Data Loading**: Uses eager loading to fetch all related data in optimized queries

2. **Service Fee Calculation**: Automatically calculates service fee (3% of base price)

3. **Host Information**: Includes complete host profile with ratings and review count

4. **Review Aggregation**: Calculates average ratings and breakdown by category (placeholder)

5. **Availability Calendar**: Provides calendar data for booking interface (placeholder)

6. **Active Auctions**: Shows current auction information if property has active auctions

7. **Error Handling**: Returns structured error for non-existent properties

---

## 5. Categories List API

### Endpoint

```

GET /api/v1/properties/

```

### Description

Retrieve a list of all available property categories with property counts for each category.

### Authentication

**Public** - No authentication required

### Query Parameters

None

### Request Example

```http

GET /api/v1/properties/

```

### Response Format

#### Success Response (200 OK)

```json

{

  "categories": [

    {

      "name": "amazing_views",

      "display_name": "Amazing Views",

      "property_count": 45

    },

    {

      "name": "cabins",

      "display_name": "Cabins",

      "property_count": 23

    },

    {

      "name": "beachfront",

      "display_name": "Beachfront",

      "property_count": 18

    }

  ]

}

```

### Business Logic

1. **Active Properties Only**: Counts only properties with status "ACTIVE"

2. **Display Name Generation**: Converts snake_case to Title Case for UI display

3. **Property Counting**: Aggregates property count per category

4. **Alphabetical Ordering**: Categories returned in alphabetical order

---

## 6. Amenities List API

### Endpoint

```

GET /api/v1/properties/amenities/

```

### Description

Retrieve a list of all available amenities organized by category for filtering purposes.

### Authentication

**Public** - No authentication required

### Query Parameters

None

### Request Example

```http

GET /api/v1/properties/amenities/

```

### Response Format

#### Success Response (200 OK)

```json

{

  "amenities": [

    {

      "id": "uuid-string-1",

      "name": "WiFi",

      "category": "internet",

      "created_at": "2024-01-01T00:00:00Z"

    },

    {

      "id": "uuid-string-2",

      "name": "Air conditioning",

      "category": "climate",

      "created_at": "2024-01-01T00:00:00Z"

    },

    {

      "id": "uuid-string-3",

      "name": "Kitchen",

      "category": "cooking",

      "created_at": "2024-01-01T00:00:00Z"

    }

  ]

}

```

### Amenity Categories

- `internet` - WiFi, High-speed internet

- `climate` - Air conditioning, Heating

- `cooking` - Kitchen, Microwave, Refrigerator

- `entertainment` - TV, Netflix, Gaming console

- `safety` - Smoke detector, Carbon monoxide detector

- `accessibility` - Wheelchair accessible, Step-free access

- `outdoor` - Balcony, Patio, Garden

- `parking` - Free parking, Paid parking

### Business Logic

1. **Category Organization**: Amenities grouped by logical categories

2. **Alphabetical Ordering**: Sorted by category first, then by name

3. **UUID Identification**: Each amenity has unique UUID for filtering

---

## 7. Location Suggestions API

### Endpoint

```

GET /api/v1/properties/locations/suggestions

```

### Description

Provide location autocomplete suggestions based on user input for search functionality.

### Authentication

**Public** - No authentication required

### Query Parameters

| Parameter | Type | Required | Default | Description |

|-----------|------|----------|---------|-------------|

| `query` | string | Yes | - | Search query for location |

| `limit` | integer | No | 10 | Maximum suggestions (1-50) |

### Request Example

```http

GET /api/v1/properties/locations/suggestions?query=New%20Y&limit=5

```

### Response Format

#### Success Response (200 OK)

```json

{

  "suggestions": [

    {

      "display_name": "New York, NY, USA",

      "city": "New York",

      "state": "NY",

      "country": "USA",

      "property_count": 234

    },

    {

      "display_name": "New Haven, CT, USA",

      "city": "New Haven",

      "state": "CT",

      "country": "USA",

      "property_count": 12

    }

  ]

}

```

### Business Logic

1. **Partial Matching**: Searches across city, state, and country fields

2. **Case Insensitive**: Matching is case-insensitive

3. **Property Counting**: Shows number of active properties in each location

4. **Relevance Ordering**: Results ordered by relevance and property count

5. **Duplicate Prevention**: Groups by unique city/state/country combinations

---

## 8. Health Check API

### Endpoint

```

GET /api/v1/health

```

### Description

Health check endpoint to verify API availability and status.

### Authentication

**Public** - No authentication required

### Query Parameters

None

### Request Example

```http

GET /api/v1/health

```

### Response Format

#### Success Response (200 OK)

```json

{

  "status": "healthy",

  "version": "1.0.0"

}

```

---

## 9. Data Models

### PropertyCard Model

Used in search and filter responses.

```typescript

interface PropertyCard {

  id: number;

  title: string;

  images: PropertyImage[];

  base_price: number;

  location: LocationInfo;

  rating: RatingInfo;

  property_type: string;

  max_guests: number;

  is_guest_favorite: boolean;

  host: HostInfo;

}

```

### PropertyImage Model

```typescript

interface PropertyImage {

  id: string;          // UUID

  image_url: string;

  alt_text: string;

  is_primary: boolean;

  display_order: number;

}

```

### LocationInfo Model

```typescript

interface LocationInfo {

  city: string;

  state: string;

  country: string;

  address_line1?: string;    // Only in detailed view

  postal_code?: string;      // Only in detailed view

  latitude?: number;         // Only in detailed view

  longitude?: number;        // Only in detailed view

}

```

### RatingInfo Model

```typescript

interface RatingInfo {

  average: number;    // 0.0 to 5.0

  count: number;      // Total number of reviews

}

```

### HostInfo Model

```typescript

interface HostInfo {

  id: string;

  full_name: string;

  is_super_host: boolean;

  profile_image_url?: string;     // Only in detailed view

  host_about?: string;            // Only in detailed view

  host_review_count?: number;     // Only in detailed view

  host_rating_average?: number;   // Only in detailed view

  created_at?: string;            // Only in detailed view

}

```

### PaginationInfo Model

```typescript

interface PaginationInfo {

  page: number;

  limit: number;

  total: number;

  has_more: boolean;

}

```

### Amenity Model

```typescript

interface Amenity {

  id: string;        // UUID

  name: string;

  category: string;

  created_at: string;

}

```

### AuctionInfo Model

```typescript

interface AuctionInfo {

  id: string;                    // UUID

  start_date: string;            // YYYY-MM-DD

  end_date: string;              // YYYY-MM-DD

  auction_start_time: string;    // ISO datetime

  auction_end_time: string;      // ISO datetime

  starting_price: number;

  current_highest_bid: number | null;

  minimum_bid: number;

  total_bids: number;

  status: string;                // PENDING, ACTIVE, COMPLETED, CANCELLED

}

```

---

## 10. Error Handling

### Error Response Format

All errors follow a consistent structure:

```json

{

  "error": {

    "code": "ERROR_CODE",

    "message": "Human readable error message",

    "details": {

      "field": "additional error details"

    }

  },

  "status_code": 400

}

```

### Common Error Codes

#### 400 Bad Request

- `VALIDATION_ERROR` - Invalid input parameters

- `BUSINESS_LOGIC_ERROR` - Business rule violation

#### 404 Not Found

- `NOT_FOUND` - Resource not found

#### 422 Unprocessable Entity

- `VALIDATION_ERROR` - Request validation failed

#### 500 Internal Server Error

- `INTERNAL_SERVER_ERROR` - Unexpected server error

### Validation Errors

Parameter validation errors include detailed information:

```json

{

  "error": {

    "code": "VALIDATION_ERROR",

    "message": "Request validation failed",

    "details": [

      {

        "loc": ["query", "guests"],

        "msg": "ensure this value is greater than or equal to 1",

        "type": "value_error.number.not_ge",

        "ctx": {"limit_value": 1}

      }

    ]

  },

  "status_code": 422

}

```

---

## 11. Examples

### Example 1: Basic Property Search

```bash

curl -X GET "http://localhost:8000/api/v1/properties/search?location=Miami&guests=2" \

  -H "accept: application/json"

```

### Example 2: Advanced Filtering

```bash

curl -X GET "http://localhost:8000/api/v1/properties/filter?location=California&min_price=100&max_price=300&property_types=apartment&instant_book=true&bedrooms=1&page=1&limit=20" \

  -H "accept: application/json"

```

### Example 3: Category Browsing

```bash

curl -X GET "http://localhost:8000/api/v1/properties/categories/beachfront?location=Florida&guests=4" \

  -H "accept: application/json"

```

### Example 4: Property Details

```bash

curl -X GET "http://localhost:8000/api/v1/properties/123" \

  -H "accept: application/json"

```

### Example 5: Location Suggestions

```bash

curl -X GET "http://localhost:8000/api/v1/properties/locations/suggestions?query=San&limit=5" \

  -H "accept: application/json"

```

---

## Performance Notes

### Database Optimization

- Indexes on frequently queried fields (location, price, status)

- Eager loading to prevent N+1 queries

- Query optimization for large datasets

- Connection pooling for concurrent requests

### Caching Strategy

- Redis caching for popular searches (future implementation)

- Category and amenity data caching

- Location suggestions caching

### Rate Limiting

- Standard rate limiting applies to all endpoints

- Higher limits for authenticated users (future implementation)

---

## Future Enhancements

### Planned Features

1. **Real Availability Checking** - Integration with calendar system

2. **Advanced Rating System** - Detailed review aggregation

3. **Amenity Filtering** - Full amenity-based filtering

4. **Geolocation Search** - Radius-based location search

5. **Price History** - Historical pricing data

6. **Recommendation Engine** - Personalized property suggestions

7. **Image Optimization** - Multiple image sizes and CDN integration

8. **Search Analytics** - Search behavior tracking

### API Versioning

- Current version: v1

- Backward compatibility maintained

- Deprecation notices for breaking changes

---

This documentation covers all current Properties API functionality with comprehensive details about inputs, outputs, business logic, and usage examples.



this is the documentation of apis of properties feature. Please use this documentation guide and reimplement the apis, remove redundancies and trash code. Read the codes, the docs carefully, implement a maintainable, scalable solution, clean and simple work is priority