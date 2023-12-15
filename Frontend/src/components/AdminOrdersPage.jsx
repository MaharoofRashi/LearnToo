import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert } from 'antd';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [coursePurchaseCounts, setCoursePurchaseCounts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
    const [error, setError] = useState(null);
    const [subscriptionError, setSubscriptionError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(response.data)
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to fetch orders. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSubscriptions = async () => {
            setIsLoadingSubscriptions(true);
            setSubscriptionError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/admin/subscriptions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('data', response.data.data)
                setSubscriptions(response.data.data);
                setCoursePurchaseCounts(response.data.coursePurchaseCounts);
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                setSubscriptionError('Failed to fetch subscriptions. Please try again later.');
            } finally {
                setIsLoadingSubscriptions(false);
            }
        };

        fetchOrders();
        fetchSubscriptions();
    }, []);

    const orderColumns = [
        {
            title: 'Order ID',
            dataIndex: '_id',
            key: 'id',
        },
        {
            title: 'User ID',
            dataIndex: ['userId', '_id'],
            key: 'userId',
        },
        {
            title: 'Courses',
            dataIndex: 'courses',
            key: 'courses',
            render: courses => courses.map(course => course.title).join(", "),
        },
        {
            title: 'Date',
            dataIndex: 'orderDate',
            key: 'date',
            render: text => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'amount',
            render: amount => `₹ ${amount}`,
        },
    ];

    const subscriptionColumns = [
        {
            title: 'Subscription ID',
            dataIndex: 'subscriptionId',
            key: 'subscriptionId',
        },
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Courses',
            dataIndex: 'courses',
            key: 'courses',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: amount => `₹ ${amount}`,
        },
    ];


    const coursePurchaseCountColumns = [
        {
            title: 'Course Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Purchase Count',
            dataIndex: 'count',
            key: 'count',
        },
    ];

    const coursePurchaseCountsArray = Object.values(coursePurchaseCounts);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Course Orders</h1>
            {isLoading ? (
                <Spin size="large" />
            ) : error ? (
                <Alert message={error} type="error" />
            ) : (
                <Table dataSource={orders} columns={orderColumns} rowKey="_id" />
            )}

            <h1 style={{ marginTop: '40px', marginBottom: '20px' }}>Subscriptions</h1>
            {isLoadingSubscriptions ? (
                <Spin size="large" />
            ) : subscriptionError ? (
                <Alert message={subscriptionError} type="error" />
            ) : (
                <Table dataSource={subscriptions} columns={subscriptionColumns} rowKey="_id" />
            )}

            <h1 style={{ marginTop: '40px', marginBottom: '20px' }}>Course Purchase Counts</h1>
            <Table
                dataSource={coursePurchaseCountsArray}
                columns={coursePurchaseCountColumns}
                rowKey="title"
            />
        </div>
    );
};

export default AdminOrdersPage;
