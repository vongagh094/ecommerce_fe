# PostgreSQL Database Schema

## Overview
The database uses PostgreSQL 14.18 with UUID extension for generating unique identifiers. It implements a comprehensive bidding system for property rentals with multiple user types and real-time auction functionality.

## Custom Types
- `auction_objective`: ENUM ('HIGHEST_TOTAL', 'HIGHEST_PER_NIGHT', 'HYBRID')
- `offer_status`: ENUM ('WAITING', 'ACCEPTED', 'DECLINED', 'EXPIRED')

## Core Tables

### Users Management
- **users**: User accounts with roles (traveller/host/admin)
  - Fields: id, email, username, password_hash, full_name, profile_image_url
  - Host-specific: is_super_host, host_about, host_review_count, host_rating_average
  - Admin flags: is_admin, is_active
  - Constraints: unique email/username, email format validation

### Properties
- **properties**: Property listings with location and pricing
  - Fields: id, host_id, title, description, property_type, category
  - Capacity: max_guests, bedrooms, bathrooms
  - Location: address_line1, city, state, country, postal_code, latitude, longitude
  - Pricing: base_price, cleaning_fee, cancellation_policy
  - Settings: instant_book, minimum_stay, home_tier, is_guest_favorite
  - Status: DRAFT/ACTIVE/INACTIVE

- **property_images**: Property photo gallery
  - Fields: id (UUID), property_id, image_url, alt_text, title
  - Display: display_order, is_primary

- **property_amenities**: Many-to-many relationship with amenities
- **amenities**: Available amenities (name, category)
- **property_highlights**: Special features (title, subtitle, icon)
- **house_rules**: Property rules and restrictions
- **location_descriptions**: Area descriptions and highlights

### Bidding System
- **auctions**: Property auction configurations
  - Fields: id (UUID), property_id, start_date, end_date
  - Pricing: starting_price, current_highest_bid, minimum_bid, bid_increment
  - Timing: auction_start_time, auction_end_time
  - Strategy: objective (HIGHEST_TOTAL/HIGHEST_PER_NIGHT/HYBRID)
  - Status: PENDING/ACTIVE/COMPLETED/CANCELLED
  - Winner: winner_user_id, total_bids

- **bids**: Individual bid submissions
  - Fields: id (UUID), auction_id, user_id
  - Dates: check_in, check_out, nights (computed)
  - Pricing: total_amount, price_per_night (computed)
  - Options: allow_partial, partial_awarded
  - Status: ACTIVE/WITHDRAWN/EXPIRED

- **second_chance_offers**: Partial booking offers
  - Fields: id (UUID), bid_id, offered_check_in, offered_check_out
  - Timing: response_deadline, responded_at
  - Status: WAITING/ACCEPTED/DECLINED/EXPIRED

- **bid_events**: Auction event logging
- **bid_notifications**: Bidding notifications

### Bookings & Calendar
- **bookings**: Confirmed reservations
  - Fields: id (UUID), auction_id, property_id, guest_id, host_id
  - Dates: check_in_date, check_out_date, total_nights
  - Pricing: base_amount, cleaning_fee, taxes, total_amount
  - Status: booking_status, payment_status

- **calendar_availability**: Property availability calendar
  - Fields: id, property_id, date, is_available
  - Bidding: bid_id, price_amount
  - Unique constraint: (property_id, date)

### Communication
- **conversation**: Chat conversations
  - Fields: id, property_id, guest_id, host_id
  - Status: last_message_at, is_archived

- **message**: Individual messages
  - Fields: id, conversation_id, sender_id, message_text
  - Status: sent_at, is_read

- **notification**: System notifications
  - Fields: id, user_id, type, title, message, data (JSONB)
  - Status: is_read, is_pushed

### Reviews & Reports
- **reviews**: Property and user reviews
  - Fields: id (UUID), booking_id, reviewer_id, reviewee_id, property_id
  - Ratings: rating, accuracy_rating, checking_rating, cleanliness_rating, communication_rating, location_rating, value_rating
  - Content: review_text, response_text, is_visible

- **reports**: Property/user reports
  - Fields: report_id, property_id, user_id, report_reason
  - Status: report_status, report_reply

### Wishlist System
- **wishlist**: User wishlists
  - Fields: id, user_id, property_id, is_private

- **wishlist_property**: Wishlist items (many-to-many)
  - Fields: wishlist_id, property_id, added_at

### System Configuration
- **configuration**: Platform settings
  - Fields: commission_rate, hybrid_objective_weight, website_name

- **banners**: Homepage banners
- **subscription**: Push notification subscriptions
- **systemlogs**: System activity logs

## Key Relationships
- Users → Properties (host_id)
- Properties → Auctions (property_id)
- Auctions → Bids (auction_id)
- Bids → Second Chance Offers (bid_id)
- Auctions → Bookings (auction_id)
- Properties → Calendar Availability (property_id)
- Users → Conversations (guest_id, host_id)
- Conversations → Messages (conversation_id)
- Bookings → Reviews (booking_id)

## Computed Fields
- `bids.nights`: GENERATED ALWAYS AS (GREATEST(1, (check_out - check_in)))
- `bids.price_per_night`: GENERATED ALWAYS AS ((total_amount / nights))

## Indexes
- Properties: location (city, state, country)
- Calendar: property_id + date
- Auctions: date window (start_date, end_date)
- Bids: date range (check_in, check_out)
- Users: email

## Triggers
- Auto-update `updated_at` timestamps on: auctions, bookings, properties, reviews, users