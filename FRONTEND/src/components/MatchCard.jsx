export default function MatchCard({ user }) {
  return (
    <div className="glass p-4">
      <h3>{user.name}</h3>
      <p>{user.teachingMode.join(" / ")}</p>
    </div>
  );
}
