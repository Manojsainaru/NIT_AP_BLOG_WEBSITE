import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => response.json())
      .then(data => {
        setTitle(data.title);
        setSummary(data.summary);
        setContent(data.content);
        setCover(data.cover);
      });
  }, [id]);

  async function updatePost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    if (files) data.append('cover', files[0]);

    const response = await fetch(`http://localhost:4000/post/${id}`, {
      method: 'PUT',
      body: data,
      credentials: 'include',
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) return <Navigate to={`/post/${id}`} />;

  return (
    <form onSubmit={updatePost}>
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
      {cover && <img src={`http://localhost:4000${cover}`} alt="Cover" />}
      <button type="submit">Update Post</button>
    </form>
  );
}
