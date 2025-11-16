"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = { children?: React.ReactNode };

export default function ToastProvider({ children }: Props) {
  return (
    <>
      {/* global toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* allow optional children so you can wrap layout */}
      {children}
    </>
  );
}
