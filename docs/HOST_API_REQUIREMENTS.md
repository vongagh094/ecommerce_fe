# Auction Winners, Payment (ZaloPay), Fallback, and Booking - Backend API Requirements

Base Path: `/api/v1`
Auth: All endpoints below require Bearer JWT unless explicitly stated.

## 1) Winners & Offers

### GET /auctions/winners/me
- Purpose: List the authenticated user’s winning bids.
- Query: none
- Response 200:
```json
[
  {
    "id": "winner-uuid",
    "auctionId": "auction-uuid",
    "property": {
      "id": "property-uuid",
      "title": "Beach House",
      "location": { "city": "Miami", "state": "FL" },
      "images": [{ "image_url": "https://..." }],
      "max_guests": 6
    },
    "bidAmount": 4500000,
    "checkIn": "2025-09-10",
    "checkOut": "2025-09-14",
    "isPartialWin": false,
    "awardedNights": [
      { "date": "2025-09-10", "pricePerNight": 1125000 },
      { "date": "2025-09-11", "pricePerNight": 1125000 }
    ],
    "status": "PENDING_PAYMENT",
    "paymentDeadline": "2025-08-31T12:00:00Z"
  }
]
```

### GET /auctions/winners/{auctionId}
- Purpose: Get a specific winning bid for the current user.
- Path: `auctionId` (UUID)
- Response 200: same shape as a single item in the list above
- Errors:
  - 404 NOT_FOUND (no such winner for user)

### POST /auctions/winners/{auctionId}/accept
- Purpose: Accept a full-win offer.
- Body: `{}`
- Response 200: `{ "success": true }`
- Errors: 400 (invalid state), 404 (not found)

### POST /auctions/winners/{auctionId}/decline
- Purpose: Decline a full-win or partial context at winner-level; triggers fallback.
- Body:
```json
{ "reason": "string (optional)" }
```
- Response 200:
```json
{ "success": true, "fallbackTriggered": true }
```

### POST /auctions/offers/{offerId}/accept
- Purpose: Accept a partial or second-chance offer with a set of nights.
- Body:
```json
{ "selectedNights": ["YYYY-MM-DD", "YYYY-MM-DD"] }
```
- Constraints: non-empty; dates must belong to the offer.
- Response 200:
```json
{ "success": true, "acceptedNights": ["YYYY-MM-DD"], "totalAmount": 3000000 }
```

### POST /auctions/offers/{offerId}/decline
- Purpose: Decline a partial or second-chance offer.
- Body:
```json
{ "reason": "string (optional)" }
```
- Response 200: `{ "success": true, "nextBidderNotified": true }`

### GET /auctions/offers/second-chance/me
- Purpose: List active second-chance offers for the user.
- Response 200:
```json
[
  {
    "id": "offer-uuid",
    "originalBidId": "bid-uuid",
    "userId": "user-uuid",
    "auctionId": "auction-uuid",
    "offeredNights": ["2025-10-12", "2025-10-13"],
    "amount": 2400000,
    "responseDeadline": "2025-08-31T12:02:00Z",
    "status": "WAITING"
  }
]
```

### GET /auctions/offers/second-chance/{offerId}
- Purpose: Get details for a specific second-chance offer.
- Response 200: one item as above.

### POST /auctions/offers/second-chance/{offerId}/accept
- Purpose: Accept a second-chance offer.
- Body: `{}`
- Response 200: `{ "success": true }`

### POST /auctions/offers/second-chance/{offerId}/decline
- Purpose: Decline a second-chance offer.
- Body:
```json
{ "reason": "string (optional)" }
```
- Response 200: `{ "success": true, "nextBidderNotified": true }`

### POST /auctions/analytics/decline
- Purpose: Track decline reasons for analytics.
- Body:
```json
{ "offerId": "uuid", "reason": "string", "type": "full|partial|second_chance" }
```
- Response 200: `{ "success": true }`

## 2) Payment (ZaloPay)

### POST /payment/zalopay/create
- Purpose: Create a ZaloPay order for a user’s winner/offer selection.
- Body:
```json
{
  "auctionId": "uuid",
  "selectedNights": ["YYYY-MM-DD"],
  "amount": 4500000,
  "orderInfo": "Booking for Beach House (2025-09-10 - 2025-09-12)"
}
```
- Validation:
  - User must own the winner/offer context.
  - `amount` must equal system-side calculation for `selectedNights` (server is source of truth).
