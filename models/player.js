const { DataTypes } = require('sequelize');

/**
 * Player model – a roster member of a team.
 *
 * Fields:
 *   id                 – auto-increment primary key
 *   team_id            – FK → teams.id (nullable; player may be a free agent)
 *   summoner_name      – in-game name displayed on the HUD
 *   real_name          – player's legal / preferred real name
 *   role               – lane/role: 'top' | 'jungle' | 'mid' | 'bot' | 'support'
 *   nationality        – ISO 3166-1 alpha-2 country code (e.g. "BR", "US")
 *   profile_image_path – relative path to the player photo in /uploads
 *   is_active          – false when a player is benched or has left the team
 *   created_at         – row creation timestamp
 *   updated_at         – row last-update timestamp
 */
function definePlayer(sequelize) {
  return sequelize.define(
    'Player',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        }
      },
      summoner_name: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      real_name: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      role: {
        type: DataTypes.STRING(16),
        allowNull: true,
        validate: {
          isIn: [['top', 'jungle', 'mid', 'bot', 'support']]
        }
      },
      nationality: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      profile_image_path: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'players',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { definePlayer };
