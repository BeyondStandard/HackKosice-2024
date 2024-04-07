'use client'

import { DiffEditor } from '@monaco-editor/react';
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';

function createFileTree(files) {
  const fileSystem = []
  files.forEach(element => {
    if (element.type === 'blob') {
      fileSystem.push(element)
    }
  })
  return fileSystem
}

export default function App() {
  // 'https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop/main&file_path=main.py'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('');
  const [rootStructure, setRootStructure] = useState([]);
  const [useDiffEditor, setUseDiffEditor] = useState(false);
  const [diffEditorModified, setDiffEditorModified] = useState('');
  const [explanation, setExplanation] = useState('');

  const fetchFile = async (fileName: string) => {
    console.log({fileName})
    const queryParams = new URLSearchParams(window.location.search);
    const repoUrl = queryParams.get('repo_url');
    const fileUrl = `https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=${repoUrl}&file_path=${fileName}`
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    setEditorValue(JSON.parse(data));
    if (fileName.endsWith('.py')) {
      setEditorLanguage('python')
    } else if (fileName.endsWith('.js')) {
      setEditorLanguage('javascript')
    } else if (fileName.endsWith('.md')) {
      setEditorLanguage('markdown')
    }
  }
  
  useEffect(() => {
    // Function to fetch repo data
    const fetchRepoData = async () => {
      try {
        // Get the query params from the URL
        const queryParams = new URLSearchParams(window.location.search);
        const repoUrl = queryParams.get('repo_url');
        if (!repoUrl) {
          throw new Error("Repo URL not specified in the query parameters.");
        }

        const url = `https://televate-1fb46ecbb8ff.herokuapp.com/get-repo-structure/?repo_url=${repoUrl}`

        // Fetch the data from the repo URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRootStructure(createFileTree(data['tree']));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const compileOnClick = async () => {
    let url = `https://televate-1fb46ecbb8ff.herokuapp.com/new-code/`
    let body = {
      'old_code': editorValue
    }
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    setUseDiffEditor(true);
    setDiffEditorModified(data);

    url = `https://televate-1fb46ecbb8ff.herokuapp.com/code-description/`
    body = {
      'old_code': editorValue
    }
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();
    setExplanation(data)
  }


  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: "#6c757d" }}>
      <div style={{ flex: '0 1 auto', overflow: 'auto' }}>
        {rootStructure.map((file, index) => (
          <div style={{margin: '5px'}}>
            <Button color='secondary' onClick={() => fetchFile(file.path)}>{file.path.split('/').pop()}</Button>
            </div>
        ))}
      </div>
      <div style={{ flex: 4 }}>
        <DiffEditor height="80vh" width="100%" original={editorValue} modified={diffEditorModified} />
        <div style={{height: '20vh', backgroundColor: 'black', color: 'white'}}>
          <Button color="success" onClick={compileOnClick}>Compile</Button>
          <div>
            { explanation }
          </div>
        </div>
      </div>
    </div>
  );
}