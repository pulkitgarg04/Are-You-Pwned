function Layout({ children }) {
    return (
        <div 
            className="h-screen bg-black text-white flex items-center justify-center bg-[url('/background-img.jpg')] bg-cover bg-center backdrop-blur-sm"
        >
            <div className="w-full max-w-4xl mx-auto p-8 bg-opacity-50 bg-black rounded-lg shadow-lg">
                {children}
            </div>
        </div>
    );
}

export default Layout;