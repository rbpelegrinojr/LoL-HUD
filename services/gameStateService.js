/**
 * In-memory singleton tracking the currently live game's HUD state.
 * This is intentionally not persisted beyond the process lifetime —
 * durable results are written to the database via the Game model
 * once a game ends.
 */
class GameStateService {
  constructor() {
    this.state = null;
  }

  startGame(gameId, matchId, blueTeam, redTeam) {
    this.state = {
      gameId,
      matchId,
      blueTeam,
      redTeam,
      status: 'ongoing',
      blueKills: 0,
      redKills: 0,
      blueGold: 0,
      redGold: 0,
      blueTowers: 0,
      redTowers: 0,
      blueDragons: 0,
      redDragons: 0,
      blueBarons: 0,
      redBarons: 0,
      events: [],
      startedAt: new Date().toISOString(),
      winnerTeamId: null
    };
    return this.state;
  }

  updateGame(updates = {}) {
    if (!this.state) {
      return null;
    }
    this.state = { ...this.state, ...updates };
    return this.state;
  }

  addEvent(event) {
    if (!this.state) {
      return null;
    }
    this.state.events = [...(this.state.events || []), { ...event, timestamp: new Date().toISOString() }].slice(-50);
    return this.state;
  }

  endGame(winnerTeamId) {
    if (!this.state) {
      return null;
    }
    this.state = {
      ...this.state,
      status: 'completed',
      winnerTeamId,
      endedAt: new Date().toISOString()
    };
    return this.state;
  }

  reset() {
    this.state = null;
  }

  getState() {
    return this.state;
  }
}

module.exports = new GameStateService();
