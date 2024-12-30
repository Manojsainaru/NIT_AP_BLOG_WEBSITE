import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    if (files) data.append('cover', files[0]);

    const response = await fetch('https://nit-ap-blog-website-al5p.onrender.com/api/post', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) return <Navigate to="/" />;

  return (
    <form onSubmit={createNewPost}>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <input
        type="text"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        placeholder="Summary"
        required
      />
      <Editor value={content} onChange={setContent} />
      <input
        type="file"
        onChange={e => setFiles(e.target.files)}
      />
      <button type="submit">Create Post</button>
    </form>
  );
}
