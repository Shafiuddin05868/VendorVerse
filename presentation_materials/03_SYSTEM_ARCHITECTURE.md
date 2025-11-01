# VendorVerse - System Architecture

This document provides a comprehensive view of the VendorVerse system architecture, including all components, integrations, and data flow.

---

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Customer[Customer Web App<br/>React + Redux<br/>Port 3000]
        Dashboard[Admin/Seller Dashboard<br/>React + Redux + Charts<br/>Port 3001]
    end

    subgraph "API Gateway"
        Express[Express.js Server<br/>Node.js Runtime<br/>Port 5000]
    end

    subgraph "Authentication Layer"
        JWT[JWT Middleware<br/>Token Validation<br/>Role-based Access]
    end

    subgraph "Business Logic Layer"
        AuthController[Auth Controllers<br/>Login/Register/Profile]
        ProductController[Product Controllers<br/>CRUD Operations]
        OrderController[Order Controllers<br/>Order Management]
        PaymentController[Payment Controllers<br/>Stripe Integration]
        ChatController[Chat Controllers<br/>Messaging]
        DashboardController[Dashboard Controllers<br/>Analytics]
    end

    subgraph "Data Access Layer"
        Mongoose[Mongoose ODM<br/>Schema Validation<br/>Query Builder]
    end

    subgraph "Database Layer"
        MongoDB[(MongoDB Atlas<br/>Cloud Database<br/>18 Collections)]
    end

    subgraph "External Services"
        Stripe[Stripe API<br/>Payment Gateway<br/>Connect Platform]
        Cloudinary[Cloudinary CDN<br/>Image Storage<br/>Image Optimization]
        SocketIO[Socket.IO Server<br/>WebSocket<br/>Real-time Chat]
    end

    subgraph "Real-time Layer"
        WebSocket[WebSocket Connections<br/>Customer-Seller Chat<br/>Admin-Seller Chat]
    end

    Customer -->|HTTP/HTTPS| Express
    Dashboard -->|HTTP/HTTPS| Express
    Customer <-->|WebSocket| SocketIO
    Dashboard <-->|WebSocket| SocketIO

    Express --> JWT
    JWT --> AuthController
    JWT --> ProductController
    JWT --> OrderController
    JWT --> PaymentController
    JWT --> ChatController
    JWT --> DashboardController

    AuthController --> Mongoose
    ProductController --> Mongoose
    OrderController --> Mongoose
    PaymentController --> Mongoose
    ChatController --> Mongoose
    DashboardController --> Mongoose

    Mongoose --> MongoDB

    ProductController --> Cloudinary
    AuthController --> Cloudinary
    DashboardController --> Cloudinary

    PaymentController --> Stripe
    OrderController --> Stripe

    ChatController --> SocketIO
    SocketIO --> WebSocket

    style Customer fill:#e1f5ff
    style Dashboard fill:#e1f5ff
    style Express fill:#90EE90
    style MongoDB fill:#13AA52
    style Stripe fill:#635BFF,color:#fff
    style Cloudinary fill:#3448C5,color:#fff
    style SocketIO fill:#010101,color:#fff
