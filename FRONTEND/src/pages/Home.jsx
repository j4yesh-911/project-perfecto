import { useNavigate } from "react-router-dom";


export default function Home() {

  const login = !!window.localStorage.getItem("token");
  const navigate = useNavigate();

const handleChange = () =>{
if(login){
  navigate("/dashboard");
}else{
navigate("/login")}
}


  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-6xl font-extrabold mb-6">
        Exchange Skills.<br />
        <span className="text-neon">Learn Anything.</span>
      </h1>
      <p className="text-gray-400 max-w-xl mb-8">
        Teach what you know. Learn what you don't. Online or offline.
      </p>
      <button onClick={handleChange}>
        enter
      </button>
 
      {/* if(!login){
      <Link to="/login" className="px-8 py-4 rounded-xl bg-neon text-black font-bold">
        Get Started
      </Link>} */}
    </section>
  );
}
