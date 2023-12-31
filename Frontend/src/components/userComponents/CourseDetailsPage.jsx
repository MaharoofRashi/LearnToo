import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Typography, Spin, Breadcrumb, Button, Rate, Tag, Space, Divider, List, Input, Modal, Form } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartState } from '../../store/atoms/cartState.js';
import { message } from 'antd';
import {discountedPriceState} from "../../store/atoms/discountedPriceState.js";

const { Title, Paragraph, Text } = Typography;

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);
    const [cart, setCart] = useRecoilState(cartState);
    const navigate = useNavigate();
    const [isCancellationModalVisible, setIsCancellationModalVisible] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [discountedPrice, setDiscountedPrice] = useRecoilState(discountedPriceState);
    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${baseUrl}/user/course/details/${courseId}`);
                const data = await response.json();
                setCourse(data.course);
                const lessonsResponse = await fetch(`${baseUrl}/user/course/${courseId}/lessons`);
                const lessonsData = await lessonsResponse.json();
                setLessons(lessonsData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${baseUrl}/user/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.userProfile && Array.isArray(data.userProfile.purchasedCourses)) {
                        const purchasedCourseIds = data.userProfile.purchasedCourses;
                        setIsPurchased(purchasedCourseIds.includes(courseId));
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        };

        fetchCourseDetails();
        fetchUserProfile();
    }, [courseId]);

    const handleBuyNow = () => {
        navigate(`/checkout?courseId=${courseId}`);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning('Please login to add courses to cart');
            navigate('/signin');
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/user/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });

            const data = await response.json();
            if (response.ok) {
                setCart(data.cart);
                message.success('Course added to cart');
            } else {
                message.error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to add course to cart');
        }
    };

    const handleCancelCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/user/create-cancellation-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId, reason: cancellationReason })
            });
            const data = await response.json();
            if (response.ok) {
                message.success('Cancellation request submitted successfully.');
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Failed to submit cancellation request.');
        }
        setIsCancellationModalVisible(false);
    };

    const applyCoupon = async () => {
        try {
            const token = localStorage.getItem('token');
            let originalPrice = course.price
            const response = await fetch(`${baseUrl}/user/apply-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ couponCode, originalPrice })
            });
            const data = await response.json();
            if (response.ok) {
                setDiscountedPrice(data.discountedPrice);
                message.success('Coupon applied successfully', data.discountedPrice);
            } else {
                message.error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to apply coupon');
        }
    };

    // const checkCancellationStatus = async () => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         // Assuming you have an endpoint to check the status
    //         const response = await fetch(`${baseUrl}/user/check-cancellation-status/${courseId}`, {
    //             headers: { 'Authorization': `Bearer ${token}` }
    //         });
    //         const data = await response.json();
    //         if (data.status === 'rejected') {
    //             message.error('Your previous cancellation request for this course was rejected.');
    //         } else {
    //             setIsCancellationModalVisible(true);
    //         }
    //     } catch (error) {
    //         message.error('Error checking cancellation status.');
    //     }
    // };


    return (
        <div style={{ padding: '24px', backgroundColor: 'rgb(240,242,245)', minHeight: '100vh' }}>
            <Breadcrumb>
                <Breadcrumb.Item onClick={() => navigate('/')}>
                    <HomeOutlined />
                    <span>Home</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{course?.title}</Breadcrumb.Item>
            </Breadcrumb>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <Spin size="large" />
                </div>
            ) : course ? (
                <div className="course-detail-container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: '24px' }}>
                    {/* Main content */}
                    <div className="course-detail-main" style={{ flex: '0 1 70%', marginBottom: '24px', marginRight: '12px' }}>
                        {/* Course Details */}
                        <Card
                            hoverable
                            style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                            cover={
                                <img
                                    alt={course.title}
                                    src={`${baseUrl}/${course.image}`}
                                    style={{ objectFit: 'cover', height: '300px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                                />
                            }
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Title level={2}>{course.title}</Title>
                                <Rate disabled defaultValue={course.rating} />
                                <Tag color="blue">{course.category.name}</Tag>
                                <Paragraph>{course.description}</Paragraph>
                            </Space>
                        </Card>

                        {/* Lessons List */}
                        <List
                            itemLayout="vertical"
                            size="large"
                            dataSource={lessons}
                            renderItem={lesson => (
                                <List.Item key={lesson._id}>
                                    <List.Item.Meta
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <PlayCircleOutlined style={{ marginRight: 8 }} />
                                                <span style={{ fontWeight: 'bold' }}>{lesson.title}</span>
                                            </div>
                                        }
                                        description={lesson.description}
                                    />
                                </List.Item>
                            )}
                            style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                        />
                    </div>

                    {/* Sticky Sidebar for Purchase Actions */}
                    <div className="course-detail-sidebar" style={{
                        flex: '0 1 25%',
                        position: 'sticky',
                        top: '24px',
                        alignSelf: 'flex-start',
                        padding: '24px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        height: 'fit-content',
                        marginLeft: '12px'
                    }}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Text strong style={{ fontSize: '24px', color: discountedPrice !== null ? '#ff4d4f' : '#1677FF' }}>
                                {discountedPrice !== null ? (
                                    <>
                                        <span style={{ textDecoration: 'line-through', marginRight: '10px', color: '#bfbfbf' }}>
                                            ₹{course.price.toFixed(2)}
                                        </span>
                                        <span style={{ color: '#ff4d4f' }}>
                                            ₹{discountedPrice.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    `${course.price.toFixed(2)}`
                                )}
                            </Text>
                            {!isPurchased && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Input
                                            placeholder="Coupon code"
                                            style={{ marginBottom: '10px' }}
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <Button
                                            type="default"
                                            style={{ width: '100%' }}
                                            onClick={applyCoupon}
                                        >
                                            Apply Coupon
                                        </Button>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        type="danger"
                                        size="large"
                                        style={{ width: '100%' }}
                                        onClick={handleBuyNow}
                                    >
                                        Buy Now
                                    </Button>
                                </>
                            )}
                            {isPurchased && (
                                <>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{ width: '100%', marginBottom: '10px' }}
                                        onClick={() => navigate(`/course-content/${course._id}`)}
                                    >
                                        Go to Course
                                    </Button>
                                    <Button
                                        danger
                                        size="large"
                                        style={{ width: '100%' }}
                                        onClick={() => setIsCancellationModalVisible(true)}
                                    >
                                        Cancel Course
                                    </Button>
                                </>
                            )}
                            <Divider />
                            <Space direction="vertical" size="small">
                                <Button type="link" style={{ padding: 0 }}>
                                    Add to Wishlist
                                </Button>
                                <Text>30-Day Money-Back Guarantee</Text>
                            </Space>
                        </Space>
                    </div>
                    <Modal
                        title="Cancel Course"
                        visible={isCancellationModalVisible}
                        onOk={handleCancelCourse}
                        onCancel={() => setIsCancellationModalVisible(false)}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Enter reason for cancellation"
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                    </Modal>
                </div>
            ) : (
                <Typography style={{ textAlign: 'center' }}>No course details available.</Typography>
            )}
        </div>
    );

};

export default CourseDetailsPage;
