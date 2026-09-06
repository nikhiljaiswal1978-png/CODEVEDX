import { Routes,Route,useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Categories from "./pages/Categories.jsx";
import Category from "./pages/Category.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";

import RaiseComplaint from "./pages/RaiseComplaint.jsx";
import ComplaintDetails from "./pages/ComplaintDetails.jsx";
import MyComplaints from "./pages/MyComplaints.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetail from "./pages/admin/AdminUserDetail.jsx";
import AdminRefunds from "./pages/admin/AdminRefunds.jsx";

function App(){
  const location=useLocation();
  const hideLayout=["/login","/register"].includes(location.pathname);

  return(
    <>
      {!hideLayout&&<Navbar/>}

      <main>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/products" element={<Products/>}/>
          <Route path="/categories" element={<Categories/>}/>
          <Route path="/category/:name" element={<Category/>}/>
          <Route path="/product/:id" element={<ProductDetail/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>

          <Route path="/checkout" element={
            <ProtectedRoute><Checkout/></ProtectedRoute>
          }/>

          <Route path="/orders" element={
            <ProtectedRoute><Orders/></ProtectedRoute>
          }/>

          <Route path="/orders/:id" element={
            <ProtectedRoute><OrderDetail/></ProtectedRoute>
          }/>

          <Route path="/order-success/:id" element={
            <ProtectedRoute><OrderSuccess/></ProtectedRoute>
          }/>

          {/* CUSTOMER COMPLAINTS */}
          <Route path="/orders/:id/complaint" element={
            <ProtectedRoute><RaiseComplaint/></ProtectedRoute>
          }/>

          <Route path="/orders/:orderId/complaint/:complaintId" element={
            <ProtectedRoute><ComplaintDetails/></ProtectedRoute>
          }/>

          <Route path="/complaints" element={
            <ProtectedRoute><MyComplaints/></ProtectedRoute>
          }/>

          {/* ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard/></ProtectedRoute>
          }/>

          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly><AdminProducts/></ProtectedRoute>
          }/>

          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly><AdminOrders/></ProtectedRoute>
          }/>

          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><AdminUsers/></ProtectedRoute>
          }/>

          <Route path="/admin/users/:id" element={
            <ProtectedRoute adminOnly><AdminUserDetail/></ProtectedRoute>
          }/>

          <Route path="/admin/refunds" element={
            <ProtectedRoute adminOnly><AdminRefunds/></ProtectedRoute>
          }/>
        </Routes>
      </main>

      {!hideLayout&&(
        <footer className="footer">
          <p>Fernweg — a demo storefront. Not a real store; payments are simulated.</p>
        </footer>
      )}
    </>
  );
}

export default App;
