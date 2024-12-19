"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
export async function Home() {
  const [token, setToken] = useState<string | null>(null);
  const ClientID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const ClientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";

  const scope = "user-read-private user-read-email";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  const data = await axios.get("https://api.spotify.com/v1/search", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleButtonClick = async () => {
    await refreshAccessToken();
  };

  const refreshAccessToken = async () => {
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (!refreshToken) {
      // Redirect to login if no refresh token is available
      window.location.href = `${AUTH_ENDPOINT}?client_id=${ClientID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
      return;
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${ClientID}:${ClientSecret}`)}`,
        },
        params: {
          grant_type: "authorization_code",
          refresh_token: refreshToken,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    const expiryTime = new Date().getTime() + expires_in * 1000;

    window.localStorage.setItem("token", access_token);
    window.localStorage.setItem("tokenExpiry", expiryTime.toString());
    setToken(access_token);
  };

  useEffect(() => {
    console.log("here");
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const expiresIn = hashParams.get("expires_in"); // Usually in seconds

      if (accessToken && expiresIn) {
        const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
        window.localStorage.setItem("token", accessToken);
        window.localStorage.setItem("tokenExpiry", expiryTime.toString());
        setToken(accessToken);

        // Clear the hash from the URL
        window.location.hash = "";
      }
    } else {
      const storedToken = window.localStorage.getItem("token");
      const tokenExpiry = window.localStorage.getItem("tokenExpiry");

      if (storedToken && tokenExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(tokenExpiry)) {
          setToken(storedToken);
        } else {
          // Token has expired, handle refresh logic here
          refreshAccessToken();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Button onClick={handleButtonClick}>Refresh Token</Button>
      <Button >HERE</Button>
    </div>
  );
}

export default Home;
