# Are You Pwned? GitHub Version

![LICENSE](https://img.shields.io/badge/LICENSE-MIT-blue) ![Built with](https://img.shields.io/badge/Built_with-React-red)

![Are You Pwned](https://socialify.git.ci/pulkitgarg04/Are-You-Pwned/image?language=1&name=1&owner=1&theme=Dark)

A React-based web application to check if a GitHub user has accidentally pushed sensitive .env files to their public or private repositories, helping identify potential security risks.

## Tech Stack
- **Frontend**: React, Vite
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **API**: GitHub REST API
- **Environment Variables**: Vite’s import.meta.env

## Prerequisites
- Node.js (v16 or higher)
- A GitHub account
- A GitHub Personal Access Token with repo and user scopes (see [GitHub Token Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token))

## Installation
1. Clone the Repository:
  ```bash
  git clone https://github.com/pulkitgarg04/are-you-pwned.git
  cd Are-You-Pwned
  ```

2. Install Dependencies:
  ```bash
  npm install
  ```

  or
  
  ```bash
  yarn install
  ```

3. Set Up Environment Variables:
- Create a `.env` file in the project root.
- Add your GitHub Personal Access Token:
  ```env
  VITE_GITHUB_TOKEN=ghp_YourPersonalAccessTokenHere
  ```

## Configuration
- GitHub Token:
  - Generate a token at GitHub > Settings > Developer settings > Personal access tokens (classic).
  - Ensure it has `repo` (for repository access) and `user` (for user details) scopes.
  - Add the token to `.env` as `VITE_GITHUB_TOKEN`.

- Vite: The project uses Vite, so environment variables must start with `VITE_` to be exposed to the client-side code.

## Usage
1. Start the Development Server:
  ```bash
  npm run dev
  ```

or

  ```bash
  yarn dev
  ```

2. Open the URL (e.g., `http://localhost:5173`) in your browser.

## License
This project is licensed under the MIT [License](LICENSE).
