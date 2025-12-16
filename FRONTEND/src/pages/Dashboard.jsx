import SwipeCard from "../components/SwipeCard";
import MapView from "../components/MapView";

const dummyUser = {
  name: "Alex",
  skillsToTeach: ["React"],
  skillsToLearn: ["Node"]
};

export default function Dashboard() {
  return (
    <div className="p-10 space-y-10">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <SwipeCard user={dummyUser} />

      <MapView users={[{ lat: 23.02, lng: 72.57 }]} />
    </div>
  );
}
