import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, List, Typography, notification, Image, Modal, Rate, Input, Button, Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PurchasedCoursesPage = () => {
    const navigate = useNavigate();
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [currentCourseForReview, setCurrentCourseForReview] = useState(null);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportData, setReportData] = useState({ reason: '' });
    const baseUrl = import.meta.env.VITE_BASE_URL;


    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${baseUrl}/user/purchasedCourses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPurchasedCourses(response.data.purchasedCourses);
            } catch (error) {
                notification.error({ message: 'Failed to load purchased courses', description: error.message });
            }
        };
        fetchPurchasedCourses();
    }, []);

    const submitReview = async (rating, comment) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${baseUrl}/user/create-review/${currentCourseForReview._id}`, { rating, comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 201) {
                notification.success({ message: 'Review submitted successfully' });
                setIsReviewModalVisible(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'User has already reviewed this course') {
                notification.info({ message: 'You have already reviewed this course' });
                setIsReviewModalVisible(false);
            } else {
                notification.error({ message: 'Failed to submit review', description: error.message });
            }
        }
    };

    const ReportModal = ({ courseId, isVisible, onClose }) => {
        const [reportData, setReportData] = useState({ reason: '' });

        const handleReportSubmit = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${baseUrl}/user/report-course`, {
                    courseId: courseId,
                    reason: reportData.reason
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.message) {
                    notification.info({ message: response.data.message });
                } else {
                    notification.success({ message: 'Report submitted successfully' });
                }
                onClose();
            } catch (error) {
                if (error.response && error.response.data.message) {
                    notification.error({ message: error.response.data.message });
                } else {
                    notification.error({ message: 'Failed to submit report', description: error.message });
                }
            }
        };


        return (
            <Modal
                title="Report Course"
                visible={isVisible}
                onOk={handleReportSubmit}
                onCancel={onClose}
                footer={[
                    <Button key="back" onClick={onClose}>Cancel</Button>,
                    <Button key="submit" type="primary" onClick={handleReportSubmit}>Submit Report</Button>,
                ]}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Write your report reason here"
                    onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                    value={reportData.reason}
                />
            </Modal>
        );
    };



    const CourseActionsMenu = ({ course }) => (
        <Menu>
            <Menu.Item key="1" onClick={(e) => {
                e.domEvent.stopPropagation();
                setCurrentCourseForReview(course);
                setIsReviewModalVisible(true);
            }}>
                Write a Review
            </Menu.Item>
            <Menu.Item key="2" onClick={(e) => {
                e.domEvent.stopPropagation();
                setCurrentCourseForReview(course);
                setIsReportModalVisible(true);
            }}>
                Report Course
            </Menu.Item>
        </Menu>
    );



    const ReviewModal = () => {
        const [localRating, setLocalRating] = useState(0);
        const [localComment, setLocalComment] = useState('');

        const handleOk = async () => {
            await submitReview(localRating, localComment);
            setLocalRating(0);
            setLocalComment('');
        };

        return (
            <Modal
                title="Submit Review"
                visible={isReviewModalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setIsReviewModalVisible(false);
                    setLocalRating(0);
                    setLocalComment('');
                }}
                footer={[
                    <Button key="back" onClick={() => setIsReviewModalVisible(false)}>Cancel</Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>Submit Review</Button>,
                ]}
            >
                <Rate onChange={setLocalRating} value={localRating} />
                <Input.TextArea
                    rows={4}
                    placeholder="Write your review here"
                    onChange={(e) => setLocalComment(e.target.value)}
                    value={localComment}
                />
            </Modal>
        );
    };



    return (
        <div style={{ padding: '20px', marginTop: '25px' }}>
            <Title level={2}>Purchased Courses</Title>
            <List
                style={{ marginTop: '50px' }}
                grid={{ gutter: 16, column: 4 }}
                dataSource={purchasedCourses}
                renderItem={course => (
                    <List.Item key={course._id}>
                        <Card
                            hoverable
                            style={{ height: '380px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                            cover={<Image alt={course.title} src={`${baseUrl}/${course.image}`} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />}
                            onClick={() => navigate(`/course-content/${course._id}`)}
                        >
                            <Card.Meta title={course.title} description={course.description} style={{ flexGrow: 1, overflow: 'hidden' }} />
                            <Dropdown overlay={<CourseActionsMenu course={course} />} trigger={['click']} placement="bottomRight">
                                <Button
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ position: 'absolute', right: 10 }}
                                    icon={<MoreOutlined />}
                                    size="large"
                                    shape="circle"
                                />
                            </Dropdown>
                        </Card>
                    </List.Item>
                )}
            />
            <ReviewModal />
            <ReportModal
                courseId={currentCourseForReview?._id}
                isVisible={isReportModalVisible}
                onClose={() => {
                    setIsReportModalVisible(false);
                    setReportData({ reason: '' });
                }}
            />
        </div>
    );
};

export default PurchasedCoursesPage;
