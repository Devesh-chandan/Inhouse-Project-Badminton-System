const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// ── User ───────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:         { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
  role:         { type: DataTypes.ENUM('admin','referee','coach','viewer'), defaultValue: 'viewer' },
  fcmToken:     { type: DataTypes.TEXT, field: 'fcm_token' },
}, { tableName: 'users', underscored: true });

// ── Player ─────────────────────────────────────────────────────────────────────
const Player = sequelize.define('Player', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  dob:         { type: DataTypes.DATEONLY },
  nationality: { type: DataTypes.STRING(60) },
  seeding:     { type: DataTypes.INTEGER },
  photoUrl:    { type: DataTypes.TEXT, field: 'photo_url' },
  coachId:     { type: DataTypes.UUID, field: 'coach_id', references: { model: 'users', key: 'id' } },
}, { tableName: 'players', underscored: true });

// ── Tournament ─────────────────────────────────────────────────────────────────
const Tournament = sequelize.define('Tournament', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:      { type: DataTypes.STRING(150), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
  endDate:   { type: DataTypes.DATEONLY, field: 'end_date' },
  venue:     { type: DataTypes.STRING(200) },
  format:    { type: DataTypes.ENUM('single_elimination','double_elimination','round_robin'), defaultValue: 'single_elimination' },
  status:    { type: DataTypes.ENUM('upcoming','ongoing','completed'), defaultValue: 'upcoming' },
  totalCourts: { type: DataTypes.INTEGER, defaultValue: 4, field: 'total_courts' },
}, { tableName: 'tournaments', underscored: true });

// ── Match ──────────────────────────────────────────────────────────────────────
const Match = sequelize.define('Match', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tournamentId: { type: DataTypes.UUID, field: 'tournament_id' },
  round:        { type: DataTypes.INTEGER, allowNull: false },
  matchNumber:  { type: DataTypes.INTEGER, field: 'match_number' },
  courtNumber:  { type: DataTypes.INTEGER, field: 'court_number' },
  player1Id:    { type: DataTypes.UUID, field: 'player1_id' },
  player2Id:    { type: DataTypes.UUID, field: 'player2_id' },
  winnerId:     { type: DataTypes.UUID, field: 'winner_id' },
  refereeId:    { type: DataTypes.UUID, field: 'referee_id' },
  status:       { type: DataTypes.ENUM('scheduled','ongoing','completed','cancelled'), defaultValue: 'scheduled' },
  scheduledAt:  { type: DataTypes.DATE, field: 'scheduled_at' },
  startedAt:    { type: DataTypes.DATE, field: 'started_at' },
  completedAt:  { type: DataTypes.DATE, field: 'completed_at' },
}, { tableName: 'matches', underscored: true });

// ── Set ────────────────────────────────────────────────────────────────────────
const MatchSet = sequelize.define('MatchSet', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  matchId:       { type: DataTypes.UUID, field: 'match_id' },
  setNumber:     { type: DataTypes.INTEGER, allowNull: false, field: 'set_number' },
  player1Score:  { type: DataTypes.INTEGER, defaultValue: 0, field: 'player1_score' },
  player2Score:  { type: DataTypes.INTEGER, defaultValue: 0, field: 'player2_score' },
  winnerId:      { type: DataTypes.UUID, field: 'winner_id' },
  serverId:      { type: DataTypes.UUID, field: 'server_id' },
  durationSecs:  { type: DataTypes.INTEGER, field: 'duration_secs' },
  status:        { type: DataTypes.ENUM('ongoing','completed'), defaultValue: 'ongoing' },
}, { tableName: 'sets', underscored: true });

// ── Point ──────────────────────────────────────────────────────────────────────
const Point = sequelize.define('Point', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  setId:     { type: DataTypes.UUID, field: 'set_id' },
  scoredBy:  { type: DataTypes.UUID, field: 'scored_by' },
  serverId:  { type: DataTypes.UUID, field: 'server_id' },
  rallyNum:  { type: DataTypes.INTEGER, field: 'rally_num' },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'points', underscored: true, timestamps: false });

// ── Associations ───────────────────────────────────────────────────────────────
Player.belongsTo(User,       { as: 'coach',    foreignKey: 'coachId' });
User.hasMany(Player,         { as: 'players',  foreignKey: 'coachId' });

Match.belongsTo(Tournament,  { foreignKey: 'tournamentId' });
Tournament.hasMany(Match,    { foreignKey: 'tournamentId' });

Match.belongsTo(Player,      { as: 'player1',  foreignKey: 'player1Id' });
Match.belongsTo(Player,      { as: 'player2',  foreignKey: 'player2Id' });
Match.belongsTo(Player,      { as: 'winner',   foreignKey: 'winnerId' });
Match.belongsTo(User,        { as: 'referee',  foreignKey: 'refereeId' });

MatchSet.belongsTo(Match,    { foreignKey: 'matchId' });
Match.hasMany(MatchSet,      { as: 'sets',     foreignKey: 'matchId' });

Point.belongsTo(MatchSet,    { foreignKey: 'setId' });
MatchSet.hasMany(Point,      { as: 'points',   foreignKey: 'setId' });

module.exports = { sequelize, User, Player, Tournament, Match, MatchSet, Point };
