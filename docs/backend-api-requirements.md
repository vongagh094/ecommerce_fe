# Backend API Requirements for ZaloPay Auction Payment Integration

## Overview

This document outlines the backend API endpoints required to support the ZaloPay payment integration for auction winners in the Airbnb clone platform. The backend should implement these endpoints to coordinate with the frontend payment flow.

## Required API Endpoints

### 1. Payment Management APIs

#### 1.1 Create ZaloPay Payment Order
**Endpoint:** `POST /api/v1/payment/zalopay/create`
**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "auctionId": "string (UUID)",
  "selectedNights": ["2024-03-15", "2024-03-16", "2024-03-17"],
  "amount": 1200000,
  "orderInfo": "Payment for Property Name from 2024-03-15 to 2024-03-18"
}
```

**Response (Success - 200):**
```json
{
  "orderUrl": "https://sbgateway.zalopay.vn/openinapp?order=...",
  "appTransId": "240315_auction_12345",
  "amount": 1200000
}
```

**Response (Error - 400/500):**
```json
{
  "error": {
    "code": "PAYMENT_CREATION_FAILED",
    "message": "Failed to create payment order",
    "details": {}
  }
}
```

**Backend Implementation Requirements:**
- Validate user owns the winning bid for the auction
- Check payment deadline hasn't expired
- Generate unique `app_trans_id` following ZaloPay format (YYMMDD_ORDER_ID)
- Create ZaloPay order using their API
- Store payment session in database with expiration
- Return ZaloPay order URL for frontend redirect

#### 1.2 Verify Payment Status
**Endpoint:** `GET /api/v1/payment/zalopay/status/{app_trans_id}`
**Authentication:** Required

**Response (Success - 200):**
```json
{
  "status": "PAID", // PAID | PENDING | FAILED | CANCELLED
  "transactionId": "zalopay_transaction_id",
  "amount": 1200000,
  "paidAt": "2024-03-15T10:30:00Z"
}
```

**Backend Implementation Requirements:**
- Query ZaloPay status using their `/v2/query` endpoint
- Verify HMAC signature of response
- Update internal payment status
- Return verified status to frontend

#### 1.3 Handle ZaloPay Callback
**Endpoint:** `POST /api/v1/payment/zalopay/callback`
**Authentication:** None (ZaloPay webhook)

**Request Body (from ZaloPay):**
```json
{
  "data": "base64_encoded_payment_data",
  "mac": "hmac_signature"
}
```

**Response (Success - 200):**
```json
{
  "return_code": 1,
  "return_message": "success"
}
```

**Backend Implementation Requirements:**
- Verify HMAC signature using ZaloPay key2
- Parse payment data and extract transaction details
- Update payment status in database
- Trigger booking creation if payment successful
- Send WebSocket notification to user
- Return proper response to ZaloPay

### 2. Auction Winner Management APIs

#### 2.1 Get User's Winning Bids
**Endpoint:** `GET /api/v1/auctions/winners/me`
**Authentication:** Required

**Response (Success - 200):**
```json
{
  "winners": [
    {
      "id": "winner_uuid",
      "auctionId": "auction_uuid",
      "property": {
        "id": "property_uuid",
        "title": "Property Name",
        "city": "Ho Chi Minh City",
        "state": "Ho Chi Minh",
        "images": [{"image_url": "https://..."}]
      },
      "bidAmount": 1200000,
      "checkIn": "2024-03-15",
      "checkOut": "2024-03-18",
      "isPartialWin": false,
      "awardedNights": [
        {"date": "2024-03-15", "pricePerNight": 400000, "isSelected": true, "rangeId": "range_1"}
      ],
      "status": "PENDING_PAYMENT",
      "paymentDeadline": "2024-03-15T12:00:00Z"
    }
  ]
}
```

**Backend Implementation Requirements:**
- Query user's winning bids from database
- Include property details and images
- Calculate awarded nights for partial wins
- Return payment status and deadlines

#### 2.2 Get Specific Winning Bid Details
**Endpoint:** `GET /api/v1/auctions/winners/{auction_id}`
**Authentication:** Required

**Response:** Same structure as single winner from above endpoint

**Backend Implementation Requirements:**
- Validate user owns this winning bid
- Return detailed information for specific auction win

#### 2.3 Confirm Full Bid Win
**Endpoint:** `POST /api/v1/auctions/winners/{auction_id}/confirm`
**Authentication:** Required

**Response (Success - 200):**
```json
{
  "message": "Bid win confirmed",
  "paymentDeadline": "2024-03-15T12:00:00Z"
}
```

**Backend Implementation Requirements:**
- Update winner status to CONFIRMED
- Set payment deadline (e.g., 2 hours from confirmation)
- Send WebSocket notification about confirmation

#### 2.4 Decline Full Bid Win
**Endpoint:** `POST /api/v1/auctions/winners/{auction_id}/decline`
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Optional decline reason"
}
```

**Backend Implementation Requirements:**
- Update winner status to DECLINED
- Trigger second chance offer to next bidder
- Send WebSocket notification about decline

### 3. Partial Offer Management APIs

#### 3.1 Accept Partial Offer
**Endpoint:** `POST /api/v1/auctions/offers/{offer_id}/accept`
**Authentication:** Required

**Request Body:**
```json
{
  "selectedNights": ["2024-03-15", "2024-03-16"]
}
```

**Backend Implementation Requirements:**
- Validate offer belongs to user and is still valid
- Update offer status to ACCEPTED
- Create partial booking record
- Set payment deadline for selected nights

