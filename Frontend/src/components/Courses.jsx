import { Card, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";

export function Course({ course, onDelete }) {
    return (
        <Card style={{ margin: 10, width: 300, minHeight: 200 }}>
            <Typography textAlign={"center"} variant="h5">{course.title}</Typography>
            <Typography textAlign={"center"} variant="subtitle1">{course.description}</Typography>
            <img src={course.imageLink} style={{ width: 300 }} alt={course.title} />
            <Button variant="contained" color="secondary" onClick={() => onDelete(course._id)}>
                Delete
            </Button>
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

    const deleteCourseById = (courseId) => {
        fetch(`http://localhost:3000/admin/courses/${courseId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("Course deleted", data);
                // Refresh the courses list
                fetchCourses();
            })
            .catch(err => {
                console.error("Error deleting course", err);
            });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {courses.map(course => {
                return <Course key={course._id} course={course} onDelete={deleteCourseById} />;
            })}
        </div>
    );
}

export default Courses;
