# VendorVerse - API Documentation Summary

Complete reference of all API endpoints organized by functionality.

---

## API Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## Authentication Headers

### For Protected Routes
```http
Cookie: accessToken=<JWT_TOKEN>
```

### JWT Token Structure
```json
{
  "id": "user_id",
  "role": "admin|seller|customer"
}
```

**Token Expiry**: 7 days

---

## 1. AUTHENTICATION ENDPOINTS

### Admin Authentication

#### POST `/admin-login`
**Description**: Admin login endpoint
**Access**: Public
**Request Body**:
```json
{
  "email": "admin@vendorverse.com",
  "password": "admin123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login Success"
}
```

---

### Seller Authentication

#### POST `/seller-register`
**Description**: Seller registration
**Access**: Public
**Request Body**:
```json
{
  "name": "John's Electronics",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Register Success"
}
```
**Notes**:
- Status set to 'pending' by default
- Requires admin approval

---

#### POST `/seller-login`
**Description**: Seller login
**Access**: Public
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Customer Authentication

#### POST `/customer/customer-register`
**Description**: Customer registration
**Access**: Public
**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

#### POST `/customer/customer-login`
**Description**: Customer login
**Access**: Public

#### GET `/customer/logout`
**Description**: Customer logout
**Access**: Protected (Customer)

---

### Common Authentication Endpoints

#### GET `/get-user`
**Description**: Get authenticated user info
**Access**: Protected (All roles)
**Response**:
```json
{
  "userInfo": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "customer|seller|admin",
    "image": "https://cloudinary.com/...",
    "shopInfo": {} // for sellers only
  }
}
```

#### POST `/profile-image-upload`
**Description**: Upload profile/shop image
**Access**: Protected (Seller/Admin)
**Content-Type**: `multipart/form-data`
**Request**:
```
image: <file>
```

#### POST `/profile-info-add`
**Description**: Add shop information
**Access**: Protected (Seller)
**Request Body**:
```json
{
  "shopName": "John's Electronics",
  "division": "California",
  "district": "Los Angeles",
  "subDistrict": "Downtown"
}
```

#### POST `/change-password`
**Description**: Change user password
**Access**: Protected (All roles)
**Request Body**:
```json
{
  "oldPassword": "old123",
  "newPassword": "new123"
}
```

#### GET `/logout`
**Description**: Logout (Seller/Admin)
**Access**: Protected

---

## 2. CATEGORY ENDPOINTS

#### POST `/category-add`
**Description**: Add new category
**Access**: Protected (Admin)
**Content-Type**: `multipart/form-data`
**Request**:
```
name: Electronics
image: <file>
```

#### GET `/category-get`
**Description**: Get all categories
**Access**: Protected (Admin)
**Response**:
```json
{
  "categorys": [
    {
      "_id": "category_id",
      "name": "Electronics",
      "image": "https://cloudinary.com/...",
      "slug": "electronics"
    }
  ]
}
```

#### PUT `/category-update/:id`
**Description**: Update category
**Access**: Protected (Admin)

#### DELETE `/category/:id`
**Description**: Delete category
**Access**: Protected (Admin)

---

## 3. PRODUCT ENDPOINTS

### Seller Product Management

#### POST `/product-add`
**Description**: Add new product
**Access**: Protected (Seller)
**Content-Type**: `multipart/form-data`
**Request**:
```
name: iPhone 15 Pro
description: Latest iPhone model
category: Electronics
brand: Apple
price: 999
stock: 50
discount: 10
images: <file1>, <file2>, <file3>
shopName: John's Electronics
```

#### GET `/products-get`
**Description**: Get seller's products
**Access**: Protected (Seller)
**Query Params**:
- `page`: Page number (default: 1)
- `searchValue`: Search term
- `parPage`: Items per page (default: 20)

#### GET `/product-get/:productId`
**Description**: Get single product details
**Access**: Protected (Seller)

#### POST `/product-update`
**Description**: Update product details
**Access**: Protected (Seller)
**Request Body**:
```json
{
  "productId": "product_id",
  "name": "Updated Name",
  "price": 899,
  "stock": 45,
  "discount": 15,
  "category": "Electronics",
  "brand": "Apple",
  "description": "Updated description"
}
```

#### POST `/product-image-update`
**Description**: Update product images
**Access**: Protected (Seller)
**Content-Type**: `multipart/form-data`

---

### Public Product Endpoints

#### GET `/home/get-categorys`
**Description**: Get all categories (public)
**Access**: Public
**Response**:
```json
{
  "categorys": [...]
}
```

#### GET `/home/get-products`
**Description**: Get featured products
**Access**: Public
**Response**:
```json
{
  "products": [...],
  "latest_product": [...],
  "topRated_product": [...],
  "discount_product": [...]
}
```

