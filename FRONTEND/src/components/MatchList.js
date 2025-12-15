import { useEffect, useState } from "react";
import API from "../services/api";

export default function MatchList() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    API.get("/user/matches").then(res => setMatches(res.data));
  }, []);

  return (
    <div>
      {matches.map(user => (
        <p key={user._id}>{user.name}</p>
      ))}
    </div>
  );
}
