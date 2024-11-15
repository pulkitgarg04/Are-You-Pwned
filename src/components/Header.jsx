import { FaGithub } from "react-icons/fa"

function Header() {
    return (
        <section>
            <div className="absolute top-10 right-10">
                <a
                    href="https://github.com/pulkitgarg04/"
                    target="_blank"
                    className="flex gap-2 text-gray-800 font-medium items-center justify-center border-2 rounded-full py-1 px-2 cursor-pointer bg-white transition-all w-fit"
                >
                    <FaGithub />
                    Github
                </a>
            </div>
        </section>
    )
}

export default Header
