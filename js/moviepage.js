import { loadHeaderFooter } from "./utils.mjs";
import MovieDetails from "./MovieDetails.mjs";

loadHeaderFooter();

// get movie ID from somewhere
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");
const imdbId = params.get("imdbId");

console.log(id);
console.log(type);
console.log(imdbId);

const movieDetails = new MovieDetails(id, type, imdbId);
movieDetails.init();




