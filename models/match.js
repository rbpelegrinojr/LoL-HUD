const { DataTypes } = require('sequelize');

/**
 * Match model – a series between two teams within a tournament (e.g. a Best-of-3).
 *
 * Fields:
 *   id             – auto-increment primary key
 *   tournament_id  – FK → tournaments.id
 *   team1_id       – FK → teams.id (first team; side assigned per-game)
 *   team2_id       – FK → teams.id (second team)
 *   format         – series format: 'bo1' | 'bo3' | 'bo5'
 *   team1_score    – games won by team1 in this series
 *   team2_score    – games won by team2 in this series
 *   winner_team_id – FK → teams.id; null until the series concludes
 *   stage          – optional bracket stage label (e.g. "Quarterfinals", "Grand Final")
 *   scheduled_at   – planned date/time for the series
 *   status         – lifecycle: 'pending' | 'ongoing' | 'completed'
 *   created_at     – row creation timestamp
 *   updated_at     – row last-update timestamp
 */
function defineMatch(sequelize) {
  return sequelize.define(
    'Match',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      tournament_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tournaments',
          key: 'id'
        }
      },
      team1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      team2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      format: {
        type: DataTypes.STRING(4),
        allowNull: false,
        defaultValue: 'bo3',
        validate: {
          isIn: [['bo1', 'bo3', 'bo5']]
        }
      },
      team1_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      team2_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      winner_team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      stage: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'ongoing', 'completed']]
        }
      }
    },
    {
      tableName: 'matches',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { defineMatch };
