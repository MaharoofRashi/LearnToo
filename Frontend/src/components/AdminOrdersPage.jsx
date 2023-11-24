import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert } from 'antd';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to fetch orders. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const columns = [
        {
            title: 'Order ID',
            dataIndex: '_id',
            key: 'id'
        },
        {
            title: 'User ID',
            dataIndex: ['userId', '_id'],
            key: 'userId'
        },
        {
            title: 'Courses',
            dataIndex: 'courses',
            key: 'courses',
            render: courses => courses.map(course => course.title).join(", ")
        },
        {
            title: 'Date',
            dataIndex: 'orderDate',
            key: 'date',
            render: text => new Date(text).toLocaleDateString()
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'amount',
            render: amount => `₹ ${amount}`
        }
    ];


    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Course Orders</h1>
            {isLoading ? (
                <Spin size="large" />
            ) : error ? (
                <Alert message={error} type="error" />
            ) : (
                <Table dataSource={orders} columns={columns} rowKey="_id" />
            )}
        </div>
    );
};

export default AdminOrdersPage;
