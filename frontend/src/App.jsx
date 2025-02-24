
import './App.css'
import Header from './components/header'
import InputForm from './components/InputForm'

function App() {

  return (
    <div className='space-y-8'>
    <Header />
    <div className="flex justify-center items-center container mx-auto">
    <InputForm />
    </div>
    </div>
  )
}

export default App
