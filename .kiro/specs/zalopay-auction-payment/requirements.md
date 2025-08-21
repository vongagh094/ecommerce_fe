# Requirements Document

## Introduction

This feature implements ZaloPay payment integration for auction winners in the Airbnb clone bidding platform. The system handles payment processing for users who win full or partial bids, including fallback mechanisms when partial offers are declined. The integration follows the existing bidding policy with pay-what-you-bid pricing and partial award capabilities, ensuring seamless payment flow from auction completion to successful transaction.

## Requirements

### Requirement 1: Auction Winner Notification and Navigation

**User Story:** As a bidding user, I want to receive notifications when I win an auction and easily navigate to the payment interface, so that I can complete my booking payment promptly.

#### Acceptance Criteria

1. WHEN a user wins a full bid THEN the system SHALL send a real-time notification with "You won!" message and payment action button
2. WHEN a user wins a partial bid THEN the system SHALL send a notification indicating partial win with details of awarded nights
3. WHEN a user clicks the notification or payment button THEN the system SHALL navigate to the winning confirmation screen
4. WHEN the notification is displayed THEN it SHALL include auction details (property name, dates, amount)
5. IF a user has multiple winning bids THEN the system SHALL group notifications by property and show total amount

### Requirement 2: Full Bid Winner Payment Interface

**User Story:** As a user who won all nights I bid for, I want to see a clear confirmation of my winning bid and proceed directly to payment, so that I can secure my booking efficiently.

#### Acceptance Criteria

1. WHEN a user wins all nights they bid for THEN the system SHALL display a "Congratulations! You won the entire bid" screen
2. WHEN the full win screen is displayed THEN it SHALL show property details, check-in/check-out dates, total nights, and total amount
3. WHEN the full win screen is displayed THEN it SHALL include a prominent "Pay Now with ZaloPay" button
4. WHEN the user clicks "Pay Now" THEN the system SHALL initiate ZaloPay payment flow
5. IF the payment is successful THEN the system SHALL create a confirmed booking and update calendar availability

### Requirement 3: Partial Bid Winner Choice Interface

**User Story:** As a user who won only some nights I bid for, I want to see which nights I won and choose whether to accept the partial booking, so that I can make an informed decision about my travel plans.

#### Acceptance Criteria

1. WHEN a user wins partial nights THEN the system SHALL display "Partial Win - Choose Your Nights" screen
2. WHEN the partial win screen is displayed THEN it SHALL show all awarded night ranges with individual pricing
3. WHEN the partial win screen is displayed THEN it SHALL allow users to select/deselect specific night ranges
4. WHEN night ranges are selected THEN the system SHALL calculate and display the updated total amount
5. WHEN the user confirms their selection THEN the system SHALL proceed to payment with the calculated amount
6. WHEN the user declines all partial offers THEN the system SHALL trigger fallback to next bidder
7. IF no nights are selected THEN the "Proceed to Payment" button SHALL be disabled

### Requirement 4: Fallback Mechanism for Declined Partial Offers

**User Story:** As a system administrator, I want the platform to automatically offer declined partial bookings to the next highest bidders, so that revenue is maximized and inventory is efficiently utilized.

#### Acceptance Criteria

1. WHEN a user declines all partial offers THEN the system SHALL identify the next highest bidder for those specific nights
2. WHEN the next bidder is identified THEN the system SHALL send them a second-chance offer notification
3. WHEN a second-chance offer is sent THEN it SHALL include a time limit for response (2 minutes)
4. WHEN the time limit expires without response THEN the system SHALL move to the next eligible bidder
5. IF no eligible bidders remain THEN the system SHALL mark those nights as available for regular booking
6. WHEN a second-chance offer is accepted THEN the system SHALL create a new booking for the accepting user

### Requirement 5: ZaloPay Payment Integration

**User Story:** As a user ready to pay for my winning bid, I want to complete payment securely through ZaloPay, so that I can finalize my booking with confidence.

#### Acceptance Criteria

1. WHEN a user clicks "Pay with ZaloPay" THEN the system SHALL call the backend payment creation API
2. WHEN the payment API responds THEN the system SHALL redirect the user to ZaloPay gateway
3. WHEN the user completes payment on ZaloPay THEN they SHALL be redirected back to the confirmation page
4. WHEN the user returns from ZaloPay THEN the system SHALL verify payment status with the backend
5. WHEN payment is verified as successful THEN the system SHALL display "Payment Successful" confirmation
6. WHEN payment fails or is cancelled THEN the system SHALL display appropriate error message and retry option
7. IF payment verification fails THEN the system SHALL show "Verifying payment..." status and retry verification

### Requirement 6: Payment Confirmation and Booking Creation

**User Story:** As a user who has completed payment, I want to see confirmation of my successful booking and receive booking details, so that I have proof of my reservation.

#### Acceptance Criteria

1. WHEN payment is successfully verified THEN the system SHALL display booking confirmation screen
2. WHEN booking confirmation is shown THEN it SHALL include booking reference number, property details, dates, and total amount paid
3. WHEN booking is confirmed THEN the system SHALL send confirmation email with booking details
4. WHEN booking is created THEN the system SHALL update the property calendar to mark dates as booked
5. WHEN booking is finalized THEN the system SHALL create conversation thread between guest and host
6. IF booking creation fails after payment THEN the system SHALL log the error and notify administrators for manual resolution

### Requirement 7: Error Handling and Recovery

**User Story:** As a user experiencing payment issues, I want clear error messages and recovery options, so that I can resolve problems and complete my booking.

#### Acceptance Criteria

1. WHEN payment creation fails THEN the system SHALL display "Unable to initiate payment" error with retry button
2. WHEN ZaloPay redirect fails THEN the system SHALL show error message and return to payment screen
3. WHEN payment verification times out THEN the system SHALL continue retrying verification in background
4. WHEN network errors occur THEN the system SHALL show appropriate offline/connectivity messages
5. WHEN booking creation fails after successful payment THEN the system SHALL show "Payment processed, booking being finalized" message
6. IF critical errors occur THEN the system SHALL provide customer support contact information
7. WHEN users encounter errors THEN all error states SHALL include clear next steps and recovery options