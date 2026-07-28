const { DataTypes } = require('sequelize');

/**
 * User model – admin and operator accounts for the management system.
 *
 * Fields:
 *   id            – auto-increment primary key
 *   username      – unique login handle (e.g. "admin")
 *   password_hash – bcrypt hash; never store plaintext passwords
 *   role          – 'admin' (full access) or 'operator' (broadcast-only)
 *   is_active     – soft-disable an account without deleting it
 *   last_login_at – timestamp of the most recent successful login
 *   created_at    – row creation timestamp (managed by Sequelize)
 *   updated_at    – row last-update timestamp (managed by Sequelize)
 */
function defineUser(sequelize) {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'operator',
        validate: {
          isIn: [['admin', 'operator']]
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = { defineUser };
