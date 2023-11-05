import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from 'antd';
import Signin from "./components/Signin";
import Signup from "./components/Signup";
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


function App() {
    const [darkTheme, setDarkTheme] = useRecoilState(darkThemeState);
    const toggleTheme = () => {
        setDarkTheme(!darkTheme);
    };

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <div style={{ backgroundColor: darkTheme ? '#000' : '#fff' }}>
            <Router>
                <Routes>
                    <Route path="/" element={<AdminSidebarLayout toggleTheme={toggleTheme} headerBackgroundColor={colorBgContainer} />} >
                    <Route path="admin/courses" element={<Courses />} />
                    <Route path="admin/addcourse" element={<AddCourse />} />
                    <Route path="admin/course/:courseId" element={<Course />} />
                    <Route path="admin/signin" element={<Signin />} />
                    <Route path="admin/addcategory" element={<AddCategory />} />
                    <Route path="admin/usermanagement" element={<UserManagement />} />
                    <Route path="admin/lessons" element={<AdminManageLessons />} />
                    <Route path="user/signup" element={<SignupUser />} />
                    <Route path="user/signin" element={<SigninUser />} />
                    <Route path="user/courses" element={<CoursesUser />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
