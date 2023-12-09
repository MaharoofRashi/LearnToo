import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Layout, Menu, Input, Button, List, Avatar } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import axios from 'axios';

const { Sider, Content } = Layout;

const Chatting = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageOffset, setMessageOffset] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const messageLimit = 50;
    const [input, setInput] = useState('');
    const [activeCourse, setActiveCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const socketRef = useRef();

    const token = localStorage.getItem('token');
    let userRole;
    if (token) {
        const decodedToken = jwtDecode(token);
        userRole = decodedToken.role;
    }
    const fetchMoreMessages = () => {
        if (activeCourse && socketRef.current && hasMoreMessages) {
            socketRef.current.emit('getChatHistory', activeCourse, messageOffset, messageLimit);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchUserDataAndCourses = async () => {
            try {
                const userEndpoint = userRole === 'admin' ? 'http://localhost:3000/admin/me' : 'http://localhost:3000/user/me';
                const userResponse = await axios.get(userEndpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(userResponse.data.id)
                setCurrentUser(userResponse.data.id);

                const coursesEndpoint = userRole === 'admin' ? 'http://localhost:3000/admin/courses' : 'http://localhost:3000/user/purchasedCourses';

                const coursesResponse = await axios.get(coursesEndpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let coursesData;
                if (userRole === 'admin') {
                    coursesData = coursesResponse.data.courses;
                    console.log(coursesData)
                } else {
                    coursesData = coursesResponse.data.purchasedCourses;
                    console.log(coursesData)
                }

                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching user data or courses:", error);
            }
        };

        fetchUserDataAndCourses();
    }, []);


    useEffect(() => {
        if (!currentUser) return;
        const isAdmin = userRole === 'admin';

        socketRef.current = io('http://localhost:3000', {
            query: { userId: currentUser, isAdmin: isAdmin },
            extraHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        socketRef.current.emit('getChatHistory', activeCourse);

        socketRef.current.on('chatHistory', history => {
            if (history.length < messageLimit) {
                setHasMoreMessages(false);
            }
            setMessages(prevMessages => [...prevMessages, ...history]);
            setMessageOffset(prevOffset => prevOffset + history.length);
        });



        const loadMoreMessages = () => {
            fetchMoreMessages();
        };

        socketRef.current.on('newMessage', message => {
            console.log('New message received:', message);
            if (message.course === activeCourse) {
                setMessages(prev => [...prev, message]);
            }
        });

        socketRef.current.on('messageRead', ({ messageId }) => {
            setMessages(prevMessages => prevMessages.map(msg =>
                msg._id === messageId ? { ...msg, readBy: [...msg.readBy, currentUser.id] } : msg
            ));
        });

        return () => socketRef.current.disconnect();
    }, [currentUser, activeCourse]);

    const handleScroll = () => {
        if (messageListRef.current && hasMoreMessages) {
            const { scrollTop } = messageListRef.current;
            if (scrollTop === 0) {
                fetchMoreMessages();
            }
        }
    };


    useEffect(() => {
        if (activeCourse && socketRef.current) {
            setMessages([]);
            setMessageOffset(0);
            setHasMoreMessages(true);
            fetchMoreMessages();
        }
    }, [activeCourse]);

    const sendMessage = () => {
        if (input.trim() && activeCourse && currentUser) {
            const newMessage = { sender: currentUser, message: input, courseId: activeCourse};
            console.log('Sending message:', newMessage);
            socketRef.current.emit('sendMessage', newMessage);
            setInput('');
        }
    };

    const selectCourse = courseId => {
        setActiveCourse(courseId);
        setMessages([]);
        setMessageOffset(0);
        setHasMoreMessages(true);
    };

    useEffect(() => {
        if (activeCourse && socketRef.current) {
            socketRef.current.emit('getChatHistory', activeCourse);
        }
    }, [activeCourse]);

    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Layout style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f3f3' }}>
            <Sider width={300} style={{
                backgroundColor: '#fff',
                overflowY: 'auto',
                borderRight: '1px solid #ddd',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d6dee1 #f5f5f5'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #ddd', fontSize: '16px', fontWeight: 'bold' }}>
                    Courses
                </div>
                <Menu mode="inline" selectedKeys={[activeCourse]} style={{ borderRight: 0 }} onClick={({ key }) => selectCourse(key)}>
                    {Array.isArray(courses) && courses.map(course => (
                        <Menu.Item key={course._id} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
                            <MessageOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                            {course.title}
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>
            <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                <div
                    style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '20px', marginBottom: '30px' }}
                    onScroll={handleScroll}
                >
                    <List
                        dataSource={messages}
                        renderItem={item => (
                            <List.Item key={item._id} style={{
                                justifyContent: item.sender === currentUser.id ? 'flex-end' : 'flex-start',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: item.sender === currentUser.id ? 'flex-end' : 'flex-start',
                                margin: '10px 0'
                            }}>
                                <div style={{ position: 'relative', maxWidth: '60%' }}>
                                    <Avatar size="small" icon={<UserOutlined />} style={{ position: 'absolute', bottom: 0, left: item.sender === currentUser.id ? '100%' : '-40px', marginLeft: '5px', marginBottom: '5px' }} />
                                    <div style={{
                                        backgroundColor: item.sender === currentUser.id ? '#DCF8C6' : '#ECECEC',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        marginLeft: item.sender === currentUser.id ? '0' : '45px'
                                    }}>
                                        {item.message}
                                        <div style={{ fontSize: '12px', color: 'grey', marginTop: '5px' }}>
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    <div ref={endOfMessagesRef} />
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid #ececec', paddingTop: '10px', alignItems: 'center' }}>
                    <Input value={input} onChange={e => setInput(e.target.value)} onPressEnter={sendMessage} placeholder="Type a message..." style={{ flex: 1, marginRight: '10px', borderRadius: '20px', padding: '10px' }} />
                    <Button icon={<SendOutlined />} onClick={sendMessage} type="primary" style={{ borderRadius: '50%', padding: '10px' }} />
                </div>
            </Content>
        </Layout>
    );
};

export default Chatting;