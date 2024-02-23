import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  names: Record<string, string> = {};
  pardonedNames: string[] = [];
  isRunning = false;
  latestPardonedName = "";

  constructor(readonly room: Party.Room) {}

  payload() {
    return {
      names: Object.values(this.names).filter(
        (name) => !this.pardonedNames.includes(name)
      ),
      pardonedNames: this.pardonedNames,
      isRunning: this.isRunning,
      latestPardonedName: this.latestPardonedName,
    };
  }

  onClose(conn: Party.Connection) {
    delete this.names[conn.id];
    this.broadcastState();
    console.log(conn.id, "closed");
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // send the current count to the new client
    conn.send(JSON.stringify(this.payload()));
  }

  onMessage(message: string, sender: Party.Connection) {
    const { op, ...rest } = JSON.parse(message);
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    if (op === "setName") {
      this.setName(sender.id, rest.name);
    }

    if (op === "start") {
      this.isRunning = true;
      this.broadcastState();
    }

    if (op === "pardon") {
      this.isRunning = false;
      this.pardonedNames.push(rest.name);
      this.latestPardonedName = rest.name;
      this.broadcastState();
    }

    if (op === "reset") {
      this.isRunning = false;
      this.pardonedNames = [];
      this.latestPardonedName = "";
      this.broadcastState();
    }
  }

  // no REST API for now
  // onRequest(req: Party.Request) {
  //   // response to any HTTP request (any method, any path) with the current
  //   // count. This allows us to use SSR to give components an initial value

  //   // if the request is a POST, increment the count
  //   if (req.method === "POST") {
  //     this.increment();
  //   }

  //   return new Response();
  // }

  broadcastState() {
    console.log(this.payload());
    this.room.broadcast(JSON.stringify(this.payload()), []);
  }

  setName(id: string, name: string) {
    this.names[id] = name;
    this.broadcastState();
  }
}

Server satisfies Party.Worker;
