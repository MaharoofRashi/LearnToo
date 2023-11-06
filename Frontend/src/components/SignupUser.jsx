import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { otpVerifiedState } from '../store/atoms/otpVerifiedState.js';
import { currentUserState } from '../store/atoms/userState.js';
import { jwtDecode } from 'jwt-decode';


const { Title, Paragraph } = Typography;

const Signup = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useRecoilState(otpVerifiedState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        let interval;
        if (otpSent && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((currentCountdown) => currentCountdown - 1);
            }, 1000);
        } else if (countdown <= 0) {
            setOtpSent(false);
            localStorage.removeItem('otpVerified');
        }
        return () => {
            clearInterval(interval);
            localStorage.removeItem('otpVerified');
        };
    }, [otpSent, countdown]);

    const onRequestOtp = async () => {
        try {
            const email = form.getFieldValue('email');
            if (email) {
                setLoading(true);
                const response = await fetch('http://localhost:3000/user/request-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: email }),
                });
                const data = await response.json();
                if (response.ok) {
                    setOtpSent(true);
                    setCountdown(300);
                    message.success(data.message);
                } else {
                    message.error(data.message);
                }
                setLoading(false);
            } else {
                message.error("Please enter your email first.");
            }
        } catch (error) {
            message.error("An error occurred while sending the OTP.");
            setLoading(false);
        }
    };

    const onVerifyOtp = async () => {
        try {
            const values = form.getFieldsValue(['email', 'otp']);
            setLoading(true);
            const response = await fetch('http://localhost:3000/user/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.email,
                    otp: values.otp,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setOtpVerified(true);
                message.success('OTP verified successfully!');
            } else {
                message.error(data.message);
            }
            setLoading(false);
        } catch (error) {
            message.error('An error occurred while verifying the OTP.');
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        if (!otpVerified) {
            message.error('Please verify the OTP before signing up.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    username: values.email,
                    password: values.password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                message.success('Signup successful!');
                localStorage.setItem("token", data.token);
                setCurrentUser(jwtDecode(data.token));
                navigate('/');
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Signup failed!');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', backgroundColor: 'rgb(240, 242, 245)' }}>
            <Card style={{ width: 300 }}>
                <Title level={2} style={{ textAlign: 'center' }}>Sign Up</Title>
                <Paragraph style={{ textAlign: 'center' }}>
                    Join us and start your learning journey!
                </Paragraph>
                <Divider />
                <Form
                    form={form}
                    name="signup"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Name" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { type: 'email', message: 'The input is not valid E-mail!' },
                            { required: true, message: 'Please input your E-mail!' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    {otpSent && (
                        <Form.Item
                            name="otp"
                            rules={[{ required: true, message: 'Please input the OTP sent to your email!' }]}
                        >
                            <Input prefix={<KeyOutlined />} placeholder="OTP" />
                        </Form.Item>
                    )}

                    {!otpVerified && otpSent && (
                        <Form.Item>
                            <Button onClick={onVerifyOtp} block disabled={loading}>
                                Verify OTP
                            </Button>
                        </Form.Item>
                    )}

                    {otpVerified && (
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block disabled={loading || !form.isFieldsTouched(true) || form.getFieldsError().filter(({ errors }) => errors.length).length}>
                                Sign Up
                            </Button>
                        </Form.Item>
                    )}

                    {!otpSent && (
                        <Form.Item>
                            <Button onClick={onRequestOtp} block disabled={loading}>
                                Request OTP
                            </Button>
                        </Form.Item>
                    )}

                    {otpSent && countdown > 0 && (
                        <Form.Item>
                            <Button block disabled>
                                Resend OTP in {Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}
                            </Button>
                        </Form.Item>
                    )}

                    {otpSent && countdown <= 0 && (
                        <Form.Item>
                            <Button onClick={onRequestOtp} block disabled={loading}>
                                Resend OTP
                            </Button>
                        </Form.Item>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default Signup;