- Response 200:
```json
{
  "orderUrl": "https://sbgateway.zalopay.vn/openinapp?order=...",
  "appTransId": "250816_order12345",
  "amount": 4500000
}
```
- Errors: 400 VALIDATION_ERROR, 409 CONFLICT (stale/expired), 500

### GET /payment/zalopay/status/{appTransId}
- Purpose: Verify payment status with ZaloPay (server-to-server) and return definitive status.
- Response 200:
```json
{ "status": "PAID|PENDING|FAILED|CANCELLED", "transactionId": "zalopay-txn-id", "amount": 4500000, "paidAt": "2025-08-31T12:03:01Z" }
```

### POST /payment/zalopay/callback (no auth)
- Purpose: ZaloPay webhook callback.
- Body:
```json
{ "data": "string", "mac": "hmac-sha256" }
```
- Behavior: verify signature (key2), update internal payment status, acknowledge.
- Response 200:
```json
{ "return_code": 1, "return_message": "success" }
```

### GET /payment/sessions/{sessionId}
- Purpose: Return a payment session record (if you model sessions).
- Response 200: PaymentSession JSON.

### GET /payment/transactions/{transactionId}
- Purpose: Get a payment by transaction ID.
- Response 200: PaymentSession JSON with status/details.

## 3) Booking & Fulfillment

### POST /payment/{paymentId}/booking
- Purpose: Create a booking after a successful payment.
- Preconditions: payment must be PAID; nights still available (idempotent).
- Body: `{}`
- Response 200:
```json
{
  "id": "booking-uuid",
  "referenceNumber": "BK202508311203-123",
  "propertyId": "property-uuid",
  "propertyName": "Beach House",
  "hostId": "host-uuid",
  "checkIn": "2025-09-10",
  "checkOut": "2025-09-12",
  "guestCount": 2,
  "totalAmount": 4500000,
  "status": "CONFIRMED",
  "createdAt": "2025-08-31T12:03:10Z"
}
```
- Side effects: persist booking, update `calendar_availability`, mark winner/offer PAID, enqueue confirmation email, create conversation thread.

### GET /payment/{paymentId}/booking
- Purpose: Retrieve booking created for a payment.
- Response 200: same shape as above.

### POST /bookings/{bookingId}/update-calendar
- Purpose: Explicit calendar write/update (optional, if not done in booking creation).
- Body: `{}`
- Response 200: `{ "success": true }`

### POST /bookings/{bookingId}/conversation
- Purpose: Create a conversation thread between guest and host for this booking.
- Body: `{}`
- Response 200: `{ "threadId": "thread-uuid" }`

### POST /bookings/{bookingId}/send-confirmation
- Purpose: Send booking confirmation email.
- Body: `{}`
- Response 200: `{ "success": true }`

## 4) WebSocket Topics (Reference)
- `auction_results`: AUCTION_RESULT messages (FULL_WIN|PARTIAL_WIN|LOST)
- `payment_status`: PAYMENT_STATUS updates (INITIATED|PROCESSING|COMPLETED|FAILED)
- `second_chance_offers`: SECOND_CHANCE_OFFER delivery and timeouts

## 5) Error Model
- Use consistent error structure:
```json
{ "error": { "code": "ERROR_CODE", "message": "...", "details": { } }, "status_code": 400 }
```
- Common codes: NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, CONFLICT, INTERNAL_SERVER_ERROR.

## 6) Security
- JWT auth for all user operations
- Ownership checks (user can only act on own winners/offers)
- Idempotency for booking creation
- HMAC verification for ZaloPay callback (key2)
- Rate limiting on create/verify endpoints

## 7) Idempotency Keys (Recommended)
- For `POST /payment/zalopay/create` and `POST /payment/{paymentId}/booking`, accept `Idempotency-Key` header; dedupe on server.

## 8) Concurrency & Timeouts
- Lock nights during payment session
- Auto-expire sessions (e.g., 15 minutes)
- Background job to verify PENDING payments and release locks

This spec matches the implemented frontend flow and the documented database and bidding policies. Ensure data validation and server-side price calculation to enforce pay-what-you-bid integrity.