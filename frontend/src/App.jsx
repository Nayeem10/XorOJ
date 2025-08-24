import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Replace with your real API call
    async function loadUser() {
      // mock:
      const data = { name: "Nayeem", avatarUrl: "" };
      setUser(data);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        onProfile={() => (window.location.href = "/profile")}
        onLogout={() => {
          // Call your API, then redirect:
          // await fetch('/api/logout', { method: 'POST', credentials: 'include' })
          window.location.href = "/login";
        }}
      />
      <main className="flex-1 p-4">
        
      </main>
      <Footer />
    </div>
  );
}
