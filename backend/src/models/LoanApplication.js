const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const BusinessProfile = require('./BusinessProfile');

const LoanApplication = sequelize.define(
  'LoanApplication',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'business_profiles', key: 'id' },
    },
    loanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    tenureMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    loanPurpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'DONE', 'FAILED'),
      defaultValue: 'PENDING',
    },
  },
  {
    tableName: 'loan_applications',
    timestamps: true,
    underscored: true,
  }
);

// Associations
BusinessProfile.hasMany(LoanApplication, { foreignKey: 'profileId', as: 'applications' });
LoanApplication.belongsTo(BusinessProfile, { foreignKey: 'profileId', as: 'profile' });

module.exports = LoanApplication;
