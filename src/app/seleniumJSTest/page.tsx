"use client"

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const handleClick = async () => {
    setLoading(true);
    setHtmlContent("");
    try {
      const response = await fetch("/api", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      setHtmlContent(data);
    } catch (error) {
      console.error('Error:', error);
      setHtmlContent("Error executing Selenium script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Running..." : "Run Selenium Script"}
      </Button>
      {htmlContent && <div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
    </div>
  );
}