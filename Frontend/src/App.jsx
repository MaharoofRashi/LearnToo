import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signin from "../src/components/Signin.jsx";
import Signup from "../src/components/Signup.jsx";
import Appbar from "../src/components/Appbar.jsx";
import AddCourse from "../src/components/AddCourse.jsx";
import Courses from "../src/components/Courses.jsx";
// import Course from "./Course";
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';

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
                        <Route path={"/addcourse"} element={<AddCourse />} />
                        {/*<Route path={"/course/:courseId"} element={<Course />} />*/}
                        <Route path={"/courses"} element={<Courses />} />
                        <Route path={"/signin"} element={<Signin />} />
                        <Route path={"/signup"} element={<Signup />} />
                    </Routes>
                </Router>
            </RecoilRoot>
        </div>
    );
}

export default App;