#### GET `/home/price-range-latest-product`
**Description**: Get price range and latest products
**Access**: Public
**Response**:
```json
{
  "latest_product": [...],
  "priceRange": {
    "low": 10,
    "high": 5000
  }
}
```

#### GET `/home/query-products`
**Description**: Search and filter products
**Access**: Public
**Query Params**:
- `category`: Category name
- `rating`: Minimum rating
- `lowPrice`: Minimum price
- `highPrice`: Maximum price
- `sortBy`: 'low-to-high' | 'high-to-low'
- `pageNumber`: Page number
- `searchValue`: Search text

**Response**:
```json
{
  "products": [...],
  "totalProduct": 125,
  "parPage": 12
}
```

#### GET `/home/product-details/:slug`
**Description**: Get product details by slug
**Access**: Public
**Response**:
```json
{
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "images": ["url1", "url2"],
    "price": 999,
    "discount": 10,
    "stock": 50,
    "rating": 4.5,
    "description": "...",
    "category": "Electronics",
    "brand": "Apple",
    "shopName": "John's Electronics"
  },
  "relatedProducts": [...],
  "moreProducts": [...]
}
```

---

## 4. SHOPPING CART ENDPOINTS

#### POST `/home/product/add-to-card`
**Description**: Add product to cart
**Access**: Public (uses userId from request)
**Request Body**:
```json
{
  "userId": "customer_id",
  "productId": "product_id",
  "quantity": 2
}
```

#### GET `/home/product/get-card-product/:userId`
**Description**: Get cart items
**Access**: Public
**Response**:
```json
{
  "card_products": [
    {
      "_id": "cart_id",
      "userId": "customer_id",
      "productId": {
        "name": "Product Name",
        "price": 100,
        "images": ["url"],
        "discount": 10
      },
      "quantity": 2
    }
  ],
  "price": 180,
  "card_product_count": 5,
  "shipping_fee": 20,
  "outofstock_product": 1,
  "buy_product_item": 4
}
```

#### DELETE `/home/product/delete-card-product/:card_id`
**Description**: Remove item from cart
**Access**: Public

#### PUT `/home/product/quantity-inc/:card_id`
**Description**: Increase cart item quantity
**Access**: Public

#### PUT `/home/product/quantity-dec/:card_id`
**Description**: Decrease cart item quantity
**Access**: Public

---

## 5. WISHLIST ENDPOINTS

#### POST `/home/product/add-to-wishlist`
**Description**: Add product to wishlist
**Access**: Public
**Request Body**:
```json
{
  "userId": "customer_id",
  "productId": "product_id",
  "name": "Product Name",
  "price": 100,
  "slug": "product-slug",
  "discount": 10,
  "image": "image_url",
  "rating": 4
}
```

#### GET `/home/product/get-wishlist-products/:userId`
**Description**: Get wishlist items
**Access**: Public

#### DELETE `/home/product/remove-wishlist-product/:wishlistId`
**Description**: Remove from wishlist
**Access**: Public

---

## 6. ORDER ENDPOINTS

### Customer Order Endpoints

#### POST `/home/order/place-order`
**Description**: Place new order
**Access**: Public
**Request Body**:
```json
{
  "price": 500,
  "products": [
    {
      "sellerId": "seller_id",
      "shopName": "Shop Name",
      "price": 250,
      "products": [
        {
          "_id": "product_id",
          "name": "Product Name",
          "quantity": 2,
          "productInfo": {...}
        }
      ]
    }
  ],
  "shipping_fee": 20,
  "shippingInfo": {
    "name": "John Doe",
    "address": "123 Main St",
    "phone": "1234567890",
    "post": "12345",
    "province": "State",
    "city": "City",
    "area": "Area"
  },
  "userId": "customer_id"
}
```
**Response**:
```json
{
  "orderId": "order_id",
  "message": "Order placed successfully"
}
```

#### POST `/order/create-payment`
**Description**: Create Stripe payment
**Access**: Public
**Request Body**:
```json
{
  "price": 520
}
```
**Response**:
```json
{
  "clientSecret": "pi_xxx_secret_yyy"
}
```

#### GET `/order/confirm/:orderId`
**Description**: Confirm order after payment
**Access**: Public
**Actions**:
- Updates payment_status to 'paid'
- Distributes funds to seller wallets
- Updates platform wallet

#### GET `/home/coustomer/get-dashboard-data/:userId`
**Description**: Get customer dashboard data
**Access**: Public
**Response**:
```json
{
  "recentOrders": [...],
  "pendingOrder": 2,
  "totalOrder": 15,
  "cancelledOrder": 1
}
```

