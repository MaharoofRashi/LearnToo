import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Spin, notification, Typography, Upload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

function Course() {
    let { courseId } = useParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch("http://localhost:3000/admin/courses", {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCourses(data.courses);
                setLoading(false);
            } catch (error) {
                notification.error({ message: 'Fetch Error', description: 'Failed to fetch courses' });
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const currentCourse = courses.find(c => c._id === courseId);
        if (currentCourse) {
            form.setFieldsValue({
                title: currentCourse.title,
                description: currentCourse.description,
            });
            if (currentCourse.imageLink) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: currentCourse.imageLink,
                }]);
            }
        }
    }, [courses, courseId, form]);

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            notification.error({ message: 'Upload Error', description: 'You can only upload image files!' });
        }
        return isImage || Upload.LIST_IGNORE;
    };

    const handleFileChange = (info) => {
        setFileList(info.fileList.slice(-1));
    };

    const onFinish = async (values) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        }

        try {
            const response = await fetch(`http://localhost:3000/admin/course/${courseId}`, {
                method: "PUT",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedCourseData = await response.json();
            notification.success({ message: 'Update Success', description: 'Course updated successfully' });
            setCourses(courses.map(c => c._id === courseId ? updatedCourseData : c));
            navigate('/admin/courses');
        } catch (error) {
            notification.error({ message: 'Update Error', description: error.toString() });
        }
    };

    const onFinishFailed = (errorInfo) => {
        notification.error({ message: 'Form Error', description: 'Please check the form for errors' });
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }} />;
    }

    const currentCourse = courses.find(c => c._id === courseId);
    if (!currentCourse) {
        return <div style={{ textAlign: 'center', marginTop: '20%' }}>No course found</div>;
    }

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card bordered={false} style={{ maxWidth: '700px', margin: 'auto', padding: '20px', borderRadius: '8px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '1rem' }}>Edit Course</Title>
                <Form
                    layout="vertical"
                    form={form}
                    name="edit_course"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        title: currentCourse.title,
                        description: currentCourse.description,
                    }}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input the title!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input the description!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Course Image"
                        name="upload"
                        valuePropName="fileList"
                        getValueFromEvent={handleFileChange}
                        extra="Select an image for the course"
                    >
                        <Dragger
                            name="file"
                            beforeUpload={beforeUpload}
                            onChange={handleFileChange}
                            listType="picture"
                            fileList={fileList}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Course
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Space>
    );
}

export default Course;
