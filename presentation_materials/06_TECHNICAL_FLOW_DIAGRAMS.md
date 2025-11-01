# VendorVerse - Technical Flow Diagrams

This document contains detailed technical flow diagrams for critical system processes.

---

## 1. AUTHENTICATION FLOW

### Complete Authentication Process

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant ExpressAPI
    participant AuthMiddleware
    participant JWT
    participant bcrypt
    participant MongoDB

    rect rgb(200, 220, 255)
        Note over User,MongoDB: REGISTRATION FLOW
        User->>Frontend: Enter Registration Details<br/>(name, email, password)
        Frontend->>Frontend: Client-side Validation
        Frontend->>ExpressAPI: POST /api/customer/customer-register<br/>{name, email, password}
        ExpressAPI->>MongoDB: Check if Email Exists
        MongoDB-->>ExpressAPI: Email Lookup Result

        alt Email Already Exists
            ExpressAPI-->>Frontend: {error: "Email already registered"}
            Frontend-->>User: Show Error Message
        else Email Available
            ExpressAPI->>bcrypt: Hash Password<br/>bcrypt.hash(password, 10)
            bcrypt-->>ExpressAPI: Hashed Password
            ExpressAPI->>MongoDB: Create User Document<br/>{name, email, hashedPassword}
            MongoDB-->>ExpressAPI: User Created (userId)
            ExpressAPI->>JWT: Generate Token<br/>jwt.sign({id, role}, SECRET, {expiresIn: '7d'})
            JWT-->>ExpressAPI: JWT Token
            ExpressAPI->>Browser: Set Cookie<br/>accessToken=JWT, expires=7days
            ExpressAPI-->>Frontend: {success: true, token, user: {id, name, email, role}}
            Frontend->>Frontend: Store User in Redux
            Frontend-->>User: Redirect to Dashboard
        end
    end

    rect rgb(200, 255, 220)
        Note over User,MongoDB: LOGIN FLOW
        User->>Frontend: Enter Login Credentials<br/>(email, password)
        Frontend->>ExpressAPI: POST /api/customer/customer-login<br/>{email, password}
        ExpressAPI->>MongoDB: Find User by Email
        MongoDB-->>ExpressAPI: User Document

        alt User Not Found
            ExpressAPI-->>Frontend: {error: "User not found"}
            Frontend-->>User: Show Error
        else User Found
            ExpressAPI->>bcrypt: Compare Password<br/>bcrypt.compare(password, user.password)
            bcrypt-->>ExpressAPI: Comparison Result

            alt Password Invalid
                ExpressAPI-->>Frontend: {error: "Invalid credentials"}
                Frontend-->>User: Show Error
            else Password Valid
                ExpressAPI->>JWT: Generate New Token<br/>jwt.sign({id, role}, SECRET, {expiresIn: '7d'})
                JWT-->>ExpressAPI: JWT Token
                ExpressAPI->>Browser: Set Cookie<br/>accessToken=JWT
                ExpressAPI-->>Frontend: {success: true, token, user}
                Frontend->>Frontend: Store in Redux
                Frontend-->>User: Redirect to Dashboard
            end
        end
    end

    rect rgb(255, 220, 200)
        Note over User,MongoDB: PROTECTED ROUTE ACCESS
        User->>Frontend: Access Protected Page
        Frontend->>ExpressAPI: GET /api/protected-route<br/>Cookie: accessToken
        ExpressAPI->>AuthMiddleware: Validate Request
        AuthMiddleware->>Browser: Extract accessToken from Cookie
        Browser-->>AuthMiddleware: JWT Token

        alt Token Missing
            AuthMiddleware-->>Frontend: {error: "Please login"}
            Frontend-->>User: Redirect to Login
        else Token Present
            AuthMiddleware->>JWT: Verify Token<br/>jwt.verify(token, SECRET)
            JWT-->>AuthMiddleware: Decoded Payload {id, role}

            alt Token Invalid/Expired
                AuthMiddleware-->>Frontend: {error: "Token expired"}
                Frontend-->>User: Redirect to Login
            else Token Valid
                AuthMiddleware->>MongoDB: Find User by ID
                MongoDB-->>AuthMiddleware: User Document
                AuthMiddleware->>AuthMiddleware: Attach user to req.user
                AuthMiddleware->>ExpressAPI: next()
                ExpressAPI->>MongoDB: Execute Business Logic
                MongoDB-->>ExpressAPI: Data
                ExpressAPI-->>Frontend: {success: true, data}
                Frontend-->>User: Display Protected Content
            end
        end
    end

    rect rgb(255, 255, 200)
        Note over User,MongoDB: LOGOUT FLOW
        User->>Frontend: Click Logout
        Frontend->>ExpressAPI: GET /api/logout
        ExpressAPI->>Browser: Clear Cookie<br/>accessToken=""
        ExpressAPI-->>Frontend: {success: true}
        Frontend->>Frontend: Clear Redux State
        Frontend-->>User: Redirect to Login
    end