#### GET `/home/coustomer/get-orders/:customerId/:status`
**Description**: Get customer orders by status
**Access**: Public
**Params**:
- status: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

#### GET `/home/coustomer/get-order-details/:orderId`
**Description**: Get order details
**Access**: Public

---

### Seller Order Endpoints

#### GET `/seller/orders/:sellerId`
**Description**: Get seller orders
**Access**: Protected (Seller)
**Query Params**:
- `page`: Page number
- `searchValue`: Search term
- `parPage`: Items per page

#### GET `/seller/order/:orderId`
**Description**: Get order details
**Access**: Protected (Seller)

#### PUT `/seller/order-status/update/:orderId`
**Description**: Update order delivery status
**Access**: Protected (Seller)
**Request Body**:
```json
{
  "delivery_status": "processing|shipped|delivered|cancelled"
}
```

---

### Admin Order Endpoints

#### GET `/admin/orders`
**Description**: Get all platform orders
**Access**: Protected (Admin)
**Query Params**:
- `page`: Page number
- `searchValue`: Search term
- `parPage`: Items per page

#### GET `/admin/order/:orderId`
**Description**: Get order details
**Access**: Protected (Admin)

#### PUT `/admin/order-status/update/:orderId`
**Description**: Update order status (admin override)
**Access**: Protected (Admin)

---

## 7. REVIEW ENDPOINTS

#### POST `/home/customer/submit-review`
**Description**: Submit product review
**Access**: Public
**Request Body**:
```json
{
  "productId": "product_id",
  "name": "Customer Name",
  "rating": 5,
  "review": "Great product!"
}
```
**Actions**:
- Creates review
- Updates product average rating

#### GET `/home/customer/get-reviews/:productId`
**Description**: Get product reviews
**Access**: Public
**Response**:
```json
{
  "reviews": [
    {
      "_id": "review_id",
      "name": "Customer Name",
      "rating": 5,
      "review": "Great product!",
      "date": "2024-01-15"
    }
  ]
}
```

---

## 8. SELLER MANAGEMENT ENDPOINTS (Admin)

