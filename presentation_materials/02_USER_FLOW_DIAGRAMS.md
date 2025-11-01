# VendorVerse - User Flow Diagrams

This document contains complete user journey flows for all three user types in the VendorVerse platform.

---

## 1. CUSTOMER USER FLOW

### Customer Complete Journey

```mermaid
flowchart TD
    Start([Customer Visits VendorVerse]) --> RegCheck{Has Account?}

    RegCheck -->|No| Register[Register Account<br/>POST /api/customer/customer-register]
    RegCheck -->|Yes| Login[Login<br/>POST /api/customer/customer-login]

    Register --> Login
    Login --> TokenStored[JWT Token Stored in Cookie<br/>7 days expiry]

    TokenStored --> HomePage[Browse Home Page<br/>View Categories & Products]

    HomePage --> Browse{Browse Options}
    Browse -->|By Category| CategoryPage[Category Shop Page<br/>GET /api/home/get-categorys]
    Browse -->|Search| SearchPage[Search Products<br/>GET /api/home/query-products]
    Browse -->|Featured| FeaturedProducts[Featured Products<br/>GET /api/home/get-products]

    CategoryPage --> ProductList[View Product Listings<br/>Filter by Price, Rating, Brand]
    SearchPage --> ProductList
    FeaturedProducts --> ProductList

    ProductList --> ProductDetails[View Product Details<br/>GET /api/home/product-details/:slug]

    ProductDetails --> ViewReviews[View Reviews & Rating<br/>GET /api/home/customer/get-reviews/:productId]

    ViewReviews --> Action{Customer Action}

    Action -->|Add to Cart| AddCart[Add to Cart<br/>POST /api/home/product/add-to-card]
    Action -->|Add to Wishlist| AddWishlist[Add to Wishlist<br/>POST /api/home/product/add-to-wishlist]
    Action -->|Continue Shopping| ProductList

    AddWishlist --> ContinueBrowse{Continue Shopping?}
    ContinueBrowse -->|Yes| ProductList
    ContinueBrowse -->|No| Dashboard

    AddCart --> CartManage{Manage Cart}
    CartManage -->|View Cart| ViewCart[View Cart<br/>GET /api/home/product/get-card-product/:userId]
    CartManage -->|Update Qty| UpdateQty[Increase/Decrease Quantity<br/>PUT /api/home/product/quantity-inc/:id]
    CartManage -->|Remove Item| RemoveCart[Remove from Cart<br/>DELETE /api/home/product/delete-card-product/:id]

    ViewCart --> Checkout{Proceed to Checkout?}
    UpdateQty --> ViewCart
    RemoveCart --> ViewCart

    Checkout -->|No| ProductList
    Checkout -->|Yes| ShippingInfo[Enter Shipping Information<br/>Name, Address, City, State]

    ShippingInfo --> PlaceOrder[Place Order<br/>POST /api/home/order/place-order]

    PlaceOrder --> OrderCreated[Order Created<br/>Status: Unpaid<br/>15-second payment timer starts]

    OrderCreated --> Payment[Payment Page<br/>POST /api/order/create-payment]

    Payment --> StripeCheckout[Stripe Checkout<br/>Card Payment]

    StripeCheckout --> PaymentStatus{Payment Success?}

    PaymentStatus -->|Success| ConfirmOrder[Confirm Order<br/>GET /api/order/confirm/:orderId]
    PaymentStatus -->|Failed| PaymentFailed[Payment Failed<br/>Order Remains Unpaid]
    PaymentStatus -->|Timeout 15s| AutoCancel[Order Auto-Cancelled]

    ConfirmOrder --> OrderConfirmed[Order Confirmed<br/>Payment Status: Paid<br/>Delivery Status: Pending]

    OrderConfirmed --> FundsDistributed[Funds Distributed<br/>- Seller Wallet Updated<br/>- Platform Fee Collected]

    FundsDistributed --> CartCleared[Shopping Cart Cleared]

    CartCleared --> Dashboard[Customer Dashboard<br/>GET /api/home/coustomer/get-dashboard-data/:userId]

    Dashboard --> DashboardOptions{Dashboard Options}

    DashboardOptions -->|Track Orders| ViewOrders[View My Orders<br/>GET /api/home/coustomer/get-orders/:customerId/:status]
    DashboardOptions -->|View Wishlist| ViewWishlist[View Wishlist<br/>GET /api/home/product/get-wishlist-products/:userId]
    DashboardOptions -->|Chat Support| ChatSeller[Chat with Seller<br/>POST /api/chat/customer/send-message-to-seller]
    DashboardOptions -->|Change Password| ChangePassword[Change Password<br/>POST /api/change-password]

    ViewOrders --> OrderDetails[View Order Details<br/>GET /api/home/coustomer/get-order-details/:orderId]

    OrderDetails --> TrackDelivery[Track Delivery Status<br/>Pending → Processing → Shipped → Delivered]

    TrackDelivery --> OrderDelivered{Order Delivered?}

    OrderDelivered -->|Yes| SubmitReview[Submit Product Review<br/>POST /api/home/customer/submit-review]
    OrderDelivered -->|No| WaitDelivery[Wait for Delivery]

    SubmitReview --> ReviewSubmitted[Review & Rating Submitted<br/>Product Rating Updated]

    ReviewSubmitted --> End([Session Complete])
    WaitDelivery --> Dashboard
    ViewWishlist --> Dashboard
    ChatSeller --> Dashboard
    ChangePassword --> Dashboard
    PaymentFailed --> Dashboard
    AutoCancel --> Dashboard
```

