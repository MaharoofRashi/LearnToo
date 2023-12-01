import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';

const AdminReportRequestsPage = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/report-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data);
        } catch (error) {
            message.error('Error fetching reports');
        }
    };

    const updateReportStatus = async (reportId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/admin/update-report-status', { reportId, status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success(`Report ${status}`);
            fetchReports();
        } catch (error) {
            message.error('Error updating report');
        }
    };

    const columns = [
        { title: 'Username', dataIndex: ['userId', 'username'], key: 'username' },
        { title: 'Course ID', dataIndex: ['courseId', 'title'], key: 'courseId' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button onClick={() => updateReportStatus(record._id, 'accepted')} disabled={record.status !== 'pending'}>Accept</Button>
                    <Button onClick={() => updateReportStatus(record._id, 'rejected')} disabled={record.status !== 'pending'}>Reject</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h2>Report Requests</h2>
            <Table dataSource={reports} columns={columns} rowKey="_id" />
        </div>
    );
};

export default AdminReportRequestsPage;