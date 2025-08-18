sequenceDiagram
    participant Frontend as Next.js Frontend
    participant Backend as FastAPI Backend
    participant ZaloPay as ZaloPay Gateway

    Frontend->Backend: Request to create order<br>(amount, internal order_id)
    activate Backend

    Backend->Backend: Generate app_trans_id (yymmdd_YOUR_ORDER_ID)<br>Generate app_time (Unix milliseconds)
    Backend->Backend: Construct ZaloPay Create Order payload<br>(app_id, app_trans_id, app_user, app_time, amount, item, embed_data, description, bank_code, callback_url)
    Backend->Backend: Generate HMAC-SHA256 signature (mac) using key1
    Backend->ZaloPay: POST /v2/create<br>(signed Create Order payload)
    activate ZaloPay

    ZaloPay->ZaloPay: Validate request and signature
    ZaloPay->Backend: Response (JSON with order_url)
    deactivate ZaloPay

    Backend->Frontend: order_url
    deactivate Backend

    Frontend->ZaloPay: Redirect user's browser to order_url
    activate ZaloPay

    ZaloPay->ZaloPay: User interacts with ZaloPay Gateway to complete payment

    ZaloPay->Backend: Asynchronous POST to callback_url<br>(data string, mac)
    activate Backend

    Backend->Backend: Parse data string and mac
    Backend->Backend: Verify HMAC-SHA256 signature of data string using key2 against received mac
    alt Signature Verification Fails
        Backend->ZaloPay: HTTP 400 (Cease processing)
    else Signature Verification Succeeds
        Backend->Backend: Parse data string, check return_code (1 for success)
        Backend->Backend: Find order using app_trans_id
        Backend->Backend: Update internal order status (e.g., PAID)
        Backend->Backend: Trigger order fulfillment
        Backend->ZaloPay: JSON response {"return_code": 1, "return_message": "success"} (Acknowledge receipt)
    end
    deactivate Backend

    ZaloPay->Frontend: Redirect user's browser to Redirect URL<br>(often with preliminary status query parameters)
    activate Frontend

    Frontend->Frontend: Parse redirect parameters (DO NOT TRUST FOR STATUS)
    Frontend->Backend: Request verified order status<br>(GET /api/zalopay/status/{app_trans_id})
    activate Backend

    Backend->Backend: Construct ZaloPay Query Order Status payload<br>(app_id, app_trans_id, app_time)
    Backend->Backend: Generate HMAC-SHA256 signature (mac) using key1 (app_id|app_trans_id|key1)
    Backend->ZaloPay: POST /v2/query<br>(signed Query Order Status payload)
    activate ZaloPay

    ZaloPay->Backend: Response (JSON with definitive status)
    deactivate ZaloPay

    Backend->Frontend: Verified order status
    deactivate Backend

    Frontend->Frontend: Display appropriate message to user based on verified status
    deactivate Frontend

    Backend->Backend: Background job (scheduled task) periodically queries status of PENDING orders using /v2/query (Failsafe)


ZaloPay Integration: Frontend Technical Documentation
1. Overview
This document outlines the frontend team's responsibilities for integrating the ZaloPay Payment Gateway. The frontend's role is to provide a seamless user experience by initiating the payment process, redirecting the user to ZaloPay, and displaying the final, verified result upon their return.

Core Responsibilities:

Provide a "Pay with ZaloPay" button on the checkout page.

Call the backend to create a payment transaction and receive a ZaloPay URL.

Redirect the user to the ZaloPay Gateway.

Handle the user's return to our website.

Call the backend to get the secure, final status of the transaction.

Display a clear success or failure message to the user based on the backend's response.

2. The Payment Flow: A Step-by-Step Guide
The entire process from the user's click to the final confirmation follows this sequence:

Click "Pay": The user finalizes their order and clicks the "Pay with ZaloPay" button.

Initiate Payment: The frontend sends a request to our backend's POST /api/payment/create endpoint with the order details.

Receive URL: The backend responds with a unique order_url for the ZaloPay Gateway.

