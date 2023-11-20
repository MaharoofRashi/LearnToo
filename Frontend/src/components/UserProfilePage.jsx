import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, List, Modal, notification } from 'antd';
import { EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import axios from 'axios';

const UserProfilePage = () => {
    const [form] = Form.useForm();
    const [addresses, setAddresses] = useState([]);
    const [education, setEducation] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // Token retrieval
    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:3000',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axiosInstance.get('/user/profile');
            form.setFieldsValue(response.data.userProfile);
            setAddresses(response.data.userProfile.addresses);
            setEducation(response.data.userProfile.education);
        } catch (error) {
            notification.error({ message: 'Error fetching user profile', description: error.message });
        }
    };

    const onUpdateProfile = async (values) => {
        try {
            await axiosInstance.put('/user/profile', values);
            fetchUserProfile(); // Refresh the data
            notification.success({ message: 'Profile updated successfully' });
        } catch (error) {
            notification.error({ message: 'Error updating profile', description: error.message });
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        form.setFieldsValue(item ? {...item} : {});
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        await form.validateFields();
        const values = form.getFieldsValue();
        try {
            const endpoint = modalType === 'address' ? '/user/profile/address' : '/user/profile/education';
            const method = selectedItem ? 'put' : 'post';
            const url = selectedItem ? `${endpoint}/${selectedItem._id}` : endpoint;

            await axiosInstance[method](url, values);
            fetchUserProfile();
            setIsModalVisible(false);
            notification.success({ message: `Successfully ${selectedItem ? 'updated' : 'added'} ${modalType}` });
        } catch (error) {
            notification.error({ message: `Error saving ${modalType}`, description: error.message });
        }
    };

    const handleDelete = async (itemId) => {
        try {
            const endpoint = modalType === 'address' ? '/user/profile/address' : '/user/profile/education';
            await axiosInstance.delete(`${endpoint}/${itemId}`);
            fetchUserProfile();
            notification.success({ message: `${modalType} deleted successfully` });
        } catch (error) {
            notification.error({ message: `Error deleting ${modalType}`, description: error.message });
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            await axiosInstance.put('/user/profile/set-default-address', { addressId });
            fetchUserProfile(); // Refresh the data
            notification.success({ message: 'Default address set successfully' });
        } catch (error) {
            notification.error({ message: 'Error setting default address', description: error.message });
        }
    };


    const renderModalContent = () => {
        if (modalType === 'address') {
            return (
                <Form form={form} layout="vertical">
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
            );
        } else if (modalType === 'education') {
            return (
                <Form form={form} layout="vertical">
                    <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="institution" label="Institution" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="year" label="Year of Completion" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                </Form>
            );
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
            <Card title="User Profile" style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Form form={form} layout="vertical" onFinish={onUpdateProfile}>
                    <Form.Item name="name" label="Name">
                        <Input placeholder="Enter your name" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '10px' }}>Update Profile</Button>
                </Form>
            </Card>

            <Card title="Addresses" style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <List
                    dataSource={addresses}
                    renderItem={address => (
                        <List.Item actions={[
                            <EditOutlined key="edit" onClick={() => openModal('address', address)} style={{ color: '#1890ff', marginRight: '10px' }} />,
                            <DeleteOutlined key="delete" onClick={() => handleDelete(address._id)} style={{ color: '#ff4d4f', marginRight: '10px' }} />,
                            address.isDefault
                                ? <StarFilled key="default" style={{ color: 'gold' }} />
                                : <StarOutlined key="set-default" onClick={() => setDefaultAddress(address._id)} style={{ color: 'grey' }} />
                        ]} style={address.isDefault ? { backgroundColor: '#f0f8ff' } : {}}>
                            <div style={{ flex: 1 }}>
                                {address.street}, {address.city}, {address.state}, {address.country}, {address.zip}
                            </div>
                        </List.Item>
                    )}
                />
                <Button type="dashed" onClick={() => openModal('address')} style={{ width: '100%', marginTop: '10px' }}>Add Address</Button>
            </Card>

            <Card title="Education" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <List
                    dataSource={education}
                    renderItem={edu => (
                        <List.Item actions={[
                            <EditOutlined key="edit" onClick={() => openModal('education', edu)} />,
                            <DeleteOutlined key="delete" onClick={() => handleDelete(edu._id)} />
                        ]}>
                            <div style={{ flex: 1 }}>
                                {edu.degree}, {edu.institution}, {edu.year}
                            </div>
                        </List.Item>
                    )}
                />
                <Button type="dashed" onClick={() => openModal('education')} style={{ width: '100%', marginTop: '10px' }}>Add Education</Button>
            </Card>

            <Modal
                title={selectedItem ? 'Edit Details' : 'Add Details'}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                style={{ top: 20 }}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );

};

export default UserProfilePage;
