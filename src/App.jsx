
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import useFetchPhotos from './hooks/useFetchPhotos'
import favoritesReducer, { loadFavorites } from './reducers/favoritesReducer'

function PhotoCard({ photo, isFavorite, onToggleFavorite }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={photo.download_url}
          alt={`Photo by ${photo.author}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Photographer
          </p>
          <h2 className="truncate font-semibold text-slate-800">
            {photo.author}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(photo)}
          aria-label={
            isFavorite
              ? `Remove ${photo.author} from favourites`
              : `Add ${photo.author} to favourites`
          }
          aria-pressed={isFavorite}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-2xl transition focus:outline-none focus:ring-2 focus:ring-rose-300 ${
            isFavorite
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:text-rose-500'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
    </article>
  )
}

export default function App() {
  const { photos, loading, error } = useFetchPhotos()

  const [search, setSearch] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)

  const [favorites, dispatch] = useReducer(
    favoritesReducer,
    undefined,
    loadFavorites
  )

  // Persist favourites whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem('celebrare-favorites', JSON.stringify(favorites))
    } catch (err) {
      console.error('Could not save favourites:', err)
    }
  }, [favorites])

  // Update the search text without making another API request.
  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  const handleToggleFavorite = useCallback((photo) => {
    dispatch({ type: 'TOGGLE_FAVORITE', photo })
  }, [])

  const favoriteIds = useMemo(
    () => new Set(favorites.map((photo) => photo.id)),
    [favorites]
  )

  // Recalculate the displayed photos only when dependencies change.
  const filteredPhotos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const sourcePhotos = showFavorites
      ? photos.filter((photo) => favoriteIds.has(photo.id))
      : photos

    return sourcePhotos.filter((photo) =>
      photo.author.toLowerCase().includes(normalizedSearch)
    )
  }, [photos, search, showFavorites, favoriteIds])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Celebrare · Frontend Assignment
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Photo Gallery
              </h1>
              <p className="mt-2 text-slate-500">
                Discover beautiful photos and save your favourites.
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 px-5 py-3">
              <p className="text-sm text-violet-600">Your favourites</p>
              <p className="text-2xl font-bold text-violet-900">
                {favorites.length}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="relative block flex-1">
              <span className="sr-only">Search by author name</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by photographer name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowFavorites((current) => !current)}
              aria-pressed={showFavorites}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                showFavorites
                  ? 'bg-violet-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {showFavorites ? '♥ Show all photos' : '♡ Favourites'}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            {showFavorites ? 'Your favourites' : 'Explore photos'}
          </h2>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            </p>
          )}
        </div>

        {loading && (
          <div
            role="status"
            className="flex min-h-64 flex-col items-center justify-center gap-4"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
            <p className="text-slate-500">Loading beautiful photos...</p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <p className="font-semibold text-red-700">
              We couldn't load the photos.
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <p className="mt-2 text-sm text-slate-600">
              Check your internet connection and refresh the page to try again.
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">
              No photos found
            </p>
            <p className="mt-2 text-slate-500">
              {showFavorites && favorites.length === 0
                ? 'Tap a heart on any photo to save it here.'
                : 'Try another photographer name or clear your search.'}
            </p>
            {(search || showFavorites) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setShowFavorites(false)
                }}
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700"
              >
                Show all photos
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isFavorite={favoriteIds.has(photo.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        Built with React, Vite and Tailwind CSS · Photos provided by Picsum
      </footer>
    </main>
  )
}
