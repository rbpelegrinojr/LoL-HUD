const { DataTypes } = require('sequelize');

/**
 * Team model – a competing organisation or club.
 *
 * Fields:
 *   id              – auto-increment primary key
 *   name            – full team name (e.g. "Team Nexus")
 *   tag             – short tag / abbreviation shown in HUD (e.g. "TNX", max 6 chars)
 *   logo_path       – relative path to the team logo image in /uploads
 *   primary_color   – hex color used as the team's main HUD accent (e.g. "#1a78c2")
 *   secondary_color – hex color used as the team's secondary HUD accent
 *   region          – optional region label (e.g. "BR", "NA", "EUW")
 *   created_at      – row creation timestamp
 *   updated_at      – row last-update timestamp
 */
function defineTeam(sequelize) {
  return sequelize.define(
    'Team',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      tag: {
        type: DataTypes.STRING(6),
        allowNull: true
      },
      logo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      primary_color: {
        type: DataTypes.STRING(7),
        allowNull: true
      },
      secondary_color: {
        type: DataTypes.STRING(7),
        allowNull: true
      },
      region: {
        type: DataTypes.STRING(8),
        allowNull: true
      }
    },
    {
      tableName: 'teams',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { defineTeam };
