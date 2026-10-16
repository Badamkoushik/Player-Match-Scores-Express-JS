const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initialiseDbAndServer()

//GET

app.get('/players/', async (request, response) => {
  const getQuery = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM
    player_details;`
  const dbStatus = await db.all(getQuery)
  response.send(dbStatus)
})

//GET --> PlayerId

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
  SELECT 
  player_id as playerId,
  player_name as playerName
  FROM
  player_details
  WHERE
  player_id = ${playerId};`
  const getStatus = await db.get(getQuery)
  response.send(getStatus)
})

//PUT

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updateDetails = request.body
  const {playerName} = updateDetails
  const updateQuery = `
  UPDATE 
  player_details
  SET 
  player_name = '${playerName}'
  WHERE player_id = ${playerId};`
  await db.run(updateQuery)
  response.send('Player Details Updated')
})

//GET --> MatchId

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getQuery = `
  SELECT
  match_id as matchId,
  match,
  year
  FROM
  match_details
  WHERE
  match_id = ${matchId};`
  const getStatus = await db.get(getQuery)
  response.send(getStatus)
})

//GET --> PlayerId

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
  SELECT
  m.match_id as matchId,
  m.match,
  m.year
  FROM 
  match_details m 
  join 
  player_match_score p
  on 
  m.match_id = p.match_id
  WHERE p.player_id = ${playerId};`
  const getStatus = await db.all(getQuery)
  response.send(getStatus)
})

//GET --> MatchId

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getQuery = `
  SELECT 
  pd.player_id as playerId,
  pd.player_name as playerName
  FROM
  player_details pd
  JOIN
  player_match_score pms
  ON
  pd.player_id = pms.player_id
  WHERE pms.match_id = ${matchId};`
  const getStatus = await db.all(getQuery)
  response.send(getStatus)
})

//GET-->PlayerId 

app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
  SELECT 
  pd.player_id as playerId,
  pd.player_name as playerName,
  SUM(score) as totalScore,
  SUM(fours) as totalFours,
  SUM(sixes) as totalSixes
  FROM
  player_details pd
  JOIN 
  player_match_score pmd
  ON
  pd.player_id = pmd.player_id
  WHERE pd.player_id = ${playerId};`
  const getStatus = await db.get(getQuery)
  response.send(getStatus)
})

module.exports = app