```

---

## 2. PAYMENT PROCESSING FLOW

### Complete Stripe Payment Integration

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant ExpressAPI
    participant MongoDB
    participant Stripe
    participant SellerStripe[Seller Stripe Account]
    participant SellerWallet
    participant PlatformWallet

    rect rgb(230, 240, 255)
        Note over Customer,PlatformWallet: STRIPE CONNECT SETUP (Seller Onboarding)
        Customer->>Frontend: Seller Logs In
        Frontend->>ExpressAPI: GET /api/payment/create-stripe-connect-account
        ExpressAPI->>Stripe: Create Express Account<br/>stripe.accounts.create({type: 'express'})
        Stripe-->>ExpressAPI: {id: 'acct_xxx', ...}
        ExpressAPI->>Stripe: Create Account Link<br/>stripe.accountLinks.create({account, return_url})
        Stripe-->>ExpressAPI: {url: 'https://connect.stripe.com/...'}
        ExpressAPI->>MongoDB: Save Stripe Account<br/>stripeModel.create({sellerId, stripeId, code: uuid()})
        ExpressAPI-->>Frontend: {url, code}
        Frontend->>SellerStripe: Redirect to Stripe Onboarding
        SellerStripe-->>Frontend: Complete KYC & Banking Info
        Frontend->>ExpressAPI: PUT /api/payment/active-stripe-connect-account/:code
        ExpressAPI->>MongoDB: Update Seller<br/>payment: 'active'
        ExpressAPI-->>Frontend: {success: true}
        Frontend-->>Customer: Payment Setup Complete!
    end

    rect rgb(255, 240, 230)
        Note over Customer,PlatformWallet: CUSTOMER PAYMENT FLOW
        Customer->>Frontend: Click "Place Order"
        Frontend->>ExpressAPI: POST /api/home/order/place-order<br/>{products, shippingInfo}

        ExpressAPI->>MongoDB: Create CustomerOrder<br/>{customerId, products, price, payment_status: 'unpaid'}
        MongoDB-->>ExpressAPI: Order Created (orderId)

        ExpressAPI->>ExpressAPI: Split Order by Seller
        loop For Each Seller in Order
            ExpressAPI->>MongoDB: Create AuthOrder<br/>{orderId, sellerId, products, payment_status: 'unpaid'}
        end

        ExpressAPI->>MongoDB: Clear Cart
        ExpressAPI-->>Frontend: {orderId, totalPrice}

        Frontend->>Frontend: Start 15-second Timer
        Frontend-->>Customer: Show Payment Page

        Customer->>Frontend: Click "Pay Now"
        Frontend->>ExpressAPI: POST /api/order/create-payment<br/>{orderId, amount}

        ExpressAPI->>Stripe: Create Payment Intent<br/>stripe.paymentIntents.create({amount, currency})
        Stripe-->>ExpressAPI: {client_secret, id}
        ExpressAPI-->>Frontend: {clientSecret}

        Frontend->>Stripe: Load Stripe Checkout<br/>stripe.confirmCardPayment(clientSecret)
        Customer->>Stripe: Enter Card Details
        Stripe->>Stripe: Process Payment
        Stripe-->>Frontend: Payment Success

        Frontend->>ExpressAPI: GET /api/order/confirm/:orderId
    end

    rect rgb(230, 255, 230)
        Note over Customer,PlatformWallet: PAYMENT CONFIRMATION & DISTRIBUTION
        ExpressAPI->>MongoDB: Update CustomerOrder<br/>payment_status: 'paid'
        ExpressAPI->>MongoDB: Update All AuthOrders<br/>payment_status: 'paid'

        ExpressAPI->>ExpressAPI: Calculate Commissions
        loop For Each Seller in Order
            ExpressAPI->>ExpressAPI: sellerAmount = productTotal * 0.95<br/>platformFee = productTotal * 0.05
            ExpressAPI->>SellerWallet: Add Funds<br/>sellerWallet.create({sellerId, amount: sellerAmount, month, year})
            ExpressAPI->>PlatformWallet: Add Commission<br/>myShopWallet.create({amount: platformFee, month, year})
        end

        ExpressAPI-->>Frontend: {success: true, message: "Order confirmed"}
        Frontend-->>Customer: Order Success Page<br/>Show Order Tracking
    end

    rect rgb(255, 230, 255)
        Note over Customer,PlatformWallet: SELLER WITHDRAWAL FLOW
        Customer->>Frontend: Seller Views Wallet Balance
        Frontend->>ExpressAPI: GET /api/payment/seller-payment-details/:sellerId
        ExpressAPI->>SellerWallet: Aggregate Balance<br/>sellerWallet.aggregate([{$match}, {$group}])
        SellerWallet-->>ExpressAPI: {availableBalance, totalEarnings, pendingWithdrawals}
        ExpressAPI-->>Frontend: Payment Dashboard Data
        Frontend-->>Customer: Show Balance

        Customer->>Frontend: Request Withdrawal (Enter Amount)
        Frontend->>ExpressAPI: POST /api/payment/withdrowal-request<br/>{sellerId, amount}

        ExpressAPI->>SellerWallet: Check Available Balance
        alt Insufficient Balance
            ExpressAPI-->>Frontend: {error: "Insufficient balance"}
        else Sufficient Balance
            ExpressAPI->>MongoDB: Create Withdrawal Request<br/>{sellerId, amount, status: 'pending'}
            ExpressAPI->>SellerWallet: Deduct from Available Balance
            ExpressAPI-->>Frontend: {success: true}
            Frontend-->>Customer: Request Submitted
        end
    end

    rect rgb(255, 245, 230)
        Note over Customer,PlatformWallet: ADMIN WITHDRAWAL APPROVAL
        Customer->>Frontend: Admin Reviews Requests
        Frontend->>ExpressAPI: GET /api/payment/request
        ExpressAPI->>MongoDB: Find Pending Withdrawals<br/>withdrowRequest.find({status: 'pending'})
        MongoDB-->>ExpressAPI: Pending Requests
        ExpressAPI-->>Frontend: Withdrawal List

        Customer->>Frontend: Approve Withdrawal
        Frontend->>ExpressAPI: POST /api/payment/request-confirm<br/>{withdrawId}

        ExpressAPI->>MongoDB: Get Seller Stripe Account<br/>stripeModel.findOne({sellerId})
        MongoDB-->>ExpressAPI: {stripeId}

        ExpressAPI->>Stripe: Create Transfer<br/>stripe.transfers.create({amount, destination: stripeId})
        Stripe-->>SellerStripe: Transfer Funds
        SellerStripe-->>Customer: Funds Available in Bank

        ExpressAPI->>MongoDB: Update Withdrawal<br/>status: 'approved'
        ExpressAPI-->>Frontend: {success: true}
        Frontend-->>Customer: Withdrawal Approved
    end
```

