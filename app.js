const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1 return all players
app.get("/players/", async (request, response) => {
  const getALlPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const responseQuery = await db.all(getALlPlayersQuery);
  response.send(responseQuery.map((eachPlayer) => convertDbObject(eachPlayer)));
});

// API return One Player
const convertDbOnePlayer = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getOnePlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const responseQuery = await db.get(getOnePlayerQuery);
  response.send(convertDbOnePlayer(responseQuery));
});

// API adding a new Player
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addNewPlayerQuery = `
  INSERT INTO 
  cricket_team(player_name, jersey_number, role)
  VALUES ('${playerName}',${jerseyNumber}, '${role}');`;
  const responseQuery = await db.run(addNewPlayerQuery);
  response.send("Player Added to Team");
});

// API Update the details of player in team
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET player_name='${playerName}', jersey_number=${jerseyNumber}, role='${role}'
    WHERE player_id = ${playerId};`;
  const responseQuery = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API Delete a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const responseQuery = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;