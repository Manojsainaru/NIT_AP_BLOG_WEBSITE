import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => response.json())
      .then(data => setPost(data));

    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(userData => setUser(userData));
  }, [id]);

  if (!post) return <div>Loading...</div>;

  const isAuthor = user && post.author._id === user._id;

  return (
    <div className="post-page">
      <h1>{post.title}</h1>
      {post.cover && <img src={`http://localhost:4000${post.cover}`} alt={post.title} />}
      <p>{post.summary}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p>By {post.author.username}</p>

      {isAuthor && (
        <Link to={`/edit/${post._id}`} className="edit-btn">
          Edit Post
        </Link>
      )}
    </div>
  );
}
