import { useState, useEffect } from "react";
import Post from "../Post"; // Adjusted import path

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('https://nit-ap-blog-website-al5p.onrender.com/api/post')
      .then(response => response.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <div>
      {posts.length > 0 ? (
        posts.map(post => (
          <Post key={post._id} {...post} />
        ))
      ) : (
        <p>No posts found</p>
      )}
    </div>
  );
}