#### 3.2 Decline Partial Offer
**Endpoint:** `POST /api/v1/auctions/offers/{offer_id}/decline`
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Optional decline reason"
}
```

**Backend Implementation Requirements:**
- Update offer status to DECLINED
- Trigger second chance offer to next eligible bidder
- Send WebSocket notification

### 4. Second Chance Offer APIs

#### 4.1 Get Second Chance Offers
**Endpoint:** `GET /api/v1/auctions/offers/second-chance/me`
**Authentication:** Required

**Response (Success - 200):**
```json
{
  "offers": [
    {
      "id": "offer_uuid",
      "originalBidId": "bid_uuid",
      "auctionId": "auction_uuid",
      "offeredNights": ["2024-03-15", "2024-03-16"],
      "amount": 800000,
      "responseDeadline": "2024-03-15T10:30:00Z",
      "status": "WAITING"
    }
  ]
}
```

#### 4.2 Respond to Second Chance Offer
**Endpoint:** `POST /api/v1/auctions/offers/second-chance/{offer_id}/respond`
**Authentication:** Required

**Request Body:**
```json
{
  "accept": true,
  "selectedNights": ["2024-03-15", "2024-03-16"]
}
```

**Backend Implementation Requirements:**
- Validate offer is still valid and within deadline
- If accepted, create booking and set payment deadline
- If declined, offer to next eligible bidder
- Send appropriate WebSocket notifications

### 5. Booking Creation APIs

#### 5.1 Create Booking After Payment
**Internal API - Called after successful payment**

**Backend Implementation Requirements:**
- Create booking record in database
- Update calendar availability
- Generate booking confirmation number
- Create conversation thread between guest and host
- Send booking confirmation email
- Send WebSocket notification to user

### 6. WebSocket Notification Requirements

The backend should send WebSocket messages for the following events:

#### 6.1 Auction Result Notification
```json
{
  "type": "AUCTION_RESULT",
  "auctionId": "auction_uuid",
  "userId": "user_uuid",
  "result": "FULL_WIN", // FULL_WIN | PARTIAL_WIN | LOST
  "awardedNights": ["2024-03-15", "2024-03-16"],
  "amount": 1200000,
  "paymentDeadline": "2024-03-15T12:00:00Z",
  "propertyName": "Property Name"
}
```

#### 6.2 Second Chance Offer Notification
```json
{
  "type": "SECOND_CHANCE_OFFER",
  "offerId": "offer_uuid",
  "auctionId": "auction_uuid",
  "userId": "user_uuid",
  "offeredNights": ["2024-03-15", "2024-03-16"],
  "amount": 800000,
  "responseDeadline": "2024-03-15T10:30:00Z",
  "propertyName": "Property Name"
}
```

#### 6.3 Payment Status Update
```json
{
  "type": "PAYMENT_STATUS",
  "paymentId": "payment_uuid",
  "userId": "user_uuid",
  "status": "COMPLETED", // INITIATED | PROCESSING | COMPLETED | FAILED
  "transactionId": "zalopay_transaction_id"
}
```

#### 6.4 Booking Confirmation
```json
{
  "type": "BOOKING_CONFIRMED",
  "bookingId": "booking_uuid",
  "userId": "user_uuid",
  "propertyName": "Property Name",
  "checkIn": "2024-03-15",
  "checkOut": "2024-03-18"
}
```

## Database Schema Requirements

### Payment Sessions Table
```sql
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id),
  user_id UUID REFERENCES users(id),
  app_trans_id VARCHAR(50) UNIQUE,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'CREATED',
  order_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  transaction_id VARCHAR(100)
);
```

### Update Existing Tables
- Add `payment_deadline` to `auctions` table
- Add `payment_status` to `bookings` table
- Ensure `second_chance_offers` table exists with proper structure

## ZaloPay Configuration

The backend needs these environment variables:
```
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_CALLBACK_URL=https://yourdomain.com/api/v1/payment/zalopay/callback
ZALOPAY_REDIRECT_URL=https://yourdomain.com/dashboard/payment/confirmation
```

## Error Handling

All APIs should return consistent error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Common error codes:
- `AUTHENTICATION_REQUIRED`
- `PAYMENT_CREATION_FAILED`
- `PAYMENT_VERIFICATION_FAILED`
- `OFFER_EXPIRED`
- `INVALID_AUCTION_STATE`
- `INSUFFICIENT_PERMISSIONS`

## Security Requirements

1. **Authentication:** All user-facing endpoints require JWT validation
2. **Authorization:** Verify user owns the auction/bid/offer being accessed
3. **HMAC Verification:** Verify all ZaloPay callbacks using HMAC-SHA256
4. **Rate Limiting:** Implement rate limiting on payment creation endpoints
5. **Input Validation:** Validate all input parameters and sanitize data
6. **Audit Logging:** Log all payment-related operations for audit trail

## Performance Requirements

1. **Response Time:** All APIs should respond within 2 seconds
2. **WebSocket Delivery:** Notifications should be delivered within 1 second
3. **Payment Verification:** Status checks should complete within 5 seconds
4. **Database Indexing:** Ensure proper indexes on auction_id, user_id, app_trans_id

## Testing Requirements

1. **Unit Tests:** Test all payment logic and calculations
2. **Integration Tests:** Test ZaloPay API integration with sandbox
3. **WebSocket Tests:** Test real-time notification delivery
4. **Error Handling Tests:** Test all error scenarios and edge cases
5. **Load Tests:** Test payment flow under concurrent load