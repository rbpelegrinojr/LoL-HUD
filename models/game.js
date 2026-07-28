const { DataTypes } = require('sequelize');

/**
 * Game model – a single game (map) within a match series.
 *
 * Fields:
 *   id                  – auto-increment primary key
 *   match_id            – FK → matches.id
 *   game_number         – ordinal within the series (1, 2, 3 …)
 *   blue_team_id        – FK → teams.id (blue-side team for this game)
 *   red_team_id         – FK → teams.id (red-side team for this game)
 *   winner_team_id      – FK → teams.id; null until the game ends
 *   blue_team_kills     – total kill count for the blue team
 *   red_team_kills      – total kill count for the red team
 *   blue_team_gold      – total gold earned by the blue team
 *   red_team_gold       – total gold earned by the red team
 *   blue_team_towers    – towers destroyed by the blue team
 *   red_team_towers     – towers destroyed by the red team
 *   blue_team_dragons   – elemental + elder drakes taken by blue
 *   red_team_dragons    – elemental + elder drakes taken by red
 *   blue_team_barons    – Baron Nashor kills by blue team
 *   red_team_barons     – Baron Nashor kills by red team
 *   duration_seconds    – game length in seconds
 *   status              – lifecycle: 'pending' | 'ongoing' | 'completed'
 *   started_at          – timestamp when the game started (first blood / minion wave)
 *   ended_at            – timestamp when the nexus exploded
 *   created_at          – row creation timestamp
 *   updated_at          – row last-update timestamp
 */
function defineGame(sequelize) {
  return sequelize.define(
    'Game',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      match_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'matches',
          key: 'id'
        }
      },
      game_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      blue_team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      red_team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      winner_team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      blue_team_kills: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      red_team_kills: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blue_team_gold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      red_team_gold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blue_team_towers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      red_team_towers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blue_team_dragons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      red_team_dragons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blue_team_barons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      red_team_barons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'ongoing', 'completed']]
        }
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'games',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { defineGame };
