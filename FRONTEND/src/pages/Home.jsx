import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-6xl font-extrabold mb-6">
        Exchange Skills.<br />
        <span className="text-neon">Learn Anything.</span>
      </h1>
      <p className="text-gray-400 max-w-xl mb-8">
        Teach what you know. Learn what you don't. Online or offline.
      </p>
      <Link to="/auth" className="px-8 py-4 rounded-xl bg-neon text-black font-bold">
        Get Started
      </Link>
    </section>
  );
}
