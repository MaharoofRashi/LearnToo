import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Modal, Form, Input, notification, Row, Col, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import {discountedPriceState} from "../store/atoms/discountedPriceState.js";
const { Title, Text, Paragraph } = Typography;
import { useRecoilState } from 'recoil';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [courses, setCourses] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [discountedPrice] = useRecoilState(discountedPriceState);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams(window.location.search);
        const directCourseId = queryParams.get('courseId');
        const selectedCourseIds = queryParams.get('selectedCourses')?.split(',');

        const fetchDirectCourse = async (courseId) => {
            try {
                const response = await axios.get(`http://localhost:3000/user/course/details/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
                setCourses([response.data.course]);
            } catch (error) {
                notification.error({ message: 'Failed to load course', description: error.message });
            }
        };
        const fetchCourseDetails = async (courseId) => {
            try {
                const response = await axios.get(`http://localhost:3000/user/course/details/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data.course;
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };
        const fetchSelectedCourses = async () => {
            if (selectedCourseIds && selectedCourseIds.length > 0) {
                const courseDetailsPromises = selectedCourseIds.map(courseId => fetchCourseDetails(courseId));
                const detailedCourses = await Promise.all(courseDetailsPromises);
                setCourses(detailedCourses.filter(course => course != null));
            }
        };

        const fetchCoursesFromCart = async () => {
            try {
                const cartResponse = await axios.get('http://localhost:3000/user/cart', { headers: { Authorization: `Bearer ${token}` } });
                const cartCourseIds = cartResponse.data.cart;

                const courseDetailsPromises = cartCourseIds.map(courseId =>
                    axios.get(`http://localhost:3000/user/course/details/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
                );

                const courseDetailsResponses = await Promise.all(courseDetailsPromises);
                const detailedCourses = courseDetailsResponses.map(response => response.data.course);
                setCourses(detailedCourses.filter(course => course != null));
            } catch (error) {
                notification.error({ message: 'Failed to load courses from cart', description: error.message });
            }
        };

        if (directCourseId) {
            fetchDirectCourse(directCourseId);
        } else if (selectedCourseIds && selectedCourseIds.length > 0) {
            fetchSelectedCourses(selectedCourseIds);
        } else {
            fetchCoursesFromCart();
        }


        fetchSelectedCourses();
        const fetchAddresses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/user/profile', { headers: { Authorization: `Bearer ${token}` } });
                setAddresses(response.data.userProfile.addresses);
                const defaultAddress = response.data.userProfile.addresses.find(address => address.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress._id);
                }
            } catch (error) {
                notification.error({ message: 'Failed to load addresses', description: error.message });
            }
        };

        fetchAddresses();
    }, []);

    const handleAddressSelect = (addressId) => {
        setSelectedAddress(addressId);
    };

    const handleAddNewAddress = async () => {
        try {
            const newAddress = await form.validateFields(); // This will ensure all required fields are filled
            const response = await axios.post('http://localhost:3000/user/profile/address', newAddress, { headers: { Authorization: `Bearer ${token}` } });
            setAddresses([...addresses, response.data]);
            notification.success({ message: 'New address added successfully' });
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            notification.error({ message: 'Error adding new address', description: error.message });
        }
    };


    const handlePayment = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const originalAmount = calculateOriginalTotalAmount();
            const amount = calculateTotalAmount();
            const orderResponse = await axios.post('http://localhost:3000/user/create-order', { amount }, { headers: { Authorization: `Bearer ${token}` } });
            const { id: orderId } = orderResponse.data;
            const options = {
                key: 'rzp_test_ArWcR87jecE0KX',
                amount: amount,
                currency: 'INR',
                name: 'Course Purchase',
                description: 'Payment for courses',
                order_id: orderId,
                handler: async (response) => {
                    try {
                        const verificationResponse = await axios.post('http://localhost:3000/user/verify-payment', {
                            ...response,
                            orderCreationId: orderId,
                            courseId: courses.map(course => course._id),
                            originalAmount: originalAmount,
                            discountedAmount: discountedPrice !== null ? discountedPrice : originalAmount,
                            billingAddress: selectedAddress
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        if (verificationResponse.data.verified) {
                            notification.success({ message: 'Payment successful' });
                            await axios.post('http://localhost:3000/user/clear-cart', {
                                purchasedCourseIds: courses.map(course => course._id)
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            navigate('/purchased-courses');
                        } else {
                            notification.error({ message: 'Payment verification failed' });
                        }
                    } catch (error) {
                        notification.error({ message: 'Payment verification failed', description: error.message });
                    }
                },
                theme: { color: '#1677FF' }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            notification.error({ message: 'Payment failed', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    const calculateOriginalTotalAmount = () => {
        return courses.reduce((total, course) => total + course.price, 0) * 100;
    };
    const calculateTotalAmount = () => {
        if (discountedPrice !== null) {
            return discountedPrice * 100;
        }
        return courses.reduce((total, course) => total + course.price, 0) * 100;
    };

    const renderAddress = (address) => (
        <div
            key={address._id}
            onClick={() => handleAddressSelect(address._id)}
            style={{
                padding: '10px',
                border: selectedAddress === address._id ? '2px solid blue' : '1px solid lightgray',
                borderRadius: '5px',
                marginBottom: '10px',
                cursor: 'pointer'
            }}
        >
            <HomeOutlined style={{ marginRight: '10px' }} />
            {`${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zip}`}
        </div>
    );

    const formatAmountForDisplay = (amountInPaise) => {
        const amountStr = amountInPaise.toString();
        return amountStr.slice(0, -2) + '.' + amountStr.slice(-2);
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', marginTop: '40px', backgroundColor: '#f7f7f7', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: '100vh' }}>
            <Card title="Checkout" bordered={false} style={{ backgroundColor: 'white', borderRadius: '10px', marginBottom: '30px' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={courses}
                    renderItem={course => (
                        <List.Item key={course.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '15px' }}>
                            <Row gutter={16} align="middle" style={{ width: '100%' }}>
                                <Col span={6}>
                                    <img
                                        alt={course.title}
                                        src={`http://localhost:3000/${course.image}`}
                                        style={{ width: '100%', borderRadius: '10px' }}
                                    />
                                </Col>
                                <Col span={14}>
                                    <Title level={5} style={{ margin: 0 }}>{course.title}</Title>
                                    <Text style={{ fontSize: '16px', color: '#595959' }}>{course.description}</Text>
                                </Col>
                                <Col span={4} style={{ textAlign: 'right' }}>
                                    <Text strong style={{ fontSize: '18px' }}>{`₹${course.price}`}</Text>
                                </Col>
                            </Row>
                        </List.Item>
                    )}
                />

                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                    <Title level={4} style={{ marginBottom: '20px' }}>Billing Details</Title>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <Text>Original Total:</Text>
                        <Text>{`₹${formatAmountForDisplay(calculateOriginalTotalAmount())}`}</Text>
                    </div>
                    {discountedPrice !== null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <Text strong>Discounted Total:</Text>
                            <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>{`₹${formatAmountForDisplay(discountedPrice * 100)}`}</Text>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '30px' }}>
                    <Title level={4} style={{ marginBottom: '20px' }}>Select Address</Title>
                    {addresses.map(address => renderAddress(address))}
                    <Button type="dashed" onClick={() => setIsModalVisible(true)} style={{ width: '100%', marginTop: '15px' }}>Add New Address</Button>
                </div>
            </Card>

            <Button
                type="primary"
                onClick={handlePayment}
                disabled={!selectedAddress}
                style={{ width: '100%', fontSize: '16px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', marginTop: '20px' }}
            >
                Proceed to Pay
            </Button>

            <Modal
                title="Add New Address"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                        Add Address
                    </Button>,
                ]}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleAddNewAddress}>
                    <Form.Item name="street" label="Street" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="city" label="City" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="state" label="State" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="zip" label="Postal/Zip Code" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CheckoutPage;
