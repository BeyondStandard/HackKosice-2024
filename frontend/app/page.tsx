"use client";
import { useEffect, useState } from "react";
import { InputGroup, Input, Button } from "reactstrap";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const MainContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: Fira Sans, sans-serif;
  margin: auto;
  text-align: center;
`;
const TitleSC = styled.div`
  display: flex;
  color: white;
  font-size: 52px;
  font-weight: bold;
  margin: auto;
  text-align: center;
  font-variant: small-caps;
`;
const SubTitleSC = styled.div`
  display: flex;
  color: #a8a8a8;
  font-size: 24px;
  margin: 16px auto;
  text-align: center;
`;
const GitHubButtonSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 50px;
  background-color: black;
  color: white;
  margin: auto;
  font-weight: 600;
  border-radius: 8px;
  gap: 10px;
  cursor: pointer;
`;

const RepoLinkInputSC = styled.input`
  border: 4px solid #e40764;
  height: 50px;
  border-radius: 6px 0px 0px 6px;
  width: 500px;
  padding-left: 12px;

  &::placeholder {
    color: #a5a5a5;
    font-weight: 500;
  }
  &:active,
  &:focus {
    outline: none;
  }
`;
const SubmitButtonSC = styled.div`
  cursor: pointer;
  width: 70px;
  height: 50px;
  background-color: #e40764;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 0px 6px 6px 0px;
`;
const RobotSC = styled.img`
  position: absolute;
  bottom: 0px;
  left: 0px;
`;

const LogoSC = styled.img``;
export default function Home() {
  const [inputValue, setInputValue] = useState(""); // State to store the input value
  const router = useRouter(); // useRouter hook for redirection
  const CLIENT_ID = "98ad48014ecb50454edd";

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update state with input value
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://televate-1fb46ecbb8ff.herokuapp.com/get-repo-structure?repo_url=" +
          inputValue,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        // If the response is successful, redirect to '/editor'
        // https://hack-kosice-2024.vercel.app/editor?repo_url=Pythagora-io/gpt-pilot
        router.push("/editor?repo_url=" + inputValue);
      } else {
        // Handle server errors or unsuccessful responses
        alert("Request failed: " + response.statusText);
      }
    } catch (error) {
      // Handle network errors
      console.error("Request error:", error);
      alert("Request error: " + error.message);
    }
  };

  function loginWithGitHub() {
    let user = prompt("Enter a username:");
    if (!user) {
      return;
    }
    router.push("/repositories?user=" + user);
    // window.location.assign(
    //   "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID
    // );
  }
  return (
    <MainContainer>
      <ContentContainer>
        <TitleSC>
          <LogoSC src="/files/logo.png" width={700} height={153} />
        </TitleSC>

        <SubTitleSC>
          AI-based code refactoring tool to help developers <br />
          elevate their legacy projects
        </SubTitleSC>
        <div style={{ display: "flex", margin: "auto" }}>
          <RepoLinkInputSC
            placeholder="Paste the link to your GitHub repository"
            value={inputValue}
            onChange={handleInputChange}
          />
          <SubmitButtonSC onClick={handleSubmit}>Elevate</SubmitButtonSC>
        </div>
        <SubTitleSC>or</SubTitleSC>
        <GitHubButtonSC>
          <img src="/files/github.png" height={30} width={30} />
          <div onClick={loginWithGitHub}>Sign in with GitHub</div>
        </GitHubButtonSC>
      </ContentContainer>
      <RobotSC src="/files/robot.png" width={394} height={600} alt="robot" />
    </MainContainer>
  );
}
