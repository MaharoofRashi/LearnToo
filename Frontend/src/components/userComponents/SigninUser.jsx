import React, {useEffect, useState} from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { jwtDecode } from 'jwt-decode';
import { currentUserState } from '../../store/atoms/userState.js';

const { Title } = Typography;

const Signin = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const setCurrentUser = useSetRecoilState(currentUserState);
    const [loading, setLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_BASE_URL;

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
        }
    }, [navigate]);
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.email,
                    password: values.password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setCurrentUser(jwtDecode(data.token));
                navigate('/');
                message.success('Login successful!');
            } else {
                message.error(data.message || "Login failed");
            }
        } catch (error) {
            message.error("An error occurred during login");
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', backgroundColor: 'rgb(240, 242, 245)' }}>
            <Card style={{ width: 300, padding: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>Sign In</Title>
                <Form
                    form={form}
                    name="signin"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { type: 'email', message: 'The input is not valid E-mail!' },
                            { required: true, message: 'Please input your E-mail!' },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Signin;
