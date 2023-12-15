import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Form, Input, message, Typography, Upload, Select, InputNumber} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import axios from 'axios';


const { Title } = Typography;
const { Dragger } = Upload;

function AddCourse() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    const token1 = localStorage.getItem("token");

    useEffect(() => {
        fetch("http://localhost:3000/admin/categories", {
            headers: {
                "Authorization": "Bearer " + token1,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setCategories(data);
            })
            .catch((error) => {
                message.error('Failed to fetch categories: ' + error.message);
            });
    }, [token1]);


    // Check if the user is logged in
    const token = localStorage.getItem("token");
    useEffect(() => {
        // Check if the user is logged in
        if (!token) {
            message.error("You must be logged in to add a course.");
            navigate('/admin/signin');
        }
    }, [token1, navigate]);

    // This function is called before the file is uploaded
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
        }
        return isImage || Upload.LIST_IGNORE;
    };

    // This function is to handle the file list change
    const handleFileChange = (info) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1); // Keep only the last selected file
        setFileList(fileList);
    };

    const onFinish = async (values) => {
        console.log(values);
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('price', values.price);
        formData.append('category', values.category);
        formData.append('published', values.published);
        fileList.forEach((file) => {
            formData.append('courseImage', file.originFileObj);
        });
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Set up the headers for the request
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'multipart/form-data'
            }
        };

        try {
            // Use axios to send the POST request
            const response = await axios.post("http://localhost:3000/admin/courses", formData, config);
            // If the request is successful, handle the response here
            console.log(response.data);
            message.success('Course added successfully!');
            navigate('/admin/courses');
        } catch (error) {
            // Handle any errors here
            console.error(error.response ? error.response.data : error.message);
            message.error(error.response ? error.response.data.message : error.message);
        }
    };

    const onFinishFailed = (errorInfo) => {
        message.error('Please check the form for errors.');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '700px', margin: '2rem auto' }}>
            <Card bordered={false}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Add New Course
                </Title>
                <Form
                    name="add_course_form"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input the title of the course!' }]}
                    >
                        <Input placeholder="Enter course title" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input the course description!' }]}
                    >
                        <Input.TextArea placeholder="Enter course description" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category!' }]}
                    >
                        <Select placeholder="Select a category">
                            {categories.map(category => (
                                <Select.Option key={category._id} value={category._id}>
                                    {category.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="published"
                        label="Publish Status"
                        rules={[{ required: true, message: 'Please select the publish status!' }]}
                    >
                        <Select placeholder="Select publish status">
                            <Select.Option value={true}>Published</Select.Option>
                            <Select.Option value={false}>Unpublished</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: 'Please input the price of the course!' }]}
                    >
                        <InputNumber
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Enter course price"
                            min={0} // minimum value
                        />
                    </Form.Item>


                    <Form.Item
                        name="upload"
                        label="Course Image"
                        valuePropName="fileList"
                        getValueFromEvent={handleFileChange}
                        extra="Select an image for the course"
                    >
                        <Dragger
                            name="courseImage"
                            beforeUpload={beforeUpload}
                            onChange={handleFileChange}
                            multiple={false}
                            fileList={fileList}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single upload. Strictly prohibit from uploading company data or other
                                band files
                            </p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Add Course
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default AddCourse;