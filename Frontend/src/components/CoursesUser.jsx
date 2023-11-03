import { Card, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Course({ course, onDelete }) {

    const navigate = useNavigate();

    return (
        <Card
            style={{ margin: 10, width: 300, minHeight: 200, marginTop: 50 }}
            onClick={() => navigate(`/user/course/${course._id}`)}
        >
            <Typography textAlign={"center"} variant="h5">{course.title}</Typography>
            <Typography textAlign={"center"} variant="subtitle1">{course.description}</Typography>
            <img src={course.imageLink} style={{ width: 300 }} alt={course.title} />
        </Card>
    );
}

function Courses() {
    const [courses, setCourses] = useState([]);

    const fetchCourses = () => {
        fetch("http://localhost:3000/admin/courses/", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses);
            })
            .catch(err => {
                console.error("Error fetching courses", err);
            });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {courses.map(course => {
                return <Course key={course._id} course={course}  />;
            })}
        </div>
    );
}

export default Courses;
