import { useState, useRef, useEffect } from 'react';
import { flushSync } from "react-dom";
import * as React from "react";
import { io, Socket } from 'socket.io-client';
import { CHAT_SERVER_URL } from './env';

const LOL =  require("./img/LOL.png")
let nextId = 0;

const connectChatServer = () => {
  const socket = io(CHAT_SERVER_URL, {
    transports: ['websocket'],
    path: '/'
  });
  socket.onAny((type, message) => console.log(type, message));
  return socket;
}

const UserName = ({ user, isColorBlindMode }: any) => {
  return (
    <b style={{
      color: isColorBlindMode ? "" : user?.color
    }}>
      {user?.name}
    </b>
  )
}

const formatMessage = (body: string) => {
  let fragments = body.split('LUL');
  let result = [];
  for (let i=0; i < fragments.length; i++) {
    let fragment = fragments[i];
    result.push(fragment)
    if (i > 0) {
      result.push(<img style={{ width: "1rem" }} src={LOL} key={i} />)
    }
    result.push(fragment)
  }
  return result;
}

const App = () => {
  const [messages, setMessages] = useState<any[]>([
    { user: { name: "test" }, body: "HI LUL LUL OMG" },
    { user: { name: "test2" }, body: "AAAA LUL LUL HI" }
  ]);
  const [text, setText] = useState<string>('')
  const [isColorBlindMode, setIsColorBlindMode] = useState<boolean>(false)
  const listRef = useRef<HTMLUListElement>(null)
  const socketRef = useRef<Socket>();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!socketRef.current) throw Error('How did this happen lol')
    let socket = socketRef.current;
    let body = text.trim();
    if (body === '') {
      return;
    }
    socket.send({
      body
    });
    setText('')
  }

  useEffect(() => {
    let socket = connectChatServer();
    socketRef.current = socket;

    const scrollToLastMessage = () => {
      let lastChild = listRef.current!.lastElementChild;
      lastChild?.scrollIntoView({
        block: "end",
        inline: "nearest",
        behavior: "smooth"
      })
    }

    socket.onAny((type, message) => {
      if (type === 'chat-message') {
        flushSync(() => {
          setMessages(m => [
            ...m,
            {
              id: nextId++,
              body: message.body,
              user: message.user,
            }
          ]);
        });
        scrollToLastMessage();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = undefined;
    }
  }, [])
  
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100 p-2">
      <h1 className="text-red-500 text-2xl">Magic Chat App</h1>
      <hr />
      <label>
        <input
          className='mr-1'
          type="checkbox"
          checked={isColorBlindMode}
          onChange={(e) => setIsColorBlindMode(e.target.checked)}
        />
        Remove Colors
      </label>
      <h2>Start editing to see some magic happen!</h2>
      <ul ref={listRef} className='bg-gray-100'>
        {messages.map((msg) => (
          <li key={msg.i}>
            <UserName user={msg.user} isColorBlindMode={isColorBlindMode} />{" "}
            {formatMessage(msg.body)}
          </li>
        ))}
      </ul>
      <hr />
      <form onSubmit={handleSubmit}>
        <input
          className='border mb-1'
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
        />
        <button
          className='bg-blue-200'
          type='submit'
        >
          Send message
        </button>
      </form>
    </div>
  );
};

export default App;
