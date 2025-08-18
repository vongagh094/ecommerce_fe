# Payment Workflow (ZaloPay) with WebSocket Integration

This document describes the end-to-end payment workflow implemented in the frontend, including the session-centric redirect, WebSocket events, and all HTTP APIs the frontend touches around payment, booking, and calendar updates. It also covers inputs, outputs, and when each API is used.

Environment variables used by the frontend:
- NEXT_PUBLIC_API_URL: Base HTTP API URL (default http://localhost:8000/api/v1)
- NEXT_PUBLIC_WS_URL: Base WebSocket URL (default ws://localhost:8080)

Related source files:
- HTTP client: `src/lib/api/base.ts`
- Payment API: `src/lib/api/payment.ts`
- Winners/Offers API: `src/lib/api/auction-winners.ts`
- Generic APIs (bookings etc.): `src/lib/api.ts`
- WebSocket client utilities: `src/hooks/use-payment-notifications.ts`, `src/lib/websocket/*.ts`
- Types: `src/types/payment.ts`, `src/types/auction-winners.ts`
- UI entry points: `src/components/payment/zalopay-payment.tsx`, `src/app/dashboard/payment/zalopay/[sessionId]/page.tsx`, `src/app/dashboard/payment/confirmation/page.tsx`

## High-level flow (session-centric with WebSocket)

```mermaid
sequenceDiagram
    autonumber
    participant U as User (Browser)
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant ZP as ZaloPay
    participant WS as WebSocket Server

    Note over FE: User won auction / accepted offer → proceeds to pay

    U->>FE: Click "Pay with ZaloPay"
    FE->>BE: POST /payment/zalopay/create {auctionId, selectedNights, amount, orderInfo}
    BE-->>FE: {orderUrl, appTransId, amount}
    FE->>U: Redirect to ZaloPay orderUrl

    U->>ZP: Complete payment
    ZP->>BE: Payment callback (server-to-server)
    BE->>BE: Verify MAC, update payment session → PAID/FAILED
    BE-->>WS: Emit PAYMENT_STATUS {paymentId, userId, status, transactionId?}

    Note over FE,WS: Frontend also polls as fallback on session page

    ZP-->>U: Redirect back to FE (redirect URL)
    U->>FE: Lands at /dashboard/payment/zalopay/{sessionId}
    FE->>WS: Connect ws://.../payment-notifications and SUBSCRIBE
    WS-->>FE: PAYMENT_STATUS (COMPLETED/FAILED) for user
    alt Completed via WS
        FE->>FE: Navigate → /dashboard/payment/confirmation?sessionId=...&transactionId=...
    else Fallback (no WS or still processing)
        FE->>BE: GET /payment/sessions/{sessionId}
        BE-->>FE: {status, appTransId, ...}
        FE->>BE: GET /payment/zalopay/status/{appTransId}
        BE-->>FE: {status, transactionId?}
        FE->>FE: Navigate to confirmation on success
    end

    U->>FE: At /dashboard/payment/confirmation
    FE->>BE: GET /payment/transactions/{transactionId} or /payment/sessions/{sessionId}
    BE-->>FE: {paymentId, status}
    opt Booking retrieval / creation
        FE->>BE: GET /payment/{paymentId}/booking
        BE-->>FE: {booking...} or 404 if not ready
        alt 404 or PENDING
            FE->>FE: Retry w/ backoff (up to N times)
            BE-->>WS: Emit BOOKING_CONFIRMED {bookingId, userId, ...}
            WS-->>FE: BOOKING_CONFIRMED → refresh booking
        else 200
            FE->>BE: POST /bookings/{bookingId}/update-calendar (optional via frontend; often backend)
            FE->>BE: POST /bookings/{bookingId}/conversation (optional)
            FE->>BE: POST /bookings/{bookingId}/send-confirmation (optional)
        end
    end
```

Notes
- The frontend prefers push (WebSocket) on the session page for immediate status, with polling fallback.
- The confirmation page tolerates booking propagation delay with retry/backoff and can also react to WS BOOKING_CONFIRMED (wiring is straightforward using the same WS utilities).
- Some post-booking steps (calendar update, email) are typically backend-orchestrated; frontend methods exist if needed.

## API contracts (HTTP)

Unless otherwise noted, all endpoints require Authorization: Bearer <token> and are prefixed by NEXT_PUBLIC_API_URL.

### 1) Create ZaloPay order
- Method: POST
- Path: /payment/zalopay/create
- Purpose: Create a payment session and obtain ZaloPay order URL.
- Called from: `ZaloPayPayment` on “Pay with ZaloPay”.
- Request (JSON):
  {
    "auctionId": "string",
    "selectedNights": ["YYYY-MM-DD", ...],
    "amount": number,
    "orderInfo": "Booking for <property> (<checkIn> - <checkOut>)"
  }
- Response (200 JSON):
  {
    "orderUrl": "https://sbgateway.zalopay.vn/openinapp?...",
    "appTransId": "string",
    "amount": number
  }
- Errors: 400 (validation), 401 (AUTH_REQUIRED), 500 (NETWORK_ERROR)

### 2) Verify payment status by appTransId
- Method: GET
- Path: /payment/zalopay/status/{appTransId}
- Purpose: Securely verify the transaction status via backend → ZaloPay.
- Used in: session processing page as polling fallback; also verification chains.
- Response (200 JSON):
  {
    "status": "PAID" | "PENDING" | "FAILED" | "CANCELLED",
    "transactionId"?: "string",
    "amount"?: number,
    "paidAt"?: "ISO"
  }

### 3) Get payment session by sessionId
- Method: GET
- Path: /payment/sessions/{sessionId}
- Purpose: Fetch session details (links sessionId ↔ appTransId/status).
- Used in: session processing page.
- Response (200 JSON, `PaymentSession`):
  {
    "id": "string",
    "auctionId": "string",
    "userId": "string",
    "amount": number,
    "currency": "VND",
    "status": "CREATED"|"PENDING"|"PAID"|"FAILED"|"CANCELLED"|"EXPIRED",
    "appTransId": "string",
    "orderUrl"?: "string",
    "createdAt": "ISO",
    "expiresAt": "ISO"
  }

### 4) Get payment by transactionId
- Method: GET
- Path: /payment/transactions/{transactionId}
- Purpose: Retrieve payment record by provider transaction identifier.
- Used in: confirmation page (if transactionId is present).
- Response: Same shape as PaymentSession or a superset (backend-defined); must include `status` and/or `paymentId`.

### 5) Create booking from payment (Backend-orchestrated or explicit)
- Method: POST
- Path: /payment/{paymentId}/booking
- Purpose: Create booking upon successful payment. Often done in backend callback flow; frontend may call if needed.
- Used in: rarely from FE; confirmation page primarily reads booking (GET). Function available in `paymentApi`.
- Response (200 JSON):
  {
    "id": "string",
    "referenceNumber": "string",
    "propertyId": "string",
    "propertyName": "string",
    "hostId": "string",
    "checkIn": "ISO",
    "checkOut": "ISO",
    "guestCount": number,
    "totalAmount": number,
    "status": "CONFIRMED"|"PENDING"|"CANCELLED",
    "createdAt": "ISO"
  }

### 6) Get booking by paymentId
- Method: GET
- Path: /payment/{paymentId}/booking
- Purpose: Retrieve booking created for a specific payment.
- Used in: confirmation page (with retry/backoff if booking not ready yet).
- Response: same as Create booking response; 404 until booking exists.

### 7) Update calendar availability
- Method: POST
- Path: /bookings/{bookingId}/update-calendar
- Purpose: Block out dates on property calendar post-booking. Often automated in backend; FE function exists if needed.
- Used in: optional FE post-booking step.
- Request: {}
- Response: 204 or 200 {}

### 8) Create conversation thread with host
- Method: POST
- Path: /bookings/{bookingId}/conversation
- Purpose: Start a message thread after booking confirmation.
- Used in: optional FE post-booking step to improve UX.
- Response (200 JSON): { "threadId": "string" }

### 9) Send booking confirmation email
- Method: POST
- Path: /bookings/{bookingId}/send-confirmation
- Purpose: Trigger transactional email to traveler (optional if backend auto-sends).
- Used in: optional FE post-booking step.
- Response: 204 or 200 {}

### 10) General booking endpoints (adjacent to payment)
From `src/lib/api.ts` (authenticated):
- POST /bookings — create booking directly (not used in ZaloPay flow)
- GET /user/bookings — list user bookings
- DELETE /bookings/{bookingId} — cancel booking

## WebSocket protocol

Connection
- URL: `${NEXT_PUBLIC_WS_URL}/payment-notifications`
- Protocol: JSON messages

Client subscribe message (sent on open):
{
  "type": "SUBSCRIBE",
  "userId": "<auth0-sub or user-id>",
  "channels": ["auction_results", "payment_status", "second_chance_offers", "booking_confirmations"]
}

Message types (validated by `message-discriminator.ts` and routed by `message-router.ts`):

1) PAYMENT_STATUS
- Shape:
  {
    "type": "PAYMENT_STATUS",
    "paymentId": "string",
    "userId": "string",
    "status": "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED",
    "transactionId"?: "string"
  }
- Used: On session page to navigate to confirmation immediately when COMPLETED; show error on FAILED.

2) BOOKING_CONFIRMED
- Shape:
  {
    "type": "BOOKING_CONFIRMED",
    "bookingId": "string",
    "userId": "string",
    "propertyName": "string",
    "checkIn": "ISO",
    "checkOut": "ISO"
  }
