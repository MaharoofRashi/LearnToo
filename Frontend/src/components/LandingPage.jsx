import React, { useState, useEffect } from 'react';
import { Carousel, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const LandingPage = () => {
    const [coursesByCategory, setCoursesByCategory] = useState({});
    const [isHovered, setIsHovered] = useState({}); // State to manage hover status
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:3000/user/courses');
                const data = await response.json();
                setCoursesByCategory(data.coursesByCategory);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);


    const scroll = (containerId, scrollOffset) => {
        const container = document.getElementById(containerId);
        container.scrollLeft += scrollOffset;
    };


    const handleMouseEnter = (categoryName) => {
        setIsHovered(prev => ({ ...prev, [categoryName]: true }));
    };

    const handleMouseLeave = (categoryName) => {
        setIsHovered(prev => ({ ...prev, [categoryName]: false }));
    };

    // Styles
    const carouselContainerStyle = {
        maxWidth: '1400px',
        height: '475px',
        margin: '40px auto',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
    };

    const imageStyle = {
        width: '100%',
        height: '480px',
        objectFit: 'cover',
    };

    const cardListStyle = {
        display: 'flex',
        overflowX: 'auto',
        padding: '20px',
        gap: '10px',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE 10+
    };

    const scrollButtonStyle = {
        cursor: 'pointer',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        border: 'none',
        color: 'white',
        padding: '10px',
        zIndex: '10',
        borderRadius: '50%',
        display: 'none', // Initially hide the button
    };

    const cardStyle = {
        minWidth: '340px',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        flex: '0 0 auto',
        width: '340px',
        margin: '0 5px',
    };

    const pageStyle = {
        background: '#f0f2f5',
        padding: '20px',
    };

    return (
        <div style={pageStyle}>
            <div style={carouselContainerStyle}>
                <Carousel autoplay>
                    {coursesByCategory['Featured Courses']?.map(course => (
                        <div key={course._id} style={{ position: 'relative' }}>
                            <img src={`http://localhost:3000/${course.image}`} alt={course.title} style={imageStyle} />
                            <h3 style={{
                                textAlign: 'center',
                                margin: '0',
                                position: 'absolute',
                                bottom: '20px',
                                width: '100%',
                                color: 'white',
                                textShadow: '2px 2px 4px #000000'
                            }}>
                                {course.title}
                            </h3>
                        </div>
                    ))}
                </Carousel>
            </div>

            {Object.entries(coursesByCategory).map(([categoryName, courses], index) => {
                const containerId = `container-${index}`;
                const showScrollButtons = courses.length > 5; // Show scroll buttons if more than 5 courses
                return (
                    <div key={categoryName} style={{ margin: '20px 0', position: 'relative' }}
                         onMouseEnter={() => handleMouseEnter(categoryName)}
                         onMouseLeave={() => handleMouseLeave(categoryName)}>
                        <h2 style={{ paddingLeft: '10px' }}>{categoryName}</h2>
                        {showScrollButtons && isHovered[categoryName] && (
                            <button
                                style={{ ...scrollButtonStyle, left: '10px', display: 'block' }}
                                onClick={() => scroll(containerId, -300)}
                            >
                                &lt;
                            </button>
                        )}
                        <div id={containerId} style={cardListStyle} className="cardListStyle">
                            {courses.map(course => (
                                <div
                                    key={course._id}
                                    style={cardStyle}
                                    onClick={() => navigate(`/course/${course._id}`)} // Add navigation here
                                >
                                    <Card
                                        hoverable
                                        cover={<img alt={course.title} src={`http://localhost:3000/${course.image}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                                    >
                                        <Meta title={course.title} description={`Price: $${course.price}`} />
                                    </Card>
                                </div>
                            ))}
                        </div>
                        {showScrollButtons && isHovered[categoryName] && (
                            <button
                                style={{ ...scrollButtonStyle, right: '10px', display: 'block' }}
                                onClick={() => scroll(containerId, 300)}
                            >
                                &gt;
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default LandingPage;
