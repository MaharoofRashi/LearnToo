import React, { useState, useEffect } from 'react';
import { Select, Table, Button, Modal, Form, Input, Upload, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const AdminManageLessons = () => {
    const [form] = Form.useForm();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [lessons, setLessons] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/admin/courses', getAuthHeaders());
                // Access the courses array from the response object
                setCourses(response.data.courses || []);
            } catch (error) {
                message.error('Error fetching courses');
            }
        };



        fetchCourses();
    }, []);

    // Fetch lessons when a course is selected
    useEffect(() => {
        if (!selectedCourse) {
            setLessons([]);
            return;
        }
        const fetchLessons = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, getAuthHeaders());
                setLessons(response.data);
            } catch (error) {
                message.error('Error fetching lessons');
            }
        };
        fetchLessons();
    }, [selectedCourse]);

    const handleCourseChange = value => {
        setSelectedCourse(value);
    };

    const showModal = (lesson = null) => {
        setCurrentLesson(lesson);
        setIsModalVisible(true);
        // Reset the form with the lesson values if we are editing
        if (lesson) {
            form.setFieldsValue({
                title: lesson.title,
                description: lesson.description,
                video: lesson.videoUrl ? [{
                    uid: '-1',
                    name: 'Video file',
                    status: 'done',
                    url: lesson.videoUrl,
                }] : [],
            });
            setFileList(lesson.videoUrl ? [{
                uid: '-1',
                name: 'Video file',
                status: 'done',
                url: lesson.videoUrl,
            }] : []);
        } else {
            // If adding a new lesson, reset the form fields and file list
            form.resetFields();
            setFileList([]);
        }
    };


    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const jsonData = {
                title: values.title,
                description: values.description,
            };

            const config = {
                headers: {
                    ...getAuthHeaders().headers,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            };

            let response;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                // If there's a file to upload, send as FormData
                const formData = new FormData();
                for (const key in jsonData) {
                    formData.append(key, jsonData[key]);
                }
                formData.append('video', fileList[0].originFileObj);
                config.headers['Content-Type'] = 'multipart/form-data';
                if (currentLesson) {
                    response = await axios.put(`http://localhost:3000/admin/lessons/${currentLesson._id}`, formData, config);
                } else {
                    response = await axios.post(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, formData, config);
                }
            } else {
                // If no file, send JSON data
                if (currentLesson) {
                    response = await axios.put(`http://localhost:3000/admin/lessons/${currentLesson._id}`, jsonData, config);
                } else {
                    response = await axios.post(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, jsonData, config);
                }
            }

            // Rest of your code for handling the response and updating state
            message.success('Lesson updated successfully');
            setIsModalVisible(false);
            setUploadProgress(0);
            // Refresh the list of lessons
            await fetchLessonsAndUpdateState();
        } catch (error) {
            console.error('Error submitting the form:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(error.response.data);
                console.error(error.response.status);
                console.error(error.response.headers);
                message.error(error.response.data.message || 'Error submitting the form');
            } else if (error.request) {
                // The request was made but no response was received
                console.error(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error', error.message);
            }
        }

    };

    const fetchLessonsAndUpdateState = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, getAuthHeaders());
            setLessons(response.data);
        } catch (error) {
            message.error('Error fetching lessons');
        }
    };


    const handleModalCancel = () => {
        setIsModalVisible(false);
        setUploadProgress(0);
    };

    const handleDeleteLesson = async lessonId => {
        try {
            await axios.delete(`http://localhost:3000/admin/lessons/${lessonId}`, getAuthHeaders());
            setLessons(lessons.filter(lesson => lesson._id !== lessonId));
            message.success('Lesson deleted successfully');
        } catch (error) {
            message.error('Error deleting lesson');
        }
    };

    const lessonColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Video',
            dataIndex: 'videoUrl',
            key: 'videoUrl',
            render: text => <a href={text} target="_blank" rel="noopener noreferrer">View Video</a>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => showModal(record)}>Edit</Button>
                    <Button danger onClick={() => handleDeleteLesson(record._id)}>Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a course"
                optionFilterProp="children"
                onChange={handleCourseChange}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {courses.map(course => (
                    <Option key={course._id} value={course._id}>{course.title}</Option>
                ))}
            </Select>

            <Button type="primary" onClick={() => showModal()} style={{ marginLeft: 8 }}>
                Add Lesson
            </Button>

            <Table dataSource={lessons} columns={lessonColumns} rowKey="_id" />

            <Modal title={`${currentLesson ? 'Edit' : 'Add'} Lesson`} visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
                <Form form={form} layout="vertical" initialValues={currentLesson}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input the title!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="video" label="Video File" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload
                            beforeUpload={() => false}
                            listType="text"
                            maxCount={1}
                            onRemove={() => {
                                setFileList([]);
                                setUploadProgress(0); // Reset progress when file is removed
                            }}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                    {uploadProgress > 0 && (
                        <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
                    )}
                </Form>
            </Modal>
        </div>
    );
};

const normFile = e => {
    if (Array.isArray(e)) {
        return e;
    }
    return e && e.fileList;
};

export default AdminManageLessons;
