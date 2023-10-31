import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signin from "../src/components/Signin.jsx";
import Signup from "../src/components/Signup.jsx";
import Appbar from "../src/components/Appbar.jsx";
import AddCourse from "../src/components/AddCourse.jsx";
import Courses from "../src/components/Courses.jsx";
import Course from "../src/components/Course.jsx";
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';
import UserManagement from "./components/UserManagement.jsx";
import SignupUser from "./components/SignupUser.jsx";

function App() {

    return (
        <div style={{width: "100vw",
            height: "100vh",
            backgroundColor: "#eeeeee"}}
        >
            <RecoilRoot>
                <Router>
                    <Appbar />
                    <Routes>
                        <Route path={"admin/addcourse"} element={<AddCourse />} />
                        <Route path={"admin/course/:courseId"} element={<Course />} />
                        <Route path={"admin/courses"} element={<Courses />} />
                        <Route path={"admin/signin"} element={<Signin />} />
                        <Route path={"admin/signup"} element={<Signup />} />
                        <Route path={"admin/usermanagement"} element={<UserManagement />} />
                        <Route path={"user/sigup"} element={<SignupUser />} />
                    </Routes>
                </Router>
            </RecoilRoot>
        </div>
    );
}

export default App;