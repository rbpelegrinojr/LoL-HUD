const { DataTypes } = require('sequelize');

/**
 * Tournament model – represents a competition event (e.g. "Spring Split 2025").
 *
 * Fields:
 *   id           – auto-increment primary key
 *   name         – full display name (e.g. "UFSC Spring Split 2025")
 *   short_name   – abbreviated label shown in HUD overlays (e.g. "Spring 25")
 *   format       – bracket/structure description (e.g. "Double Elimination")
 *   status       – lifecycle state: 'upcoming' | 'ongoing' | 'completed'
 *   start_date   – ISO date the tournament begins
 *   end_date     – ISO date the tournament ends (nullable until scheduled)
 *   logo_path    – relative path to the tournament logo image in /uploads
 *   created_at   – row creation timestamp
 *   updated_at   – row last-update timestamp
 */
function defineTournament(sequelize) {
  return sequelize.define(
    'Tournament',
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
      short_name: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      format: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'upcoming',
        validate: {
          isIn: [['upcoming', 'ongoing', 'completed']]
        }
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      logo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: 'tournaments',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { defineTournament };
