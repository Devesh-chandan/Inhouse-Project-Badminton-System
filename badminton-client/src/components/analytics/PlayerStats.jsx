import StatCard from '../common/StatCard';

export default function PlayerStats({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="Win rate"        value={`${summary.winRate}%`}         color="green" />
      <StatCard label="Wins"            value={summary.wins}                   color="blue" />
      <StatCard label="Losses"          value={summary.losses}                 color="red" />
      <StatCard label="Avg pts/match"   value={summary.avgPointsPerMatch}      color="amber" />
      <StatCard label="Sets won"        value={summary.totalSetsWon}           color="blue" />
      <StatCard label="Sets lost"       value={summary.totalSetsLost}          color="red" />
      <StatCard label="Total points"    value={summary.totalPoints}            color="green" />
      <StatCard label="Points conceded" value={summary.totalPointsConceded}    color="amber" />
    </div>
  );
}
