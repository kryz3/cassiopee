"use client";

import ChatComponent from "../components/chatComponent";



export default function ChatPage() {
  const userID = localStorage.getItem("userID");
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ChatComponent />
    </div>
  );
}
 