```

---

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend - Customer App Port 3000"
        CA1[Pages<br/>Home, Shop, Product Details<br/>Cart, Checkout, Dashboard]
        CA2[Redux Store<br/>State Management<br/>Auth, Cart, Order]
        CA3[API Layer<br/>Axios Interceptors<br/>JWT Token Management]
        CA4[Components<br/>Header, Footer, ProductCard<br/>Carousel, Rating]
    end

    subgraph "Frontend - Dashboard Port 3001"
        DA1[Admin Views<br/>Dashboard, Sellers, Orders<br/>Categories, Payments]
        DA2[Seller Views<br/>Products, Orders, Payments<br/>Chat, Profile]
        DA3[Redux Store<br/>Auth, Products, Orders<br/>Dashboard Analytics]
        DA4[Charts<br/>ApexCharts<br/>Revenue, Sales Analytics]
    end

    subgraph "Backend - Express Server Port 5000"
        subgraph "Routes"
            R1[Auth Routes<br/>/api/admin-login<br/>/api/seller-register]
            R2[Home Routes<br/>/api/home/get-products<br/>/api/home/query-products]
            R3[Order Routes<br/>/api/order/place-order<br/>/api/admin/orders]
            R4[Payment Routes<br/>/api/payment/*<br/>Stripe Integration]
            R5[Chat Routes<br/>/api/chat/*<br/>Messaging]
        end

        subgraph "Middleware"
            M1[Auth Middleware<br/>JWT Verification<br/>Role Checking]
            M2[Error Handler<br/>Global Error Handling]
            M3[CORS<br/>Cross-Origin Config]
            M4[Body Parser<br/>JSON/Form Data]
        end

        subgraph "Controllers"
            C1[Auth Controllers]
            C2[Home Controllers]
            C3[Order Controllers]
            C4[Payment Controllers]
            C5[Chat Controllers]
            C6[Dashboard Controllers]
        end

        subgraph "Models 18 Schemas"
            MOD1[User Models<br/>Admin, Seller, Customer]
            MOD2[Product Models<br/>Product, Category, Review]
            MOD3[Order Models<br/>CustomerOrder, AuthOrder]
            MOD4[Payment Models<br/>Stripe, Wallets, Withdrawals]
            MOD5[Chat Models<br/>Messages, Relationships]
        end

        subgraph "Utils"
            U1[Database Connection<br/>MongoDB URI]
            U2[Token Generator<br/>JWT Creation]
            U3[Response Handler<br/>Standardized Responses]
            U4[Query Builder<br/>Product Search/Filter]
        end
    end

    CA3 --> R1
    CA3 --> R2
    CA3 --> R3
    DA3 --> R1
    DA3 --> R4
    DA3 --> R5

    R1 --> M1
    R2 --> M1
    R3 --> M1
    R4 --> M1
    R5 --> M1

    M1 --> C1
    M1 --> C2
    M1 --> C3
    M1 --> C4
    M1 --> C5
    M1 --> C6

    C1 --> MOD1
    C2 --> MOD2
    C3 --> MOD3
    C4 --> MOD4
    C5 --> MOD5
    C6 --> MOD1
    C6 --> MOD2
    C6 --> MOD3
```

---

## Data Flow Architecture

### 1. Authentication Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ExpressAPI
    participant JWT
    participant MongoDB
    participant Cookie

    User->>Frontend: Enter Credentials
    Frontend->>ExpressAPI: POST /api/customer/customer-login<br/>{email, password}
    ExpressAPI->>MongoDB: Find User by Email
    MongoDB-->>ExpressAPI: User Document
    ExpressAPI->>ExpressAPI: bcrypt.compare(password, hash)
    alt Password Valid
        ExpressAPI->>JWT: Generate Token<br/>{id, role}, 7d expiry
        JWT-->>ExpressAPI: JWT Token
        ExpressAPI->>Cookie: Set accessToken Cookie
        ExpressAPI-->>Frontend: {success: true, token, user}
        Frontend->>Frontend: Store in Redux
        Frontend-->>User: Redirect to Dashboard
    else Password Invalid
        ExpressAPI-->>Frontend: {error: "Invalid credentials"}
        Frontend-->>User: Show Error Message
    end
```

### 2. Product Search & Discovery Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ExpressAPI
    participant QueryBuilder
    participant MongoDB

    User->>Frontend: Search "laptop"
    User->>Frontend: Filter: Category=Electronics, Price=500-1000
    Frontend->>ExpressAPI: GET /api/home/query-products?<br/>search=laptop&category=Electronics&<br/>lowPrice=500&highPrice=1000&sortBy=rating
    ExpressAPI->>QueryBuilder: Build Query
    QueryBuilder->>QueryBuilder: Text Search Weight<br/>name:5, category:4, brand:3, desc:2
    QueryBuilder->>MongoDB: Aggregation Pipeline<br/>$match, $sort, $skip, $limit
    MongoDB-->>QueryBuilder: Matching Products
    QueryBuilder-->>ExpressAPI: Filtered Results
    ExpressAPI-->>Frontend: {products: [], totalProducts: 45}
    Frontend-->>User: Display Product Grid with Pagination
```

