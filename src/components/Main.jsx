import { useState } from "react";
import axios from "axios";

function Main() {
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://avatars.githubusercontent.com/u/9919");
    const [envCounts, setEnvCounts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [envRepos, setEnvRepos] = useState([]);

    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`,
    };

    const checkRepoHasCommits = async (repo, username) => {
        try {
            const commitsResponse = await axios.get(
                `https://api.github.com/repos/${username}/${repo.name}/commits`,
                { headers }
            );
            return commitsResponse.data.length > 0;
        } catch(error) {
            console.error(`Error checking commits for repo ${repo.name}:`, error.message);
            return false;
        }
    };

    const checkEnvFileExistence = async (repo, username) => {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${username}/${repo.name}/contents/.env`,
                { headers }
            );
            return response.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false;
            }
            console.error("Error checking .env file existence", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setEnvCounts(0);
        setMessage("");
        setEnvRepos([]);

        try {
            const fetchRepos = await axios.get(
                `https://api.github.com/users/${username}/repos`,
                { headers }
            );
            const repos = fetchRepos.data;

            let totalEnvCommits = 0;
            const reposWithEnvFiles = [];

            for (const repo of repos) {
                const hasCommits = await checkRepoHasCommits(repo, username);
                if (!hasCommits) {
                    continue;
                }

                const fileExists = await checkEnvFileExistence(repo, username);
                if (fileExists) {
                    try {
                        const commitsResponse = await axios.get(
                            `https://api.github.com/repos/${username}/${repo.name}/commits?path=.env`,
                            { headers }
                        );
                        if (commitsResponse.data.length > 0) {
                            totalEnvCommits += commitsResponse.data.length;
                            reposWithEnvFiles.push({
                                name: repo.name,
                                url: repo.html_url,
                                description: repo.description || "No description provided.",
                            });
                        }
                    } catch (error) {
                        console.log(`Error fetching commits for repo ${repo.name}: ${error.message}`);
                    }
                }
            }

            const userDetails = await axios.get(
                `https://api.github.com/users/${username}`,
                { headers }
            );
            setAvatarUrl(userDetails.data.avatar_url);

            setEnvCounts(totalEnvCommits);
            setEnvRepos(reposWithEnvFiles);

            if (reposWithEnvFiles.length === 0 && totalEnvCommits === 0) {
                setMessage("No repositories with .env files found.");
            } else if (totalEnvCommits === 0) {
                setMessage("You are safe! You have not pushed any .env file to GitHub.");
            }
        } catch (error) {
            setMessage("Error fetching data. Please try again.");
            console.error("Error fetching data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-100">Are You Pwned?</h1>
            <img
                src={avatarUrl}
                alt={`${username ? username : ""} avatar`}
                className="w-16 h-16 rounded-full mx-auto mb-4"
            />
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
                    className={`px-5 py-2.5 text-white font-medium rounded-lg shadow-md text-sm
                        ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                >
                    {loading ? "Checking..." : "Check"}
                </button>
            </div>

            {message && (
                <p
                    className={`font-medium ${envCounts === 0 ? "text-green-500" : "text-red-500"}`}
                >
                    {message}
                </p>
            )}

            <div className="text-xl font-semibold text-gray-100">
                Env Counts: {envCounts}
            </div>

            {envCounts > 0 && (
                <p className="text-red-500 font-medium">
                    You have pwned! You have pushed {envCounts} .env file{envCounts > 1 ? "s" : ""} to GitHub.
                </p>
            )}

            {envRepos.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-200 mb-4">
                        Repositories with .env files:
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {envRepos.map((repo, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-xl font-semibold text-blue-400 mb-2 text-center">
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        {repo.name}
                                    </a>
                                </h3>
                                <p className="text-gray-300 text-center">{repo.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Main;