import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, message } from 'antd';
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

export function Course({ course, onDelete }) {
    const navigate = useNavigate();

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(course._id);
    };

    return (
        <Col xs={24} sm={12} md={8} lg={6} xl={6} style={{ padding: '10px' }}>
            <Card
                hoverable
                style={{ width: '100%' }}
                cover={<img alt={course.title} src={`http://localhost:3000/${course.image}`} style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }} />}
                onClick={() => navigate(`/admin/course/${course._id}`)}
            >
                <Title level={4}>{course.title}</Title>
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                    {course.description}
                </Paragraph>
                <Button type="primary" danger onClick={handleDelete}>
                    Delete
                </Button>
            </Card>
        </Col>
    );
}

function Courses() {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

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
                message.error('Failed to fetch courses.');
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
                message.success('Course deleted successfully.');
                fetchCourses();
            })
            .catch(err => {
                console.error("Error deleting course", err);
                message.error('Failed to delete course.');
            });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <Row gutter={16} justify="start">
            {courses.map(course => (
                <Course key={course._id} course={course} onDelete={deleteCourseById} />
            ))}
        </Row>
    );
}

export default Courses;