Redirect: The frontend immediately redirects the user's browser to this order_url.

User Pays: The user completes the payment on the ZaloPay website or app.

Return to Site: ZaloPay redirects the user's browser back to a pre-configured redirect_url on our site (e.g., /order/confirmation). This URL will contain query parameters like status and apptransid.

Verify Status: On the redirect page, the frontend must ignore the status query parameter. It will extract the apptransid from the URL and use it to call our backend's GET /api/payment/status/{app_trans_id} endpoint.

Display Result: The backend provides the true, verified status. The frontend uses this response to show the final "Payment Successful" or "Payment Failed" message.

3. Consuming Backend APIs
The frontend will interact with two primary backend endpoints.

3.1. POST /api/payment/create
Call this endpoint to start the ZaloPay payment process.

URL: /api/payment/create

Method: POST

Request Body: A JSON object containing the order details.

{
    "amount": 50000,
    "order_info": "Payment for Order #12345"
}

Success Response Body: A JSON object containing the URL to redirect the user to.

{
    "order_url": "https://sbgateway.zalopay.vn/openinapp?order=..."
}

Action:

On button click, show a loading indicator.

Call this endpoint.

Upon receiving a successful response, immediately perform the redirect: window.location.href = response.order_url;

Example Implementation:

async function handleZaloPayPayment(amount, orderInfo) {
  document.getElementById('loading-spinner').style.display = 'block';
  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, order_info: orderInfo }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order.');
    }

    const data = await response.json();
    if (data.order_url) {
      window.location.href = data.order_url;
    } else {
       throw new Error('Order URL not received.');
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
    document.getElementById('error-message').innerText = 'Could not start payment. Please try again.';
    document.getElementById('loading-spinner').style.display = 'none';
  }
}

3.2. GET /api/payment/status/{app_trans_id}
Call this endpoint on the redirect page to get the verified transaction status.

URL: /api/payment/status/<app_trans_id>

Method: GET

How to Get app_trans_id: When ZaloPay redirects the user back to our site, the URL will look like this: https://yourdomain.com/order/confirmation?apptransid=250816_order12345&status=1.... You must parse apptransid from the URL's query string.

Success Response Body: A JSON object with the verified status.

{
    "status": "PAID" // Possible values: "PAID", "PENDING", "FAILED"
}

Action:

On the redirect page, immediately display a "Verifying your payment..." message.

Parse apptransid from the URL.

Call this endpoint.

Use the status from the response to update the UI with the final confirmation message.

Example Implementation (for the redirect page):

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const appTransId = params.get('apptransid');

  if (!appTransId) {
    document.getElementById('status-message').innerText = 'Error: Transaction ID not found.';
    return;
  }

  verifyPaymentStatus(appTransId);
});

async function verifyPaymentStatus(appTransId) {
  try {
    const response = await fetch(`/api/payment/status/${appTransId}`);
    if (!response.ok) {
      throw new Error('Status verification failed.');
    }
    const data = await response.json();

    if (data.status === 'PAID') {
      document.getElementById('status-message').innerText = 'Thank you! Your payment was successful.';
      // Add success icon, hide spinner
    } else {
      document.getElementById('status-message').innerText = 'Your payment failed or is still processing. Please contact support.';
       // Add failure icon, hide spinner
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    document.getElementById('status-message').innerText = 'We could not verify your payment status. Please contact support.';
  }
}

4. Security and Coordination
NEVER Trust the URL: The query parameters in the redirect URL (e.g., status=1) are for informational purposes only and are insecure. They can be manipulated. Do not use them to confirm the payment.

Single Source of Truth: The backend's /api/payment/status endpoint is the only source of truth for the payment's status. The UI must always reflect the response from this endpoint.

UI States: The frontend must handle several UI states gracefully:

Idle: Before the "Pay" button is clicked.

Initiating: After the "Pay" button is clicked, while waiting for the order_url (show a spinner).

Verifying: On the redirect page, while waiting for the response from the /status endpoint.

Confirmed (Success/Failure): The final state displayed to the user.