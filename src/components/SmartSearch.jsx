import React, { useState } from "react";
import toast from "react-hot-toast";

export default function SmartSearch({ onResults }) {
    const [query, setQuery] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch("http://localhost:4001/api/search/nlp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query }),
          });
          const body = await res.json();
          if (!res.ok) {
              console.error("Search error:", body);
              toast.error(body.error || "Search failed");
              return;
          }
          if (!Array.isArray(body)) {
              console.error("Unexpected response:", body);
              toast.error("Invalid response from server");
              return;
          }
          onResults(body);
      } catch (err) {
          console.error("Network error:", err);
          toast.error("Network error");
      }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex mb-4">
            <input
                type="text"
                className="form-control me-2"
                placeholder="Try: Show me shoes under $100 with rating >4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
                Search AI
            </button>
        </form>
    );
}