### 3. Order Placement & Payment Data Flow

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant ExpressAPI
    participant MongoDB
    participant Stripe
    participant SellerWallet

    Customer->>Frontend: Click "Place Order"
    Frontend->>ExpressAPI: POST /api/home/order/place-order<br/>{products, shippingInfo}

    ExpressAPI->>MongoDB: Create CustomerOrder<br/>payment_status: unpaid
    MongoDB-->>ExpressAPI: Order Created (orderId)

    ExpressAPI->>ExpressAPI: Split Order by Seller
    loop For Each Seller
        ExpressAPI->>MongoDB: Create AuthOrder<br/>Link to CustomerOrder
    end

    ExpressAPI->>MongoDB: Clear Cart Items
    ExpressAPI-->>Frontend: {orderId, totalPrice}

    Frontend->>Frontend: Start 15s Timer
    Frontend->>ExpressAPI: POST /api/order/create-payment<br/>{orderId, amount}

    ExpressAPI->>Stripe: Create Payment Intent
    Stripe-->>ExpressAPI: Client Secret
    ExpressAPI-->>Frontend: {clientSecret}

    Frontend->>Stripe: Stripe Checkout (Card Details)
    Stripe-->>Frontend: Payment Success

    Frontend->>ExpressAPI: GET /api/order/confirm/:orderId

    ExpressAPI->>MongoDB: Update CustomerOrder<br/>payment_status: paid
    ExpressAPI->>MongoDB: Update All AuthOrders<br/>payment_status: paid

    loop For Each Seller
        ExpressAPI->>SellerWallet: Add to Seller Wallet<br/>amount - platform_fee
        ExpressAPI->>MongoDB: Create Wallet Entry
    end

    ExpressAPI->>MongoDB: Create MyShop Wallet<br/>platform_fee
    ExpressAPI-->>Frontend: {success: true}
    Frontend-->>Customer: Order Confirmed!
```

### 4. Real-time Chat Data Flow

```mermaid
sequenceDiagram
    participant Customer
    participant CustomerApp
    participant SocketIO
    participant SellerApp
    participant Seller
    participant MongoDB

    Customer->>CustomerApp: Open Chat with Seller
    CustomerApp->>SocketIO: socket.emit('add_user', customerId)
    SocketIO->>SocketIO: Add to allCustomer[]

    Customer->>CustomerApp: Type Message
    CustomerApp->>MongoDB: POST /api/chat/customer/send-message-to-seller
    MongoDB-->>CustomerApp: Message Saved

    CustomerApp->>SocketIO: socket.emit('send_customer_message', msg)

    SocketIO->>SocketIO: Find Seller Socket by receverId
    SocketIO->>SellerApp: socket.emit('customer_message', msg)

    SellerApp-->>Seller: Show Message Notification
    Seller->>SellerApp: View Message

    Seller->>SellerApp: Type Reply
    SellerApp->>MongoDB: POST /api/chat/seller/send-message-to-customer
    MongoDB-->>SellerApp: Message Saved

    SellerApp->>SocketIO: socket.emit('send_seller_message', msg)
    SocketIO->>CustomerApp: socket.emit('seller_message', msg)

    CustomerApp-->>Customer: Show Reply in Real-time
