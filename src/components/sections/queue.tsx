"use client"
import React, { useContext } from 'react';
import { AppContext } from '@/app/AppContext';

export default function Queue() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const { QDetails } = context;

  return (
    <div>
      <p>Queue Component: {QDetails}</p>
    </div>
  );
}