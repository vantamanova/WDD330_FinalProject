import MoviesList from "./MoviesModule.mjs";
import ExternalServices from "./utils.mjs";
import { getGenreId } from "./MoviesModule.mjs";
import { loadHeaderFooter, attachSearchHandler } from "./utils.mjs";

loadHeaderFooter(() => {
    attachSearchHandler("search-button", "search-input", "search.html");
});

let selectedGenre;

// Get genre from the user
document.getElementById("apply-filters").addEventListener("click", async () => {
    const genreSelect = document.getElementById("genre");
    selectedGenre = genreSelect.value;
    console.log("You selected: ", selectedGenre);

    try {
        // Get the genre ID
        const category = await getGenreId(selectedGenre, "movie");

        // Creates List of top-rated movies
        const moviesElement = document.querySelector(".movies-grid");

        // Clear previous results
        moviesElement.innerHTML = "";

        const moviesDataSourse = new ExternalServices();
        let moviesData = await moviesDataSourse.getData(`/discover/movie?with_genres=${category}`);
        moviesData = moviesData.results.slice(0, 20);

        let movieList = new MoviesList(".movies-grid", moviesData, "movie");
        movieList.init();
    } catch (error) {
        console.error("Error:", error);
    }
});