---

## 3. ORDER MANAGEMENT FLOW

### Order Placement, Splitting, and Tracking

```mermaid
flowchart TD
    Start([Customer Ready to Checkout]) --> ViewCart[View Shopping Cart<br/>Multiple Sellers' Products]

    ViewCart --> CartItems{Cart Items?}
    CartItems -->|Empty| EmptyCart[Show Empty Cart Message]
    CartItems -->|Has Items| ProceedCheckout[Click Proceed to Checkout]

    ProceedCheckout --> ShippingForm[Enter Shipping Information<br/>- Name, Phone<br/>- Address, City, State<br/>- Postal Code]

    ShippingForm --> ValidateShipping{Valid Shipping Info?}
    ValidateShipping -->|No| ShippingForm
    ValidateShipping -->|Yes| PlaceOrderAPI[POST /api/home/order/place-order]

    PlaceOrderAPI --> CreateMainOrder[Create CustomerOrder<br/>customerId, products[], price<br/>payment_status: unpaid<br/>delivery_status: pending]

    CreateMainOrder --> GroupBySeller[Group Products by Seller]

    GroupBySeller --> SellerLoop{For Each Seller}

    SellerLoop --> CreateAuthOrder[Create AuthOrder<br/>orderId link to CustomerOrder<br/>sellerId<br/>seller's products only<br/>seller's total price<br/>payment_status: unpaid]

    CreateAuthOrder --> MoreSellers{More Sellers?}
    MoreSellers -->|Yes| SellerLoop
    MoreSellers -->|No| ClearCart[Delete All Cart Items<br/>DELETE cart where userId]

    ClearCart --> StartTimer[Start 15-Second Payment Timer]

    StartTimer --> ReturnOrderId[Return orderId to Frontend]

    ReturnOrderId --> ShowPayment[Show Payment Page<br/>Display Total Amount]

    ShowPayment --> UserAction{User Action}

    UserAction -->|Waits 15s| AutoCancel[Auto-Cancel Order<br/>Update status: cancelled]
    UserAction -->|Clicks Pay| StripeCheckout[Redirect to Stripe Checkout<br/>POST /api/order/create-payment]

    StripeCheckout --> CreatePaymentIntent[Stripe Creates Payment Intent<br/>Return clientSecret]

    CreatePaymentIntent --> CustomerPays[Customer Enters Card Details<br/>Stripe Processes Payment]

    CustomerPays --> PaymentResult{Payment Status}

    PaymentResult -->|Failed| PaymentFailed[Payment Failed<br/>Order Remains Unpaid<br/>Show Error Message]
    PaymentResult -->|Success| ConfirmOrder[GET /api/order/confirm/:orderId]

    ConfirmOrder --> UpdateMainOrder[Update CustomerOrder<br/>payment_status: paid]

    UpdateMainOrder --> UpdateAuthOrders[Update All Linked AuthOrders<br/>payment_status: paid]

    UpdateAuthOrders --> DistributeFunds[Distribute Funds to Wallets]

    DistributeFunds --> SellerWalletLoop{For Each Seller}

    SellerWalletLoop --> CalcCommission[Calculate:<br/>sellerAmount = total * 0.95<br/>platformFee = total * 0.05]

    CalcCommission --> AddSellerWallet[Add to SellerWallet<br/>sellerId, amount, month, year]

    AddSellerWallet --> AddPlatformWallet[Add to MyShopWallet<br/>platformFee, month, year]

    AddPlatformWallet --> MoreSellersWallet{More Sellers?}
    MoreSellersWallet -->|Yes| SellerWalletLoop
    MoreSellersWallet -->|No| OrderComplete[Order Confirmed<br/>Show Success Page]

    OrderComplete --> CustomerDashboard[Customer Can Track Order<br/>in Dashboard]

    CustomerDashboard --> SellerNotified[Sellers Notified<br/>New Order Received]

    SellerNotified --> SellerProcessing{Seller Action}

    SellerProcessing --> UpdateStatus1[Update Status: Processing<br/>PUT /api/seller/order-status/update]
    UpdateStatus1 --> UpdateStatus2[Update Status: Shipped]
    UpdateStatus2 --> UpdateStatus3[Update Status: Delivered]

    UpdateStatus3 --> CustomerNotified[Customer Receives Notifications<br/>at Each Status Change]

    CustomerNotified --> DeliveryComplete{Delivered?}

    DeliveryComplete -->|Yes| SubmitReview[Customer Can Submit Review<br/>POST /api/home/customer/submit-review]
    DeliveryComplete -->|No| WaitDelivery[Wait for Delivery]

    SubmitReview --> UpdateRating[Update Product Rating<br/>Calculate Average from All Reviews]

    UpdateRating --> End([Order Flow Complete])

    AutoCancel --> CancelNotify[Notify Customer<br/>Order Cancelled]
    PaymentFailed --> FailNotify[Notify Customer<br/>Payment Failed]

    EmptyCart --> EndEmpty([End])
    CancelNotify --> EndCancel([End - Order Cancelled])
    FailNotify --> EndFail([End - Payment Failed])
    WaitDelivery --> CustomerDashboard
```

