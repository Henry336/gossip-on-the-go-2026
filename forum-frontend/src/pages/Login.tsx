import { useState } from "react";
import { TextField, Button, Paper, Typography, Box, Stack } from "@mui/material";
import { API_BASE_URL } from "../config";

interface LoginProps {
    onLogin: (username: string) => void;
}

function Login({ onLogin }: LoginProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (!name) return;

        fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Username: name })
        })
        .then(res => {
            if (res.ok) {
                onLogin(name); 
            } else {
                alert("Login failed");
            }
        })
        .catch(err => console.error(err));
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            
            {/* LEFT SIDE: The Branding (Now First) */}
            <Box 
                sx={{ 
                    flex: 1.5,
                    bgcolor: '#673ab7', 
                    display: { xs: 'none', md: 'flex' }, // Hidden on mobile
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    color: 'white',
                    p: 4
                }}
            >
                <Typography variant="h2" fontWeight="bold" gutterBottom>
                    🤫 Gossip on the Go
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.8 }}>
                    The wildest stories, whispered here first.
                </Typography>
            </Box>

            {/* RIGHT SIDE: The Form (Now Second) */}
            <Box 
                sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: '#f0f2f5',
                    p: 4
                }}
            >
                <Paper elevation={6} sx={{ p: 5, width: '100%', maxWidth: 400, textAlign: 'center', borderRadius: 4 }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#673ab7' }}>
                        👋 Welcome Back!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Enter your username to start gossiping.
                    </Typography>

                    <Stack spacing={3}>
                        <TextField 
                            label="Username" 
                            variant="outlined" 
                            fullWidth 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSubmit() }} // Added Enter key support!
                        />
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={handleSubmit}
                            sx={{ 
                                py: 1.5, 
                                fontSize: '1.1rem',
                                bgcolor: '#ff4081', 
                                '&:hover': { bgcolor: '#c60055'} 
                            }}
                        >
                            Enter the Circle
                        </Button>
                    </Stack>
                </Paper>
            </Box>

        </Box>
    );
}

export default Login;