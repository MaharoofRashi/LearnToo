import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { currentUserState } from '../../store/atoms/userState.js';
import { useSetRecoilState } from 'recoil';
import { searchTermState } from '../../store/atoms/searchState.js';
import { Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Button, Dropdown, Input, Space } from 'antd';
import {
    HomeOutlined,
    LoginOutlined,
    UserAddOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';

const { Header } = Layout;
const { Search } = Input;

const Appbar = () => {
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const setSearchTerm = useSetRecoilState(searchTermState);

    useEffect(() => {
        const checkAuthState = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        setCurrentUser(decodedToken);
                    } else {
                        localStorage.removeItem('token');
                        setCurrentUser(null);
                    }
                } catch (error) {
                    console.error('Token decoding failed', error);
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                }
            }
        };

        checkAuthState();
    }, [setCurrentUser]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const menu = (
        <Menu>
            <Menu.Item key="0">
                <Link to="/profile">My Profile</Link>
            </Menu.Item>
            <Menu.Item key="1">
                <Link to="/chat">Chat</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/purchased-courses">Purchased Courses</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="3" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', background: 'rgb(255,255,255)', height: '64px', borderBottom: '2px solid #e0e0e0',boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
            <Link to="/" style={{ fontSize: '1.5em', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                LearnToo
            </Link>
            <Space align="center" size="large" style={{ height: '100%' }}>
                <Search
                    placeholder="Search courses"
                    onSearch={value => setSearchTerm(value)}
                    style={{ width: 400, verticalAlign: 'middle' }}
                    enterButton
                />
                <Menu mode="horizontal" selectable={false} style={{ borderBottom: 'none', lineHeight: '64px' }}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to="/">Home</Link>
                    </Menu.Item>
                    {!currentUser ? (
                        <Space>
                            <Button type="primary" icon={<LoginOutlined />}>
                                <Link to="/signin">Sign In</Link>
                            </Button>
                            <Button icon={<UserAddOutlined />}>
                                <Link to="/signup">Sign Up</Link>
                            </Button>
                        </Space>
                    ) : (
                        <Space>
                            <Button icon={<ShoppingCartOutlined />}>
                                <Link to="/cart">Cart</Link>
                            </Button>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <a onClick={e => e.preventDefault()}>
                                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                                </a>
                            </Dropdown>
                        </Space>
                    )}
                </Menu>
            </Space>
        </Header>
    );
};

export default Appbar;
