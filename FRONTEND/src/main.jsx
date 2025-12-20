import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { UnreadMessagesProvider } from "./context/UnreadMessagesContext";
import { IncomingCallProvider } from "./context/IncomingCallContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <UnreadMessagesProvider>
        <IncomingCallProvider>
          <App />
        </IncomingCallProvider>
      </UnreadMessagesProvider>
    </ThemeProvider>
  </BrowserRouter>
);
