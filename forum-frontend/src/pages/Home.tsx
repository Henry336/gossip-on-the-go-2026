import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  Card, 
  CardContent, 
  Typography, 
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material'
import { type Post } from '../types'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config';

function Home() {
  // This is to get the topic ID from the URL (if it actually exist s)
  const { id } = useParams();
  const currentTopicId = id ? parseInt(id) : null;
  const [posts, setPosts] = useState<Post[]>([])

  const currentUser = localStorage.getItem("username");

  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState("")
  
  const [desc, setDesc] = useState("")

  const [editId, setEditId] = useState<number | null>(null)

  const fetchPosts = useCallback(() => {
    let url = API_BASE_URL + "/posts";
    if (currentTopicId != null) {
      url += `?topic_id=${currentTopicId}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setPosts(data || []))
      .catch(err => console.error(err));
  }, [currentTopicId]);

  // Re-fetch whenever URL ID changes (basically made URL ID the dependency)
  useEffect(() => {
    fetchPosts(); 
  }, [fetchPosts]); // fetchPosts is a dependency because it's wrapped in useCallback

  const handleCreateOpen = () => {
    setEditId(null); 
    setTitle("");    
    setDesc("");
    setOpen(true);
  }

  const handleEditOpen = (p: Post) => {
    setEditId(p.Id);  
    setTitle(p.Title);
    setDesc(p.Description);
    setOpen(true);
  }

  const handleSubmit = () => {
    if (!title || !desc) {
      alert("Please fill in both fields");
      return;
    }

    const newPost = { 
      Title: title, 
      Description: desc,
      TopicId: currentTopicId || 1,
      Username: currentUser
    }

    let url = API_BASE_URL + "/posts";
    let method = "POST";
    
    if (editId != null) {
      url = API_BASE_URL + `/posts/${editId}`;
      method = "PATCH";
    }
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),

    })
      .then((response) => {
        if (response.ok) {
          setOpen(false);
          fetchPosts();
        } else {
          alert("Failed to save post");
        }
      })
      .catch((error) => console.error("Error:", error));
    };

  const handleDelete = (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post? ");
    if (!isConfirmed) {
      return;
    }

    fetch(API_BASE_URL + `/posts/${id}`, {
      method: "DELETE",
    })
    .then((response) => {
      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to delete post");
      }
    })
    .catch((error) => console.error("Error:", error));
  };

  return (
    <div style={{ padding: "40px" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        Gossip on the Go! {/* If anyone ever sees this, yes, the pun is intentional. I'm sorry */}
      </Typography>

      {/* NEW LAYOUT: Stack instead of Grid */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
        
        {/* LEFT COLUMN: SIDEBAR */}
        {/* NTS: The definition of the code below: "On desktop, keep it 280px wide. On mobile, 100% wide." */}
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
            <Sidebar/>
            <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCreateOpen}
            >
                Spill the Tea
            </Button>
        </Box>

        {/* RIGHT COLUMN: FEED */}
        {/* NTS: flexGrow: 1 means "take up all remaining space" */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Typography variant="h5" gutterBottom>
                {currentTopicId === null ? "Gossipers' Gathering" : "🐝What the Buzz?"}
            </Typography>

            <Stack spacing={2}> 
                {posts.length === 0 && <Typography>It's quiet around here... too quiet. So I'll hit you with a fun fact. Did you know that this took about 40 HOURS to make? Thank god I had Gemini as my tutor when I lost my way. Otherwise, I might have been stuck with the CORS errors at the very beginning and never moved on from there. Since you're still reading this, I'll drop another fun fact. Did you know that the largest blackhole known to mankind is about 9.5 trillion times the size of our Sun? This had been considered scientifically impossible since blackholes theoretically cannot have such massive solar masses until one day, the scientists accidentally discovered that I made it up! Okay, here's a real fun fact though. Did you know that Nintendo came before the collapse of the Ottoman Empire? This is because Nintendo was founded in Kyoto in 1889 and the Empire did not collapse until 1922. So, samurai could technically have played Nintendo! Isn't it amazing how I prompted Gemini to "give me some actual, unbelievable fun facts about random topics", copied the top one, and pasted it here? Since you're still reading, for god knows what reason, here's yet ANOTHER fun fact. Did you know that my current favourite ongoing show is The Amazing Digital Circus? To put it simply, the existential dread that all the characters go through on an episodic basis is just so fascinating to me. Is it your favourite as well? Oh, oh, and did you know . . .</Typography>}
                
                {posts.map((post) => (
                <Card key={post.Id} sx={{ '&:hover': { boxShadow: 4 }, transition: '0.3s' }}>
                    <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Link to={`/posts/${post.Id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="h6" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                {post.Title}
                            </Typography>
                        </Link>
                        {/*  Only show buttons if the post belongs to the logged-in user - except myself */}
                        {(post.Username === currentUser || currentUser === "Henry") && (
                         <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => handleEditOpen(post)}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(post.Id)}>X</Button>
                        </Stack>
                        )}
                    </Stack>
                  
            
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        {post.Description}
                    </Typography>

                    <Typography variant="caption" sx={{ color: 'gray' }}>
                        Shared by {post.Username} • {new Date(post.CreatedAt).toLocaleDateString()}
                    </Typography>
                    </CardContent>
                </Card>
                ))}
            </Stack>
        </Box>
      </Stack>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Gossip" : "Spill the Tea"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} marginTop={1}>
            <TextField label="Subject (Title)" variant="outlined" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="The Details..." variant="outlined" multiline rows={4} fullWidth value={desc} onChange={(e) => setDesc(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Home