---

## 2. SELLER (VENDOR) USER FLOW

### Seller Complete Journey

```mermaid
flowchart TD
    Start([Seller Visits VendorVerse]) --> Register[Register as Seller<br/>POST /api/seller-register]

    Register --> SellerCreated[Seller Account Created<br/>Status: Pending<br/>Payment: Inactive]

    SellerCreated --> WaitApproval[Wait for Admin Approval]

    WaitApproval --> AdminReview{Admin Reviews}

    AdminReview -->|Approved| StatusActive[Status Changed to Active<br/>POST /api/seller-status-update]
    AdminReview -->|Rejected| StatusDeactive[Status: Deactive<br/>Cannot access platform]

    StatusDeactive --> End1([Registration Rejected])

    StatusActive --> Login[Seller Login<br/>POST /api/seller-login]

    Login --> TokenStored[JWT Token Stored<br/>7 days expiry]

    TokenStored --> Dashboard[Seller Dashboard<br/>GET /api/seller/get-dashboard-data]

    Dashboard --> FirstTime{First Time Login?}

    FirstTime -->|Yes| ProfileSetup[Profile Setup]
    FirstTime -->|No| DashboardMain

    ProfileSetup --> UploadImage[Upload Profile Image<br/>POST /api/profile-image-upload<br/>Cloudinary Upload]

    UploadImage --> ShopInfo[Add Shop Information<br/>POST /api/profile-info-add<br/>Shop Name, Address, Description]

    ShopInfo --> StripeConnect[Connect Stripe Account<br/>GET /api/payment/create-stripe-connect-account]

    StripeConnect --> StripeOnboarding[Stripe Express Onboarding<br/>Complete KYC Process]

    StripeOnboarding --> StripeCallback[Stripe Redirect with Code<br/>PUT /api/payment/active-stripe-connect-account/:code]

    StripeCallback --> PaymentActive[Payment Status: Active<br/>Can Receive Payments]

    PaymentActive --> DashboardMain[Seller Dashboard Main]

    DashboardMain --> DashboardView[View Dashboard Analytics<br/>- Total Sales<br/>- Total Products<br/>- Total Orders<br/>- Pending Orders<br/>- Available Balance<br/>- Monthly Earnings Chart]

    DashboardView --> SellerActions{Seller Actions}

    SellerActions -->|Manage Products| ProductManagement
    SellerActions -->|Manage Orders| OrderManagement
    SellerActions -->|View Payments| PaymentManagement
    SellerActions -->|Customer Support| CustomerChat
    SellerActions -->|Platform Support| AdminChat

    %% Product Management Flow
    ProductManagement --> ProductActions{Product Actions}

    ProductActions -->|Add Product| AddProduct[Add New Product<br/>POST /api/product-add]
    ProductActions -->|View Products| ViewProducts[View All Products<br/>GET /api/products-get]
    ProductActions -->|Edit Product| EditProduct[Update Product<br/>POST /api/product-update]
    ProductActions -->|Add Banner| AddBanner[Add Promotional Banner<br/>POST /api/banner/add]

    AddProduct --> ProductForm[Fill Product Form<br/>- Name, Category, Brand<br/>- Price, Stock, Discount<br/>- Description]

    ProductForm --> UploadImages[Upload Product Images<br/>Multiple Images to Cloudinary]

    UploadImages --> ProductCreated[Product Created<br/>- Slug Generated<br/>- Appears in Marketplace]

    ProductCreated --> DashboardMain

    ViewProducts --> ProductList[Product List with Stats<br/>Stock, Sales, Rating]

    ProductList --> ProductActions

    EditProduct --> UpdateProduct[Update Product Details<br/>POST /api/product-update]
    UpdateProduct --> ProductActions

    AddBanner --> BannerCreated[Banner Added<br/>Featured on Homepage]
    BannerCreated --> ProductActions

    %% Order Management Flow
    OrderManagement --> ViewOrders[View All Orders<br/>GET /api/seller/orders/:sellerId]

    ViewOrders --> OrderList[Order List by Status<br/>Pending, Processing, Shipped, Delivered]

    OrderList --> SelectOrder[Select Order<br/>GET /api/seller/order/:orderId]

    SelectOrder --> OrderDetailsView[View Order Details<br/>- Products<br/>- Customer Info<br/>- Shipping Address<br/>- Payment Status]

    OrderDetailsView --> UpdateOrderStatus{Update Status}

    UpdateOrderStatus -->|Process| ProcessOrder[Status: Processing<br/>PUT /api/seller/order-status/update/:orderId]
    UpdateOrderStatus -->|Ship| ShipOrder[Status: Shipped<br/>PUT /api/seller/order-status/update/:orderId]
    UpdateOrderStatus -->|Deliver| DeliverOrder[Status: Delivered<br/>PUT /api/seller/order-status/update/:orderId]
    UpdateOrderStatus -->|Cancel| CancelOrder[Status: Cancelled<br/>PUT /api/seller/order-status/update/:orderId]

    ProcessOrder --> OrderUpdated[Order Status Updated<br/>Customer Notified]
    ShipOrder --> OrderUpdated
    DeliverOrder --> OrderUpdated
    CancelOrder --> OrderUpdated

    OrderUpdated --> PaymentReleased{Status Delivered?}

    PaymentReleased -->|Yes| WalletUpdated[Funds in Seller Wallet<br/>Available for Withdrawal]
    PaymentReleased -->|No| DashboardMain

    WalletUpdated --> DashboardMain

    %% Payment Management Flow
    PaymentManagement --> PaymentDashboard[Payment Dashboard<br/>GET /api/payment/seller-payment-details/:sellerId]

    PaymentDashboard --> PaymentView[View Payment Details<br/>- Available Balance<br/>- Total Earnings<br/>- Pending Withdrawals<br/>- Monthly Reports]

    PaymentView --> WithdrawAction{Request Withdrawal?}

    WithdrawAction -->|Yes| RequestWithdraw[Request Withdrawal<br/>POST /api/payment/withdrowal-request<br/>Enter Amount]
    WithdrawAction -->|No| DashboardMain

    RequestWithdraw --> WithdrawCreated[Withdrawal Request Created<br/>Status: Pending<br/>Balance Deducted]

    WithdrawCreated --> AdminApproval[Wait for Admin Approval]

    AdminApproval --> WithdrawStatus{Admin Decision}

    WithdrawStatus -->|Approved| TransferFunds[Funds Transferred to Stripe<br/>POST /api/payment/request-confirm]
    WithdrawStatus -->|Rejected| RefundBalance[Balance Refunded<br/>Request Denied]

    TransferFunds --> WithdrawComplete[Withdrawal Complete<br/>Check Stripe Account]

    WithdrawComplete --> DashboardMain
    RefundBalance --> DashboardMain

    %% Customer Chat Flow
    CustomerChat --> ViewCustomers[View Customer List<br/>GET /api/chat/seller/get-customers/:sellerId]

    ViewCustomers --> SelectCustomer[Select Customer]

    SelectCustomer --> ChatHistory[View Chat History<br/>GET /api/chat/seller/get-customer-message/:customerId]

    ChatHistory --> SendMessage[Send Message<br/>POST /api/chat/seller/send-message-to-customer<br/>Socket.IO Real-time]

    SendMessage --> MessageSent[Message Delivered<br/>Customer Receives Notification]

    MessageSent --> DashboardMain

    %% Admin Chat Flow
    AdminChat --> AdminChatHistory[View Admin Chat<br/>GET /api/chat/get-admin-messages/:receverId]

    AdminChatHistory --> SendAdminMsg[Send Message to Admin<br/>POST /api/chat/message-send-seller-admin<br/>Socket.IO Real-time]

    SendAdminMsg --> AdminMsgSent[Message Sent to Admin<br/>For Platform Support]

    AdminMsgSent --> DashboardMain
```

