# Implementation Plan

- [x] 1. Set up payment infrastructure and types


  - Create TypeScript interfaces for payment, auction winners, and WebSocket messages
  - Set up ZaloPay configuration and environment variables
  - Create base payment API service structure with error handling
  - _Requirements: 5.1, 5.2, 7.1_

- [x] 2. Implement ZaloPay API integration


  - [x] 2.1 Create payment API service




    - Write payment creation API call with proper request/response handling
    - Implement payment status verification with retry logic
    - Add payment callback handling for ZaloPay webhooks
    - Create comprehensive error handling for all payment scenarios
    - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2_

  - [x] 2.2 Create payment utilities and helpers




    - Write payment amount calculation utilities
    - Implement ZaloPay URL generation and validation
    - Create payment session management utilities
    - Add payment error classification and recovery logic
    - _Requirements: 5.4, 5.5, 7.3, 7.7_



- [x] 3. Build auction winner API integration





  - [x] 3.1 Create auction winner API service


    - Write API calls to fetch user's winning bids
    - Implement partial offer acceptance/decline endpoints
    - Create second chance offer retrieval and response APIs
    - Add proper authentication and error handling for all winner APIs
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 4.1, 4.2_

  - [x] 3.2 Implement winner data management


    - Create data transformation utilities for auction winner data
    - Write winner status tracking and updates
    - Implement winner notification data processing


    - Add winner bid validation and verification logic
    - _Requirements: 1.4, 3.3, 3.4, 6.3_

- [x] 4. Create WebSocket notification system





  - [x] 4.1 Build WebSocket integration hook


    - Write usePaymentNotifications hook with connection management
    - Implement message handling for auction results, payment status, and second chance offers
    - Create connection recovery and reconnection logic with exponential backoff
    - Add notification state management and persistence
    - _Requirements: 1.1, 1.2, 4.1, 4.2_

  - [x] 4.2 Create WebSocket message handlers


    - Write message type discrimination and routing logic


    - Implement notification creation from WebSocket messages
    - Create real-time status update handlers
    - Add message deduplication and ordering logic
    - _Requirements: 1.3, 4.3, 4.4_

- [x] 5. Build winner notification components
  - [x] 5.1 Create winner notification card component
    - Write WinnerNotificationCard component with full/partial win display
    - Implement notification action buttons (Pay Now, View Details)
    - Create notification styling with property images and details
    - Add notification dismissal and interaction handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



  - [x] 5.2 Build notification dropdown integration
    - Extend existing NotificationDropdown to handle winner notifications
    - Implement winner notification filtering and grouping
    - Create navigation to payment screens from notifications
    - Add unread count updates for winner notifications
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 6. Create full bid winner confirmation interface
  - [x] 6.1 Build full win confirmation component
    - Write FullWinConfirmation component with property and bid details
    - Implement "Congratulations" messaging and visual design
    - Create payment button with loading states
    - Add decline option with confirmation dialog
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.2 Create full win confirmation page
    - Write /dashboard/winners/[auctionId] page for full win display
    - Implement data fetching for auction and property details
    - Create navigation flow to payment processing
    - Add error handling for invalid or expired auctions
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 7. Build partial bid winner selection interface
  - [x] 7.1 Create partial win selection component
    - Write PartialWinSelection component with night range display
    - Implement selectable night ranges with pricing calculation
    - Create dynamic total amount calculation based on selections
    - Add select all/none functionality for user convenience
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_

  - [x] 7.2 Implement partial win logic and validation
    - Write night selection validation (minimum stay requirements)
    - Implement pricing calculation for selected night combinations
    - Create selection state management with undo/redo capability
    - Add selection persistence during navigation
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 7.3 Create partial win page and navigation
    - Write /dashboard/winners/partial/[auctionId] page
    - Implement data fetching for partial win details
    - Create navigation flow to payment or decline handling
    - Add session timeout handling for partial selections
    - _Requirements: 3.1, 3.5, 3.6_

