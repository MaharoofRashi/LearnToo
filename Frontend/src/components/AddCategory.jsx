import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Form, Input, Card, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        // Replace with your actual GET request to backend
        fetch("http://localhost:3000/admin/categories", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token") // Replace with your auth token
            }
        })
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => {
                message.error('Failed to fetch categories');
                console.error('Error:', error);
            });
    };

    const onFinish = (values) => {
        // Replace with your actual POST request to backend
        fetch("http://localhost:3000/admin/categories", {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token") // Replace with your auth token
            }
        })
            .then(response => response.json())
            .then(data => {
                message.success('Category added successfully!');
                form.resetFields();
                fetchCategories(); // Refresh the list
            })
            .catch(error => {
                message.error('Failed to add category');
                console.error('Error:', error);
            });
    };

    const handleDelete = (categoryId) => {
        // Replace with your actual DELETE request to backend
        fetch(`http://localhost:3000/admin/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token") // Replace with your auth token
            }
        })
            .then(response => {
                if (response.ok) {
                    setCategories(categories.filter(category => category.id !== categoryId));
                    message.success('Category deleted successfully!');
                } else {
                    throw new Error('Failed to delete category');
                }
            })
            .catch(error => {
                message.error(error.message);
            });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleEdit(record.id)} icon={<EditOutlined />} />
                    <Button onClick={() => handleDelete(record.id)} icon={<DeleteOutlined />} danger />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <Card>
                <Title level={2}>Add New Category</Title>
                <Form form={form} onFinish={onFinish} layout="vertical" name="addCategoryForm">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please input the category name!' }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Category
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Table columns={columns} dataSource={categories} rowKey="id" style={{ marginTop: '20px' }} />
        </div>
    );
}

export default CategoryPage;
