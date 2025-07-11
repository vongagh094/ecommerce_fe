CREATE USER customer WITH PASSWORD 'customer';
GRANT SELECT, INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public  TO customer;

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL
);
CREATE TABLE categories (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE products (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          price DECIMAL(10, 2) NOT NULL,
                          category_id INT NOT NULL,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE TABLE orders (
                        id SERIAL PRIMARY KEY,
                        user_id INT NOT NULL,
                        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        total DECIMAL(10, 2) NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Sample data for users table
INSERT INTO users (id, username, email, password) VALUES
                                                      (1, 'alice', 'alice@example.com', 'hashed_password1'),
                                                      (2, 'bob', 'bob@example.com', 'hashed_password2');

-- Sample data for categories table
INSERT INTO categories (id, name) VALUES
                                      (1, 'Electronics'),
                                      (2, 'Books');

-- Sample data for products table
INSERT INTO products (id, name, price, category_id) VALUES
                                                        (1, 'Smartphone', 299.99, 1),
                                                        (2, 'Novel', 19.99, 2);