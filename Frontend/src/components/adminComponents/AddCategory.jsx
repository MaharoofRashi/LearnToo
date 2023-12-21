import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Form, Input, Card, Typography, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        // Replace with your actual GET request to backend
        fetch(`${baseUrl}/admin/categories`, {
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

    const onFinish = async (values) => {
        try {
            const response = await fetch(`${baseUrl}/admin/categories`, {
                method: "POST",
                body: JSON.stringify(values),
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add category');
            }
            message.success('Category added successfully!');
            form.resetFields();
            fetchCategories();
        } catch (error) {
            message.error(error.message);
            console.error('Error:', error);
        }
    };


    const handleDelete = (categoryId) => {
        fetch(`${baseUrl}/admin/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.ok) {
                    // Filter out the deleted category
                    setCategories(prevCategories => prevCategories.filter(category => category._id !== categoryId));
                    message.success('Category deleted successfully!');
                } else {
                    throw new Error('Failed to delete category');
                }
            })
            .catch(error => {
                message.error(error.message);
            });
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsModalVisible(true);
        form.setFieldsValue({
            name: category.name,
        });
    };

    const handleUpdate = async (values) => {
        try {
            // Send the PUT request using fetch
            const response = await fetch(`${baseUrl}/admin/categories/${editingCategory._id}`, {
                method: "PUT",
                body: JSON.stringify(values),
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update category');
            }
            if (data.message === "Category already exists.") {
                alert("Category already exists.");
            } else {
                message.success("Category updated successfully.");
                fetchCategories();
                setIsModalVisible(false);
                setEditingCategory(null);
                form.resetFields();

            }
        } catch (error) {
            message.error(error.message);
        }
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
            render: (text, record) => (
                <Space size="middle">
                    <Button onClick={() => handleEdit(record)} icon={<EditOutlined />} />
                    <Button onClick={() => handleDelete(record._id)} icon={<DeleteOutlined />} danger />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <Card>
                <Title level={2}>Add New Category</Title>
                <Form form={form} onFinish={editingCategory ? handleUpdate : onFinish} layout="vertical" name="addCategoryForm">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please input the category name!' }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingCategory ? 'Update Category' : 'Add Category'}
                        </Button>
                        {editingCategory && (
                            <Button
                                style={{ marginLeft: '8px' }}
                                onClick={() => {
                                    setEditingCategory(null);
                                    form.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </Card>
            <Table columns={columns} dataSource={categories} rowKey="_id" style={{ marginTop: '20px' }} />
            <Modal
                title="Edit Category"
                visible={isModalVisible}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => {
                            handleUpdate(values);
                        })
                        .catch((info) => {
                            console.log('Validate Failed:', info);
                        });
                }}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingCategory(null);
                }}
            >
                <Form form={form} layout="vertical" name="editCategoryForm">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please input the category name!' }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryPage;
