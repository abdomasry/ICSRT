# Dashboard API Updates

## Overview
This document outlines the API updates made to support the new dashboard features, transforming from a conference-focused system to a support-focused academic services platform.

## Updated Statistics Endpoints

### `/api/dashboard-stats` (GET)
**Purpose**: Main admin dashboard statistics  
**Changes**: Completely restructured to focus on support and service metrics

**New Response Structure**:
```json
{
  // Main Stats
  "totalUsers": 1234,
  "totalTickets": 567,
  "totalServiceOrders": 890,
  "monthlyRevenue": 12500,
  
  // Content Stats  
  "activeProjects": 45,
  "pendingReviews": 12,
  "newMessages": 8,
  "totalNews": 25,
  "totalServices": 15,
  
  // Additional Stats
  "totalFAQ": 30,
  "totalTestimonials": 20,
  "totalGallery": 100,
  "totalContacts": 200,
  
  // Pending Actions
  "pendingTickets": 23,
  "pendingOrders": 15,
  
  // Recent Activity (last 30 days)
  "recentUsers": 50,
  "recentTickets": 25,
  "recentServiceOrders": 35
}
```

**Removed Fields**:
- `totalRegistrations`
- `totalPapers` 
- `totalEvents`
- `totalConferences`
- `totalSpeakers`
- `totalJournals`
- `pendingUsers`
- `pendingRegistrations`

### `/api/user-stats` (GET)
**Purpose**: User dashboard statistics  
**Changes**: Updated to align with support-focused metrics

**New Response Structure**:
```json
{
  "totalTickets": 5,
  "totalServiceOrders": 8,
  "activeProjects": 3,
  "newMessages": 2,
  "recentActivity": {
    "tickets": 2,
    "serviceOrders": 5
  }
}
```

## New Message System Endpoints

### `/api/messages` (GET)
**Purpose**: Retrieve all messages for admin dashboard  
**Response**: Array of message objects with sender/recipient info

### `/api/messages/user/:userId` (GET)  
**Purpose**: Get messages for specific user
**Parameters**: `userId` - User identifier

### `/api/messages` (POST)
**Purpose**: Send a new message
**Body**:
```json
{
  "senderId": "user123",
  "recipientId": "admin",
  "message": "Hello, I need help with...",
  "type": "support"
}
```

### `/api/messages/:id/read` (PATCH)
**Purpose**: Mark message as read
**Parameters**: `id` - Message ID

## Enhanced Support Ticket System

The existing ticket system endpoints remain unchanged but are now prominently featured in dashboard statistics:

- `GET /api/tickets` - All tickets (admin)
- `GET /api/tickets/user/:email` - User tickets  
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Ticket details
- `POST /api/tickets/:id/respond` - Admin response
- `PATCH /api/tickets/:id/status` - Update status

## Service Orders Integration

Service order endpoints are handled by the enhanced service orders API module (`enhanced-service-orders-api-simple.js`) and are now central to the dashboard metrics.

## Database Collections

### New Collections:
- `messages` - User-admin communication
- `tickets` - Support ticket system  
- `service-orders` - Service requests and orders

### Updated Collection Usage:
- Reduced emphasis on `registrations`, `papers`, `conferences`
- Increased focus on `tickets`, `service-orders`, `messages`

## Revenue Tracking

The `monthlyRevenue` field in dashboard stats is currently a mock value (12,500). To implement real revenue tracking:

1. Integrate with payment processor webhooks
2. Store payment records in `payments` collection  
3. Calculate monthly totals from actual transaction data

## Status Values

### Support Tickets:
- `open` - New ticket
- `pending` - Awaiting response  
- `in-progress` - Being worked on
- `review` - Under review
- `resolved` - Issue resolved
- `closed` - Ticket closed

### Service Orders:
- `pending` - Initial request
- `quoted` - Price quoted
- `in-progress` - Work in progress
- `review` - Under review  
- `completed` - Work completed
- `cancelled` - Order cancelled

### Messages:
- `unread` - New message
- `read` - Message read

## Migration Notes

### Frontend Changes Required:
1. Update dashboard components to use new statistics fields
2. Remove references to conference/registration metrics
3. Add support for messages and enhanced ticket system

### Backend Considerations:
1. Existing data in old collections remains accessible
2. New endpoints are additive (no breaking changes)
3. Enhanced statistics provide richer dashboard insights

## API Testing

The server includes comprehensive endpoint logging on startup:

```
=== General Statistics ===
- GET  /api/dashboard-stats (Admin dashboard statistics)
- GET  /api/user-stats (User dashboard statistics)

=== Messages & Communication ===
- GET  /api/messages (All messages for admin)
- GET  /api/messages/user/:userId (User-specific messages)  
- POST /api/messages (Send a message)
- PATCH /api/messages/:id/read (Mark message as read)

=== Support Tickets ===
- GET  /api/tickets (All tickets for admin)
- GET  /api/tickets/user/:email (User-specific tickets)
- POST /api/tickets (Create new ticket)
- Enhanced ticket management endpoints available

=== Service Orders ===
- Enhanced service order endpoints via external API module
```

## Next Steps

1. **Test New Endpoints**: Verify all new API endpoints work correctly
2. **Revenue Integration**: Implement real payment tracking for monthly revenue
3. **Dashboard Testing**: Test admin dashboard with new statistics
4. **User Dashboard**: Update user dashboard to consume new user-stats endpoint
5. **Message System**: Implement frontend for the new messaging system

## Error Handling

All new endpoints include consistent error handling:
- 400: Bad Request (missing required fields)
- 404: Not Found (resource doesn't exist)  
- 500: Internal Server Error (database/system errors)

Errors return JSON format:
```json
{
  "error": "Error description",
  "code": "ERROR_CODE"
}
```
