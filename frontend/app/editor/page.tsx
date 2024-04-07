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
  const fetchFile = async (fileName: string) => {
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

  const compileOnClick = async () => {
    let url = `https://televate-1fb46ecbb8ff.herokuapp.com/new-code/`;
    let body = {
      old_code: editorValue,
    };
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    setUseDiffEditor(true);
    setDiffEditorModified(data);

    url = `https://televate-1fb46ecbb8ff.herokuapp.com/code-description/`;
    body = {
      old_code: editorValue,
    };
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();
    setExplanation(data);
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
                setActiveSection("overview");
              }}
            >
              overview
            </SectionTitle>
            <SectionTitle
              isActive={activeSection === "testing"}
              onClick={() => {
                setActiveSection("testing");
              }}
            >
              testing
            </SectionTitle>
          </SectionsContainer>
          <OverviewContainer>
            <OverviewTitleSC>Overview</OverviewTitleSC>
            <OverviewSC>
              "This code file, named analysis.py, serves as the main script for
              data analysis in a project aimed at forecasting sales trends. The
              Python script is well-organized into distinct functions,
              facilitating modularity and ease of maintenance. The code begins
              with essential imports, including libraries such as pandas for
              data manipulation and matplotlib for visualization. The main
              functionalities of the script are encapsulated within functions.
              For instance, the load_data function effectively imports the
              dataset, ensuring data integrity and handling potential errors
              gracefully. Subsequently, the "preprocess_data function undertakes
              crucial data preprocessing steps, such as handling missing values
              and encoding categorical variables. Moreover, the script includes
              functions dedicated to exploratory data analysis tasks. The
              "plot_distribution" function, for instance, generates histograms
              to visualize the distribution of numerical features, aiding in
              understanding the underlying patterns in the data. Additionally,
              the "plot_correlation_matrix" function creates a correlation
              matrix heatmap, facilitating the identification of relationships
              between variables."
            </OverviewSC>
          </OverviewContainer>
          <Button color="success" onClick={compileOnClick}>
            Compile
          </Button>
          <div>{explanation}</div>
        </div>
      </div>
    </div>
  );
}
