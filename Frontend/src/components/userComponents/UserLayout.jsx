import React from 'react';
import Appbar from './Appbar.jsx';

const UserLayout = ({ children }) => {
    return (
        <>
            <Appbar />
            {children}
        </>
    );
};

export default UserLayout;