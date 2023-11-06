import React from 'react';
import Appbar from './Appbar';

const UserLayout = ({ children }) => {
    return (
        <>
            <Appbar />
            {children}
        </>
    );
};

export default UserLayout;