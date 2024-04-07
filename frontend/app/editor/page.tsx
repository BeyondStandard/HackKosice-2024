"use client";
import "../globals.css";
import { DiffEditor } from "@monaco-editor/react";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "reactstrap";
import styled from "styled-components";

function createFileTree(files) {
  const fileSystem = [];
  files.forEach((element) => {
    if (element.type === "blob") {
      fileSystem.push(element);
    }
  });
  return fileSystem;
}

const LanguageButtonSC = styled.div<{ color: string }>`
  height: 70px;
  width: 70px;
  ${(props) => props.color && "background-color:" + props.color};
`;

const FileTreeContainerSC = styled.div`
  margin: 5px;
  padding-left: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;

  &:hover {
    background-color: rgba(228, 7, 100, 0.5);
  }
`;
const FileContainer = styled.div`
  display: flex;
  font-family: "Fira Code", monospace;
  margin: auto;
  text-align: left;
`;
const FileTreeTitleSC = styled.div`
  display: flex;
  font-family: "Fira Code", monospace;
  margin: auto;
  text-align: left;
  font-size: 22px;
  font-weight: 500;
  color: #c4c666;
  padding-left: 10px;
`;
const SectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 55px;
  align-items: center;
  justify-content: center;
  width: 50px;
`;

const SectionTitle = styled.div<{ isActive?: string }>`
  display: flex;
  font-family: "Fira Code", monospace;
  text-align: center;
  justify-content: center;
  align-items: center;
  font-variant: small-caps;
  color: white;
  transform: rotate(-90deg);
  font-size: 20px;
  &:hover {
    background-color: rgba(228, 7, 100, 0.5);
  }
  width: 100px;
  height: 50px;
  ${(props) => props.isActive && "background-color: rgba(228, 7, 100, 0.5);"}
`;

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 5px;
  width: 1100px;
`;
const OverviewTitleSC = styled.div`
  display: flex;
  font-family: "Fira Code", monospace;
  text-align: left;
  font-size: 24px;
  font-weight: 500;
  color: #c4c666;
  padding-left: 10px;
`;
const OverviewSC = styled.div`
  display: flex;
  font-family: "Fira Code", monospace;
  text-align: left;
  color: white;
  font-size: 18px;
  overflow: auto;
  max-height: 200px;
`;
const ButtonsContainerSC = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export default function App() {
  // 'https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop/main&file_path=main.py'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [editorLanguage, setEditorLanguage] = useState("");
  const [rootStructure, setRootStructure] = useState([]);
  const [useDiffEditor, setUseDiffEditor] = useState(false);
  const [diffEditorModified, setDiffEditorModified] = useState("");
  const [explanation, setExplanation] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [descriptionSpinnerSpinning, setDescriptionSpinnerSpinning] = useState(false)

  const fetchFile = async (fileName: string) => {
    setSelectedFile(fileName);
    console.log({ fileName });
    const queryParams = new URLSearchParams(window.location.search);
    const repoUrl = queryParams.get("repo_url");
    const fileUrl = `https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=${repoUrl}&file_path=${fileName}`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    setEditorValue(JSON.parse(data));
    if (fileName.endsWith(".py")) {
      setEditorLanguage("python");
    } else if (fileName.endsWith(".js")) {
      setEditorLanguage("javascript");
    } else if (fileName.endsWith(".md")) {
      setEditorLanguage("markdown");
    }
  };

  useEffect(() => {
    // Function to fetch repo data
    const fetchRepoData = async () => {
      try {
        // Get the query params from the URL
        const queryParams = new URLSearchParams(window.location.search);
        const repoUrl = queryParams.get("repo_url");
        if (!repoUrl) {
          throw new Error("Repo URL not specified in the query parameters.");
        }

        const url = `https://televate-1fb46ecbb8ff.herokuapp.com/get-repo-structure/?repo_url=${repoUrl}`;

        // Fetch the data from the repo URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRootStructure(createFileTree(data["tree"]));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, []);

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
  if (error) {
    return <div>Error: {error}</div>;
  }

  const compileOnClick = async (language: string) => {
    if (!selectedFile) {
      alert("No file selected");
      return;
    }
    const queryParams = new URLSearchParams(window.location.search);
    const repoUrl = queryParams.get("repo_url");
    if (!repoUrl) {
      throw new Error("Repo URL not specified in the query parameters.");
    }
    let url = `https://televate-1fb46ecbb8ff.herokuapp.com/new-code/?repo_url=${repoUrl}&file_path=${selectedFile}&lang=${language}`;
    let response = await fetch(url, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    setUseDiffEditor(true);
    setDiffEditorModified(data["result"]);
  };

  const getDescription = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setDescriptionSpinnerSpinning(false)
    setDescription(data["result"]);
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#1F1624" }}
    >
      <div style={{ flex: "0 1 auto", overflow: "auto" }}>
        <FileTreeTitleSC>Project files</FileTreeTitleSC>
        {rootStructure.map((file, index) => (
          <FileTreeContainerSC>
            <FileContainer onClick={() => fetchFile(file.path)}>
              {file.path.split("/").pop()}
            </FileContainer>
          </FileTreeContainerSC>
        ))}
      </div>
      <div style={{ flex: 3 }}>
        <DiffEditor
          height="70vh"
          width="100%"
          original={editorValue}
          modified={diffEditorModified}
          language="python"
          theme={"vs-dark"}
        />
        <div
          style={{
            height: "30vh",
            backgroundColor: "black",
            color: "white",
            display: "flex",
          }}
        >
          <SectionsContainer>
            <SectionTitle
              isActive={activeSection === "overview"}
              onClick={() => {
                setActiveSection("overview")
                setDescription("");
                setDescriptionSpinnerSpinning(true)
                getDescription(
                  `https://televate-1fb46ecbb8ff.herokuapp.com/new-description/?file_path=${selectedFile}`
                );
              }}
            >
              overview
            </SectionTitle>
            <SectionTitle
              isActive={activeSection === "testing"}
              onClick={() => {
                setActiveSection("testing")
                setDescription("");
                setDescriptionSpinnerSpinning(true)
                getDescription(
                  `https://televate-1fb46ecbb8ff.herokuapp.com/new-test/?file_path=${selectedFile}`
                );
              }}
            >
              testing
            </SectionTitle>
          </SectionsContainer>
          <OverviewContainer>
            <OverviewTitleSC>
              {activeSection === "overview" ? "Overview" : "Testing"}
            </OverviewTitleSC>
            <OverviewSC style={{ width: "100%" }}>{description}</OverviewSC>
          </OverviewContainer>
          {descriptionSpinnerSpinning && <Spinner/>}
          <ButtonsContainerSC>
            <LanguageButtonSC
              onClick={() => {
                compileOnClick("Python");
              }}
            >
              <img src="/files/python.png" width={60} height={60} />
            </LanguageButtonSC>
            <LanguageButtonSC
              onClick={() => {
                compileOnClick("Java");
              }}
            >
              <img src="/files/java.png" width={60} height={60} />
            </LanguageButtonSC>
            <LanguageButtonSC
              onClick={() => {
                compileOnClick("C++");
              }}
            >
              <img src="/files/cpp.png" width={60} height={60} />
            </LanguageButtonSC>
          </ButtonsContainerSC>
          <div></div>
        </div>
      </div>
    </div>
  );
}
