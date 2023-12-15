import React from 'react';
import { Result, Button, Layout } from 'antd';
import { Link } from 'react-router-dom';

const { Content } = Layout;

const NotFoundPage = () => {
    return (
        <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Content style={{ padding: '50px', maxWidth: '600px', textAlign: 'center' }}>
                <Result
                    status="404"
                    title="Oops!"
                    subTitle="The page you're looking for can't be found."
                    extra={
                        <Link to="/">
                            <Button type="primary" size="large">Go Back Home</Button>
                        </Link>
                    }
                />
                <p style={{ marginTop: '20px' }}>Or, try using the navigation menu to find what you're looking for.</p>
            </Content>
        </Layout>
    );
};

export default NotFoundPage;
