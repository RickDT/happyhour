import "./styles.css";
import { createRoot } from "react-dom/client";
import { Name } from "./components/Name";
import { Names } from "./components/Names";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import { startFireworks } from "./confetti";

function App() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const socket = usePartySocket({
    room: "hh-room",
    onMessage(evt) {
      const d = JSON.parse(evt.data);
      console.log(d);
      setIsRunning(d.isRunning);
      setNames(d.names);
    },
  });

  const [currentName, setCurrentName] = useState<string>("");

  return (
    <main>
      <div
        style={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1>Happy Hour</h1>
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({
                op: "reset",
              })
            );
          }}
          style={{
            opacity: 0.1,
          }}
        >
          Reset
        </button>
        <button
          disabled={names.length < 2 || isRunning}
          onClick={() => {
            socket.send(
              JSON.stringify({
                op: "start",
              })
            );
          }}
        >
          Go!
        </button>
        <button
          disabled={!isRunning || names.length < 2}
          onClick={() => {
            if (!isRunning) return;
            socket.send(
              JSON.stringify({
                op: "pardon",
                name: currentName,
              })
            );
          }}
        >
          Pardon
        </button>
        <Name />
        <Names onName={(name) => setCurrentName(name)} />
        {/* <Confetti /> */}
        <small>v1.2</small>
      </div>
    </main>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
