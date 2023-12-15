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
    const [selectedFileType, setSelectedFileType] = useState('');

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
        form.resetFields();
        setFileList([]);
        setSelectedFileType('');
        if (lesson) {
            form.setFieldsValue({
                title: lesson.title,
                description: lesson.description,
                fileType: lesson.fileType || '',
                file: lesson.videoUrl ? [{
                    uid: '-1',
                    name: 'Video file',
                    status: 'done',
                    url: lesson.videoUrl,
                }] : [],
            });
            setSelectedFileType(lesson.fileType || '');
            setFileList(lesson.videoUrl ? [{
                uid: '-1',
                name: 'Video file',
                status: 'done',
                url: lesson.videoUrl,
            }] : []);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const jsonData = {
                title: values.title,
                description: values.description,
                videoUrl: selectedFileType === 'video' ? values.fileUrl : undefined,
            };

            const config = {
                headers: {
                    ...getAuthHeaders().headers,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            };

            let response;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const formData = new FormData();
                for (const key in jsonData) {
                    formData.append(key, jsonData[key]);
                }
                formData.append('file', fileList[0].originFileObj);
                config.headers['Content-Type'] = 'multipart/form-data';
                if (currentLesson) {
                    response = await axios.put(`http://localhost:3000/admin/lessons/${currentLesson._id}`, formData, config);
                } else {
                    response = await axios.post(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, formData, config);
                }
            } else {
                if (currentLesson) {
                    response = await axios.put(`http://localhost:3000/admin/lessons/${currentLesson._id}`, jsonData, config);
                } else {
                    response = await axios.post(`http://localhost:3000/admin/courses/${selectedCourse}/lessons`, jsonData, config);
                }
            }

            message.success('Lesson updated successfully');
            setIsModalVisible(false);
            setUploadProgress(0);
            await fetchLessonsAndUpdateState();
        } catch (error) {
            console.error('Error submitting the form:', error);
            message.error(error.response?.data?.message || 'Error submitting the form');
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
            message.success('Lesson deleted successfully');
            await fetchLessonsAndUpdateState();
        } catch (error) {
            message.error('Error deleting lesson');
        }
    };

    const handleFileTypeChange = value => {
        setSelectedFileType(value);
    };

    const beforeUpload = (file) => {
        if (!selectedFileType) {
            message.error('Please select a file type first');
            return Upload.LIST_IGNORE;
        }

        const fileType = file.type.split('/')[1];
        const expectedType = selectedFileType === 'video' ? 'mp4' : selectedFileType;
        if (fileType !== expectedType) {
            message.error(`You can only upload ${selectedFileType.toUpperCase()} file!`);
            return Upload.LIST_IGNORE;
        }
        return true;
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
            title: 'File',
            key: 'file',
            render: (_, record) => {
                console.log(record);
                if (record.fileType === 'mp4') {
                    return <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">View Video</a>;
                } else if (record.fileType === 'pdf') {
                    return <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">View PDF</a>;
                }
                return null;
            }
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
                    <Form.Item name="fileType" label="File Type" rules={[{ required: true, message: 'Please select a file type!' }]}>
                        <Select placeholder="Select file type" onChange={handleFileTypeChange}>
                            <Option value="video">Video</Option>
                            <Option value="pdf">PDF</Option>
                            {/* Add other file types if necessary */}
                        </Select>
                    </Form.Item>
                    <Form.Item name="file" label="Upload File" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload
                            beforeUpload={beforeUpload}
                            listType="text"
                            maxCount={1}
                            onRemove={() => setFileList([])}
                            onChange={({ fileList }) => setFileList(fileList)}
                            disabled={!selectedFileType} // Disable until file type is selected
                        >
                            <Button icon={<UploadOutlined />} disabled={!selectedFileType}>
                                Select File
                            </Button>
                        </Upload>
                    </Form.Item>
                    {uploadProgress > 0 && (
                        <Progress percent={uploadProgress} />
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
