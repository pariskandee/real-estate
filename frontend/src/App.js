import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PostForm from "./pages/PostForm";
import PostDetails from "./pages/PostDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { auth } from "./firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const t = (fr, en) => (lang === "fr" ? fr : en);

  return (
    <Router>
      <div className="app-container">
        <header>
          <nav>
            <Link to="/">{t("Accueil", "Home")}</Link>
            <Link to="/post">{t("Ajouter une annonce", "Post Ad")}</Link>
            <Link to="/contact">{t("Contact", "Contact")}</Link>
            {user && (
              <Link to="/admin">{t("Admin", "Admin")}</Link>
            )}
            {!user ? (
              <Link to="/login">{t("Connexion", "Login")}</Link>
            ) : (
              <button onClick={handleLogout}>{t("Déconnexion", "Logout")}</button>
            )}
            <select onChange={(e) => setLang(e.target.value)} value={lang}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/post" element={<PostForm user={user} lang={lang} />} />
            <Route path="/post/:id" element={<PostDetails lang={lang} />} />
            <Route path="/admin" element={<AdminDashboard user={user} lang={lang} />} />
            <Route path="/contact" element={<Contact lang={lang} />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <footer>
          <p>© 2025 KingTamil Immobilier</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
