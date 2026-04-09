/**
 * Core badminton scoring rules (BWF standard)
 */

const WINNING_SCORE = 21;
const MAX_SCORE = 30;
const WIN_MARGIN = 2;
const THIRD_SET_SWITCH = 11; // sides switch at 11 in 3rd set

function checkSetWinner(p1Score, p2Score) {
  if (p1Score >= WINNING_SCORE && (p1Score - p2Score) >= WIN_MARGIN) return 1;
  if (p2Score >= WINNING_SCORE && (p2Score - p1Score) >= WIN_MARGIN) return 2;
  if (p1Score === MAX_SCORE) return 1;
  if (p2Score === MAX_SCORE) return 2;
  return null; // set not over
}

function checkMatchWinner(p1Sets, p2Sets) {
  if (p1Sets === 2) return 1;
  if (p2Sets === 2) return 2;
  return null;
}

function shouldSwitchSides(setNumber, p1Score, p2Score) {
  if (setNumber !== 3) return false;
  return (p1Score === THIRD_SET_SWITCH || p2Score === THIRD_SET_SWITCH);
}

function isServiceChange(lastServerId, scoredById) {
  return lastServerId !== scoredById;
}

module.exports = {
  checkSetWinner,
  checkMatchWinner,
  shouldSwitchSides,
  isServiceChange,
  WINNING_SCORE,
  MAX_SCORE,
  WIN_MARGIN,
};
