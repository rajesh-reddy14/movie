import React, { useEffect, useState } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YmI0YTY1MWM1Y2Y5YWUyMWRkMTk0MmE1OGQ0MzYyOSIsIm5iZiI6MTczNzg4MDYyNy4zNTksInN1YiI6IjY3OTVmNDMzMDljMjUyZTNhYjIzOWY3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FE-A5KXboIsLWAW_23ZUdW55CNJ-zWUdSywm1mu3M4E'
  }
};
const App = () => {
  const [seacrhTerm, setSearchTerm] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [moviesList, setMoviesList] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  useDebounce(() => setDebounceSearchTerm(seacrhTerm), 500, [seacrhTerm])
  const [trendingMovies, setTrendingMovies] = React.useState([]);
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error('failed yo fetch movies');
      }
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage(data.Error);
        setMoviesList([])
        return;
      }
      setMoviesList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      setErrorMessage('error fetching movies, pls try again later');
    } finally {
      setIsLoading(false);
    }
  }
  const loadTendingMovies = async () => {
    try {
      const trendingMovies = await getTrendingMovies();
      setTrendingMovies(trendingMovies);
    } catch (error) {
      console.error(error)
    }
  }
    useEffect(() => {
      fetchMovies(debounceSearchTerm);
    }, [debounceSearchTerm]);

    useEffect(() => {
      loadTendingMovies();
    }, []);
    console.log(trendingMovies,"hello")
    return (
      <main>
        <div className='pattern'>
          <div className='wrapper'>
            <header>
              <img src='./hero.png' alt='Hero Banner' />
              <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
              <Search seacrhTerm={seacrhTerm} setSearchTerm={setSearchTerm} />
            </header>
            {
              trendingMovies.length >0 && (
                <section className='trending'>
                  <h2>Trending Movies</h2>
                  <ul>
                    {trendingMovies.map((movie,index) => (
                      <li key={movie.$id}>
                        <p>{index+1}</p>
                        <img src={movie.poster_url} alt={movie.title}/>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            }
            <section className='all-movies'>
              <h2>All Movies</h2>
              {isLoading ? (
                <p className='text-white'><Spinner /></p>
              ) : errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ) : (
                <ul>
                  {moviesList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    )
  }


export default App;
