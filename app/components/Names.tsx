import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import { fireConfetti, startFireworks } from "../confetti";

type FastNamesProps = {
  names: string[];
  isRunning: boolean;
  onName: (name: string) => void;
  latestPardonedName?: string;
};
const FastNames = ({
  names,
  isRunning,
  onName,
  latestPardonedName,
}: FastNamesProps) => {
  const [name, setName] = useState<string>("");
  const [idx, setIdx] = useState<number>(0);

  useEffect(() => {
    let nextIdx = idx + 1;
    if (nextIdx >= names.length) nextIdx = 0;

    const timer = setTimeout(() => {
      if (!isRunning) return;
      setIdx(nextIdx);
      setName(names[nextIdx]);
      onName(names[nextIdx]);
    }, 100);

    return () => clearTimeout(timer);
  });

  return <div>{isRunning ? name : latestPardonedName ?? ""}</div>;
};

type NamesProps = {
  onName: (name: string) => void;
};
export const Names = ({ onName }: NamesProps) => {
  const [names, setNames] = useState<string[]>([]);
  const [pardonedNames, setPardonedNames] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestPardonedName, setLatestPardonedName] = useState<string>("");

  useEffect(() => {}, []);

  const _socket = usePartySocket({
    room: "hh-room",
    onMessage(evt) {
      const d = JSON.parse(evt.data);

      if (
        d.latestPardonedName !== "" &&
        d.latestPardonedName !== latestPardonedName
      ) {
        fireConfetti();
      }

      setNames(d.names);
      setPardonedNames(d.pardonedNames ?? []);
      setIsRunning(d.isRunning);
      setLatestPardonedName(d.latestPardonedName ?? "");

      if (d.names.length < 2 && d.pardonedNames.length > 0) {
        startFireworks();
      }
    },
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "2em" }}>
        <div>
          <h2>{names.length < 2 ? "Next Host" : "Pool"}</h2>
          <ul>
            {names.map((name) => (
              <li key={name}>
                {names.length < 2 && pardonedNames.length > 0 ? (
                  <strong>{name}</strong>
                ) : (
                  name
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Pardoned</h2>
          <ul>
            {pardonedNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
      <FastNames
        names={names}
        isRunning={isRunning}
        onName={onName}
        latestPardonedName={latestPardonedName}
      />
    </div>
  );
};
