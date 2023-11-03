import React from 'react';
import { Layout, Button, Avatar, Menu, Dropdown } from 'antd';
import { Outlet } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, LogoutOutlined, ProfileOutlined } from "@ant-design/icons";
import Logo from '../components/AdminLogo.jsx';
import MenuList from '../components/AdminMenuList.jsx';
import ToggleThemeButton from "./ToggleThemeButton";
import { useRecoilState } from "recoil";
import { darkThemeState } from "../store/atoms/darkThemeState.js";
import { collapsedState } from "../store/atoms/collapsedState.js";

const { Header, Sider, Content } = Layout;

const SidebarLayout = ({ toggleTheme, headerBackgroundColor }) => {
    const [darkTheme] = useRecoilState(darkThemeState);
    const [collapsed, setCollapsed] = useRecoilState(collapsedState);

    const handleLogout = () => {
        // Implement your logout logic here
        console.log('User logged out');
    };

    const handleProfileClick = () => {
        // Implement your profile view logic here
        console.log('Profile clicked');
    };

    // Dropdown menu for the admin profile
    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={handleProfileClick} style={{ fontSize: '16px' }}>
                <ProfileOutlined style={{ marginRight: '8px' }} />
                My Profile
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" onClick={handleLogout} style={{ fontSize: '16px' }}>
                <LogoutOutlined style={{ marginRight: '8px' }} />
                Logout
            </Menu.Item>
        </Menu>
    );

    const AdminProfile = () => (
        <div style={{ display: 'flex', alignItems: 'center', float: 'right', marginRight: '16px' }}>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                <a onClick={e => e.preventDefault()} href="#">
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} icon={<UserOutlined />} />
                </a>
            </Dropdown>
        </div>
    );

    return (
        <Layout>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={darkTheme ? 'dark' : 'light'}
                className='sidebar'
            >
                <Logo />
                <MenuList darkTheme={darkTheme} />
                <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme} />
            </Sider>
            <Layout className="site-layout">
                <Header
                    className="site-layout-background"
                    style={{
                        padding: 0,
                        background: headerBackgroundColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        type='text'
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ marginLeft: '16px' }}
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    />
                    <AdminProfile />
                </Header>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <Outlet /> {/* This is where the nested routes' components will be rendered */}
                </Content>
            </Layout>
        </Layout>
    );
};

export default SidebarLayout;