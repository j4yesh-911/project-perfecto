import { useNavigate } from "react-router-dom";

const MatchCard = ({ user }) => {
  const navigate = useNavigate();

  const openChat = () => {
    localStorage.setItem("chatUser", JSON.stringify(user));
    navigate("/chat");
  };

  return (
    <div onClick={openChat} className="cursor-pointer">
      <h3>{user.username}</h3>
    </div>
  );
};

export default MatchCard;
