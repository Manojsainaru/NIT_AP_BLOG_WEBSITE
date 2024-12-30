import { Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";

export default function Post({ _id, title, cover, summary, createdAt, author }) {
  return (
    <div className="post">
      <Link to={`/post/${_id}`}>
        {cover && <img src={`http://localhost:4000${cover}`} alt={title} />}
        <h2>{title}</h2>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </Link>
    </div>
  );
}
