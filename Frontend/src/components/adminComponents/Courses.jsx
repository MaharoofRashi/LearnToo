import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, message, Progress } from 'antd';
import { useNavigate } from "react-router-dom";
import { Modal } from 'antd';


const { Title, Paragraph } = Typography;

export function Course({ course, onDelete }) {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const handleDelete = (e) => {
        e.stopPropagation();
        Modal.confirm({
            title: 'Are you sure you want to delete this course?',
            content: 'This action cannot be undone.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                onDelete(course._id);
            }
        });
    };

    return (
        <Col xs={24} sm={12} md={8} lg={6} xl={6} style={{ padding: '10px' }}>
            <Card
                hoverable
                style={{ width: '100%' }}
                cover={<img alt={course.title} src={`${baseUrl}/${course.image}`} style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }} />}
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
    const [visibleCourses, setVisibleCourses] = useState(8);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const fetchCourses = () => {
        fetch(`${baseUrl}/admin/courses/`, {
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
        fetch(`${baseUrl}/admin/courses/${courseId}`, {
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

    const checkIfBottom = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            setIsFetching(true);
        }
    };

    useEffect(() => {
        fetchCourses();
        window.addEventListener('scroll', checkIfBottom);
        return () => window.removeEventListener('scroll', checkIfBottom);
    }, []);

    useEffect(() => {
        let interval;
        if (isFetching && visibleCourses < courses.length) {
            interval = setInterval(() => {
                setLoadingProgress(prevProgress => {
                    if (prevProgress >= 100) {
                        clearInterval(interval);
                        setVisibleCourses(prev => prev + 8);
                        return 0;
                    }
                    return prevProgress + 10;
                });
            }, 100);
        }
        return () => interval && clearInterval(interval);
    }, [isFetching, visibleCourses, courses.length]);

    return (
        <div>
            <Row gutter={16} justify="start">
                {courses.slice(0, visibleCourses).map(course => (
                    <Course key={course._id} course={course} onDelete={deleteCourseById} />
                ))}
            </Row>
            {visibleCourses < courses.length && (
                <Row justify="center" style={{ marginTop: '20px' }}>
                    <Progress type="circle" percent={loadingProgress} />
                </Row>
            )}
        </div>
    );
}

export default Courses;
