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
    const [unreadCounts, setUnreadCounts] = useState({});
    const messageListRef = useRef(null);
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const token = localStorage.getItem('token');
    let userRole;
    if (token) {
        const decodedToken = jwtDecode(token);
        userRole = decodedToken.role;
    }
    const fetchMoreMessages = async () => {
        if (activeCourse && hasMoreMessages) {
            try {
                const base_Url = userRole === 'admin'
                    ? `${baseUrl}/admin/chat-history/${activeCourse}`
                    : `${baseUrl}/user/chat-history/${activeCourse}`;

                const response = await axios.get(base_Url, {
                    params: { offset: messageOffset, limit: messageLimit },
                    headers: { Authorization: `Bearer ${token}` }
                });

                const fetchedMessages = response.data;
                if (fetchedMessages.length < messageLimit) {
                    setHasMoreMessages(false);
                }
                setMessages(prevMessages => [...fetchedMessages, ...prevMessages]);
                setMessageOffset(prevOffset => prevOffset + fetchedMessages.length);
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchUserDataAndCourses = async () => {
            try {
                const userEndpoint = userRole === 'admin' ? `${baseUrl}/admin/me` : `${baseUrl}/user/me`;
                const userResponse = await axios.get(userEndpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(userResponse.data.id)
                setCurrentUser(userResponse.data);

                const coursesEndpoint = userRole === 'admin' ? `${baseUrl}/admin/courses` : `${baseUrl}/user/purchasedCourses`;

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

        socketRef.current = io(`${baseUrl}`, {
            query: { userId: currentUser.id, isAdmin: isAdmin },
            extraHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        socketRef.current.emit('getChatHistory', activeCourse);

        socketRef.current.on('chatHistory', history => {
            if (history.length < messageLimit) {
                setHasMoreMessages(false);
            }
            setMessages(prevMessages => [...prevMessages, ...history]);
            setMessageOffset(prevOffset => prevOffset + history.length);
            const unreadCount = history.filter(msg => !msg.readBy.includes(currentUser.id)).length;
            setUnreadCounts(prevCounts => ({ ...prevCounts, [activeCourse]: unreadCount }));
        });



        const loadMoreMessages = () => {
            fetchMoreMessages();
        };

        socketRef.current.on('newMessage', message => {
            console.log('New message received:', message);

            let isCurrentUserMessage = false;

            if (userRole === 'admin') {
                isCurrentUserMessage = message.sender === null;
            } else {
                isCurrentUserMessage = message.sender && message.sender._id === currentUser.id;
            }

            console.log('Is current user message:', isCurrentUserMessage);

            if (message.course === activeCourse) {
                setMessages(prev => [...prev, { ...message, isCurrentUserMessage }]);
            } else if (!isCurrentUserMessage) {
                setUnreadCounts(prevCounts => {
                    const newCounts = { ...prevCounts };
                    newCounts[message.course] = (newCounts[message.course] || 0) + 1;
                    return newCounts;
                });
            }
        });

        socketRef.current.on('messageRead', ({ messageId }) => {
            setMessages(prevMessages => prevMessages.map(msg =>
                msg._id === messageId ? { ...msg, readBy: [...msg.readBy, currentUser.id] } : msg
            ));
            setUnreadCounts(prevCounts => {
                const newCounts = { ...prevCounts };
                if (userId === currentUser.id && newCounts[activeCourse]) {
                    newCounts[activeCourse]--;
                }
                return newCounts;
            });
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
    const markMessageAsRead = (messageId) => {
        socketRef.current.emit('markMessageAsRead', { messageId, userId: currentUser.id });
    };

    const sendMessage = () => {
        if (input.trim() && activeCourse && currentUser) {
            const newMessage = { sender: currentUser.id, message: input, courseId: activeCourse};
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
        setUnreadCounts(prevCounts => ({ ...prevCounts, [courseId]: 0 }));

        messages.forEach(message => {
            if (!message.readBy.includes(currentUser.id)) {
                markMessageAsRead(message._id);
            }
        });
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
                            {unreadCounts[course._id] > 0 && (
                                <>
                                  <span style={{
                                      height: '10px',
                                      width: '10px',
                                      backgroundColor: '#1677FF',
                                      borderRadius: '50%',
                                      display: 'inline-block',
                                      marginRight: '5px',
                                  }}></span>
                                    <span style={{ color: '#1677FF', fontWeight: 'bold' }}>
                                        {unreadCounts[course._id]}
                                    </span>
                                </>
                            )}
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>
            <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                <div
                    style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '20px', marginBottom: '30px' }}
                    onScroll={handleScroll}
                    ref={messageListRef}
                >
                    <List
                        dataSource={messages}
                        renderItem={item => {
                            if (!item.sender && userRole !== 'admin') {
                                return null;
                            }

                            const messageAlignment = item.isCurrentUserMessage ? 'flex-end' : 'flex-start';

                            return (
                                <List.Item
                                    key={item._id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: messageAlignment
                                    }}
                                >
                                    <div style={{ position: 'relative', maxWidth: '60%' }}>
                                        <div style={{
                                            backgroundColor: item.isCurrentUserMessage ? '#daf8cb' : '#ECECEC',
                                            borderRadius: '20px',
                                            padding: '10px 20px',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                            marginLeft: item.isCurrentUserMessage ? '0' : '45px',
                                            marginRight: item.isCurrentUserMessage ? '45px' : '0',
                                        }}>
                                            {item.message}
                                            <div style={{ fontSize: '12px', color: 'grey', marginTop: '5px' }}>
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
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