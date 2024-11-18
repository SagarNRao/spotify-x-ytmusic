import React from 'react';

const Popup = () => {
  return (
    <div style={{ padding: '20px', width: '300px' }}>
      <h1>My Extension Popup</h1>
      <button onClick={() => alert('Hello from the extension!')}>Click Me</button>
    </div>
  );
};

export default Popup;
