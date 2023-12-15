import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert, Radio, Layout, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;

const Signin = () => {
    const navigate = useNavigate();
    const [loginOption, setLoginOption] = useState("password");
    const [form] = Form.useForm();
    const [error, setError] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);

    // Check if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/admin/courses");
        }
    }, [navigate]);

    const onFinish = async (values) => {
        let apiURL;
        let payload;

        if (loginOption === "password") {
            apiURL = "http://localhost:3000/admin/login";
            payload = {
                username: values.username,
                password: values.password,
            };
        } else {
            apiURL = "http://localhost:3000/admin/verify-otp";
            payload = {
                username: values.username,
                otp: values.otp,
            };
        }

        try {
            const response = await fetch(apiURL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location = "/admin/courses";
            } else {
                setError(data.message || "An error occurred");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    const handleRequestOtp = async () => {
        // Only proceed if the username (email) field is valid
        form.validateFields(['username'])
            .then(async (values) => {
                const apiURL = "http://localhost:3000/admin/request-otp";
                const payload = {
                    username: values.username,
                };

                try {
                    const response = await fetch(apiURL, {
                        method: "POST",
                        body: JSON.stringify(payload),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    const data = await response.json();
                    if (data.message === 'OTP sent') {
                        setError('');
                        setIsOtpSent(true);
                    } else {
                        setError(data.message || "An error occurred");
                    }
                } catch (err) {
                    setError("An error occurred");
                }
            })
            .catch((errorInfo) => {
                // Handle the validation error if the username (email) is not filled
                setError("Please enter your email to request an OTP.");
            });
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Content style={{ padding: '50px', marginTop: 120 }}>
                <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
                    <Col xs={24} sm={16} md={12} lg={8} xl={6}>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>Admin Login</Title>
                        <Form
                            form={form}
                            name="normal_login"
                            className="login-form"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            style={{ maxWidth: '300px', margin: 'auto' }}
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please input your Username!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                            >
                                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                            </Form.Item>
                            {loginOption === 'password' && (
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Please input your Password!' }]}
                                >
                                    <Input
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        type="password"
                                        placeholder="Password"
                                    />
                                </Form.Item>
                            )}
                            {loginOption === 'otp' && (
                                <Form.Item
                                    name="otp"
                                    rules={[{ required: true, message: 'Please input your OTP!' }]}
                                >
                                    <Input
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="OTP"
                                        disabled={!isOtpSent} // Disable OTP input until OTP is sent
                                    />
                                </Form.Item>
                            )}
                            <Form.Item style={{marginTop: 50}}>
                                <Button type="primary" htmlType="submit" className="login-form-button" block>
                                    {loginOption === 'password' ? 'Log in' : 'Verify OTP'}
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Radio.Group value={loginOption} onChange={(e) => setLoginOption(e.target.value)}>
                                    <Radio value="password">Password Login</Radio>
                                    <Radio value="otp">OTP Login</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {loginOption === 'otp' && (
                                <Form.Item>
                                    <Button onClick={handleRequestOtp} block disabled={isOtpSent}>
                                        {isOtpSent ? 'OTP Sent' : 'Request OTP'}
                                    </Button>
                                </Form.Item>
                            )}
                        </Form>
                        {error && (
                            <Alert
                                message="Error"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginTop: '20px' }}
                            />
                        )}
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Signin;
