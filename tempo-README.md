# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list


# PRD from Tempo

## The Middle - Location-Based Social Discovery App

A web app that helps groups of friends find the perfect meetup spot by calculating the geographic midpoint between their locations and suggesting nearby venues they'll all enjoy, with swipe-based voting on recommendations.

## Key Features & Functionality

- **User Profiles & Authentication**: Users create profiles and can link accounts (Google, Yelp, Beli) for personalized recommendations based on preferences and behavior
- **Friend Location Sharing**: Real-time map view showing friends' current locations with permission-based sharing
- **Midpoint Calculator**: Automatically calculates the geographic center point between 2+ friends and displays it on an interactive map
- **Personalized Venue Recommendations**: Shows nearby restaurants, cafes, bars, and lounges around the midpoint with ratings, photos, and details tailored to each user's preferences
- **Swipe Voting Interface**: Tinder-style card stack where friends swipe right/left on venue suggestions, with matches revealed when everyone agrees
- **Group Session**: Create a session link to invite friends, see who's joined, and track voting progress in real-time


## UI Components & Style

- Bold, modern design with vibrant gradients and smooth animations
- Mobile-first responsive design optimized for phone usage
- Split-screen layout on desktop: map on one side, venue cards on the other
- Tabbed navigation on mobile for seamless switching between map and venues
- Clean cards showing venue images, name, distance from midpoint, rating stars, and quick details
- Floating action button to create new sessions and manage friend groups


## Default Location
Hermosa Beach, CA serves as the default location for the app


## Primary Use Case
Finding centrally located, communally agreed upon places to eat or meet up (bars, restaurants, lounges, cafes)
