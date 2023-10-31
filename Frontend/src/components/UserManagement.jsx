import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button } from '@mui/material';

function UserManagement() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch all users
        fetch("http://localhost:3000/admin/users", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data.users);
            })
            .catch(err => {
                console.error("Error fetching users", err);
            });
    }, []);

    const updateUserStatus = (userId, isBlocked) => {
        fetch(`http://localhost:3000/admin/users/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isBlocked })
        })
            .then(res => res.json())
            .then(data => {
                console.log("User status updated", data);
                // Refresh the user list
                setUsers(users.map(user => user._id === userId ? {...user, isBlocked} : user));
            })
            .catch(err => {
                console.error("Error updating user status", err);
            });
    };

    return (
        <Paper elevation={3} style={{ marginTop: '40px', marginLeft: '10px', marginRight: '10px' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.isBlocked ? "Blocked" : "Active"}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color={user.isBlocked ? "primary" : "secondary"}
                                    onClick={() => updateUserStatus(user._id, !user.isBlocked)}
                                >
                                    {user.isBlocked ? "Unblock" : "Block"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

export default UserManagement;
