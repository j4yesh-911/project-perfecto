import { Link , useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
const login = !!window.localStorage.getItem("token");

 const nav = useNavigate();

const logoutfun = () =>{
  localStorage.removeItem("token")
  nav("login")
  alert("logged out")
}

const handledashboard = ()=>{
  if(login){
    nav("/dashboard");
  }else{
    nav("/login");
  }
}


const handlechat = ()=>{
  if(login){
    nav("/chats");
  }else{
    nav("/login");
  }
}


const handleprofile = ()=>{
  if(login){
    nav("/profile");
  }else{
    nav("/login");
  }
}



  return (
    <nav className="flex justify-between items-center px-8 py-4 glass">
      <h1 className="text-xl font-bold text-neon">SkillSwap</h1>
      <div className="flex gap-6">
        <Link to="/">Home</Link>
       {/*  <Link to="/dashboard">Dashboard</Link>
        <Link to="/chats">Chats</Link>
        <Link to="/profile">Profile</Link> */}
        <button onClick={handledashboard}> dashboard</button>
        <button onClick={handlechat}> chats</button>
        <button onClick={handleprofile}> profile</button>
        {/* <button onClick={logoutfun}> logout</button> */}

        <ThemeToggle />
        <button onClick={logoutfun}> logout</button>
      </div>
    </nav>
  );
}
