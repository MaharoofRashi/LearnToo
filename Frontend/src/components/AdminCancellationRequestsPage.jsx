import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';

const AdminCancellationRequestsPage = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const response = await axios.get('http://localhost:3000/admin/cancellation-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRequests(response.data);
        } catch (error) {
            message.error('Error fetching requests');
        }
    };

    const updateRequestStatus = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/admin/update-cancellation-request', { requestId, status }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success(`Request ${status}`);
            fetchRequests();
        } catch (error) {
            message.error('Error updating request');
        }
    };


    const columns = [
        { title: 'Username', dataIndex: ['userId', 'username'], key: 'username' },
        { title: 'Course ID', dataIndex: 'courseId', key: 'courseId' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button onClick={() => updateRequestStatus(record._id, 'accepted')} disabled={record.status !== 'pending'}>Accept</Button>
                    <Button onClick={() => updateRequestStatus(record._id, 'rejected')} disabled={record.status !== 'pending'}>Reject</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h2>Cancellation Requests</h2>
            <Table dataSource={requests} columns={columns} rowKey="_id" />
        </div>
    );
};

export default AdminCancellationRequestsPage;
