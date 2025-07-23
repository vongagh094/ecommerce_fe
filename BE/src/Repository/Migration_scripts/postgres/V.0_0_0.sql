-- Complete PostgreSQL Database Initialization Script
-- Airbnb Auction Platform - Full Database Schema
-- This script creates ALL tables from the Mermaid ERD diagram + Additional Admin Tables

-- Drop and recreate schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- create user customer
CREATE USER customer WITH PASSWORD 'customer';
GRANT CONNECT ON DATABASE ecommerce_db to customer;
GRANT USAGE ON SCHEMA public TO customer;


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- CORE USER AND AUTHENTICATION TABLES
-- =============================================================================

-- Create users table (enhanced from original)
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     email VARCHAR(255) NOT NULL UNIQUE,
                                     username VARCHAR(255) NOT NULL UNIQUE,
                                     password_hash VARCHAR(255),
                                     full_name VARCHAR(255) NOT NULL,
                                     first_name VARCHAR(255),
                                     last_name VARCHAR(255),
                                     phone VARCHAR(20),
                                     profile_image_url TEXT,
                                     date_of_birth DATE,
                                     verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
                                     is_active BOOLEAN DEFAULT TRUE,
                                     is_admin BOOLEAN DEFAULT FALSE,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                     CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create subscription table