---

## 4. REAL-TIME CHAT FLOW

### Socket.IO Communication Architecture

```mermaid
sequenceDiagram
    participant Customer
    participant CustomerApp
    participant SocketServer[Socket.IO Server]
    participant MongoDB
    participant SellerApp
    participant Seller
    participant AdminApp
    participant Admin

    rect rgb(230, 245, 255)
        Note over Customer,Admin: CONNECTION ESTABLISHMENT
        Customer->>CustomerApp: Open Application
        CustomerApp->>SocketServer: socket.connect()
        SocketServer-->>CustomerApp: Connection Established

        CustomerApp->>SocketServer: socket.emit('add_user', {customerId, userInfo})
        SocketServer->>SocketServer: Add to allCustomer[]<br/>socketId mapped to customerId
        SocketServer-->>CustomerApp: User Added
        SocketServer->>SellerApp: Broadcast active_customer list

        Seller->>SellerApp: Open Dashboard
        SellerApp->>SocketServer: socket.connect()
        SellerApp->>SocketServer: socket.emit('add_seller', {sellerId, userInfo})
        SocketServer->>SocketServer: Add to allSeller[]<br/>socketId mapped to sellerId
        SocketServer-->>SellerApp: Seller Added
        SocketServer->>CustomerApp: Broadcast active_seller list
    end

    rect rgb(255, 245, 230)
        Note over Customer,Admin: CUSTOMER-SELLER CHAT FLOW
        Customer->>CustomerApp: Click "Chat with Seller"
        CustomerApp->>MongoDB: POST /api/chat/customer/add-customer-friend<br/>{myId: customerId, myFriends: [sellerId]}
        MongoDB-->>CustomerApp: Friend Added

        CustomerApp->>MongoDB: GET /api/chat/customer/get-customer-message/:sellerId
        MongoDB-->>CustomerApp: Chat History

        Customer->>CustomerApp: Type Message "Is this product available?"
        CustomerApp->>MongoDB: POST /api/chat/customer/send-message-to-seller<br/>{senderId, receverId, message, status: 'unseen'}
        MongoDB-->>CustomerApp: Message Saved (messageId)

        CustomerApp->>SocketServer: socket.emit('send_customer_message', {<br/>  senderId, senderName,<br/>  receverId (sellerId),<br/>  message, createdAt<br/>})

        SocketServer->>SocketServer: Find Seller Socket<br/>allSeller.find(s => s.sellerId === receverId)

        alt Seller Online
            SocketServer->>SellerApp: socket.emit('customer_message', messageData)
            SellerApp->>SellerApp: Show Notification<br/>Update Chat UI
            SellerApp-->>Seller: Display Message in Real-time
        else Seller Offline
            SocketServer->>SocketServer: Queue Message<br/>(Will be delivered on reconnect)
        end

        Seller->>SellerApp: Type Reply "Yes, 5 units in stock"
        SellerApp->>MongoDB: POST /api/chat/seller/send-message-to-customer<br/>{senderId: sellerId, receverId: customerId, message}
        MongoDB-->>SellerApp: Message Saved

        SellerApp->>SocketServer: socket.emit('send_seller_message', messageData)
        SocketServer->>SocketServer: Find Customer Socket
        SocketServer->>CustomerApp: socket.emit('seller_message', messageData)
        CustomerApp-->>Customer: Show Reply in Chat
    end

    rect rgb(240, 255, 240)
        Note over Customer,Admin: SELLER-ADMIN CHAT FLOW
        Seller->>SellerApp: Click "Contact Support"
        SellerApp->>MongoDB: GET /api/chat/get-admin-messages/:sellerId
        MongoDB-->>SellerApp: Admin Chat History

        Seller->>SellerApp: Type "How do I change my payout method?"
        SellerApp->>MongoDB: POST /api/chat/message-send-seller-admin<br/>{senderId: sellerId, receverId: adminId, message}
        MongoDB-->>SellerApp: Message Saved

        SellerApp->>SocketServer: socket.emit('send_message_seller_to_admin', messageData)
        SocketServer->>AdminApp: socket.emit('receved_seller_message', messageData)

        AdminApp-->>Admin: Show Notification<br/>"New message from Seller"

        Admin->>AdminApp: Open Seller Chat
        AdminApp->>MongoDB: GET /api/chat/get-seller-messages
        MongoDB-->>AdminApp: All Seller Messages

        Admin->>AdminApp: Type Reply "Go to Profile > Payment Settings"
        AdminApp->>MongoDB: POST /api/chat/message-send-seller-admin<br/>{senderId: adminId, receverId: sellerId, message}
        MongoDB-->>AdminApp: Message Saved

        AdminApp->>SocketServer: socket.emit('send_message_admin_to_seller', messageData)
        SocketServer->>SellerApp: socket.emit('receved_admin_message', messageData)
        SellerApp-->>Seller: Display Admin Reply
    end

    rect rgb(255, 240, 245)
        Note over Customer,Admin: MESSAGE STATUS UPDATE
        Customer->>CustomerApp: View Unread Messages
        CustomerApp->>MongoDB: Update Message Status<br/>status: 'seen'
        MongoDB-->>CustomerApp: Status Updated
        CustomerApp->>SocketServer: socket.emit('message_seen', {messageId})
        SocketServer->>SellerApp: socket.emit('message_seen_confirmation', {messageId})
        SellerApp->>SellerApp: Remove Unread Badge
    end

    rect rgb(245, 245, 245)
        Note over Customer,Admin: DISCONNECTION
        Customer->>CustomerApp: Close Browser/App
        CustomerApp->>SocketServer: socket.disconnect()
        SocketServer->>SocketServer: Remove from allCustomer[]
        SocketServer->>SellerApp: Broadcast updated_customer_list<br/>(Customer Offline)
        SellerApp->>SellerApp: Update Customer Status to Offline
    end
```

