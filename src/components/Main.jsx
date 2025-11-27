import { useState } from "react";
import axios from "axios";

function Main() {
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://avatars.githubusercontent.com/u/9919");
    const [envCounts, setEnvCounts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [envRepos, setEnvRepos] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = GITHUB_TOKEN ? {
        Authorization: `token ${GITHUB_TOKEN}`,
    } : {};

    const checkRepoForEnvFile = async (repo, username) => {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${username}/${repo.name}/contents/.env`,
                { headers }
            );
            
            if (response.status === 200) {
                try {
                    const commitsResponse = await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/commits?path=.env&per_page=100`,
                        { headers }
                    );
                    
                    if (commitsResponse.data.length > 0) {
                        return {
                            hasEnv: true,
                            commitCount: commitsResponse.data.length,
                            repoData: {
                                name: repo.name,
                                url: repo.html_url,
                                description: repo.description || "No description provided.",
                            }
                        };
                    }
                } catch (commitError) {
                    console.error(`Error fetching commits for ${repo.name}:`, commitError.message);
                }
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error(`Error checking ${repo.name}:`, error.message);
            }
        }
        
        return { hasEnv: false, commitCount: 0, repoData: null };
    };

    const fetchAllRepos = async (username) => {
        let allRepos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await axios.get(
                    `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
                    { headers }
                );
                
                if (response.data.length === 0) {
                    hasMore = false;
                } else {
                    allRepos = [...allRepos, ...response.data];
                    page++;
                    if (response.data.length < 100) {
                        hasMore = false;
                    }
                }
            } catch (error) {
                console.error(`Error fetching repos page ${page}:`, error.message);
                hasMore = false;
            }
        }

        return allRepos;
    };

    const handleSubmit = async () => {
        if (!username.trim()) {
            setMessage("Please enter a valid GitHub username.");
            return;
        }

        setLoading(true);
        setEnvCounts(0);
        setMessage("");
        setEnvRepos([]);
        setProgress({ current: 0, total: 0 });

        try {
            const [userDetailsResponse, allRepos] = await Promise.all([
                axios.get(`https://api.github.com/users/${username}`, { headers }),
                fetchAllRepos(username)
            ]);

            setAvatarUrl(userDetailsResponse.data.avatar_url);
            const repos = allRepos;

            if (repos.length === 0) {
                setMessage("No repositories found for this user.");
                return;
            }

            setProgress({ current: 0, total: repos.length });

            const BATCH_SIZE = 10;
            let totalEnvCommits = 0;
            const reposWithEnvFiles = [];

            for (let i = 0; i < repos.length; i += BATCH_SIZE) {
                const batch = repos.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(repo => checkRepoForEnvFile(repo, username))
                );

                results.forEach(result => {
                    if (result.hasEnv) {
                        totalEnvCommits += result.commitCount;
                        reposWithEnvFiles.push(result.repoData);
                    }
                });

                setProgress({ current: Math.min(i + BATCH_SIZE, repos.length), total: repos.length });
            }

            setEnvCounts(totalEnvCommits);
            setEnvRepos(reposWithEnvFiles);

            if (totalEnvCommits === 0) {
                setMessage("You are safe! No .env files found in your repositories.");
            } else {
                setMessage(`Warning: Found .env files in ${reposWithEnvFiles.length} repository${reposWithEnvFiles.length > 1 ? 's' : ''}.`);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setMessage("User not found. Please check the username and try again.");
            } else if (error.response?.status === 403) {
                setMessage("Rate limit exceeded. Please try again later or add a GitHub token.");
            } else {
                setMessage("Error fetching data. Please check your connection and try again.");
            }
            console.error("Error fetching data:", error.message);
        } finally {
            setLoading(false);
            setProgress({ current: 0, total: 0 });
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
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
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

            {loading && progress.total > 0 && (
                <div className="w-full max-w-md">
                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                    <p className="text-gray-300 text-sm text-center mt-2">
                        Scanning repositories: {progress.current} / {progress.total}
                    </p>
                </div>
            )}

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