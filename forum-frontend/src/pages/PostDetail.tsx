import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { 
  Typography, 
  Button,
  Card,
  CardContent,
  Stack, 
  TextField,
  Divider,
  Box
} from '@mui/material'

import { type Post, type Comment } from '../types'
import { API_BASE_URL } from "../config";

function PostDetail() {
  const [massDeleteMode, setMassDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const currentUser = localStorage.getItem("username");
  const isAdmin = currentUser === "Henry";
  const { id } = useParams(); 

  // NTS: The post starts as null since it hasn't been fetched yet
  const [post, setPost] = useState<Post | null>(null)
  // NTS: List of comments
  const [comments, setComments] = useState<Comment[]>([])
  // NTS: Input for writing a new comment
  const [newComment, setNewComment] = useState("")

  const toggleSelection = (id: number) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const executeMassDelete = async () => {
      if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
    
      // Loop through selected IDs and call existing delete logic
      for (const id of selectedIds) {
          await fetch(`${API_BASE_URL}/posts/${id}`, { method: "DELETE" });
      }
    
      setSelectedIds([]);
      setMassDeleteMode(false);
      fetchComments(); // Refresh the list silently
  };

  const fetchComments = useCallback(() => {
    fetch(API_BASE_URL + `/posts/${id}/comments`)
    .then(res => res.json())
    .then(data => {
      console.log("FROM BACKEND:", data);
      setComments(data || [])
    }) // [] is included to default list to [] if empty (null)
    .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    fetch(API_BASE_URL + `/posts/${id}`)
    .then(res => res.json())
    .then(data => setPost(data))
    .catch(err => console.error(err));

    fetchComments();
  }, [id, fetchComments]) // Finally, a dependency has been added. This will rerun if ID changes
  // NTS for above: fetchComments was also added as a dependency

  const handleAddComment = () => {
    if (!newComment) {
      return;
    }

  const currentUser = localStorage.getItem("username"); // Get the identity
  const payload = { 
      Content: newComment, 
      Username: currentUser 
      };

    fetch(API_BASE_URL + `/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        setNewComment(""); // Clear the input
        fetchComments(); // Text to the right has BEEN improved with re-fetching [placeholder refresh (to be improved)]
      } else {
        alert("Failed to post comment");
      }
    })
    .catch(err => console.error(err));
  }

  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
    fetch(API_BASE_URL + `/posts/${id}/comments/${commentId}`, { method: "DELETE" })
    .then(response => {
        if (response.ok) {
          fetchComments();
        }
        else {
          alert("Failed to delete");
        }
    });
  };

  const handleEditComment = (comment: Comment) => {
      const newText = window.prompt("Edit your comment:", comment.content);
      if (!newText || newText === comment.content) return;

      fetch(API_BASE_URL + `/posts/${id}/comments/${comment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Content: newText })
      })
      .then(response => {
          if (response.ok) {
            fetchComments();
          }
          else {
            alert("Failed to update");
          }
      });
  };

  // NTS: This is for loading
  // If {post.Title} is rendered before post is fetched, app will crash. So a loading state has been added (don't forget to read more into this, future me)
  if (!post) {
    return <div style = {{padding: "40px" }}>Loading. . .</div>
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" sx={{ mb: 2 }}>Back to the Gathering</Button>
        </Link>
        
        {/* THE POST */}
        <Card sx={{ mb: 4, bgcolor: '#f5f5f5' }}>
            <CardContent>

                <Typography variant="h3" gutterBottom>
                  {post.title}
                </Typography>

                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                  {post.description}
                </Typography>

                <Typography variant="caption" color="gray" sx={{ mt: 2, display: 'block' }}>
                    Shared by {post.username} • {new Date(post.created_at).toLocaleDateString()}
                </Typography>

            </CardContent>
        </Card>

        <Divider sx={{ mb: 4 }} /> {/* Read more about what this does, later */}

        {/* THE ADMIN CONTROL PANEL */}
        {isAdmin && (
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button 
                    variant="contained" 
                    color={massDeleteMode ? "secondary" : "primary"}
                    onClick={() => {
                        setMassDeleteMode(!massDeleteMode);
                        setSelectedIds([]); // Clear selection when toggling
                    }}
                >
                    {massDeleteMode ? "Exit Management" : "Manage Chatters"}
                </Button>

                {massDeleteMode && selectedIds.length > 0 && (
                    <Button variant="contained" color="error" onClick={executeMassDelete}>
                        Delete Selected ({selectedIds.length})
                    </Button>
                )}
            </Stack>
        )}
        
        {/* COMMENT SECTION */}
        <Typography variant="h5" gutterBottom> Chatters ({comments.length})</Typography>
        
        {/* Input Box */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>

            <TextField 
                fullWidth 
                placeholder="Share your opinion..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddComment}>
              Reply
            </Button>
            
        </Stack>

        {/* List of Comments */}
        <Stack spacing={2}>
            {comments.map((c) => (
              <Card key={c.id} variant="outlined">
                <CardContent>
                    {/* NTS: Here, use a horizontal Stack to put the checkbox next to the content */}
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            
                            {/* THE CHECKBOX  */}
                            {massDeleteMode && (
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(c.id)}
                                    onChange={() => toggleSelection(c.id)}
                                    style={{ marginTop: '7px', transform: 'scale(1.4)', cursor: 'pointer' }}
                                />
                            )}

                            <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="body1">{c.content}</Typography>

                                    {/* Hide standard Edit/Delete buttons when Mass Delete is active to avoid clutter */}
                                    {!massDeleteMode && (c.username === currentUser || isAdmin) && (
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" onClick={() => handleEditComment(c)}>Edit</Button>
                                            <Button size="small" color="error" onClick={() => handleDeleteComment(c.id)}>X</Button>
                                        </Stack>
                                    )}
                                </Stack>

                                <Typography variant="caption" color="gray">
                                    {c.username || "Anonymous"} • {new Date(c.created_at).toLocaleString()}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    </div>
  )
}

export default PostDetail