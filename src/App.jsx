import { useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'
import { Spinner } from 'flowbite-react'
import Search from './components/Search.jsx'
import MovieCard from './components/MovieCard.jsx'
import './App.css'

const API_BASE_URL = `https://api.themoviedb.org/3`

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [moviesList, setMoviesList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useDebounce(()=>setDebouncedSearchTerm(searchTerm),500, [searchTerm])

  const fetchMovies = async (query='') => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
              ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
              :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMoviesList([]);
        return;
      }
      console.log(data.results)
      setMoviesList(data.results || []);

      if(query && data.results.length > 0){
          await updateSearchCount(query, data.results[0])
      }

    } catch (error) {
      console.error(`error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };


  const loadTrendingMovies = async ()=>{
    try{
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    }catch(err){
      console.error(err)
    }
  }

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(()=>{
    loadTrendingMovies()
  }, [])

  return (
  <main className='text-white text-center'>
    <div className='pattern'/>
    <div className="wrapper">
      <header>
        <h1 className="text-4xl">Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>

      {trendingMovies.length > 0 &&(
        <section className='trending'>
          <h2>Trending movies</h2>

          <ul>
            {trendingMovies.map((movie, index)=>(
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="all-movies">
        <h2>All Movies</h2>

        {isLoading ? <Spinner/>: errorMessage?<p className='text-red-500'>{errorMessage}</p>:
        <ul>{moviesList.map((movie)=>(
            <MovieCard key={movie.id} movie={movie}/>
          ))}
        </ul>}
      </section>

    </div>
  </main>
  )
}

export default App
