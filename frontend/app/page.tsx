'use client'
import { useState } from 'react';
import { InputGroup, Input, Button } from "reactstrap";
import { useRouter } from 'next/router';

export default function Home() {
  const [inputValue, setInputValue] = useState(''); // State to store the input value
  const router = useRouter(); // useRouter hook for redirection


  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update state with input value
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop&file_path=main.py', {
        method: 'GET',
      });

      if (response.ok) {
        // If the response is successful, redirect to '/editor'
        router.push("/editor")
      } else {
        // Handle server errors or unsuccessful responses
        alert('Request failed: ' + response.statusText);
      }
    } catch (error) {
      // Handle network errors
      console.error('Request error:', error);
      alert('Request error: ' + error.message);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '40%' }}>
        <InputGroup size="lg" style={{ marginBottom: '1rem' }}>
          <Input placeholder="Enter your Github repo URL" value={inputValue} onChange={handleInputChange} />
        </InputGroup>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{ width: '50%' }} onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </main>
  );
}