---

## 3. ADMIN USER FLOW

### Admin Complete Journey

```mermaid
flowchart TD
    Start([Admin Logs In]) --> Login[Admin Login<br/>POST /api/admin-login]

    Login --> TokenStored[JWT Token Stored<br/>7 days expiry]

    TokenStored --> Dashboard[Admin Dashboard<br/>GET /api/admin/get-dashboard-data]

    Dashboard --> DashboardView[View Platform Analytics<br/>- Total Sales Revenue<br/>- Total Products<br/>- Total Sellers<br/>- Total Orders<br/>- Monthly Sales Chart<br/>- Recent Orders]

    DashboardView --> AdminActions{Admin Actions}

    AdminActions -->|Manage Sellers| SellerManagement
    AdminActions -->|Manage Categories| CategoryManagement
    AdminActions -->|Monitor Orders| OrderManagement
    AdminActions -->|Payment Requests| PaymentManagement
    AdminActions -->|Seller Support| SellerChat

    %% Seller Management Flow
    SellerManagement --> SellerActions{Seller Actions}

    SellerActions -->|Pending Requests| ViewRequests[View Seller Requests<br/>GET /api/request-seller-get]
    SellerActions -->|Active Sellers| ViewActiveSellers[View Active Sellers<br/>GET /api/get-sellers]
    SellerActions -->|Deactive Sellers| ViewDeactiveSellers[View Deactive Sellers<br/>GET /api/get-deactive-sellers]

    ViewRequests --> RequestList[Seller Request List<br/>Status: Pending]

    RequestList --> SelectSeller[Select Seller<br/>GET /api/get-seller/:sellerId]

    SelectSeller --> ReviewSeller[Review Seller Details<br/>- Name, Email<br/>- Shop Info<br/>- Registration Date]

    ReviewSeller --> Decision{Approve or Reject?}

    Decision -->|Approve| ApproveSeller[Approve Seller<br/>POST /api/seller-status-update<br/>Status: Active]
    Decision -->|Reject| RejectSeller[Reject Seller<br/>POST /api/seller-status-update<br/>Status: Deactive]

    ApproveSeller --> SellerActive[Seller Can Access Platform<br/>Email Notification Sent]
    RejectSeller --> SellerRejected[Seller Blocked<br/>Cannot Access Platform]

    SellerActive --> Dashboard
    SellerRejected --> Dashboard

    ViewActiveSellers --> ActiveList[Active Seller List<br/>View Performance Metrics]
    ActiveList --> SellerDetails[View Seller Details<br/>- Products Count<br/>- Total Sales<br/>- Order Count]
    SellerDetails --> ManageStatus{Change Status?}
    ManageStatus -->|Yes| DeactivateSeller[Deactivate Seller<br/>POST /api/seller-status-update]
    ManageStatus -->|No| Dashboard
    DeactivateSeller --> Dashboard

    ViewDeactiveSellers --> DeactiveList[Deactive Seller List]
    DeactiveList --> ReactivateOption{Reactivate?}
    ReactivateOption -->|Yes| ReactivateSeller[Reactivate Seller<br/>POST /api/seller-status-update]
    ReactivateOption -->|No| Dashboard
    ReactivateSeller --> Dashboard

    %% Category Management Flow
    CategoryManagement --> CategoryActions{Category Actions}

    CategoryActions -->|Add Category| AddCategory[Add New Category<br/>POST /api/category-add]
    CategoryActions -->|View Categories| ViewCategories[View All Categories<br/>GET /api/category-get]
    CategoryActions -->|Edit Category| EditCategory[Edit Category<br/>PUT /api/category-update/:id]
    CategoryActions -->|Delete Category| DeleteCategory[Delete Category<br/>DELETE /api/category/:id]

    AddCategory --> CategoryForm[Fill Category Form<br/>- Category Name<br/>- Upload Image Cloudinary<br/>- Generate Slug]

    CategoryForm --> CategoryCreated[Category Created<br/>Available for Products]
    CategoryCreated --> Dashboard

    ViewCategories --> CategoryList[Category List<br/>With Product Counts]
    CategoryList --> CategoryActions

    EditCategory --> UpdateCategory[Update Category Details<br/>Name, Image, Slug]
    UpdateCategory --> CategoryUpdated[Category Updated<br/>All Products Updated]
    CategoryUpdated --> Dashboard

    DeleteCategory --> ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|Yes| CategoryDeleted[Category Deleted<br/>Products Unassigned]
    ConfirmDelete -->|No| CategoryActions
    CategoryDeleted --> Dashboard

    %% Order Management Flow
    OrderManagement --> ViewAllOrders[View All Platform Orders<br/>GET /api/admin/orders]

    ViewAllOrders --> OrderFilter[Filter Orders<br/>By Status, Date, Seller]

    OrderFilter --> OrderListAdmin[Complete Order List<br/>All Sellers Combined]

    OrderListAdmin --> SelectOrderAdmin[Select Order<br/>GET /api/admin/order/:orderId]

    SelectOrderAdmin --> OrderDetailsAdmin[View Order Details<br/>- Customer Info<br/>- Seller Info<br/>- Products<br/>- Payment Status<br/>- Delivery Status<br/>- Shipping Address]

    OrderDetailsAdmin --> UpdateStatusAdmin{Update Status?}

    UpdateStatusAdmin -->|Yes| ChangeStatus[Update Order Status<br/>PUT /api/admin/order-status/update/:orderId]
    UpdateStatusAdmin -->|No| Dashboard

    ChangeStatus --> StatusChanged[Status Updated<br/>Customer & Seller Notified]
    StatusChanged --> Dashboard

    %% Payment Management Flow
    PaymentManagement --> ViewWithdrawals[View Withdrawal Requests<br/>GET /api/payment/request]

    ViewWithdrawals --> WithdrawalList[Pending Withdrawal List<br/>Seller Name, Amount, Date]

    WithdrawalList --> SelectWithdrawal[Select Withdrawal Request]

    SelectWithdrawal --> ReviewWithdrawal[Review Request Details<br/>- Seller Information<br/>- Requested Amount<br/>- Available Balance<br/>- Stripe Account Status]

    ReviewWithdrawal --> WithdrawalDecision{Approve or Reject?}

    WithdrawalDecision -->|Approve| ApproveWithdrawal[Approve Withdrawal<br/>POST /api/payment/request-confirm<br/>Status: Approved]
    WithdrawalDecision -->|Reject| RejectWithdrawal[Reject Withdrawal<br/>Refund to Seller Wallet]

    ApproveWithdrawal --> TransferToStripe[Transfer to Seller Stripe<br/>Funds Released]

    TransferToStripe --> WithdrawalComplete[Withdrawal Complete<br/>Seller Notified]
    WithdrawalComplete --> Dashboard

    RejectWithdrawal --> WithdrawalRejected[Request Rejected<br/>Balance Returned]
    WithdrawalRejected --> Dashboard

    %% Seller Chat Flow
    SellerChat --> ViewSellers[View All Sellers<br/>GET /api/chat/admin/get-sellers]

    ViewSellers --> SellerChatList[Seller List with Messages]

    SellerChatList --> SelectSellerChat[Select Seller Chat]

    SelectSellerChat --> ChatHistoryAdmin[View Chat History<br/>GET /api/chat/get-seller-messages]

    ChatHistoryAdmin --> SendMessageAdmin[Send Message to Seller<br/>POST /api/chat/message-send-seller-admin<br/>Socket.IO Real-time]

    SendMessageAdmin --> MessageSentAdmin[Message Delivered<br/>Seller Receives Notification]

    MessageSentAdmin --> Dashboard
```