```

---

## Technology Stack Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        PL1[React 18.2.0<br/>Component-based UI]
        PL2[React Router DOM<br/>Client-side Routing]
        PL3[TailwindCSS<br/>Utility-first Styling]
        PL4[React Icons<br/>Icon Library]
    end

    subgraph "State Management Layer"
        SM1[Redux Toolkit 2.0.1<br/>Global State]
        SM2[Redux Thunk<br/>Async Actions]
        SM3[React Redux<br/>React Bindings]
    end

    subgraph "API Communication Layer"
        AC1[Axios<br/>HTTP Client]
        AC2[Socket.IO Client<br/>WebSocket]
        AC3[Stripe React<br/>Payment UI]
    end

    subgraph "Server Layer"
        SL1[Node.js<br/>Runtime Environment]
        SL2[Express.js 4.18.2<br/>Web Framework]
        SL3[Socket.IO Server 4.7.2<br/>Real-time Engine]
    end

    subgraph "Authentication Layer"
        AL1[JWT jsonwebtoken 9.0.2<br/>Token Generation]
        AL2[bcrypt 5.1.1<br/>Password Hashing]
        AL3[cookie-parser<br/>Cookie Management]
    end

    subgraph "Data Access Layer"
        DAL1[Mongoose 8.0.3<br/>MongoDB ODM]
        DAL2[Query Builder<br/>Complex Queries]
        DAL3[Aggregation Pipeline<br/>Data Processing]
    end

    subgraph "Database Layer"
        DB1[(MongoDB Atlas<br/>Cloud NoSQL Database)]
    end

    subgraph "External Integration Layer"
        EI1[Stripe 14.18.0<br/>Payment Processing]
        EI2[Cloudinary 1.41.0<br/>Image CDN]
    end

    PL1 --> SM1
    PL2 --> SM1
    SM1 --> AC1
    AC1 --> SL2
    AC2 --> SL3
    AC3 --> EI1

    SL2 --> AL1
    SL2 --> AL2
    SL2 --> DAL1

    DAL1 --> DB1
    SL2 --> EI1
    SL2 --> EI2
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Deployment"
        CDeploy1[Vercel/Netlify<br/>Customer Frontend<br/>Static Hosting]
        CDeploy2[Vercel/Netlify<br/>Dashboard Frontend<br/>Static Hosting]
    end

    subgraph "Server Deployment"
        SDeploy1[Heroku/Railway/AWS<br/>Express API Server<br/>Node.js Runtime]
    end

    subgraph "Database"
        DBDeploy1[(MongoDB Atlas<br/>Cloud Cluster<br/>Auto-scaling)]
    end

    subgraph "CDN & Storage"
        CDN1[Cloudinary<br/>Global CDN<br/>Image Delivery]
    end

    subgraph "Payment Gateway"
        PG1[Stripe<br/>PCI Compliant<br/>Secure Payment]
    end

    subgraph "Environment Variables"
        ENV1[.env File<br/>DB_URL<br/>SECRET<br/>STRIPE_KEY<br/>CLOUDINARY_CONFIG]
    end

    CDeploy1 -->|HTTPS| SDeploy1
    CDeploy2 -->|HTTPS| SDeploy1
    SDeploy1 --> ENV1
    SDeploy1 --> DBDeploy1
    SDeploy1 --> CDN1
    SDeploy1 --> PG1
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        FS1[JWT Token Storage<br/>HTTP-only Cookies]
        FS2[CORS Headers<br/>Whitelisted Origins]
        FS3[XSS Prevention<br/>React Sanitization]
    end

    subgraph "API Security"
        AS1[Auth Middleware<br/>Token Validation]
        AS2[Role-based Access<br/>Admin/Seller/Customer]
        AS3[Rate Limiting<br/>Future Implementation]
    end

    subgraph "Data Security"
        DS1[Password Hashing<br/>bcrypt Salt Rounds: 10]
        DS2[Input Validation<br/>Mongoose Schemas]
        DS3[NoSQL Injection Prevention<br/>Parameterized Queries]
    end

    subgraph "Payment Security"
        PS1[Stripe Checkout<br/>PCI DSS Compliant]
        PS2[No Card Storage<br/>Tokenized Payments]
        PS3[HTTPS Only<br/>SSL/TLS Encryption]
    end

    subgraph "Environment Security"
        ES1[.env Variables<br/>Not in Version Control]
        ES2[API Key Rotation<br/>Regular Updates]
        ES3[MongoDB Authentication<br/>Username/Password]
    end

    FS1 --> AS1
    FS2 --> AS1
    AS1 --> AS2
    AS2 --> DS1
    DS1 --> DS2
    DS2 --> DS3
    AS1 --> PS1
    PS1 --> PS2
    PS2 --> PS3
    DS3 --> ES1
    ES1 --> ES2
    ES2 --> ES3
```

