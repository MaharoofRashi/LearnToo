import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DatePicker, Select, Button, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


const baseUrl = import.meta.env.VITE_BASE_URL;

const getSalesReport = async (reportType, startDate, endDate) => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`${baseUrl}/admin/sales/${reportType}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD')
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sales report:', error);
        throw error;
    }
};

const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesManagementPage = () => {
    const [reportType, setReportType] = useState('daily');
    const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);
    const [salesData, setSalesData] = useState({ totalSales: 0, count: 0 });

    useEffect(() => {
        fetchSalesReport();
    }, [reportType, dateRange]);


    const fetchSalesReport = async () => {
        try {
            const data = await getSalesReport(reportType, dateRange[0], dateRange[1]);
            console.log("Fetched sales data:", data.sales);
            setSalesData(data.sales);
        } catch (error) {
            console.error('Failed to fetch sales report:', error);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const token = localStorage.getItem('token');
            let params = { reportType: reportType };

            if (reportType === 'interval') {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await axios.get(`${baseUrl}/admin/sales/download`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sales-report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download sales report:', error);
        }
    };

    const chartData = {
        labels: ['Sales Count', 'Total Sales'],
        datasets: [{
            label: 'Sales Data',
            data: [salesData?.count ?? 0, salesData?.totalSales ?? 0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div>
            <Card title="Sales Management" style={{margin: '20px'}}>
                <Select defaultValue="daily" onChange={value => setReportType(value)} style={{width: '200px'}}>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="yearly">Yearly</Option>
                    <Option value="interval">Custom Interval</Option>
                </Select>
                {reportType === 'interval' && (
                    <RangePicker onChange={dates => setDateRange(dates)} onOk={fetchSalesReport} />
                )}
                <Button icon={<DownloadOutlined />} onClick={handleDownloadReport}>
                    Download Report
                </Button>
                <Bar data={chartData} options={chartOptions} />
            </Card>
        </div>
    );
};

export default SalesManagementPage;
