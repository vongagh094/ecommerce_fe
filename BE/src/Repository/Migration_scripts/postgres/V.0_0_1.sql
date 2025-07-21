-- Trigger catch insert bid
CREATE OR REPLACE FUNCTION after_bids_insert()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bid_events ( auction_id, event_type, user_id, bid_amount, previous_amount, event_data, event_time, created_at, updated_at)
    VALUES (
        NEW.auction_id,
        'bid_placed',
        NEW.user_id,
        NEW.bid_amount,
        (SELECT COALESCE(MAX(bid_amount), 0) FROM bids WHERE auction_id = NEW.auction_id),
        jsonb_build_object('auto_bid_max', NEW.auto_bid_max, 'status', NEW.status),
        NEW.created_at,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_bids_insert_event
    AFTER INSERT ON bids
    FOR EACH ROW
EXECUTE FUNCTION after_bids_insert();

-- Trigger catch update bid
CREATE OR REPLACE FUNCTION after_bids_update()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bid_events ( auction_id, event_type, user_id, bid_amount, previous_amount, event_data, event_time, created_at, updated_at)
    VALUES (
        NEW.auction_id,
        'bid_updated',
        NEW.user_id,
        NEW.bid_amount,
        (SELECT COALESCE(MAX(bid_amount), 0) FROM bids WHERE auction_id = NEW.auction_id),
        jsonb_build_object('auto_bid_max', NEW.auto_bid_max, 'status', NEW.status),
        NEW.updated_at,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_bids_update_event
    AFTER UPDATE ON bids
    FOR EACH ROW
WHEN (OLD.bid_amount IS DISTINCT FROM NEW.bid_amount)
EXECUTE FUNCTION after_bids_update();
