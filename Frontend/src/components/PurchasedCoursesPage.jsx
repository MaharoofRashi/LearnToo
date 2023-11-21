import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, List, Typography, notification, Image } from 'antd';

const { Title } = Typography;

const PurchasedCoursesPage = () => {
    const [purchasedCourses, setPurchasedCourses] = useState([]);

    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/user/purchasedCourses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPurchasedCourses(response.data.purchasedCourses);
            } catch (error) {
                notification.error({ message: 'Failed to load purchased courses', description: error.message });
            }
        };
        fetchPurchasedCourses();
    }, []);

    return (
        <div style={{ padding: '20px', marginTop: '25px'}}>
            <Title level={2}>Purchased Courses</Title>
            <List
                style={{marginTop: '50px'}}
                grid={{ gutter: 16, column: 4 }}
                dataSource={purchasedCourses}
                renderItem={course => (
                    <List.Item key={course._id}>
                        <Card
                            hoverable
                            cover={<Image alt={course.title} src={`http://localhost:3000/${course.image}`} style={{ width: '100%', height: '220px', objectFit: 'cover' }}/>}
                            style={{ height: '340px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <Card.Meta title={course.title} description={course.description} style={{ flexGrow: 1, overflow: 'hidden' }} />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default PurchasedCoursesPage;