---

## 5. PRODUCT SEARCH & FILTER FLOW

### Advanced Search with Weighted Text Indexing

```mermaid
flowchart TD
    Start([Customer Wants to Find Product]) --> SearchType{Search Type}

    SearchType -->|Text Search| TypeQuery[Customer Types: laptop]
    SearchType -->|Category Browse| SelectCategory[Select Category: Electronics]
    SearchType -->|Home Page| ViewFeatured[View Featured Products]

    TypeQuery --> BuildQuery1[Build Search Query<br/>$text: $search: laptop]
    SelectCategory --> BuildQuery2[Build Category Filter<br/>category: Electronics]

    BuildQuery1 --> AddFilters[Add Optional Filters]
    BuildQuery2 --> AddFilters

    AddFilters --> PriceFilter{Price Range?}
    PriceFilter -->|Yes| AddPrice[price: $gte: 500, $lte: 1000]
    PriceFilter -->|No| RatingFilter

    AddPrice --> RatingFilter{Min Rating?}
    RatingFilter -->|Yes| AddRating[rating: $gte: 4]
    RatingFilter -->|No| BrandFilter

    AddRating --> BrandFilter{Brand?}
    BrandFilter -->|Yes| AddBrand[brand: Dell]
    BrandFilter -->|No| SortOption

    AddBrand --> SortOption{Sort By?}

    SortOption -->|Latest| SortLatest[sort: createdAt: -1]
    SortOption -->|Price Low-High| SortPriceLow[sort: price: 1]
    SortOption -->|Price High-Low| SortPriceHigh[sort: price: -1]
    SortOption -->|Rating| SortRating[sort: rating: -1]
    SortOption -->|Default| NoSort[No Sort Applied]

    SortLatest --> Pagination
    SortPriceLow --> Pagination
    SortPriceHigh --> Pagination
    SortRating --> Pagination
    NoSort --> Pagination

    Pagination[Apply Pagination<br/>page=1, perPage=12] --> ExecuteQuery[Execute MongoDB Query<br/>GET /api/home/query-products]

    ExecuteQuery --> TextSearch{Has Text Search?}

    TextSearch -->|Yes| WeightedSearch[MongoDB Text Search<br/>Weighted Indexes:<br/>name: 5<br/>category: 4<br/>brand: 3<br/>description: 2]
    TextSearch -->|No| StandardQuery[Standard Find Query]

    WeightedSearch --> CalculateScore[Calculate Text Score<br/>score: $meta: textScore]
    CalculateScore --> SortByScore[Sort by Score Desc]
    SortByScore --> ApplyOtherFilters

    StandardQuery --> ApplyOtherFilters[Apply Price, Rating, Brand Filters]

    ApplyOtherFilters --> CountTotal[Count Total Matching Products]

    CountTotal --> ApplyPagination[Apply Skip & Limit<br/>skip: page-1 * perPage<br/>limit: perPage]

    ApplyPagination --> SelectFields[Select Required Fields<br/>name, slug, price, images<br/>rating, discount, shopName]

    SelectFields --> ReturnResults[Return Results<br/>products: []<br/>totalProducts: count<br/>perPage: 12<br/>totalPages: ceil count/perPage]

    ReturnResults --> DisplayResults[Display Product Grid]

    DisplayResults --> UserAction{User Action}

    UserAction -->|Change Page| UpdatePage[page=2]
    UpdatePage --> Pagination

    UserAction -->|Change Filter| UpdateFilter[Update Filter Parameters]
    UpdateFilter --> AddFilters

    UserAction -->|Clear Filters| ClearAll[Reset All Filters]
    ClearAll --> SearchType

    UserAction -->|Select Product| ViewProductDetail[View Product Details<br/>GET /api/home/product-details/:slug]

    ViewProductDetail --> End([End])

    ViewFeatured --> GetFeatured[GET /api/home/get-products<br/>Get Latest/Featured/Discounted]
    GetFeatured --> DisplayResults
```

