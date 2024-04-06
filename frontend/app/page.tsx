'use client'
import { useState } from 'react';
import { InputGroup, Input, Button } from "reactstrap";
import { useRouter } from 'next/navigation'

export default function Home() {
  const [inputValue, setInputValue] = useState(''); // State to store the input value
  const router = useRouter(); // useRouter hook for redirection


  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update state with input value
  };

  const handleSubmit = async () => {
    try {

      const response = await fetch('https://televate-1fb46ecbb8ff.herokuapp.com/get-repo-structure?repo_url='+ inputValue, {
        method: 'GET',
      });

      if (response.ok) {
        // If the response is successful, redirect to '/editor'
        // https://hack-kosice-2024.vercel.app/editor?repo_url=Pythagora-io/gpt-pilot
        router.push("/editor?repo_url=" + inputValue)
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
