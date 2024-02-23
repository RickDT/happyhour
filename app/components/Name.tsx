import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import { generateUUID } from "../uuid";

export const Name = () => {
  const [name, setName] = useState<string>("");
  const [uuid, setUuid] = useState<string | null>(null);

  const socket = usePartySocket({
    room: "hh-room",
    onMessage(evt) {
      const d = JSON.parse(evt.data);
      console.log(d);
    },
  });

  useEffect(() => {
    let storageId = localStorage.getItem("id");
    if (!!storageId) {
      setUuid(storageId);
    } else {
      const uuid = generateUUID();
      setUuid(uuid);
      localStorage.setItem("id", uuid);
    }

    const name = localStorage.getItem("name") ?? "";
    if (name) {
      setName(name);
    }

    return () => socket.close();
  }, []);

  return (
    <input
      onChange={(e) => {
        const newName = e.target.value ?? "";
        localStorage.setItem("name", newName);
        setName(e.target.value);
        socket.send(
          JSON.stringify({
            op: "setName",
            userId: uuid,
            name: newName,
          })
        );
      }}
      value={name}
      placeholder="Your real name"
    />
  );
};