---

## 6. IMAGE UPLOAD FLOW

### Cloudinary Integration Process

```mermaid
sequenceDiagram
    participant Seller
    participant Frontend
    participant Express
    participant Formidable
    participant Cloudinary
    participant MongoDB

    Seller->>Frontend: Select Product Images<br/>(up to 5 images)
    Frontend->>Frontend: Validate Files<br/>- Check file type (jpg, png, webp)<br/>- Check file size < 5MB each<br/>- Preview images

    alt Validation Failed
        Frontend-->>Seller: Show Error: Invalid file type or size
    else Validation Passed
        Frontend->>Frontend: Create FormData<br/>Append images[] + product fields

        Seller->>Frontend: Click "Add Product"
        Frontend->>Express: POST /api/product-add<br/>Content-Type: multipart/form-data<br/>{images[], name, price, category, ...}

        Express->>Formidable: Parse Multipart Form<br/>formidable.IncomingForm()
        Formidable->>Formidable: Extract Fields & Files<br/>files.images (array)
        Formidable-->>Express: {fields: {...}, files: {images: [...]}}

        Express->>Express: Validate Product Data<br/>- Check required fields<br/>- Validate sellerId from JWT

        loop For Each Image
            Express->>Cloudinary: Upload Image<br/>cloudinary.uploader.upload(file.filepath, {<br/>  folder: 'products',<br/>  transformation: [{<br/>    width: 800,<br/>    quality: 'auto',<br/>    fetch_format: 'auto'<br/>  }]<br/>})

            Cloudinary->>Cloudinary: Process Image<br/>- Optimize size<br/>- Convert to WebP if supported<br/>- Generate responsive URLs

            Cloudinary-->>Express: {<br/>  url: 'https://res.cloudinary.com/.../image.jpg',<br/>  secure_url: 'https://...',<br/>  public_id: 'products/xyz',<br/>  format: 'jpg',<br/>  width: 800,<br/>  height: 600<br/>}

            Express->>Express: Add URL to images array<br/>images.push(secure_url)
        end

        Express->>Express: Generate Slug<br/>slug = name.toLowerCase().replace(/\s+/g, '-')

        Express->>MongoDB: Create Product Document<br/>productModel.create({<br/>  sellerId,<br/>  name,<br/>  slug,<br/>  category,<br/>  price,<br/>  stock,<br/>  discount,<br/>  images: [urls],<br/>  description,<br/>  brand,<br/>  shopName<br/>})

        MongoDB-->>Express: Product Created (productId)

        Express-->>Frontend: {<br/>  success: true,<br/>  message: 'Product added successfully',<br/>  product: {...}<br/>}

        Frontend->>Frontend: Update Redux Store<br/>Add product to seller's product list

        Frontend-->>Seller: Show Success Message<br/>"Product added successfully"<br/>Redirect to Products Page
    end

    Note over Seller,MongoDB: DISPLAYING IMAGES
    Seller->>Frontend: View Product List
    Frontend->>Express: GET /api/products-get
    Express->>MongoDB: Find Products<br/>sellerModel.find({sellerId})
    MongoDB-->>Express: Products with Image URLs
    Express-->>Frontend: {products: [{images: [urls]}, ...]}
    Frontend->>Cloudinary: Load Images from CDN<br/><img src="cloudinary_url" />
    Cloudinary-->>Frontend: Optimized Images Delivered
    Frontend-->>Seller: Display Product Grid
```