- [x] 8. Implement fallback mechanism for declined offers
  - [x] 8.1 Create decline handling logic
    - Write decline confirmation dialog with clear messaging
    - Implement API call to decline partial offers
    - Create fallback trigger to notify next bidders
    - Add decline reason tracking for analytics
    - _Requirements: 3.6, 4.1, 4.2_

  - [x] 8.2 Build second chance offer components
    - Write SecondChanceOfferModal with countdown timer
    - Implement offer details display with property information
    - Create accept/decline actions with immediate feedback
    - Add timeout handling with automatic decline
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 9. Create ZaloPay payment integration component
  - [x] 9.1 Build ZaloPay payment component


    - Write ZaloPayPayment component with payment initiation
    - Implement redirect to ZaloPay gateway with proper URL handling
    - Create loading states during payment creation
    - Add error handling for payment creation failures
    - _Requirements: 5.1, 5.2, 7.1, 7.2_

  - [x] 9.2 Create payment processing page
    - Write /dashboard/payment/zalopay/[sessionId] page
    - Implement payment session validation and security checks
    - Create payment summary display with booking details
    - Add payment cancellation handling and cleanup
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Build payment verification and confirmation system
  - [x] 10.1 Create payment status verification component
    - Write PaymentStatusVerifier with automatic status polling
    - Implement callback URL handling for ZaloPay returns
    - Create status verification retry logic with exponential backoff
    - Add payment verification timeout handling
    - _Requirements: 5.3, 5.4, 5.7, 7.3, 7.4_

  - [x] 10.2 Build payment confirmation page
    - Write /dashboard/payment/confirmation page with status display
    - Implement success/failure state handling with appropriate messaging
    - Create booking confirmation display with reference numbers
    - Add navigation to booking details and conversation threads
    - _Requirements: 5.5, 6.1, 6.2, 6.3_

- [x] 11. Create booking creation and confirmation system
  - [x] 11.1 Implement booking creation logic
    - Write booking creation API integration after successful payment
    - Implement calendar update logic for booked dates
    - Create booking reference number generation and tracking
    - Add booking creation error handling and recovery
    - _Requirements: 2.5, 6.3, 6.4, 7.5_

  - [x] 11.2 Build booking confirmation components
    - Write BookingConfirmation component with complete booking details
    - Implement confirmation email trigger and status display
    - Create host-guest conversation thread initialization
    - Add booking management navigation and quick actions
    - _Requirements: 6.1, 6.2, 6.5, 6.6_

- [x] 12. Create winner dashboard and management interface


  - [x] 12.1 Build winners dashboard page

    - Write /dashboard/winners page with all winning bids display
    - Implement filtering and sorting for different win types and statuses
    - Create quick action buttons for pending payments
    - Add winner statistics and payment deadline tracking
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 3.1_

  - [x] 12.2 Create winner management utilities
    - Write winner data aggregation and display utilities
    - Implement winner status tracking and updates
    - Create winner notification management and history
    - Add winner analytics and reporting components
    - _Requirements: 1.4, 1.5, 6.2, 6.3_

- [x] 13. Implement comprehensive error handling and recovery
  - [x] 13.1 Create payment error handling system
    - Write PaymentErrorHandler class with error classification
    - Implement error recovery strategies for different failure types
    - Create user-friendly error messages and recovery options
    - Add error logging and monitoring integration
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 13.2 Build error recovery components
    - Write error boundary components for payment flows
    - Implement retry mechanisms with user feedback
    - Create fallback UI states for critical errors
    - Add customer support integration for unrecoverable errors
    - _Requirements: 7.1, 7.2, 7.6, 7.7_

- [ ] 14. Create comprehensive testing suite
  - [ ] 14.1 Write unit tests for payment components
    - Create tests for all payment-related components and utilities
    - Write tests for WebSocket message handling and state management
    - Implement tests for winner selection logic and calculations
    - Add tests for error handling and recovery mechanisms
    - _Requirements: All requirements validation_

  - [ ] 14.2 Build integration tests for payment flows
    - Write end-to-end tests for complete payment workflows
    - Create tests for WebSocket notification delivery and handling
    - Implement tests for ZaloPay integration and callback handling
    - Add tests for booking creation and confirmation flows
    - _Requirements: All requirements validation_

- [ ] 15. Integrate and wire all components together
  - [ ] 15.1 Connect payment flow components
    - Wire winner notifications to confirmation screens
    - Connect confirmation screens to payment processing
    - Integrate payment processing with verification and booking creation
    - Add navigation flow between all payment-related pages
    - _Requirements: All requirements integration_

  - [ ] 15.2 Final integration and testing
    - Integrate all components into existing dashboard navigation
    - Connect WebSocket notifications to existing notification system
    - Test complete user journeys from auction win to booking confirmation
    - Add final polish and user experience improvements
    - _Requirements: All requirements validation and integration_