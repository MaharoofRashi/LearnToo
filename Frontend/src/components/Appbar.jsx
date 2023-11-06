import React from 'react';
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

const { Header } = Layout;
const { Search } = Input;

const Appbar = ({ isLoggedIn, handleLogout }) => {
    const menu = (
        <Menu>
            <Menu.Item key="0">
                <Link to="/cart">My Cart</Link>
            </Menu.Item>
            <Menu.Item key="1">
                <Link to="/wishlist">Wishlist</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/purchased-courses">My Purchased Courses</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="3" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', background: 'white', height: '64px' }}>
            <Link to="/" style={{ fontSize: '1.5em', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                LearnToo
            </Link>
            <Space align="center" size="large" style={{ height: '100%' }}>
                <Search placeholder="Search courses" onSearch={value => console.log(value)} style={{ width: 400, verticalAlign: 'middle' }} enterButton />
                <Menu mode="horizontal" selectable={false} style={{ borderBottom: 'none', lineHeight: '64px' }}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to="/">Home</Link>
                    </Menu.Item>
                    {!isLoggedIn ? (
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
                            <Dropdown overlay={menu} trigger={['click']}>
                                <a onClick={e => e.preventDefault()}>
                                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                                </a>
                            </Dropdown>
                            <Button icon={<ShoppingCartOutlined />}>
                                <Link to="/cart">Cart</Link>
                            </Button>
                        </Space>
                    )}
                </Menu>
            </Space>
        </Header>
    );
};

export default Appbar;
