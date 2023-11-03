import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Form, Input, message, Typography, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';

const { Title } = Typography;
const { Dragger } = Upload;

function AddCourse() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);

    // Check if the user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
        message.error("You must be logged in to add a course.");
        navigate('/admin/signin');
        return null; // Or a loading spinner until redirect
    }

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

    const onFinish = (values) => {
        // Create a new FormData object for the file upload
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        fileList.forEach((file) => {
            formData.append('image', file.originFileObj);
        });

        // Post request to add course with the file
        fetch("http://localhost:3000/admin/courses", {
            method: "POST",
            body: formData, // FormData will be sent as multipart/form-data
            headers: {
                "Authorization": "Bearer " + token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to add course');
                }
                return res.json();
            })
            .then((data) => {
                message.success('Course added successfully!');
                navigate('/admin/courses');
            })
            .catch((error) => {
                message.error(error.message);
            });
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
                        name="upload"
                        label="Course Image"
                        valuePropName="fileList"
                        getValueFromEvent={handleFileChange}
                        extra="Select an image for the course"
                    >
                        <Dragger
                            name="file"
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