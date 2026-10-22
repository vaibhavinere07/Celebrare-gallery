
const STORAGE_KEY = 'celebrare-favorites'

export function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function favoritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const alreadyFavorite = state.some(
        (photo) => photo.id === action.photo.id
      )

      if (alreadyFavorite) {
        return state.filter(
          (photo) => photo.id !== action.photo.id
        )
      }

      return [...state, action.photo]
    }

    default:
      return state
  }
}
