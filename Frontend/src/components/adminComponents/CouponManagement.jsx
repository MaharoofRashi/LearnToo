import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState(null);
    const [form] = Form.useForm();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseUrl}/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(response.data.coupons);
        } catch (error) {
            message.error('Failed to fetch coupons');
        }
    };

    const handleCouponSubmit = async (values) => {
        const token = localStorage.getItem('token');
        try {
            if (currentCoupon) {
                await axios.put(`${baseUrl}/admin/coupon/${currentCoupon._id}`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Coupon updated successfully');
            } else {
                await axios.post(`${baseUrl}/admin/coupon`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Coupon created successfully');
            }
            fetchCoupons();
            closeModal();
        } catch (error) {
            message.error('Failed to process coupon');
        }
    };

    const deleteCoupon = async (couponId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseUrl}/admin/coupon/${couponId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            message.error('Failed to delete coupon');
        }
    };

    const openModalForEdit = (coupon) => {
        const formattedCoupon = {
            ...coupon,
            expiryDate: coupon.expiryDate ? moment(coupon.expiryDate) : null
        };
        setCurrentCoupon(formattedCoupon);
        form.setFieldsValue(formattedCoupon);
        setIsModalVisible(true);
    };


    const closeModal = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentCoupon(null);
    };

    const columns = [
        { title: 'Code', dataIndex: 'code', key: 'code' },
        { title: 'Type', dataIndex: 'discountType', key: 'discountType' },
        { title: 'Value', dataIndex: 'discountValue', key: 'discountValue' },
        { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate' },
        { title: 'Usage Limit', dataIndex: 'usageLimit', key: 'usageLimit' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button icon={<EditOutlined />} onClick={() => openModalForEdit(record)}>
                        Edit
                    </Button>
                    <Button danger onClick={() => deleteCoupon(record._id)}>
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{ marginBottom: '20px' }}
            >
                Create Coupon
            </Button>
            <Table
                dataSource={coupons}
                columns={columns}
                rowKey="_id"
                style={{ marginBottom: '20px' }}
            />

            <Modal
                title={currentCoupon ? 'Edit Coupon' : 'Create Coupon'}
                visible={isModalVisible}
                onCancel={closeModal}
                footer={null}
                style={{ paddingTop: '20px', marginTop: '50px' }}
            >
                <Form form={form} onFinish={handleCouponSubmit} layout="vertical">
                    <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="discountType" label="Discount Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="percentage">Percentage</Option>
                            <Option value="fixed">Fixed Amount</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="discountValue" label="Discount Value" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="expiryDate" label="Expiry Date">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="usageLimit" label="Usage Limit">
                        <Input type="number" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ marginTop: '20px' }}
                    >
                        {currentCoupon ? 'Update' : 'Create'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CouponManagement;
