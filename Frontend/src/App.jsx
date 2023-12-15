import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from 'antd';
import Signin from "./components/adminComponents/Signin.jsx";
import AddCourse from "./components/adminComponents/AddCourse.jsx";
import Courses from "./components/adminComponents/Courses.jsx";
import Course from "./components/adminComponents/Course.jsx";
import UserManagement from "./components/adminComponents/UserManagement.jsx";
import SignupUser from "./components/userComponents/SignupUser.jsx";
import SigninUser from "./components/userComponents/SigninUser.jsx";
import AdminSidebarLayout from "./components/adminComponents/AdminSidebarLayout.jsx";
import { useRecoilState } from 'recoil';
import { darkThemeState } from "./store/atoms/darkThemeState";
import AddCategory from "./components/adminComponents/AddCategory.jsx";
import AdminManageLessons from "./components/adminComponents/Lessons.jsx";
import LandingPage from "./components/userComponents/LandingPage.jsx";
import UserLayout from "./components/userComponents/UserLayout.jsx";
import CourseDetailsPage from "./components/userComponents/CourseDetailsPage.jsx";
import Cart from "./components/userComponents/Cart.jsx";
import UserProfilePage from "./components/userComponents/UserProfilePage.jsx";
import CheckoutPage from "./components/userComponents/CheckoutPage.jsx";
import PurchasedCoursesPage from "./components/userComponents/PurchasedCoursesPage.jsx";
import CourseContentPage from "./components/userComponents/CourseContentPage.jsx";
import AdminCancellationRequestsPage from "./components/adminComponents/AdminCancellationRequestsPage.jsx";
import CouponManagement from "./components/adminComponents/CouponManagement.jsx";
import AdminOrdersPage from "./components/adminComponents/AdminOrdersPage.jsx";
import AdminSalesReportPage from "./components/adminComponents/SalesManagementPage.jsx";
import NotFoundPage from "./components/common/NotFoundPage.jsx";
import AdminReportRequestsPage from "./components/adminComponents/AdminReportRequestsPage.jsx";
import Chatting from "./components/common/Chatting.jsx";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/admin/signin" replace />;
};

function App() {
    const [darkTheme, setDarkTheme] = useRecoilState(darkThemeState);
    const toggleTheme = () => {
        setDarkTheme(!darkTheme);
    };

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <div style={{ backgroundColor: darkTheme ? 'rgb(240,242,245)' : '' }}>
            <Router>
                <Routes>
                    <Route path="/" element={<UserLayout><LandingPage /></UserLayout>} />
                    <Route path="/signup" element={<UserLayout><SignupUser /></UserLayout>} />
                    <Route path="/signin" element={<UserLayout><SigninUser /></UserLayout>} />
                    <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
                    <Route path="/profile" element={<UserLayout><UserProfilePage /></UserLayout>} />
                    <Route path="/checkout" element={<UserLayout><CheckoutPage /></UserLayout>} />
                    <Route path="course/:courseId" element={<CourseDetailsPage />} />
                    <Route path="/purchased-courses" element={<UserLayout><PurchasedCoursesPage /></UserLayout>} />
                    <Route path="/course-content/:courseId" element={<UserLayout><CourseContentPage /></UserLayout>} />
                    <Route path="/chat" element={<UserLayout><Chatting/></UserLayout>} />
                    <Route path="*" element={<UserLayout><NotFoundPage /></UserLayout>} />

                    <Route path="/admin/signin" element={<Signin />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminSidebarLayout toggleTheme={toggleTheme} headerBackgroundColor={colorBgContainer} />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/admin/courses" replace />} />
                        <Route path="courses" element={<Courses />} />
                        <Route path="addcourse" element={<AddCourse />} />
                        <Route path="course/:courseId" element={<Course />} />
                        <Route path="addcategory" element={<AddCategory />} />
                        <Route path="usermanagement" element={<UserManagement />} />
                        <Route path="lessons" element={<AdminManageLessons />} />
                        <Route path="cancellation-requests" element={<AdminCancellationRequestsPage />} />
                        <Route path="coupon-management" element={<CouponManagement />} />
                        <Route path="user-orders" element={<AdminOrdersPage />} />
                        <Route path="sales" element={<AdminSalesReportPage />} />
                        <Route path="report-requests" element={<AdminReportRequestsPage />} />
                        <Route path="chat" element={<Chatting />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
