


## API Endpoints Outline

### 1. Authentication & User Management

- **POST /api/auth/signup**
  - Description: Register a new user (Customer or Provider) with email and password.
  - Request Body: `{ email, password, role }`
  - Response: `{ message: 'OTP sent to email' }`

- **POST /api/auth/verify-otp**
  - Description: Verify OTP for signup or login.
  - Request Body: `{ email, otp }`
  - Response: `{ token, user: { id, email, role } }`

- **POST /api/auth/login**
  - Description: Login user with email and password, sends OTP for verification.
  - Request Body: `{ email, password }`
  - Response: `{ message: 'OTP sent to email' }`

- **POST /api/auth/resend-otp**
  - Description: Resend OTP to user's email.
  - Request Body: `{ email }`
  - Response: `{ message: 'OTP sent to email' }`

- **GET /api/users/me**
  - Description: Get current authenticated user's profile.
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user: { ... } }`

- **PUT /api/users/me**
  - Description: Update current authenticated user's profile.
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ name, contactInfo, location: { city, area } }`
  - Response: `{ user: { ... } }`




### 2. Provider Profile Management

- **POST /api/providers/profile**
  - Description: Create or update provider profile details.
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ name, contactInfo, location: { city, area }, servicesOffered, pricing, profilePicture, sampleWorkPhotos }`
  - Response: `{ provider: { ... } }`

- **GET /api/providers/:id**
  - Description: Get a specific provider's public profile.
  - Response: `{ provider: { ... } }`

- **GET /api/providers**
  - Description: Get a list of all providers (for search/filter).
  - Query Params: `category, city, area, minPrice, maxPrice, minRating, sortBy, sortOrder`
  - Response: `[{ provider: { ... } }]`




### 3. Customer Dashboard

- **GET /api/customers/bookings/active**
  - Description: Get active bookings for the current customer.
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ booking: { ... } }]`

- **GET /api/customers/bookings/past**
  - Description: Get past bookings for the current customer.
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ booking: { ... } }]`

- **POST /api/customers/favorites/:providerId**
  - Description: Add a provider to customer's favorites.
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: 'Provider added to favorites' }`

- **DELETE /api/customers/favorites/:providerId**
  - Description: Remove a provider from customer's favorites.
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: 'Provider removed from favorites' }`

- **GET /api/customers/favorites**
  - Description: Get customer's favorite providers.
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ provider: { ... } }]`




### 4. Search & Filter

- **GET /api/search/providers**
  - Description: Search and filter providers based on various criteria.
  - Query Params: `category, city, area, minPrice, maxPrice, minRating, sortBy (price, rating), sortOrder (asc, desc)`
  - Response: `[{ provider: { ... } }]`




### 5. Payments & Subscriptions

- **POST /api/payments/subscribe**
  - Description: Initiate subscription for a provider.
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ paymentGateway, planId, currency }`
  - Response: `{ paymentUrl }` (for redirection to gateway)

- **POST /api/payments/webhook/:gateway**
  - Description: Webhook endpoint for payment gateway notifications (e.g., Razorpay, Stripe).
  - Request Body: (Gateway specific payload)
  - Response: `200 OK`




### 6. Real-time Chat

- **GET /api/chat/conversations**
  - Description: Get list of conversations for the authenticated user.
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ conversationId, participant1, participant2, lastMessage, lastMessageTimestamp }]`

- **GET /api/chat/conversations/:conversationId/messages**
  - Description: Get messages for a specific conversation.
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ messageId, sender, content, timestamp }]`

- **POST /api/chat/conversations/:conversationId/messages**
  - Description: Send a message in a specific conversation.
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ content }`
  - Response: `{ message: { ... } }`

- **Socket.IO Events:**
  - `sendMessage`: Client sends a message.
  - `receiveMessage`: Server broadcasts a new message to participants.
  - `joinChat`: Client joins a chat room.




### 7. Notifications

- **POST /api/notifications/send-email**
  - Description: Send an email notification (internal use by backend).
  - Request Body: `{ to, subject, body }`
  - Response: `{ message: 'Email sent' }`

- **POST /api/notifications/send-push**
  - Description: Send a push notification (internal use by backend).
  - Request Body: `{ userId, title, body, data }`
  - Response: `{ message: 'Push notification sent' }`




### 8. Reviews & Ratings

- **POST /api/reviews**
  - Description: Submit a review and rating for a provider.
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ providerId, rating, comment }`
  - Response: `{ review: { ... } }`

- **GET /api/reviews/:providerId**
  - Description: Get all reviews for a specific provider.
  - Response: `[{ review: { ... } }]`



