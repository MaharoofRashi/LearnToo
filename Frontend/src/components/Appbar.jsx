import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

function Appbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userEmail, setUserEmail] = useState(null);

    let role = 'user'; // default role
    if (location.pathname.startsWith('/admin')) {
        role = 'admin';
    }

    const navigateTo = (path) => {
        navigate(`/${role}${path}`);
    };

    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/admin/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.username) {
                setUserEmail(data.username);
            }
        }

        fetchUser();
    }, []);

    const renderAdminButtons = () => {
        return (
            <div style={{ marginRight: 10 }}>
                <Button
                    variant={"contained"}
                    onClick={() => {
                        navigate("/admin/addcourse");
                    }}
                >
                    Add Course
                </Button>
            </div>
        );
    };

    const renderButtons = () => {
        return (
            <div style={{ display: "flex" }}>
                {role === 'admin' ? renderAdminButtons() : null}
                <div style={{ marginRight: 10 }}>
                    <Button
                        variant={"contained"}
                        onClick={() => {
                            localStorage.setItem("token", null);
                            window.location = "/";
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 4
        }}>
            <div>
                <Typography variant={"h6"}>LearnToo</Typography>
            </div>
            <div>
                {userEmail ? renderButtons() : (
                    <div style={{ display: "flex" }}>
                        <div style={{ marginRight: 10 }}>
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    navigateTo("/signup");
                                }}
                            >
                                Signup
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    navigateTo("/signin");
                                }}
                            >
                                Signin
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Appbar;