CREATE TABLE IF NOT EXISTS subscription (
                                            id SERIAL PRIMARY KEY,
                                            endpoint VARCHAR(255) NOT NULL UNIQUE,
                                            p256dh VARCHAR(255) NOT NULL,
                                            auth VARCHAR(255) NOT NULL,
                                            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create notifications table (renamed from notification)
CREATE TABLE IF NOT EXISTS notifications (
                                             id SERIAL PRIMARY KEY,
                                             user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             type VARCHAR(50),
                                             title VARCHAR(255) NOT NULL,
                                             message TEXT NOT NULL,
                                             data JSONB,
                                             is_read BOOLEAN DEFAULT FALSE,
                                             is_pushed BOOLEAN DEFAULT FALSE,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PROPERTY MANAGEMENT TABLES
-- =============================================================================

-- Create properties table (renamed and enhanced from property)
CREATE TABLE IF NOT EXISTS properties (
                                          id SERIAL PRIMARY KEY,
                                          host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                          title VARCHAR(255) NOT NULL,
                                          description TEXT,
                                          property_type VARCHAR(50) NOT NULL,
                                          category VARCHAR(50) NOT NULL,
                                          max_guests INTEGER NOT NULL,
                                          bedrooms INTEGER NOT NULL,
                                          bathrooms INTEGER NOT NULL,
                                          address_line1 VARCHAR(255) NOT NULL,
                                          address_line2 VARCHAR(255),
                                          city VARCHAR(100) NOT NULL,
                                          state VARCHAR(100) NOT NULL,
                                          country VARCHAR(100) NOT NULL,
                                          postal_code VARCHAR(20) NOT NULL,
                                          latitude DECIMAL(10, 8),
                                          longitude DECIMAL(11, 8),
                                          base_price DECIMAL(10, 2) NOT NULL,
                                          cleaning_fee DECIMAL(10, 2) DEFAULT 0,
                                          service_fee DECIMAL(10, 2) DEFAULT 0,
                                          cancellation_policy VARCHAR(50) NOT NULL,
                                          instant_book BOOLEAN DEFAULT FALSE,
                                          minimum_stay INTEGER NOT NULL DEFAULT 1,
                                          maximum_stay INTEGER,
                                          check_in_time TIME DEFAULT '15:00:00',
                                          check_out_time TIME DEFAULT '11:00:00',
                                          status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                          CONSTRAINT check_guest_capacity CHECK (max_guests > 0),
                                          CONSTRAINT check_room_counts CHECK (bedrooms >= 0 AND bathrooms >= 0),
                                          CONSTRAINT check_prices CHECK (base_price > 0),
                                          CONSTRAINT check_stay_limits CHECK (minimum_stay > 0 AND (maximum_stay IS NULL OR maximum_stay >= minimum_stay)),
                                          CONSTRAINT check_coordinates CHECK (
                                              (latitude IS NULL AND longitude IS NULL) OR
                                              (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
                                              )
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                               property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                               image_url TEXT NOT NULL,
                                               alt_text VARCHAR(255),
                                               display_order INTEGER NOT NULL DEFAULT 0,
                                               is_primary BOOLEAN DEFAULT FALSE,
                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
                                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         name VARCHAR(255) NOT NULL UNIQUE,
                                         icon VARCHAR(100),
                                         category VARCHAR(100) NOT NULL,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property_amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
                                                  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                                  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
                                                  PRIMARY KEY (property_id, amenity_id)
);

-- =============================================================================
-- AUCTION SYSTEM TABLES
-- =============================================================================

-- Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                        check_in_date DATE NOT NULL,
                                        check_out_date DATE NOT NULL,
                                        starting_price DECIMAL(10, 2) NOT NULL,
                                        current_highest_bid DECIMAL(10, 2),
                                        bid_increment DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
                                        minimum_bid DECIMAL(10, 2) NOT NULL,
                                        auction_start_time TIMESTAMP NOT NULL,
                                        auction_end_time TIMESTAMP NOT NULL,
                                        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                        winner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                                        total_bids INTEGER DEFAULT 0,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                        CONSTRAINT check_auction_dates CHECK (check_out_date > check_in_date),
                                        CONSTRAINT check_auction_times CHECK (auction_end_time > auction_start_time),
                                        CONSTRAINT check_auction_prices CHECK (starting_price > 0 AND minimum_bid > 0 AND bid_increment > 0),
                                        CONSTRAINT check_current_bid CHECK (current_highest_bid IS NULL OR current_highest_bid >= minimum_bid)
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
                                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    bid_amount DECIMAL(10, 2) NOT NULL,
                                    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    is_winning_bid BOOLEAN DEFAULT FALSE,
                                    auto_bid_max DECIMAL(10, 2),
                                    status VARCHAR(50) DEFAULT 'ACTIVE',
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                    CONSTRAINT check_bid_amount CHECK (bid_amount > 0),
                                    CONSTRAINT check_auto_bid CHECK (auto_bid_max IS NULL OR auto_bid_max >= bid_amount)
);

-- Create bid_events table
CREATE TABLE IF NOT EXISTS bid_events (
                                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                          auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
                                          event_type VARCHAR(50) NOT NULL,
                                          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                                          bid_amount DECIMAL(10, 2),
                                          previous_amount DECIMAL(10, 2),
                                          event_data JSONB,
                                          event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          processed BOOLEAN DEFAULT FALSE,
                                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- BOOKING SYSTEM TABLES
-- =============================================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
                                        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                        guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        check_in_date DATE NOT NULL,
                                        check_out_date DATE NOT NULL,
                                        total_nights INTEGER NOT NULL,
                                        base_amount DECIMAL(10, 2) NOT NULL,
                                        cleaning_fee DECIMAL(10, 2) DEFAULT 0,
                                        service_fee DECIMAL(10, 2) DEFAULT 0,
                                        taxes DECIMAL(10, 2) DEFAULT 0,
                                        total_amount DECIMAL(10, 2) NOT NULL,
                                        booking_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                        payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                        special_requests TEXT,
                                        guest_count INTEGER NOT NULL,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                        CONSTRAINT check_booking_dates CHECK (check_out_date > check_in_date),
                                        CONSTRAINT check_booking_amounts CHECK (base_amount >= 0 AND total_amount >= 0),
                                        CONSTRAINT check_booking_guest_count CHECK (guest_count > 0),
                                        CONSTRAINT check_nights CHECK (total_nights > 0)
);

-- =============================================================================
-- USER INTERACTION TABLES
-- =============================================================================

-- Create wishlists table (renamed from wishlist)
CREATE TABLE IF NOT EXISTS wishlists (
                                         id SERIAL PRIMARY KEY,
                                         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                         name VARCHAR(255) NOT NULL,
                                         is_private BOOLEAN DEFAULT FALSE,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist_properties table (renamed from wishlist_property)
CREATE TABLE IF NOT EXISTS wishlist_properties (
                                                   wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
                                                   property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                                   added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                   PRIMARY KEY (wishlist_id, property_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
                                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                       booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                                       reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                       rating INTEGER NOT NULL,
                                       review_text TEXT,
                                       review_type VARCHAR(50) NOT NULL,
                                       response_text TEXT,
                                       is_visible BOOLEAN DEFAULT TRUE,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                       CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5),
                                       CONSTRAINT check_review_type CHECK (review_type IN ('GUEST_TO_HOST', 'HOST_TO_GUEST'))
);

-- =============================================================================
-- COMMUNICATION SYSTEM TABLES
-- =============================================================================

-- Create conversations table (renamed from conversation)
CREATE TABLE IF NOT EXISTS conversations (
                                             id SERIAL PRIMARY KEY,
                                             property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
                                             guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             last_message_at TIMESTAMP,
                                             is_archived BOOLEAN DEFAULT FALSE,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table (renamed and enhanced from message)
CREATE TABLE IF NOT EXISTS messages (
                                        id SERIAL PRIMARY KEY,
                                        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                                        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        message_text TEXT,
                                        message_type VARCHAR(50) DEFAULT 'TEXT',
                                        is_read BOOLEAN DEFAULT FALSE,
                                        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ADMIN AND SYSTEM MANAGEMENT TABLES
-- =============================================================================

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
                                       banner_id SERIAL PRIMARY KEY,
                                       banner_title VARCHAR(255) NOT NULL,
                                       banner_img VARCHAR(255),
                                       is_active BOOLEAN DEFAULT TRUE,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
                                       report_id SERIAL PRIMARY KEY,
                                       listing_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                       user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       report_reason VARCHAR(255) NOT NULL,
                                       report_status VARCHAR(50) DEFAULT 'pending',
                                       report_reply VARCHAR(255),
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                       CONSTRAINT check_report_status CHECK (report_status IN ('pending', 'resolved', 'rejected'))
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
                                           id SERIAL PRIMARY KEY,
                                           type VARCHAR(100) NOT NULL,
                                           status VARCHAR(50) NOT NULL,
                                           message TEXT,
                                           user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                                           metadata JSONB,
                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                           CONSTRAINT check_log_type CHECK (type IN ('error', 'info', 'warning', 'debug')),
                                           CONSTRAINT check_log_status CHECK (status IN ('success', 'failed', 'pending'))
);

-- Create configuration table
CREATE TABLE IF NOT EXISTS configuration (
                                             id SERIAL PRIMARY KEY,
                                             commission_rate DECIMAL(5,2) NOT NULL,
                                             website_name VARCHAR(100) NOT NULL,
                                             website_logo VARCHAR(255),
                                             email_notifications BOOLEAN DEFAULT TRUE,
                                             maintenance_mode BOOLEAN DEFAULT FALSE,
                                             max_bid_increment DECIMAL(10,2) DEFAULT 100.00,
                                             min_auction_duration INTEGER DEFAULT 24, -- hours
                                             max_auction_duration INTEGER DEFAULT 168, -- hours (7 days)
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
                                             CONSTRAINT check_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 100),
                                             CONSTRAINT check_auction_durations CHECK (min_auction_duration > 0 AND max_auction_duration > min_auction_duration)
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state, country);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(base_price);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- Property images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON property_images(property_id, display_order);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = TRUE;

-- Amenities and property_amenities indexes
CREATE INDEX IF NOT EXISTS idx_amenities_category ON amenities(category);
CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity ON property_amenities(amenity_id);

-- Auctions table indexes
CREATE INDEX IF NOT EXISTS idx_auctions_property_id ON auctions(property_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_times ON auctions(auction_start_time, auction_end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_check_dates ON auctions(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_auctions_winner ON auctions(winner_user_id);

-- Bids table indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_time ON bids(auction_id, bid_time DESC);
CREATE INDEX IF NOT EXISTS idx_bids_winning ON bids(auction_id, is_winning_bid) WHERE is_winning_bid = TRUE;
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Bid events indexes
CREATE INDEX IF NOT EXISTS idx_bid_events_auction_id ON bid_events(auction_id);
CREATE INDEX IF NOT EXISTS idx_bid_events_user_id ON bid_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_events_time ON bid_events(event_time);
CREATE INDEX IF NOT EXISTS idx_bid_events_processed ON bid_events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_bid_events_type ON bid_events(event_type);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_auction_id ON bookings(auction_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);

-- Wishlists table indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_properties_property_id ON wishlist_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_properties_added_at ON wishlist_properties(added_at);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX IF NOT EXISTS idx_conversations_host_id ON conversations(host_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(is_archived) WHERE is_archived = FALSE;

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Subscription table indexes
CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON subscription(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_endpoint ON subscription(endpoint);

-- Admin tables indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(report_status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON system_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- =============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT COLUMNS
-- =============================================================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at
    BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
    BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuration_updated_at
    BEFORE UPDATE ON configuration
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INSERT SAMPLE DATA
-- =============================================================================

-- Insert sample amenities
INSERT INTO amenities (name, icon, category) VALUES
                                                 ('WiFi', 'wifi', 'Technology'),
                                                 ('Kitchen', 'chef-hat', 'Kitchen'),
                                                 ('Washing Machine', 'washing-machine', 'Laundry'),
                                                 ('Dryer', 'shirt', 'Laundry'),
                                                 ('Air Conditioning', 'wind', 'Climate'),
                                                 ('Heating', 'thermometer', 'Climate'),
                                                 ('TV', 'tv', 'Entertainment'),
                                                 ('Parking', 'car', 'Transportation'),
                                                 ('Pool', 'waves', 'Recreation'),
                                                 ('Hot Tub', 'bath', 'Recreation'),
                                                 ('Gym', 'dumbbell', 'Fitness'),
                                                 ('Balcony', 'home', 'Outdoor'),
                                                 ('Garden', 'trees', 'Outdoor'),
                                                 ('BBQ Grill', 'grill', 'Outdoor'),
                                                 ('Fireplace', 'flame', 'Comfort'),
                                                 ('Pet Friendly', 'heart', 'Policies'),
                                                 ('Smoking Allowed', 'cigarette', 'Policies'),
                                                 ('Events Allowed', 'calendar', 'Policies'),
                                                 ('Workspace', 'briefcase', 'Work'),
                                                 ('Beach Access', 'umbrella', 'Location'),
                                                 ('Mountain View', 'mountain', 'Location'),
                                                 ('City View', 'building', 'Location'),
                                                 ('Lake View', 'waves', 'Location'),
                                                 ('Dishwasher', 'utensils', 'Kitchen'),
                                                 ('Coffee Maker', 'coffee', 'Kitchen'),
                                                 ('Microwave', 'zap', 'Kitchen'),
                                                 ('Refrigerator', 'snowflake', 'Kitchen'),
                                                 ('Hair Dryer', 'wind', 'Bathroom'),
                                                 ('Shampoo', 'droplets', 'Bathroom'),
                                                 ('Iron', 'shirt', 'Essentials')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users
INSERT INTO users (email, username, full_name, first_name, last_name, verification_status) VALUES
                                                                                               ('admin@airbnb-auction.com', 'admin', 'Admin User', 'Admin', 'User', 'VERIFIED'),
                                                                                               ('host1@example.com', 'host1', 'John Smith', 'John', 'Smith', 'VERIFIED'),
                                                                                               ('host2@example.com', 'host2', 'Jane Doe', 'Jane', 'Doe', 'VERIFIED'),
                                                                                               ('guest1@example.com', 'guest1', 'Mike Johnson', 'Mike', 'Johnson', 'VERIFIED'),
                                                                                               ('guest2@example.com', 'guest2', 'Sarah Wilson', 'Sarah', 'Wilson', 'UNVERIFIED')
ON CONFLICT (email) DO NOTHING;

-- Insert initial configuration
INSERT INTO configuration (commission_rate, website_name, website_logo) VALUES
    (15.00, 'Airbnb Auction Platform', '/assets/logo.png')
ON CONFLICT DO NOTHING;

-- Insert sample banners
INSERT INTO banners (banner_title, banner_img) VALUES
                                                   ('Welcome to Airbnb Auctions', '/assets/banners/welcome.jpg'),
                                                   ('Book Your Dream Vacation', '/assets/banners/vacation.jpg'),
                                                   ('Special Offers Available', '/assets/banners/offers.jpg')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Core table comments
COMMENT ON TABLE users IS 'Core user accounts for hosts and guests';
COMMENT ON TABLE properties IS 'Property listings available for auction';
COMMENT ON TABLE property_images IS 'Images associated with properties';
COMMENT ON TABLE amenities IS 'Master list of available property amenities';
COMMENT ON TABLE property_amenities IS 'Junction table linking properties to their amenities';
COMMENT ON TABLE auctions IS 'Auction instances for property bookings';
COMMENT ON TABLE bids IS 'Individual bids placed on auctions';
COMMENT ON TABLE bid_events IS 'Event log for all auction activities';
COMMENT ON TABLE bookings IS 'Confirmed reservations from successful auctions';
COMMENT ON TABLE reviews IS 'Reviews and ratings for completed bookings';
COMMENT ON TABLE wishlists IS 'User-created lists of favorite properties';
COMMENT ON TABLE wishlist_properties IS 'Properties saved to wishlists';
COMMENT ON TABLE conversations IS 'Message threads between users';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE subscription IS 'Push notification subscriptions';

-- Admin table comments
COMMENT ON TABLE banners IS 'Website banners for marketing and announcements';
COMMENT ON TABLE reports IS 'User reports about properties or other users';
COMMENT ON TABLE system_logs IS 'System event logging for monitoring and debugging';
COMMENT ON TABLE configuration IS 'Global system configuration settings';

-- Column comments for enum-like fields
COMMENT ON COLUMN users.verification_status IS 'UNVERIFIED, PENDING, VERIFIED, SUSPENDED';
COMMENT ON COLUMN properties.status IS 'DRAFT, ACTIVE, INACTIVE, SUSPENDED';
COMMENT ON COLUMN properties.property_type IS 'HOUSE, APARTMENT, CONDO, VILLA, CABIN, etc.';
COMMENT ON COLUMN properties.category IS 'ENTIRE_PLACE, PRIVATE_ROOM, SHARED_ROOM';
COMMENT ON COLUMN properties.cancellation_policy IS 'FLEXIBLE, MODERATE, STRICT, SUPER_STRICT';
COMMENT ON COLUMN auctions.status IS 'PENDING, ACTIVE, COMPLETED, CANCELLED, EXPIRED';
COMMENT ON COLUMN bids.status IS 'ACTIVE, OUTBID, WINNING, CANCELLED';
COMMENT ON COLUMN bookings.booking_status IS 'PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED';
COMMENT ON COLUMN bookings.payment_status IS 'PENDING, PAID, PARTIAL, REFUNDED, FAILED';
COMMENT ON COLUMN reviews.review_type IS 'GUEST_TO_HOST, HOST_TO_GUEST';
COMMENT ON COLUMN messages.message_type IS 'TEXT, IMAGE, SYSTEM, BOOKING_REQUEST, etc.';
COMMENT ON COLUMN notifications.type IS 'BID_PLACED, AUCTION_WON, BOOKING_CONFIRMED, MESSAGE_RECEIVED, etc.';
COMMENT ON COLUMN reports.report_status IS 'pending, resolved, rejected';
COMMENT ON COLUMN system_logs.type IS 'error, info, warning, debug';
COMMENT ON COLUMN system_logs.status IS 'success, failed, pending';

-- Success message
DO $$
    BEGIN
        RAISE NOTICE 'Database initialization completed successfully!';
        RAISE NOTICE 'Created % tables with full relationships and indexes',
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    END $$;

-- =============================================================================
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO customer;
