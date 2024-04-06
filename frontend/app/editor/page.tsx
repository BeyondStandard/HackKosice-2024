'use client'

import { DiffEditor } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';

// Mock function to simulate fetching directory contents
const fetchDirectoryContents = async (path) => {
  const queryParams = new URLSearchParams(window.location.search);
  const repoUrl = queryParams.get('repo_url');
  const url = `https://televate-1fb46ecbb8ff.herokuapp.com/get-directory-contents/?repo_url=${repoUrl}&dir_path=${path}`
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json()
  return data
};



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
  
  const Item = ({ name, path, type, fetchContents, onFileClick }) => {
      const [isOpen, setIsOpen] = useState(false);
      const [contents, setContents] = useState([]);

      const handleClick = async () => {
          if (type === 'dir') {
              if (!isOpen) {
                  const fetchedContents = await fetchContents(path);
                  setContents(fetchedContents);
              }
              setIsOpen(!isOpen);
          } else if (type === 'file') {
              onFileClick(path); // Execute the passed function for files
          }
      };

      return (
          <div>
              <div onClick={handleClick} style={{ cursor: 'pointer' }}>
                  {name} {type === 'dir' ? isOpen ? '(-)' : '(+)' : ''}
              </div>
              {isOpen && type === 'dir' && (
                  <div style={{ marginLeft: '20px' }}>
                      {contents.length > 0 ? (
                          contents.map(item => (
                              <Item key={item.path} {...item} fetchContents={fetchContents} onFileClick={onFileClick} />
                          ))
                      ) : (
                          <div>No items found</div>
                      )}
                  </div>
              )}
          </div>
      );
  };
  
  const Folder = ({ name, path, fetchContents }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contents, setContents] = useState([]);
  
    const toggleFolder = async () => {
        if (!isOpen) {
            const fetchedContents = await fetchContents(path);
            setContents(fetchedContents);
        }
        setIsOpen(!isOpen);
    };
  
    return (
        <div>
            <div onClick={toggleFolder} style={{ cursor: 'pointer' }}>
                {name} {isOpen ? '(-)' : '(+)'}
            </div>
            {isOpen && (
                <div style={{ marginLeft: '20px' }}>
                    {contents.map(item => (
                        <div key={item.path}>
                            {item.type === 'dir' ? (
                                <Folder name={item.name} path={item.path} fetchContents={fetchContents} />
                            ) : (
                                <div>{item.name}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };
  
  const FolderStructure = ({ structure, onFileClick }) => {
      return (
          <div>
              {structure.map(item => (
                  <Item key={item.path} {...item} fetchContents={fetchDirectoryContents} onFileClick={onFileClick} />
              ))}
          </div>
      );
  };

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
        data.forEach(element => {
          if (element.type === 'dir') {
            element['children'] = []
          }
        });
        
        setRootStructure(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, []);

  const handleEditorChange = (text) => {
    console.log(JSON.stringify(text))
  }

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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: "gray" }}>
      <div style={{ flex: 1 }}>
        <FolderStructure structure={rootStructure} onFileClick={fetchFile}/>
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