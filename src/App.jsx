import Layout from "./components/Layout"
import Header from "./components/Header"
import Main from "./components/Main"
import Footer from "./components/Footer"
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div>
      <Layout>
        <Header />
        <Main />
        <Footer />
      </Layout>
      <Analytics/>
    </div>
  )
}

export default App