---

## File Upload Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Express
    participant Formidable
    participant Cloudinary
    participant MongoDB

    User->>Frontend: Select Image File
    Frontend->>Frontend: Validate File<br/>Type, Size
    Frontend->>Express: POST multipart/form-data
    Express->>Formidable: Parse Form Data
    Formidable-->>Express: {fields, files}

    Express->>Cloudinary: Upload Image<br/>cloudinary.uploader.upload()
    Cloudinary->>Cloudinary: Process Image<br/>Optimize, Resize
    Cloudinary-->>Express: {url, public_id}

    Express->>MongoDB: Save URL to Document<br/>product.images.push(url)
    MongoDB-->>Express: Document Updated
    Express-->>Frontend: {success: true, imageUrl}
    Frontend-->>User: Show Image Preview
```

---

## Scaling Considerations

### Horizontal Scaling
```
┌─────────────┐
│ Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┬────────┬────────┐
   │       │        │        │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│API 1│ │API 2│ │API 3│ │API 4│
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │        │        │
   └───┬───┴────────┴────────┘
       │
   ┌───▼────────────────┐
   │ MongoDB Cluster    │
   │ (Replica Set)      │
   └────────────────────┘
```

### Caching Layer (Future)
- Redis for session management
- Product cache for frequently accessed items
- API response caching

### CDN Strategy
- Cloudinary for image delivery (already implemented)
- Static asset CDN for frontend bundles
- Global edge locations for low latency

---

## Monitoring & Logging (Recommended)

```mermaid
graph LR
    App[Express Application]

    App --> Logger[Winston/Morgan Logger]
    App --> ErrorTracker[Sentry Error Tracking]
    App --> Analytics[Google Analytics]

    Logger --> LogStorage[Log Storage<br/>CloudWatch/Papertrail]
    ErrorTracker --> AlertSystem[Alert System<br/>Email/Slack]
    Analytics --> Dashboard[Analytics Dashboard]
```

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Customer Frontend | 3000 | http://localhost:3000 |
| Admin/Seller Dashboard | 3001 | http://localhost:3001 |
| Express API | 5000 | http://localhost:5000 |
| MongoDB | 27017 | mongodb+srv://... (Atlas Cloud) |
| Socket.IO | 5000 | ws://localhost:5000 (Same as API) |

---

## Environment Configuration

```
Backend (.env)
├── PORT=5000
├── DB_URL=mongodb+srv://...
├── SECRET=theDominators
├── STRIPE_SECRET_KEY=sk_test_...
├── cloud_name=dq0szn0al
├── api_key=386154179566863
├── api_secret=wgRgsA2bdUVv9fqAB_-07O6bey4
├── CLIENT_URL=http://localhost:3000
└── DASHBOARD_URL=http://localhost:3001

Frontend (React Environment)
├── REACT_APP_API_URL=http://localhost:5000
└── REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## API Endpoint Categories

| Category | Endpoints | Protected | Main Purpose |
|----------|-----------|-----------|--------------|
| Auth | 8 | Mixed | Login, Register, Logout |
| Home/Products | 12 | No | Public product browsing |
| Cart/Wishlist | 8 | Yes | Shopping cart management |
| Orders | 15 | Yes | Order placement & tracking |
| Payment | 6 | Yes | Stripe integration |
| Dashboard | 8 | Yes | Analytics & stats |
| Chat | 8 | Yes | Real-time messaging |
| Category | 4 | Yes (Admin) | Category CRUD |
| Seller Mgmt | 6 | Yes (Admin) | Seller approval |

**Total API Endpoints: 50+**

---

**Generated for VendorVerse Final Semester Project Presentation**
