-- =====================================================================
-- Airbnb Auction Platform – Full Initialisation Script (LEAN + BIDDING)
--  • Uses BIGINT for IDs to support large property ID values
--  • Adds flexible auction-window model and advanced bidding support
--  • Fixes property vs properties table references
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Recreate schema & extensions
-- ---------------------------------------------------------------------

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Clear out any existing tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS calendar_availability CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS house_rules CASCADE;
DROP TABLE IF EXISTS location_descriptions CASCADE;
DROP TABLE IF EXISTS property_highlights CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS configuration CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updated_at helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. ENUM / TYPE DEFINITIONS
-- ---------------------------------------------------------------------

DROP TYPE IF EXISTS auction_objective CASCADE;
DROP TYPE IF EXISTS offer_status CASCADE;

CREATE TYPE auction_objective AS ENUM ('HIGHEST_TOTAL', 'HIGHEST_PER_NIGHT', 'HYBRID');
CREATE TYPE offer_status      AS ENUM ('WAITING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- ---------------------------------------------------------------------
-- 2. CORE USER & AUTH TABLES (LEANED)
-- ---------------------------------------------------------------------

CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    username     VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name    VARCHAR(255) NOT NULL,
    first_name   VARCHAR(255),
    last_name    VARCHAR(255),
    profile_image_url TEXT,
    verification_status VARCHAR(50), -- nullable now
    is_active    BOOLEAN DEFAULT TRUE,
    is_admin     BOOLEAN DEFAULT FALSE,
    is_super_host BOOLEAN DEFAULT FALSE,
    host_about TEXT,
    host_review_count INTEGER,
    host_rating_average DECIMAL(3,2),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE subscription (
    id BIGSERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    p256dh  VARCHAR(255) NOT NULL,
    auth    VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);


-- ---------------------------------------------------------------------
-- 3. PROPERTY MANAGEMENT (LEANED)
-- ---------------------------------------------------------------------

CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    host_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    max_guests  INTEGER NOT NULL,
    bedrooms    INTEGER,
    bathrooms   INTEGER,
    address_line1 VARCHAR(255),
    city         VARCHAR(100),
    state        VARCHAR(100),
    country      VARCHAR(100),
    postal_code  VARCHAR(20),
    latitude     DECIMAL(10,8),
    longitude    DECIMAL(11,8),
    base_price   DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    cancellation_policy VARCHAR(50) NOT NULL,
    instant_book BOOLEAN DEFAULT FALSE,
    minimum_stay INTEGER DEFAULT 1,
    home_tier INTEGER,
    is_guest_favorite BOOLEAN,
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_guest_capacity CHECK (max_guests > 0),
    CONSTRAINT chk_prices         CHECK (base_price > 0),
    CONSTRAINT chk_coordinates    CHECK ((latitude IS NULL AND longitude IS NULL)
                                         OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
);

CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text  VARCHAR(255),
    title     VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE property_amenities (
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id  UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- ---------------------------------------------------------------------
-- 4. AUCTION & BIDDING SYSTEM (ADVANCED)
-- ---------------------------------------------------------------------

CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    min_nights INTEGER DEFAULT 1,
    max_nights INTEGER,
    starting_price DECIMAL(10,2) NOT NULL,
    current_highest_bid DECIMAL(10,2),
    bid_increment DECIMAL(10,2) DEFAULT 1.00,
    minimum_bid DECIMAL(10,2) NOT NULL,
    auction_start_time TIMESTAMP NOT NULL,
    auction_end_time   TIMESTAMP NOT NULL,
    objective auction_objective DEFAULT 'HIGHEST_TOTAL',
    status VARCHAR(50) DEFAULT 'PENDING',
    winner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    total_bids INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_auction_window CHECK (end_date > start_date),
    CONSTRAINT chk_auction_times  CHECK (auction_end_time > auction_start_time),
    CONSTRAINT chk_auction_prices CHECK (starting_price > 0 AND minimum_bid > 0 AND bid_increment > 0)
);

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in  DATE NOT NULL,
    check_out DATE NOT NULL,
    nights    INTEGER GENERATED ALWAYS AS (GREATEST(1, check_out - check_in)) STORED,
    total_amount DECIMAL(10,2) NOT NULL,
    price_per_night DECIMAL(10,2) GENERATED ALWAYS AS (total_amount / GREATEST(1, check_out - check_in)) STORED,
    allow_partial BOOLEAN DEFAULT TRUE,
    partial_awarded BOOLEAN DEFAULT FALSE,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',

    CONSTRAINT chk_bid_dates CHECK (check_out > check_in)
);

