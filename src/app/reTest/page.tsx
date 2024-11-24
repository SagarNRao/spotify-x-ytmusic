"use client"
import { Button } from "@/components/ui/button";

const sendDataToPythonScript = async () => {
  const response = await fetch('/api/run-python', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: 'your-string-data' }),
  });

  const result = await response.json();
  console.log(result.output);
};

// Call this function when needed, e.g., on a button click
// sendDataToPythonScript();

export default function Page() {
return (
  <Button onClick={sendDataToPythonScript}>Here</Button>
)
}