- Used: On confirmation page to stop retry loop and fetch booking immediately.

3) AUCTION_RESULT (pre-payment)
- Shape: { type: "AUCTION_RESULT", auctionId, userId, result, awardedNights?, amount, paymentDeadline, propertyName }
- Used: Dashboard notifications when user wins or partially wins (leads to payment entry UI).

4) SECOND_CHANCE_OFFER (pre-payment)
- Shape: { type: "SECOND_CHANCE_OFFER", offerId, auctionId, userId, offeredNights, amount, responseDeadline, propertyName }
- Used: Offer notifications; accept leads to payment.

Resilience
- The WebSocket clients implement exponential backoff reconnection.
- Messages are validated and routed; unknown/invalid messages are ignored with stats recorded.

## When the frontend calls what

- On Pay click (winners pages):
  - POST /payment/zalopay/create → redirect to ZaloPay

- On return to site (session page `/dashboard/payment/zalopay/{sessionId}`):
  - Connect WebSocket and SUBSCRIBE
  - If PAYMENT_STATUS COMPLETED arrives → navigate to confirmation
  - Else poll: GET /payment/sessions/{sessionId} → get `appTransId`; GET /payment/zalopay/status/{appTransId}` until PAID/FAILED

- On confirmation page `/dashboard/payment/confirmation`:
  - Resolve payment via transactionId or sessionId → fetch session/transaction
  - GET /payment/{paymentId}/booking with retry/backoff until booking exists
  - Optionally react to BOOKING_CONFIRMED via WebSocket
  - Optionally POST update-calendar, create conversation, send confirmation (often backend does these)

## Error handling

- HTTP errors are wrapped by `ApiError` with status, code, and details when present.
- Payment-specific guidance via `PaymentErrorHandler` maps backend error codes to FE actions.
- The confirmation page implements retry/backoff for eventual consistency of booking creation.

## Notes for backend alignment

- Ensure redirect lands on `/dashboard/payment/zalopay/{sessionId}` and maintain mapping sessionId ↔ appTransId.
- Emit PAYMENT_STATUS and BOOKING_CONFIRMED to the user’s channel (`userId`) to optimize UX.
- Prefer backend orchestration for booking creation, calendar updates, and emails; frontend will reflect state.

## Appendix: Types (frontend)

PaymentSession (excerpt):
{
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  currency: 'VND';
  status: 'CREATED'|'PENDING'|'PAID'|'FAILED'|'CANCELLED'|'EXPIRED';
  appTransId: string;
  orderUrl?: string;
  createdAt: string;
  expiresAt: string;
}

PaymentVerificationResponse (excerpt):
{
  status: 'PAID'|'PENDING'|'FAILED'|'CANCELLED';
  transactionId?: string;
  amount?: number;
  paidAt?: string;
}

WebSocket PaymentStatusMessage:
{
  type: 'PAYMENT_STATUS';
  paymentId: string;
  userId: string;
  status: 'INITIATED'|'PROCESSING'|'COMPLETED'|'FAILED';
  transactionId?: string;
}

WebSocket BookingConfirmationMessage:
{
  type: 'BOOKING_CONFIRMED';
  bookingId: string;
  userId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
}

---
This documentation reflects the current Option 2 session-centric architecture with WebSocket acceleration and polling fallback, based on the code in this repository.
