import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <Navbar />
      <AppRoutes />
    </div>
  );
}