---

## 7. SELLER APPROVAL WORKFLOW

### Admin Vendor Management Process

```mermaid
stateDiagram-v2
    [*] --> SellerRegistration: Seller Submits Application

    SellerRegistration --> PendingReview: Account Created<br/>status: 'pending'<br/>payment: 'inactive'

    PendingReview --> AdminNotified: Admin Receives Notification

    AdminNotified --> AdminReview: Admin Reviews Application<br/>GET /api/request-seller-get

    AdminReview --> SellerDetails: View Seller Details<br/>GET /api/get-seller/:sellerId

    SellerDetails --> Decision: Admin Decision

    Decision --> Approved: Approve Seller<br/>POST /api/seller-status-update<br/>{status: 'active'}
    Decision --> Rejected: Reject Seller<br/>POST /api/seller-status-update<br/>{status: 'deactive'}

    Approved --> ActiveSeller: Seller Status: Active<br/>Can Login & Access Dashboard

    ActiveSeller --> ProfileSetup: Seller Sets Up Profile<br/>- Upload Image<br/>- Add Shop Info

    ProfileSetup --> StripeConnection: Connect Stripe Account<br/>GET /api/payment/create-stripe-connect-account

    StripeConnection --> StripeOnboarding: Stripe KYC Process

    StripeOnboarding --> PaymentActivated: Complete Onboarding<br/>PUT /api/payment/active-stripe-connect-account<br/>payment: 'active'

    PaymentActivated --> FullyOperational: Seller Can:<br/>- Add Products<br/>- Receive Orders<br/>- Get Paid

    FullyOperational --> MonitorPerformance: Admin Monitors Seller

    MonitorPerformance --> PerformanceCheck: Check Metrics

    PerformanceCheck --> ContinueActive: Performance Good<br/>Status Remains Active
    PerformanceCheck --> Deactivate: Poor Performance/<br/>Policy Violation

    Deactivate --> DeactiveSeller: POST /api/seller-status-update<br/>{status: 'deactive'}

    DeactiveSeller --> NoAccess: Seller Cannot Login<br/>Products Hidden

    NoAccess --> AppealReview: Seller Appeals

    AppealReview --> Decision: Admin Re-reviews

    Rejected --> RejectedState: Account Blocked<br/>Cannot Access Platform

    RejectedState --> [*]: End

    ContinueActive --> FullyOperational: Continue Operations

    note right of PendingReview
        Email sent to admin
        Seller can login but
        has limited access
    end note

    note right of FullyOperational
        All features unlocked:
        - Product management
        - Order processing
        - Payment withdrawal
        - Customer chat
    end note

    note right of DeactiveSeller
        Products hidden from
        marketplace but data
        preserved for records
    end note
```

---

## How to Use These Diagrams

### For Presentation
1. **Render Diagrams**: Use https://mermaid.live/ to convert to images
2. **Export Options**: PNG (high resolution) or SVG (scalable)
3. **Slide Integration**: One diagram per slide with explanatory notes
4. **Highlight Key Points**: Use annotations to emphasize critical steps

### For Documentation
1. **GitHub**: Automatically renders Mermaid diagrams
2. **VS Code**: Install Mermaid extension for preview
3. **Confluence/Notion**: Most platforms support Mermaid syntax

### For Understanding
1. **Follow the Flow**: Read from top to bottom or left to right
2. **Identify Decision Points**: Diamond shapes indicate branching logic
3. **Track Data Flow**: Arrows show direction of information
4. **Note Interactions**: Sequence diagrams show system communication

---

**Generated for VendorVerse Final Semester Project Presentation**
