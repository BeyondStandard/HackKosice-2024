"use client"
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "reactstrap";

export default function Repositories() {
    const [repositories, setRepositories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepositories = async () => {
          try {
            const queryParams = new URLSearchParams(window.location.search);
            const user = queryParams.get("user");
            if (!user) {
                throw new Error("User missing.");
            }
            const url = `https://api.github.com/users/${user}/repos`;
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }    
            const data = await response.json();
            setRepositories(data);
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
    
        fetchRepositories()
      }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh", // This makes sure the div takes full viewport height
              backgroundColor: "#000", // Optional: in case you want to change the background color
            }}
          >
            <Spinner color="light">Loading...</Spinner>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {repositories.map((repo) => (
                <div key={repo.id} style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <Button>
                        <span>{repo.full_name}</span> {/* Displaying the full name */}
                    </Button>
                </div>
            ))}
        </div>
    );
    
    
}
