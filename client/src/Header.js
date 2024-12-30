import { Link } from "react-router-dom";
import { useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch('https://nit-ap-blog-website-al5p.onrender.com/api/profile', {
      credentials: 'include',
    }).then(response => {
      if (response.ok) {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      }
    });
  }, [setUserInfo]);

  function logout() {
    fetch('https://nit-ap-blog-website-al5p.onrender.com/api/logout', {
      credentials: 'include',
      method: 'POST',
    }).then(() => setUserInfo(null));
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        <img src="/nitap_logo1.jpg" alt="NIT Andhra Logo" className="logo-img" />
        NIT Andhra Insights
      </Link>
      <nav>
        {username ? (
          <>
            <Link to="/create">New post</Link>
            <a onClick={logout}>Logout ({username})</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
