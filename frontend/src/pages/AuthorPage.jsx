import { Link } from "react-router-dom";

export default function AuthorPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Link
          to="/create-problem"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-8 px-6 rounded-lg text-center transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <div className="text-2xl mb-2">📝</div>
          <div className="text-xl">Create Problem</div>
          <p className="text-blue-100 mt-2">Design and add new coding problems</p>
        </Link>

        <Link
          to="/create-contest"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-8 px-6 rounded-lg text-center transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-xl">Create Contest</div>
          <p className="text-green-100 mt-2">Organize competitive programming contests</p>
        </Link>
      </div>
    </div>
  );
}
