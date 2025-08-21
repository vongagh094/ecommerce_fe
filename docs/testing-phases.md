# Testing Phases for ZaloPay Auction Payment Integration

## Overview

This document outlines the comprehensive testing strategy for the ZaloPay payment integration feature. Testing is organized into phases that build upon each other, ensuring thorough validation of all components and user flows.

## Phase 1: Unit Testing

### 1.1 Payment API Service Tests
**Location:** `src/lib/api/payment.test.ts`

**Test Cases:**
- ✅ Payment creation with valid data
- ✅ Payment creation with invalid amount
- ✅ Payment status verification success
- ✅ Payment status verification failure
- ✅ Payment callback handling
- ✅ Error handling for network failures
- ✅ Error handling for API errors
- ✅ Payment utility functions (formatAmount, calculateTotal, etc.)

**Mock Requirements:**
- Mock `apiClient` calls
- Mock ZaloPay responses
- Mock error scenarios

### 1.2 Auction Winner API Tests
**Location:** `src/lib/api/auction-winners.test.ts`

**Test Cases:**
- ✅ Fetch winning bids success
- ✅ Fetch winning bids empty response
- ✅ Accept partial offer
- ✅ Decline partial offer
- ✅ Second chance offer handling
- ✅ Winner utility functions (date calculations, grouping, etc.)

### 1.3 WebSocket Hook Tests
**Location:** `src/hooks/use-payment-notifications.test.ts`

**Test Cases:**
- ✅ WebSocket connection establishment
- ✅ Message handling for different notification types
- ✅ Connection recovery after disconnect
- ✅ Notification state management
- ✅ Cleanup on unmount

**Mock Requirements:**
- Mock WebSocket API
- Mock connection events
- Mock message events

### 1.4 Component Unit Tests

#### Winner Notification Card Tests
**Location:** `src/components/traveller/winner-notification-card.test.tsx`

**Test Cases:**
- ✅ Render full win notification
- ✅ Render partial win notification
- ✅ Display payment deadline correctly
- ✅ Handle expired payments
- ✅ Button click handlers
- ✅ Expand/collapse partial details

#### Full Win Confirmation Tests
**Location:** `src/components/traveller/full-win-confirmation.test.tsx`

**Test Cases:**
- ✅ Render confirmation screen
- ✅ Display property and bid details
- ✅ Handle payment button click
- ✅ Handle decline confirmation
- ✅ Show expired state
- ✅ Loading states

#### ZaloPay Payment Tests
**Location:** `src/components/payment/zalopay-payment.test.tsx`

**Test Cases:**
- ✅ Render payment form
- ✅ Handle payment initiation
- ✅ Show loading states
- ✅ Handle payment success
- ✅ Handle payment failure
- ✅ Payment verification flow
- ✅ Error recovery

## Phase 2: Integration Testing

### 2.1 API Integration Tests
**Location:** `src/__tests__/integration/payment-api.test.ts`

**Test Cases:**
- ✅ End-to-end payment creation flow
- ✅ Payment status verification with backend
- ✅ Error handling with real API responses
- ✅ Authentication token handling
- ✅ Network timeout scenarios

**Requirements:**
- Test backend server or mock server
- Valid test authentication tokens
- ZaloPay sandbox credentials

### 2.2 WebSocket Integration Tests
**Location:** `src/__tests__/integration/websocket.test.ts`

**Test Cases:**
- ✅ Connect to WebSocket server
- ✅ Receive auction result notifications
- ✅ Receive second chance offers
- ✅ Receive payment status updates
- ✅ Handle connection drops and recovery
- ✅ Message ordering and deduplication

**Requirements:**
- WebSocket test server
- Mock notification scenarios

### 2.3 Component Integration Tests
**Location:** `src/__tests__/integration/payment-flow.test.tsx`

**Test Cases:**
- ✅ Winner notification to payment flow
- ✅ Full win confirmation to payment
- ✅ Partial win selection to payment
- ✅ Payment completion to booking confirmation
- ✅ Error handling across components

## Phase 3: End-to-End Testing

### 3.1 Full Bid Winner Flow
**Test Scenario:** User wins entire bid and completes payment

**Steps:**
1. ✅ User receives auction result notification (full win)
2. ✅ Click notification navigates to full win confirmation
3. ✅ Confirm bid and proceed to payment
4. ✅ Complete ZaloPay payment in sandbox
5. ✅ Return to confirmation page
6. ✅ Verify payment status and booking creation
7. ✅ Receive booking confirmation notification

