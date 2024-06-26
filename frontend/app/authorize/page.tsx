"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Spinner } from "reactstrap";

export default function Auth() {
  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const router = useRouter(); // useRouter hook for redirection
  async function getToken() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");

    if (codeParam && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch(
          "https://televate-1fb46ecbb8ff.herokuapp.com/getAccessToken?code=" +
            codeParam,
          {
            method: "GET",
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setRerender(!rerender);
            }
          });
      }

      getAccessToken();
    }
  }

  async function getUserData() {
    await fetch("https://televate-1fb46ecbb8ff.herokuapp.com/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      });
  }
  console.log(userData.login);
  useEffect(() => {
    async function fetchData() {
      await getToken(); // Call getToken first

      // Now call getUserData after getToken completes
      await getUserData();
    }
    fetchData().then(() => {
      if (userData.login) {
        router.push("/repositories?user=" + userData.login);
      }
    });
  }, [userData.login]); // Add userData.login to the dependency array
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
      <Spinner color="light">
        </Spinner>
    </div>
  );
}
