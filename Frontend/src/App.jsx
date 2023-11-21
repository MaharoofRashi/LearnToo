import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from 'antd';
import Signin from "./components/Signin";
import AddCourse from "./components/AddCourse";
import Courses from "./components/Courses";
import Course from "./components/Course";
import UserManagement from "./components/UserManagement";
import SignupUser from "./components/SignupUser";
import SigninUser from "./components/SigninUser";
import CoursesUser from "./components/CoursesUser";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import { useRecoilState } from 'recoil';
import { darkThemeState } from "./store/atoms/darkThemeState";
import AddCategory from "./components/AddCategory.jsx";
import AdminManageLessons from "./components/Lessons.jsx";
import LandingPage from "./components/LandingPage";
import UserLayout from "./components/UserLayout.jsx";
import CourseDetailsPage from "./components/CourseDetailsPage.jsx";
import Cart from "./components/Cart.jsx";
import UserProfilePage from "./components/UserProfilePage.jsx";
import CheckoutPage from "./components/CheckoutPage.jsx";

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
                    <Route path="/courses" element={<UserLayout><CoursesUser /></UserLayout>} />
                    <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
                    <Route path="/profile" element={<UserLayout><UserProfilePage /></UserLayout>} />
                    <Route path="/checkout" element={<UserLayout><CheckoutPage /></UserLayout>} />
                    <Route path="course/:courseId" element={<CourseDetailsPage />} />

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
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