#### GET `/request-seller-get`
**Description**: Get pending seller requests
**Access**: Protected (Admin)
**Response**:
```json
{
  "sellers": [
    {
      "_id": "seller_id",
      "name": "Shop Name",
      "email": "email@example.com",
      "status": "pending",
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### GET `/get-seller/:sellerId`
**Description**: Get seller details
**Access**: Protected (Admin)

#### POST `/seller-status-update`
**Description**: Update seller status
**Access**: Protected (Admin)
**Request Body**:
```json
{
  "sellerId": "seller_id",
  "status": "active|deactive"
}
```

#### GET `/get-sellers`
**Description**: Get active sellers
**Access**: Protected (Admin)
**Query Params**:
- `page`: Page number
- `searchValue`: Search term
- `parPage`: Items per page

#### GET `/get-deactive-sellers`
**Description**: Get deactivated sellers
**Access**: Protected (Admin)

---

## 9. PAYMENT ENDPOINTS

### Stripe Connect (Seller)

#### GET `/payment/create-stripe-connect-account`
**Description**: Create Stripe Connect account
**Access**: Protected (Seller)
**Response**:
```json
{
  "url": "https://connect.stripe.com/express/oauth/authorize?...",
  "message": "Redirect to Stripe onboarding"
}
```
**Actions**:
- Creates Stripe Express account
- Generates account link
- Creates activation code
- Saves to database

#### PUT `/payment/active-stripe-connect-account/:activeCode`
**Description**: Activate Stripe account
**Access**: Protected (Seller)
**Actions**:
- Verifies activation code
- Updates seller payment status to 'active'

---

### Seller Payment Dashboard

#### GET `/payment/seller-payment-details/:sellerId`
**Description**: Get payment dashboard data
**Access**: Protected (Seller)
**Response**:
```json
{
  "totalSale": 5000,
  "availableAmount": 3500,
  "pendingAmount": 1000,
  "successWithdrowal": 500,
  "pendingWithdrowal": 1000
}
```

---

### Withdrawal Requests

#### POST `/payment/withdrowal-request`
**Description**: Request withdrawal
**Access**: Protected (Seller)
**Request Body**:
```json
{
  "sellerId": "seller_id",
  "amount": 1000
}
```
**Actions**:
- Creates withdrawal request
- Status set to 'pending'
- Deducts from available balance

#### GET `/payment/request`
**Description**: Get all withdrawal requests
**Access**: Protected (Admin)
**Response**:
```json
{
  "withdrowalRequest": [
    {
      "_id": "request_id",
      "sellerId": {
        "name": "Seller Name",
        "email": "email@example.com"
      },
      "amount": 1000,
      "status": "pending",
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### POST `/payment/request-confirm`
**Description**: Approve/reject withdrawal
**Access**: Protected (Admin)
**Request Body**:
```json
{
  "withdrawId": "request_id"
}
```
**Actions**:
- Transfers funds to seller Stripe account
- Updates request status to 'approved'

---

## 10. CHAT ENDPOINTS

### Customer-Seller Chat

#### POST `/chat/customer/add-customer-friend`
**Description**: Add seller to customer's chat list
**Access**: Public
**Request Body**:
```json
{
  "myId": "customer_id",
  "myFriends": ["seller_id"]
}
```

#### POST `/chat/customer/send-message-to-seller`
**Description**: Send message to seller
**Access**: Public
**Request Body**:
```json
{
  "userId": "customer_id",
  "text": "Is this product available?",
  "sellerId": "seller_id",
  "name": "Customer Name"
}
```

#### GET `/chat/seller/get-customers/:sellerId`
**Description**: Get customer chat list
**Access**: Protected (Seller)

#### GET `/chat/seller/get-customer-message/:customerId`
**Description**: Get chat messages with customer
**Access**: Protected (Seller)
**Query Params**:
- `sellerId`: Current seller ID

#### POST `/chat/seller/send-message-to-customer`
**Description**: Send message to customer
**Access**: Protected (Seller)

---

### Seller-Admin Chat

#### POST `/chat/message-send-seller-admin`
**Description**: Send message to admin
**Access**: Protected (Seller)
**Request Body**:
```json
{
  "senderName": "Seller Name",
  "senderId": "seller_id",
  "message": "Need help with payouts"
}
```

#### GET `/chat/get-admin-messages/:receverId`
**Description**: Get admin chat messages
**Access**: Protected (Seller)
**Params**: receverId = seller_id

#### GET `/chat/admin/get-sellers`
**Description**: Get sellers for chat
**Access**: Protected (Admin)

#### GET `/chat/get-seller-messages`
**Description**: Get seller messages (admin view)
**Access**: Protected (Admin)
**Query Params**:
- `receverId`: Seller ID

---

## 11. DASHBOARD ENDPOINTS

#### GET `/admin/get-dashboard-data`
**Description**: Get admin dashboard data
**Access**: Protected (Admin)
**Response**:
```json
{
  "totalSale": 50000,
  "totalProduct": 500,
  "totalSeller": 25,
  "totalOrder": 300,
  "recentOrder": [...],
  "recentMessage": [...]
}
```

#### GET `/seller/get-dashboard-data`
**Description**: Get seller dashboard data
**Access**: Protected (Seller)
**Response**:
```json
{
  "totalSale": 5000,
  "totalOrder": 50,
  "totalProduct": 25,
  "pendingOrder": 5,
  "recentOrders": [...],
  "recentMessage": [...]
}
```

---

## 12. BANNER ENDPOINTS

#### POST `/banner/add`
**Description**: Add promotional banner
**Access**: Protected (Seller)
**Content-Type**: `multipart/form-data`
**Request**:
```
productId: product_id
banner: <file>
link: /product/product-slug
```

#### GET `/banner/get/:productId`
**Description**: Get banner for product
**Access**: Protected (Seller)

#### PUT `/banner/update/:bannerId`
**Description**: Update banner
**Access**: Protected (Seller)

#### GET `/banners`
**Description**: Get all banners (for homepage)
**Access**: Public

---

## ERROR RESPONSES

### Standard Error Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

---

## API STATISTICS

- **Total Endpoints**: 50+
- **Public Endpoints**: 15
- **Protected Endpoints**: 35+
- **Admin-Only Endpoints**: 12
- **Seller-Only Endpoints**: 15
- **Customer Endpoints**: 8

---

## RATE LIMITING (Future Implementation)

```
Recommended Limits:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 200 requests/minute
- Admin endpoints: 500 requests/minute
```

---

## WEBSOCKET EVENTS (Socket.IO)

### Connection Events
- `add_user` - Customer connects
- `add_seller` - Seller connects
- `add_admin` - Admin connects
- `disconnect` - User disconnects

### Message Events
- `send_customer_message` - Customer sends message
- `customer_message` - Seller receives customer message
- `send_seller_message` - Seller sends message
- `seller_message` - Customer receives seller message
- `send_message_seller_to_admin` - Seller to admin
- `receved_seller_message` - Admin receives message
- `send_message_admin_to_seller` - Admin to seller
- `receved_admin_message` - Seller receives admin message

### Status Events
- `active_seller` - Broadcast active sellers
- `active_customer` - Broadcast active customers
- `message_seen` - Mark message as read

---

**Generated for VendorVerse Final Semester Project Presentation**