CREATE TABLE bid_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
    event_data JSONB,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Second-chance offers
CREATE TABLE second_chance_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    offered_check_in  DATE NOT NULL,
    offered_check_out DATE NOT NULL,
    response_deadline TIMESTAMP NOT NULL,
    status offer_status DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- Lightweight notifications per bid
CREATE TABLE bid_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_id  UUID REFERENCES bids(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- 5. CALENDAR & BOOKING
-- ---------------------------------------------------------------------

CREATE TABLE calendar_availability (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
    price_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, date)
);

-- Bookings table kept (but booking_id now nullable in reviews)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    host_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(50) DEFAULT 'PENDING',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

-- Reviews (booking_id nullable)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_text TEXT,
    review_type VARCHAR(50) NOT NULL,
    response_text TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    accuracy_rating INTEGER,
    checking_rating INTEGER,
    cleanliness_rating INTEGER,
    communication_rating INTEGER,
    location_rating INTEGER,
    value_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);


-- Create notification table
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_pushed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist_property table
CREATE TABLE IF NOT EXISTS wishlist_property (
    wishlist_id BIGINT NOT NULL REFERENCES wishlist(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (wishlist_id, property_id)
);

-- Create conversation table
CREATE TABLE IF NOT EXISTS conversation (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    host_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message table
CREATE TABLE IF NOT EXISTS message (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Create Banners table
CREATE TABLE banners (
    banner_id BIGSERIAL PRIMARY KEY,
    banner_title VARCHAR(255) NOT NULL,
    banner_img VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports table
CREATE TABLE reports (
    report_id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    report_reason VARCHAR(255) NOT NULL,
    report_status VARCHAR(50) DEFAULT 'pending',
    report_reply VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create SystemLogs table
CREATE TABLE SystemLogs (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create house_rules table
CREATE TABLE house_rules (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create location_descriptions table
CREATE TABLE location_descriptions (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    description_type VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property_highlights table
CREATE TABLE property_highlights (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. TRIGGERS FOR updated_at
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_props_upd BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_auctions_upd BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_upd BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_upd BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- 7. BASIC INDEXES (essential subset)
-- ---------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_location ON properties(city, state, country);
CREATE INDEX idx_auctions_window ON auctions(start_date, end_date);
CREATE INDEX idx_bids_date_range ON bids(check_in, check_out);
CREATE INDEX idx_calendar_prop_date ON calendar_availability(property_id, date);

-- ---------------------------------------------------------------------
-- 8. INITIAL CONFIG ROW
-- ---------------------------------------------------------------------
CREATE TABLE configuration (
    id BIGSERIAL PRIMARY KEY,
    commission_rate DECIMAL(5,2) NOT NULL,
    hybrid_objective_weight DECIMAL(5,2) DEFAULT 0.5,
    website_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_commission_rate CHECK (commission_rate BETWEEN 0 AND 100)
);

INSERT INTO configuration (commission_rate, website_name) VALUES (15.00, 'Airbnb Auction');

-- ---------------------------------------------------------------------
-- 9. SUCCESS NOTICE
-- ---------------------------------------------------------------------
DO $$ BEGIN
    RAISE NOTICE 'Airbnb Auction schema created successfully!';
END$$; 