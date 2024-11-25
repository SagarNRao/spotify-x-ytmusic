"use client";
import React, { useState } from "react";

const YourComponent = () => {
  const [inputData, setInputData] = useState("");
  const [res, setRes] = useState("");

  const handleButtonClick = async () => {
    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: inputData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      setRes(result);
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      setRes("Error fetching data from Python server");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Enter data"
      />
      <button onClick={handleButtonClick}>Run Python Script</button>
      <p>{res}</p>
    </div>
  );
};

export default YourComponent;
