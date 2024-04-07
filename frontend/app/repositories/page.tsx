"use client";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "reactstrap";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { headers } from "@/node_modules/next/headers";
const TitleSC = styled.div`
  display: flex;
  font-family: "Fira Code", monospace;
  text-align: left;
  font-size: 30px;
  font-weight: 500;
  color: #c4c666;
  padding-left: 10px;
`;

const RepoContainerSC = styled.div`
  width: 600px;
  height: 50px;
  font-family: "Fira Code", monospace;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0px;
  background-color: #232123;
  border-radius: 8px;
  &:hover {
    background-color: rgba(228, 7, 100, 0.4);
  }
  cursor: pointer;
`;
export default function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Username");
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const user = queryParams.get("user");
        if (!user) {
          throw new Error("User missing.");
        }
        setUserName(user);
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
    };

    fetchRepositories();
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
  const router = useRouter(); // useRouter hook for redirection
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "90%",
        overflow: "auto",
      }}
    >
      <TitleSC>Here are your repositories, {userName}</TitleSC>
      {repositories.map((repo) => (
        <RepoContainerSC
          key={repo.id}
          onClick={() => {
            router.push("/editor?repo_url=" + repo.full_name);
          }}
        >
          {repo.full_name} {/* Displaying the full name */}
        </RepoContainerSC>
      ))}
    </div>
  );
}
