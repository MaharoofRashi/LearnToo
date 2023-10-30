import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import { Card, Typography } from "@mui/material";

function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loginOption, setLoginOption] = useState("password");
    const [error, setError] = useState(null);

    const handleRequestOtp = () => {
        fetch("http://localhost:3000/admin/request-otp", {
            method: "POST",
            body: JSON.stringify({ username: email }),
            headers: {
                "Content-type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'OTP sent') {
                    alert('OTP has been sent to your email');
                } else {
                    setError(data.message || "An error occurred");
                }
            })
            .catch(err => {
                setError("An error occurred");
            });
    };

    const handleSignin = () => {
        let apiURL;
        let payload;

        if (loginOption === "password") {
            apiURL = "http://localhost:3000/admin/login";
            payload = {
                username: email,
                password: password
            };
        } else {
            apiURL = "http://localhost:3000/admin/verify-otp";
            payload = {
                username: email,
                otp: otp
            };
        }

        fetch(apiURL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    window.location = "/";
                } else {
                    setError(data.message || "An error occurred");
                }
            })
            .catch(err => {
                setError("An error occurred");
            });
    };

    return (
        <div>
            <div style={{
                paddingTop: 150,
                marginBottom: 10,
                display: "flex",
                justifyContent: "center"
            }}>
                <Typography variant={"h6"}>
                    Welcome back. Sign in below
                </Typography>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Card variant={"outlined"} style={{ width: 400, padding: 20 }}>
                    <TextField
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                        fullWidth={true}
                        label="Email"
                        variant="outlined"
                    />
                    <br /><br />
                    {loginOption === "password" ? (
                        <TextField
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            fullWidth={true}
                            label="Password"
                            variant="outlined"
                            type={"password"}
                        />
                    ) : (
                        <TextField
                            onChange={(e) => {
                                setOtp(e.target.value);
                            }}
                            fullWidth={true}
                            label="OTP"
                            variant="outlined"
                        />
                    )}
                    <br /><br />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <Button
                        size={"large"}
                        variant="contained"
                        onClick={handleSignin}
                    >
                        {loginOption === "password" ? "Sign In" : "Verify OTP"}
                    </Button>
                    <div>
                        <Button onClick={() => setLoginOption('password')}>Login with Password</Button>
                        <Button onClick={() => setLoginOption('otp')}>Login with OTP</Button>
                        {loginOption === 'otp' && (
                            <Button variant="outlined" onClick={handleRequestOtp}>Request OTP</Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Signin;