**Expected Results:**
- All UI states display correctly
- Payment processes successfully
- Booking is created in database
- User receives confirmation email
- WebSocket notifications are delivered

### 3.2 Partial Bid Winner Flow
**Test Scenario:** User wins partial nights and selects some to pay for

**Steps:**
1. ✅ User receives partial win notification
2. ✅ Navigate to partial selection screen
3. ✅ Select desired night ranges
4. ✅ Confirm selection and proceed to payment
5. ✅ Complete payment for selected nights
6. ✅ Verify booking created for selected nights only

**Expected Results:**
- Partial selection UI works correctly
- Amount calculation is accurate
- Only selected nights are booked
- Remaining nights trigger second chance offers

### 3.3 Second Chance Offer Flow
**Test Scenario:** User receives and accepts second chance offer

**Steps:**
1. ✅ Previous winner declines partial offer
2. ✅ Next bidder receives second chance notification
3. ✅ User accepts offer within time limit
4. ✅ Complete payment for offered nights
5. ✅ Verify booking creation

**Expected Results:**
- Second chance offer delivered in real-time
- Time limit enforced correctly
- Payment and booking process works
- Original decliner doesn't receive offer again

### 3.4 Payment Failure and Recovery Flow
**Test Scenario:** Payment fails and user retries successfully

**Steps:**
1. ✅ User initiates payment
2. ✅ Payment fails (simulate network error or insufficient funds)
3. ✅ Error message displayed with retry option
4. ✅ User clicks retry
5. ✅ Payment succeeds on second attempt
6. ✅ Booking is created successfully

**Expected Results:**
- Error handling is graceful
- Retry mechanism works
- No duplicate bookings created
- User experience is smooth

### 3.5 Payment Deadline Expiry Flow
**Test Scenario:** User doesn't pay within deadline

**Steps:**
1. ✅ User wins auction
2. ✅ Payment deadline passes without payment
3. ✅ Offer expires and becomes unavailable
4. ✅ Nights are offered to next bidder
5. ✅ Original winner sees expired status

**Expected Results:**
- Deadline enforcement works correctly
- Expired offers cannot be paid
- Second chance mechanism triggers
- UI shows appropriate expired state

## Phase 4: Performance Testing

### 4.1 Load Testing
**Tool:** Artillery.io or similar

**Test Scenarios:**
- ✅ Concurrent payment creations (100 users)
- ✅ WebSocket connection load (500 concurrent connections)
- ✅ Payment verification under load
- ✅ Database performance with multiple auctions

**Performance Targets:**
- Payment creation: < 2 seconds response time
- WebSocket notifications: < 1 second delivery
- Payment verification: < 5 seconds
- 99th percentile response time: < 10 seconds

### 4.2 Stress Testing
**Test Scenarios:**
- ✅ Maximum concurrent payments
- ✅ WebSocket connection limits
- ✅ Database connection pool exhaustion
- ✅ Memory usage under load

### 4.3 Endurance Testing
**Test Scenarios:**
- ✅ 24-hour continuous operation
- ✅ Memory leak detection
- ✅ Connection stability over time
- ✅ Database performance degradation

## Phase 5: Security Testing

### 5.1 Authentication Testing
**Test Cases:**
- ✅ Unauthorized access to payment APIs
- ✅ Token expiration handling
- ✅ Invalid token scenarios
- ✅ Cross-user data access prevention

### 5.2 Payment Security Testing
**Test Cases:**
- ✅ HMAC signature verification
- ✅ Payment amount tampering prevention
- ✅ Replay attack prevention
- ✅ SQL injection in payment parameters

### 5.3 WebSocket Security Testing
**Test Cases:**
- ✅ Unauthorized WebSocket connections
- ✅ Message injection attempts
- ✅ Cross-user notification delivery
- ✅ Connection hijacking prevention

## Phase 6: Browser Compatibility Testing

### 6.1 Desktop Browsers
**Test Browsers:**
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### 6.2 Mobile Browsers
**Test Browsers:**
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Samsung Internet
- ✅ Firefox Mobile

### 6.3 Feature Testing
**Test Cases:**
- ✅ WebSocket support
- ✅ Local storage functionality
- ✅ Payment redirect handling
- ✅ Responsive design
- ✅ Touch interactions

