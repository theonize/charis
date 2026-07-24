import Main from './Main.js'
import Header from './Header.js'
import {VerseProvider} from '../lib/verseContext.js'

import '../style/App.css'


function App() {
  return <VerseProvider>
    <header>
      <Header />
    </header>
    
    <main>
      <Main />
    </main>
    
    <footer></footer>
  </VerseProvider>
}

export default App;
