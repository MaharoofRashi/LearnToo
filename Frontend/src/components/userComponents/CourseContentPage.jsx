import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Typography, Button } from 'antd';
const { Title } = Typography;

const CourseContentPage = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/course/${courseId}/lessons`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLessons(data);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchLessons();
    }, [courseId]);

    const columns = [
        {
            title: 'Lesson Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                if (record.fileType === 'mp4') {
                    return <Button type="primary" onClick={() => window.open(record.fileUrl, '_blank')}>Watch Video</Button>;
                } else if (record.fileType === 'pdf') {
                    return <Button type="primary" onClick={() => window.open(record.fileUrl, '_blank')}>View PDF</Button>;
                }
                return null;
            },
        },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto', marginTop: '20px'}}>
            <Title level={2}>Course Lessons</Title>
            <Table
                style={{marginTop:'40px'}}
                columns={columns}
                dataSource={lessons}
                rowKey={record => record._id}
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
};

export default CourseContentPage;
