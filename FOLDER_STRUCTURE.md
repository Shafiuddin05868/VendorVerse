# VendorVerse Folder Structure

## Backend
```
backend/
├── controllers/
│   ├── authControllers.js
│   ├── chat/
│   │   └── ChatController.js
│   ├── dasboard/
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── productController.js
│   │   └── sellerController.js
│   ├── home/
│   │   ├── cardController.js
│   │   ├── customerAuthController.js
│   │   └── homeControllers.js
│   ├── order/
│   │   └── orderController.js
│   └── payment/
│       └── paymentController.js
├── middlewares/
│   └── authMiddleware.js
├── models/
│   ├── adminModel.js
│   ├── authOrder.js
│   ├── bannerModel.js
│   ├── cardModel.js
│   ├── categoryModel.js
│   ├── chat/
│   │   ├── adminSellerMessage.js
│   │   ├── sellerCustomerMessage.js
│   │   └── sellerCustomerModel.js
│   ├── customerModel.js
│   ├── customerOrder.js
│   ├── myShopWallet.js
│   ├── productModel.js
│   ├── reviewModel.js
│   ├── sellerModel.js
│   ├── sellerWallet.js
│   ├── stripeModel.js
│   ├── wishlistModel.js
│   └── withdrowRequest.js
├── routes/
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   ├── paymentRoutes.js
│   ├── dashboard/
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── productRoutes.js
│   │   └── sellerRoutes.js
│   ├── home/
│   │   ├── cardRoutes.js
│   │   ├── customerAuthRoutes.js
│   │   └── homeRoutes.js
│   └── order/
│       └── orderRoutes.js
├── utiles/
│   ├── db.js
│   ├── queryProducts.js
│   ├── response.js
│   └── tokenCreate.js
├── server.js
└── package.json
```

## Dashboard
```
dashboard/
├── public/
│   └── images/
├── src/
│   ├── api/
│   │   └── api.js
│   ├── assets/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│   ├── navigation/
│   │   ├── allNav.js
│   │   └── index.js
│   ├── router/
│   │   ├── Router.jsx
│   │   └── routes/
│   │       ├── adminRoutes.js
│   │       ├── index.js
│   │       ├── privateRoutes.js
│   │       ├── ProtectRoute.jsx
│   │       ├── publicRoutes.js
│   │       └── sellerRoutes.js
│   ├── store/
│   │   ├── index.js
│   │   ├── rootReducers.js
│   │   └── Reducers/
│   │       ├── authReducer.js
│   │       ├── bannerReducer.js
│   │       ├── categoryReducer.js
│   │       ├── chatReducer.js
│   │       ├── dashboardReducer.js
│   │       ├── OrderReducer.js
│   │       ├── PaymentReducer.js
│   │       ├── productReducer.js
│   │       └── sellerReducer.js
│   ├── utils/
│   │   └── utils.js
│   ├── views/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Category.jsx
│   │   │   ├── ChatSeller.jsx
│   │   │   ├── DeactiveSellers.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── PaymentRequest.jsx
│   │   │   ├── SellerDetails.jsx
│   │   │   ├── SellerRequest.jsx
│   │   │   └── Sellers.jsx
│   │   ├── auth/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   └── Search.jsx
│   │   ├── seller/
│   │   │   ├── AddBanner.jsx
│   │   │   ├── AddProduct.jsx
│   │   │   ├── DiscountProducts.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── SellerToAdmin.jsx
│   │   │   └── SellerToCustomer.jsx
│   │   ├── Deactive.jsx
│   │   ├── Home.jsx
│   │   ├── Pagination.jsx
│   │   ├── Pending.jsx
│   │   ├── Success.jsx
│   │   └── UnAuthorized.jsx
│   ├── App.jsx
│   └── index.js
├── tailwind.config.js
└── package.json
```

## Frontend
```
frontend/
├── public/
│   └── images/
│       ├── banner/
│       ├── payment/
│       └── products/
├── src/
│   ├── api/
│   │   └── api.js
│   ├── assets/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Index.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── products/
│   │   │   ├── FeatureProducts.jsx
│   │   │   ├── Products.jsx
│   │   │   └── ShopProducts.jsx
│   │   ├── Banner.jsx
│   │   ├── Categorys.jsx
│   │   ├── CheckoutForm.js
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Pagination.jsx
│   │   ├── Rating.jsx
│   │   ├── RatingTemp.jsx
│   │   ├── Reviews.jsx
│   │   └── Stripe.jsx
│   ├── pages/
│   │   ├── Card.jsx
│   │   ├── CategoryShop.jsx
│   │   ├── ConfirmOrder.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Details.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Payment.jsx
│   │   ├── Register.jsx
│   │   ├── SearchProducts.jsx
│   │   ├── Shipping.jsx
│   │   └── Shops.jsx
│   ├── store/
│   │   ├── index.js
│   │   ├── rootReducer.js
│   │   └── reducers/
│   │       ├── authReducer.js
│   │       ├── cardReducer.js
│   │       ├── chatReducer.js
│   │       ├── dashboardReducer.js
│   │       ├── homeReducer.js
│   │       └── orderReducer.js
│   ├── utils/
│   │   └── ProtectUser.jsx
│   ├── App.jsx
│   └── index.js
├── tailwind.config.js
└── package.json
```
