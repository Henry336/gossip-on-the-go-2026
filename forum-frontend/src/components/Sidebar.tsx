import { useEffect, useState, useCallback } from "react";
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
    DialogActions,
    Stack,
    IconButton
} from "@mui/material";
import { Link, useParams } from "react-router-dom"; //
import { type Topic } from "../types";
import { API_BASE_URL } from '../config';

function Sidebar() {
    const [massDeleteMode, setMassDeleteMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const { id } = useParams(); // Read the URL to see which one is active
    
    // NTS: This is to parse the ID safely (it comes as a string, e.g., "2")
    const activeId = id ? parseInt(id) : null; 

    const [open, setOpen] = useState(false);
    const [newTopicName, setNewTopicName] = useState("");

    const currentUser = localStorage.getItem("username");
    const isAdmin = currentUser === "Henry";

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const executeMassDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Delete ${selectedIds.length} gossip circles?`)) return;

        for (const topicId of selectedIds) {
            await fetch(`${API_BASE_URL}/topics/${topicId}`, { 
                method: "DELETE" 
            });
        }

        setSelectedIds([]);
        setMassDeleteMode(false);
        fetchTopics(); // Refresh silently
        window.location.assign("/"); // Redirect to home in case the active topic was deleted
    };

    const fetchTopics = useCallback(() => {
        fetch(API_BASE_URL + "/topics")
            .then(res => res.json())
            .then(data => setTopics(data || []))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const handleCreateTopic = () => {
        if (!newTopicName) {
            return;
        }

        fetch(API_BASE_URL + "/topics", {
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

    const handleRenameTopic = (topicId: number, currentName: string) => {
        const newName = window.prompt("Rename topic to:", currentName);
        if (!newName || newName === currentName) {
            return;
        }
        fetch(`${API_BASE_URL}/topics/${topicId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Name: newName })
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            }
            else alert("Failed to rename");
        });
    };

    const handleDeleteTopic = (topicId: number) => {
        if (!window.confirm("Delete this circle? All posts inside will be lost forever.")) return;

        fetch(`${API_BASE_URL}/topics/${topicId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                window.location.assign("/"); 
            }
            else alert("Failed to delete");
        });
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 280, height: 'fit-content' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pr: 1 }}>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
                    Gossip Circles
                </Typography>
                {/* THE MANAGEMENT TOGGLE */}
                {isAdmin && (
                    <IconButton 
                        size="small" 
                        onClick={() => {
                            setMassDeleteMode(!massDeleteMode);
                            setSelectedIds([]);
                        }}
                        color={massDeleteMode ? "secondary" : "default"}
                    >
                        ⚙️
                    </IconButton>
                )}
            </Stack>

            {/* MASS DELETE ACTION BUTTON */}
            {massDeleteMode && selectedIds.length > 0 && (
                <Button 
                    variant="contained" 
                    color="error" 
                    size="small" 
                    fullWidth 
                    onClick={executeMassDelete}
                    sx={{ mb: 1 }}
                >
                    Delete Selected ({selectedIds.length})
                </Button>
            )}

            <Divider />
            <MenuList>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem selected={activeId === null}>
                        <ListItemText>🏠 All Gossips</ListItemText>
                    </MenuItem>
                </Link>

                <Divider sx={{ my: 1 }} />

                {topics.map((t) => (
                    <Stack key={t.Id} direction="row" alignItems="center" sx={{ pr: 1 }}>
                        {/* THE CHECKBOX */}
                        {massDeleteMode && (
                            <input 
                                type="checkbox" 
                                checked={selectedIds.includes(t.Id)}
                                onChange={() => toggleSelection(t.Id)}
                                style={{ marginLeft: '10px', transform: 'scale(1.2)' }}
                            />
                        )}

                        <Link to={`/topic/${t.Id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                            <MenuItem selected={activeId === t.Id}>
                                <ListItemText>g/{t.Name}</ListItemText>
                            </MenuItem>
                        </Link>

                        {/* Individual Edit/Delete icons - Hide them during Mass Delete */}
                        {isAdmin && !massDeleteMode && (
                            <Stack direction="row">
                                <IconButton size="small" onClick={() => handleRenameTopic(t.Id, t.Name)}>✏️</IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteTopic(t.Id)}>🗑️</IconButton>
                            </Stack>
                        )}
                    </Stack>
                ))}
            </MenuList>

            <div style={{ padding: '10px' }}>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setOpen(true)}
                >
                    + Start a Circle
                </Button>
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Start a new Gossip Circle</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic of Gossip"
                        fullWidth
                        variant="standard"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTopic} variant="contained">Start</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default Sidebar;