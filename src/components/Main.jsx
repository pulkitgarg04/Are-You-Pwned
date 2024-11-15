import { useState } from "react";
import axios from "axios";

function Main() {
    const [username, setUsername] = useState('');
    const [envCounts, setEnvCounts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`,
    };

    const handleSubmit = async () => {
        setLoading(true);
        setEnvCounts(0);
        setError('');

        try {
            const fetchRepos = await axios.get(
                `https://api.github.com/users/${username}/repos`,
                { headers }
            );
            const repos = fetchRepos.data;

            let totalEnvCommits = 0;

            for (const repo of repos) {
                const commitsResponse = await axios.get(
                    `https://api.github.com/repos/${username}/${repo.name}/commits?path=.env`,
                    { headers }
                );
                totalEnvCommits += commitsResponse.data.length;
            }

            setEnvCounts(totalEnvCommits);
        } catch (error) {
            setError('Error fetching data. Please try again.');
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-100">Are You Pwned?</h1>
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                <label htmlFor="username" className="text-lg font-medium text-gray-300">
                    Enter GitHub Username:
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    placeholder="Enter your GitHub username"
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-gray-800 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-5 py-2.5 text-white font-medium rounded-lg shadow-md  text-sm
                        ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                >
                    {loading ? "Checking..." : "Check"}
                </button>

            </div>
            {error && (
                <p className="text-red-500 font-medium">
                    {error}
                </p>
            )}
            <div className="text-xl font-semibold text-gray-100">
                Env Counts: {envCounts}
            </div>
            {
                envCounts > 0 && (
                <p className="text-red-500 font-medium">
                    You have pwned! You have pushed {envCounts} .env file{envCounts > 1 ? 's' : ''} to GitHub.
                </p>
            )}
        </div>
    );
}

export default Main;