---

## Simplified User Journey Summary

### Customer Journey (8 Key Steps)
1. **Register/Login** → Account created
2. **Browse Products** → Search, filter, view details
3. **Add to Cart** → Manage cart items
4. **Checkout** → Enter shipping info
5. **Payment** → Stripe checkout
6. **Order Placed** → Track order
7. **Delivery** → Receive product
8. **Review** → Submit rating & review

### Seller Journey (8 Key Steps)
1. **Register** → Wait for approval
2. **Admin Approves** → Account activated
3. **Setup Profile** → Upload image, shop info
4. **Connect Stripe** → Payment activation
5. **Add Products** → List items for sale
6. **Receive Orders** → Process & ship
7. **Earn Money** → Funds in wallet
8. **Withdraw** → Request payout

### Admin Journey (5 Key Responsibilities)
1. **Approve Sellers** → Review & activate vendors
2. **Manage Categories** → Add/edit/delete categories
3. **Monitor Orders** → Oversee all platform orders
4. **Approve Withdrawals** → Release seller payments
5. **Support Sellers** → Chat support for platform issues

---

## How to Use These Diagrams

1. **For Presentation**:
   - Render on https://mermaid.live/
   - Export as PNG/SVG for PowerPoint slides
   - Each flow can be a separate slide

2. **For Documentation**:
   - View in VS Code with Mermaid extension
   - Share with stakeholders as markdown

3. **For Development**:
   - Use as reference for feature implementation
   - Validate all user paths are covered

---

**Generated for VendorVerse Final Semester Project Presentation**
