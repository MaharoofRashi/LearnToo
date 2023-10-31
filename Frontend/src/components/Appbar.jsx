import {Typography} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Appbar() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("token");
            console.log("token - " + token);

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

    if (userEmail) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 4
            }}>
                <div>
                    <Typography variant={"h6"}>LearnToo</Typography>
                </div>

                <div style={{ display: "flex" }}>
                    <div>
                        {userEmail}
                    </div>
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
            </div>
        );
    } else {
        return (
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 4
            }}>
                <div>
                    <Typography variant={"h6"}>LearnToo</Typography>
                </div>

                <div style={{ display: "flex" }}>
                    <div style={{ marginRight: 10 }}>
                        <Button
                            variant={"contained"}
                            onClick={() => {
                                navigate("/admin/signup");
                            }}
                        >
                            Signup
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant={"contained"}
                            onClick={() => {
                                navigate("/admin/signin");
                            }}
                        >
                            Signin
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Appbar;
