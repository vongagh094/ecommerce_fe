-- Testing data
INSERT INTO properties( id,host_id,title,description,property_type,category,max_guests,bedrooms,bathrooms,address_line1,address_line2,city,state,country,postal_code,base_price,cleaning_fee,service_fee,cancellation_policy,instant_book,minimum_stay,maximum_stay
)VALUES (
    1,
    1,
    'Cozy Cottage',
    'A cozy cottage in the woods.',
    'cottage',
    'vacation_rental',
    4,
    2,
    1,
    '123 Forest Lane',
    NULL,
    'Springfield',
    'IL',
    'USA',
    '62701',
    150.00,
    50.00,
    20.00,
    'flexible',
    TRUE,
    2,
    14
);
INSERT INTO auctions(id,property_id,check_in_date,check_out_date,starting_price,current_highest_bid,bid_increment,minimum_bid,auction_start_time,auction_end_time,status,winner_user_id,total_bids,created_at,updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    1,
    '2023-10-01',
    '2023-10-10',
    100.00,
    400.00,
    10.00,
    10.00,
    '2023-10-01 10:00:00',
    '2023-10-10 10:00:00',
    'active',
    NULL,
    0,
    '2023-10-01 09:00:00',
    '2023-10-01 09:00:00'
);