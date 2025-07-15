CREATE USER customer WITH PASSWORD 'customer';
GRANT CONNECT ON DATABASE ecommerce_db to customer;
CREATE TABLE users
(
    id       UUID PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
-- Sample data for users table
INSERT INTO users ( id,username, email, password) VALUES
                                                      ( '11111111-1111-1111-1111-111111111111','alice', 'alice@example.com', 'hashed_password1'),
                                                      ( '22222222-2222-2222-2222-222222222222','bob', 'bob@example.com', 'hashed_password2');

CREATE TABLE auctions(
                         id UUID PRIMARY KEY,
                         product_id INT,
                         check_in_date TIMESTAMP ,
                         check_out_date TIMESTAMP,
                         starting_price DECIMAL(10, 2),
                         current_highest_bid DECIMAL(10, 2),
                         bid_increment DECIMAL(10, 2),
                         minimum_bid DECIMAL(10, 2),
                         auction_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         auction_end_time TIMESTAMP,
                         status VARCHAR(20) DEFAULT 'active',
                         winner_user_id uuid,
                         total_bids INT DEFAULT 0,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE bids (
                      id UUID PRIMARY KEY,
                      user_id UUID NOT NULL,
                      auction_id UUID NOT NULL,
                      bid_amount DECIMAL(10, 2) NOT NULL,
                      bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      is_winning_bid BOOLEAN DEFAULT FALSE,
                      auto_bid_max INT ,
                      status varchar(20),
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);
CREATE TABLE bid_events (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            auction_id UUID NOT NULL,
                            event_type VARCHAR(50),
                            user_id UUID NOT NULL,
                            bid_amount DECIMAL(10, 2),
                            previous_amount DECIMAL(10, 2),
                            event_data JSONB,
                            event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO auctions (id, product_id, check_in_date, check_out_date, starting_price, current_highest_bid, bid_increment, minimum_bid, auction_start_time, auction_end_time, status, winner_user_id, total_bids)
VALUES
    ('22222222-2222-2222-2222-222222222222', 1, '2023-10-01 10:00:00', '2023-10-05 10:00:00', 100.00, 0.00, 5.00, 10.00, '2023-10-01 09:00:00', '2023-10-05 09:00:00', 'active', NULL, 0);
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO customer;
