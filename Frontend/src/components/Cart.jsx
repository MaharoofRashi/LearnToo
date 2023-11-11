import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { cartState } from '../store/atoms/cartState';
import { List, Button, Card, Space, Typography, Image, Checkbox, Divider, Row, Col, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CartPage = () => {
    const [cart, setCart] = useRecoilState(cartState);
    const initialSelectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    const [selectedCourses, setSelectedCourses] = useState(initialSelectedCourses);

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                message.info('Please log in to view your cart');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/user/cart', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    setCart(data.cart);
                    if (!initialSelectedCourses || initialSelectedCourses.length === 0) {
                        setSelectedCourses(data.cart.map(item => item._id));
                    }
                } else {
                    message.error(data.message || 'Failed to fetch cart');
                }
            } catch (error) {
                console.error('Error:', error);
                message.error('Failed to fetch cart');
            }
        };

        fetchCart();
    }, [setCart]);

    useEffect(() => {
        localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
    }, [selectedCourses]);

    const handleRemoveFromCart = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning('Please login to manage your cart');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/user/cart/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setCart(currentCart => currentCart.filter(item => item._id !== courseId));
                setSelectedCourses(currentSelected => currentSelected.filter(id => id !== courseId));
                message.success('Course removed from cart');
            } else {
                message.error(data.message || 'Failed to remove course from cart');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to remove course from cart');
        }
    };

    const handleSelectCourse = (courseId) => {
        setSelectedCourses(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            } else {
                return [...prev, courseId];
            }
        });
    };

    const handleProceedToBuy = () => {
        // Logic to proceed to buy selected courses
        console.log('Selected courses to buy:', selectedCourses);
        // Redirect to payment or checkout page
        // ...
    };

    const isCourseSelected = (courseId) => selectedCourses.includes(courseId);

    return (
        <div style={{ padding: '24px', backgroundColor: 'rgb(240, 242, 245)', minHeight: '100vh' }}>
            <Title level={2} style={{ marginBottom: '20px' }}>Your Cart</Title>
            <List
                grid={{ gutter: 24, column: 1 }}
                dataSource={cart}
                renderItem={item => (
                    <List.Item key={item._id}>
                        <Card hoverable style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', padding: '20px' }}>
                            <Row align="middle">
                                <Col flex="none" style={{ marginRight: '20px' }}>
                                    <Checkbox
                                        checked={isCourseSelected(item._id)}
                                        onChange={() => handleSelectCourse(item._id)}
                                    />
                                </Col>
                                <Col flex="none">
                                    <Image
                                        width={150}
                                        height={150}
                                        alt={item.title}
                                        src={`http://localhost:3000/${item.image}`}
                                    />
                                </Col>
                                <Col flex="auto" style={{ paddingLeft: '20px' }}>
                                    <Title level={4}>{item.title}</Title>
                                    <Text>{item.description}</Text>
                                </Col>
                                <Col flex="none" style={{ textAlign: 'right', marginLeft: '20px' }}>
                                    <Text strong style={{ fontSize: '18px', display: 'block' }}>${item.price.toFixed(2)}</Text>
                                    <Button
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveFromCart(item._id)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        Remove
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </List.Item>
                )}
            />

            <Divider />

            <Row justify="end" align="middle" style={{ marginTop: '20px' }}>
                <Col>
                    <Title level={4} style={{ marginRight: '20px', display: 'inline' }}> {/* Inline style for Title */}
                        Total: ${selectedCourses.reduce((acc, courseId) => {
                            const course = cart.find(c => c._id === courseId);
                            return acc + (course ? course.price : 0);
                        }, 0).toFixed(2)}
                    </Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleProceedToBuy}
                        disabled={selectedCourses.length === 0}
                    >
                        Proceed to Buy
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;