## Phase 7: Accessibility Testing

### 7.1 Screen Reader Testing
**Tools:** NVDA, JAWS, VoiceOver

**Test Cases:**
- ✅ Payment form accessibility
- ✅ Notification announcements
- ✅ Button and link descriptions
- ✅ Form validation messages

### 7.2 Keyboard Navigation
**Test Cases:**
- ✅ Tab order through payment flow
- ✅ Keyboard shortcuts
- ✅ Focus management
- ✅ Modal dialog navigation

### 7.3 Visual Accessibility
**Test Cases:**
- ✅ Color contrast ratios
- ✅ Text scaling (up to 200%)
- ✅ High contrast mode
- ✅ Reduced motion preferences

## Phase 8: User Acceptance Testing

### 8.1 Stakeholder Testing
**Participants:** Product owners, business stakeholders

**Test Scenarios:**
- ✅ Complete user journey walkthrough
- ✅ Business rule validation
- ✅ Revenue calculation accuracy
- ✅ Reporting and analytics

### 8.2 Beta User Testing
**Participants:** Selected real users

**Test Scenarios:**
- ✅ Real auction participation
- ✅ Actual payment processing
- ✅ User experience feedback
- ✅ Edge case discovery

## Test Data Requirements

### 8.3 Test Users
- ✅ Regular bidder accounts
- ✅ Host accounts with properties
- ✅ Admin accounts for monitoring

### 8.4 Test Properties
- ✅ Properties with different pricing
- ✅ Properties in different locations
- ✅ Properties with various amenities

### 8.5 Test Auctions
- ✅ Active auctions for bidding
- ✅ Completed auctions with winners
- ✅ Expired auctions
- ✅ Cancelled auctions

### 8.6 Test Payment Scenarios
- ✅ Successful payments
- ✅ Failed payments
- ✅ Cancelled payments
- ✅ Timeout scenarios

## Test Environment Setup

### 8.7 Development Environment
- ✅ Local development setup
- ✅ Mock ZaloPay sandbox
- ✅ Test database with sample data
- ✅ WebSocket test server

### 8.8 Staging Environment
- ✅ Production-like setup
- ✅ Real ZaloPay sandbox integration
- ✅ Full database with test data
- ✅ Load balancer configuration

### 8.9 Production Environment
- ✅ Live ZaloPay integration
- ✅ Real user data
- ✅ Monitoring and alerting
- ✅ Backup and recovery

## Test Automation

### 8.10 Continuous Integration
- ✅ Unit tests run on every commit
- ✅ Integration tests run on PR
- ✅ E2E tests run on staging deployment
- ✅ Performance tests run nightly

### 8.11 Test Reporting
- ✅ Test coverage reports
- ✅ Performance metrics
- ✅ Error rate monitoring
- ✅ User experience metrics

## Success Criteria

### 8.12 Functional Criteria
- ✅ All user flows complete successfully
- ✅ Payment success rate > 95%
- ✅ WebSocket delivery rate > 99%
- ✅ Zero data corruption incidents

### 8.13 Performance Criteria
- ✅ Page load times < 3 seconds
- ✅ Payment processing < 30 seconds
- ✅ WebSocket latency < 1 second
- ✅ 99.9% uptime during testing

### 8.14 Security Criteria
- ✅ No security vulnerabilities found
- ✅ All authentication tests pass
- ✅ Payment data properly encrypted
- ✅ Audit logs complete and accurate

## Test Schedule

### Week 1-2: Unit and Integration Testing
- Complete all unit tests
- Set up integration test environment
- Run integration test suite

### Week 3-4: End-to-End Testing
- Execute all E2E scenarios
- Performance and load testing
- Security testing

### Week 5: User Acceptance Testing
- Stakeholder review and approval
- Beta user testing
- Bug fixes and retesting

### Week 6: Production Readiness
- Final regression testing
- Production environment validation
- Go-live preparation

## Risk Mitigation

### High-Risk Areas
- ✅ ZaloPay API integration reliability
- ✅ WebSocket connection stability
- ✅ Payment verification accuracy
- ✅ Database transaction integrity

### Mitigation Strategies
- ✅ Comprehensive error handling
- ✅ Retry mechanisms with backoff
- ✅ Fallback payment verification
- ✅ Database transaction rollback
- ✅ Real-time monitoring and alerting