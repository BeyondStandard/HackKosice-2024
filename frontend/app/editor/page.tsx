'use client'

import { DiffEditor } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import React, { useState, useEffect } from 'react';

// let treeStructure = {
  // "name": "project",
  // "type": "folder",
  // "children": [
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

// const FileTree = ({ node }) => {
//   if (node.type === "folder") {
//     return (
//       <div>
//         <strong>{node.name}/</strong>
//         <div style={{ paddingLeft: "20px" }}>
          // {node.children.map((child, index) => (
          //   <FileTree key={index} node={child} />
          // ))}
//         </div>
//       </div>
//     );
//   } else {
//     return <div>{node.name}</div>;
//   }
// };




export default function App() {
  // 'https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop/main&file_path=main.py'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoStrucutre, setRepoStructure] = useState([]);
  const [editorValue, setEditorValue] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('');
  
  const fetchFile = async (fileName: string) => {
    const fileUrl = `https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop&file_path=${fileName}`
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
  
  const FileTree = ({ files }) => {
    return (
      <div>
        {files.map((file, index) => (
          <div onClick={() => fetchFile(file.name)}>{file.name}</div>
        ))}
      </div>
    )
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

        
        setRepoStructure(data);
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
        <FileTree files={repoStrucutre} />
      </div>
      <div style={{ flex: 4 }}>
        {/* <DiffEditor height="100vh" width="100%" original="// some comment" modified="// some comment \r\n ahoj\\" /> */}
        <Editor height="100vh" defaultLanguage="javascript" defaultValue="// Select a file" value={editorValue} onChange={handleEditorChange} language={editorLanguage} />;
      </div>
    </div>
  );
}