import { useEffect, useState } from "react";
import { 
    Paper, 
    MenuList, 
    MenuItem, 
    ListItemText, 
    Typography, 
    Divider, 
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { Link, useParams } from "react-router-dom"; //
import { type Topic } from "../types";

function Sidebar() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const { id } = useParams(); // Read the URL to see which one is active
    
    // NTS: This is to parse the ID safely (it comes as a string, e.g., "2")
    const activeId = id ? parseInt(id) : null; 

    const [open, setOpen] = useState(false);
    const [newTopicName, setNewTopicName] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/topics")
            .then(res => res.json())
            .then(data => setTopics(data || []))
            .catch(err => console.error(err));
    }, []);

    const handleCreateTopic = () => {
        if (!newTopicName) {
            return;
        }

        fetch("http://localhost:8080/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ Name: newTopicName })
        })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Refresh to see new topic(s)
            } else {
                alert("Failed to create topic")
            }
        })
        .catch(err => console.error(err));
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 280, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
                Gossip Circles
            </Typography>
            <Divider />
            <MenuList>
                {/* Option for All Posts */}
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem selected={activeId === null}>
                        <ListItemText>🏠 All Gossips</ListItemText>
                    </MenuItem>
                </Link>

                <Divider sx={{ my: 1 }} />

                {/* List of Topics */}
                {topics.map((t) => (
                    <Link key={t.Id} to={`/topic/${t.Id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <MenuItem selected={activeId === t.Id}>
                            <ListItemText>
                                g/{t.Name}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                ))}
            </MenuList>

            <div style = {{ padding: '10px' }}>
                <Button
                    variant = "outlined"
                    fullWidth
                    onClick = {() => setOpen(true)}
                >
                    + Start a Circle
                </Button>
            </div>

            <Dialog open = {open} onClose = {() => setOpen(false)}>
                <DialogTitle> 
                    Start a new Gossip Circle
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin = "dense"
                        label = "Topic of Gossip (e.g., CVWO)"
                        fullWidth
                        variant = "standard"
                        value = {newTopicName}
                        onChange = {(e) => setNewTopicName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick = {() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick = {handleCreateTopic} 
                            variant = "contained"
                    >
                        Start
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default Sidebar;