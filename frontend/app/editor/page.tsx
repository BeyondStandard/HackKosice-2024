'use client'

import { DiffEditor } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import React, { useState, useEffect } from 'react';

// let treeStructure = {
//   "name": "project",
//   "type": "folder",
//   "children": [
//     {
//       "name": "docs",
//       "type": "folder",
//       "children": [
//         {
//           "name": "index.md",
//           "type": "file"
//         },
//         {
//           "name": "installation.md",
//           "type": "file"
//         }
//       ]
//     },
//     {
//       "name": "src",
//       "type": "folder",
//       "children": [
//         {
//           "name": "main.py",
//           "type": "file"
//         },
//         {
//           "name": "utils",
//           "type": "folder",
//           "children": [
//             {
//               "name": "helper.py",
//               "type": "file"
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "name": "tests",
//       "type": "folder",
//       "children": [
//         {
//           "name": "test_main.py",
//           "type": "file"
//         },
//         {
//           "name": "test_utils.py",
//           "type": "file"
//         }
//       ]
//     }
//   ]
// };

// Mocked root structure
const rootStructure = [
  { "name": ".github", "path": ".github", "type": "dir" },
  { "name": ".gitignore", "path": ".gitignore", "type": "file" },
  { "name": "scripts", "path": "scripts", "type": "dir" },
  { "name": "docs", "path": "docs", "type": "dir" },
];

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
  const [repoStrucutre, setRepoStructure] = useState({});
  const [editorValue, setEditorValue] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('');
  const [rootStructure, setRootStructure] = useState([]);

  const fetchFile = async (fileName: string) => {
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
  
  const Item = ({ name, path, type, fetchContents }) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [contents, setContents] = useState([]);
  
    const handleClick = async () => {
        if (type === 'dir') {
            if (!isOpen) {
                const fetchedContents = await fetchContents(path);
                setContents(fetchedContents);
            }
            setIsOpen(!isOpen);
        }
    };
  
    return (
        <div>
            <div onClick={handleClick} style={{ cursor: type === 'dir' ? 'pointer' : 'default' }}>
                {name} {type === 'dir' ? isOpen ? '(-)' : '(+)' : ''}
            </div>
            {isOpen && type === 'dir' && (
                <div style={{ marginLeft: '20px' }}>
                    {contents.length > 0 ? (
                        contents.map(item => (
                            <Item key={item.path} {...item} fetchContents={fetchContents} />
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
  
  const FolderStructure = ({ structure }) => {
    return (
        <div>
            {structure.map(item => (
                <Item key={item.path} {...item} fetchContents={fetchDirectoryContents} />
            ))}
        </div>
    );
  };

  const FileTree = ({ node }) => {
    console.log('meow', {node})
    if (node.type === "dir") {
      return (
        <div>
          <strong>{node.name}/</strong>
          <div style={{ paddingLeft: "20px" }}>
            {node['children'].map((child, index) => (
              <div onClick={() => fetchDirectory(child)}>
                <FileTree key={index} node={child} />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return <div onClick={() => fetchFile(node.name)}>{node.name} file</div>;
    }
  };

  
  // const FileTree = ({ files }) => {
  //   return (
  //     <div>
  //       {files.map((file, index) => (
  //         <div onClick={() => fetchFile(file.name)}>
  //       {file.name}
  //       {file.type === 'dir' && (
  //         <button onClick={(e) => {
  //           e.stopPropagation(); // Prevent triggering the div's onClick
  //           // Handle button click action here
  //           console.log(`Button for ${file.name} clicked`);
  //         }}>Button</button>
  //       )}
  //           </div>
  //       ))}
  //     </div>
  //   )
  // };
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


  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: "gray" }}>
      <div style={{ flex: 1 }}>
        <FolderStructure structure={rootStructure}/>
        {/* <FileTree node={repoStrucutre} /> */}
      </div>
      <div style={{ flex: 4 }}>
        {/* <DiffEditor height="100vh" width="100%" original="// some comment" modified="// some comment \r\n ahoj\\" /> */}
        <Editor height="100vh" defaultLanguage="javascript" defaultValue="// Select a file" value={editorValue} onChange={handleEditorChange} language={editorLanguage} />;
      </div>
    </div>
  );
}