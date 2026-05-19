import './App.css'
import { BasicExample, FadeNoArrowExample, KeepMountedExample, ThemedExample } from './components/Popover/Popover.examples';

function App() {

  return (
    <>
      <section id="center">
        <div className='flex'>
          <BasicExample />
          <FadeNoArrowExample />
          <ThemedExample />
          <KeepMountedExample />
        </div>
      </section>

     </>
  )
}

export default App
