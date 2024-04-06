'use client'

import { DiffEditor } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';

const treeStructure = {
  "name": "project",
  "type": "folder",
  "children": [
    {
      "name": "docs",
      "type": "folder",
      "children": [
        {
          "name": "index.md",
          "type": "file"
        },
        {
          "name": "installation.md",
          "type": "file"
        }
      ]
    },
    {
      "name": "src",
      "type": "folder",
      "children": [
        {
          "name": "main.py",
          "type": "file"
        },
        {
          "name": "utils",
          "type": "folder",
          "children": [
            {
              "name": "helper.py",
              "type": "file"
            }
          ]
        }
      ]
    },
    {
      "name": "tests",
      "type": "folder",
      "children": [
        {
          "name": "test_main.py",
          "type": "file"
        },
        {
          "name": "test_utils.py",
          "type": "file"
        }
      ]
    }
  ]
};

const FileTree = ({ node }) => {
  if (node.type === "folder") {
    return (
      <div>
        <strong>{node.name}/</strong>
        <div style={{ paddingLeft: "20px" }}>
          {node.children.map((child, index) => (
            <FileTree key={index} node={child} />
          ))}
        </div>
      </div>
    );
  } else {
    return <div>{node.name}</div>;
  }
};


export default function App() {
  // 'https://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop/main&file_path=main.py'
  // return <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />;
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: "gray" }}>
      <div style={{ flex: 1 }}>
        <FileTree node={treeStructure} />
      </div>
      <div style={{ flex: 4 }}>
        <DiffEditor height="100vh" width="100%" original="// some comment" modified="// some comment \r\n ahoj\\" />
      </div>
    </div>
  );
}


// const treeStructure = {
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
// }

// const FileTree = ({ node }) => {
//   if (node.type === "folder") {
//     return (
//       <div>
//         <strong>{node.name}/</strong>
//         <div style={{ paddingLeft: "20px" }}>
//           {node.children.map((child, index) => (
//             <FileTree key={index} node={child} />
//           ))}
//         </div>
//       </div>
//     );
//   } else {
//     return <div>{node.name}</div>;
//   }
// };

// export default function Editorxx() {
//   return (
//     <Container fluid className="custom-container">
//       <Row>
//         <Col xs="2" className="bg-light border">
//           <FileTree node={treeStructure} />
//         </Col>
        
//         <Col xs="5" className="bg-light border">
//           Wider Column 1
//         </Col>
        
//         <Col xs="5" className="bg-light border">
//           Wider Column 2
//         </Col>
//       </Row>
//     </Container>
//   );
// }
