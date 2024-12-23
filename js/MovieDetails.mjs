import ExternalServices from "./utils.mjs";
import { getStreamingAvailability } from "./StreamingAvailability.mjs";
import { addToFavorites } from "./utils.mjs";


export function moviePageTemplate(movie) {
    return `
           <div class="movie-details-hero">
            <img id="movie-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-details-info">
                <h1 id="movie-title">${movie.title}</h1>
                <p id="movie-release-date">Release Date: <span>${movie.release_date}</span></p>
                <p id="movie-rating">Rating: <span>${movie.vote_average.toFixed(1)}/10</span></p>
                <p id="movie-genre">Genre: <span>${movie.genres.map(genre => genre.name).join(', ')}</span></p>
            </div>
        </div>

        <div class="movie-details-main">
            <section class="movie-synopsis">
                <h2>Synopsis</h2>
                <p id="movie-synopsis">${movie.overview}</p>
            </section>

            <section class="movie-actions">
                <button class="outline streaming-platforms">Streaming Platforms</button>
                <button class="outline add-to-favorites">Add to Favorites</button>
            </section>

            <section class="streaming-info" id="streaming-info">
                <h2>Available On</h2>
                <p id="platforms-list">Click the button above to see streaming platforms.</p>
            </section>
        </div>`
}

export function seriesPageTemplate(tvShow) {
    return `
           <div class="movie-details-hero">
            <img id="movie-poster" src="https://image.tmdb.org/t/p/w500${tvShow.poster_path}" alt="${tvShow.name}">
            <div class="movie-details-info">
                <h1 id="movie-title">${tvShow.name}</h1>
                <p id="movie-release-date">Release Date: <span>${tvShow.first_air_date}</span></p>
                <p id="movie-rating">Rating: <span>${tvShow.vote_average.toFixed(1)}/10</span></p>
                <p id="movie-genre">Genre: <span>${tvShow.genres.map(genre => genre.name).join(', ')}</span></p>
            </div>
        </div>

        <div class="movie-details-main">
            <section class="movie-synopsis">
                <h2>Synopsis</h2>
                <p id="movie-synopsis">${tvShow.overview}</p>
            </section>

            <section class="movie-actions">
                <button class="outline streaming-platforms">Streaming Platforms</button>
                <button class="outline add-to-favorites">Add to Favorites</button>
            </section>

            <section class="streaming-info" id="streaming-info">
                <h2>Available On</h2>
                <p id="platforms-list">Click the button above to see streaming platforms.</p>
            </section>
        </div>`
}

export default class MovieDetails{
    constructor(movieId, type, imdbId) {
        this.movieId = movieId;
        this.type = type
        this.imdbId = imdbId;
    }

    // Main initialization function
    async init() {
        try {
            const moviesDataSource = new ExternalServices();

            // Determine API endpoint based on type
            const params = this.type === "movie" ? `/movie/${this.movieId}` : `/tv/${this.movieId}`;

            // Fetch movie or series data
            const data = await moviesDataSource.getData(params);
            console.log(data);

            // Render the page content using appropriate template
            const templateHtml = this.type === "movie" ? moviePageTemplate(data) : seriesPageTemplate(data);
            renderMovieDetails(templateHtml);

            // Attach event listener to the "Streaming Platforms" button
            this.attachStreamingPlatformsListener();

            // Attach event listener to the "Add to Favourite" button
            this.addToFavouriteListener(data)
        } catch (error) {
            console.error("Error initializing details page:", error);
        }
    }

    // Attach event listener for fetching and displaying streaming platforms
    attachStreamingPlatformsListener() {
        const streamingButton = document.querySelector(".streaming-platforms");

        if (streamingButton) {
            streamingButton.addEventListener("click", async () => {
                try {
                    await this.displayStreamingPlatforms();
                } catch (error) {
                    console.error("Error displaying streaming platforms:", error);
                }
            });
        } else {
            console.error("Element '.streaming-platforms' not found.");
        }
    }

    // Fetch and display streaming platforms
    async displayStreamingPlatforms() {
        try {
            const streamingInfoSection = document.getElementById("streaming-info");
            const platformsList = document.getElementById("platforms-list");
        
            // Fetch streaming availability for the current IMDb ID
            const platforms = await getStreamingAvailability(this.imdbId, 'us'); // Checking for US availability because there are more data then ae

            // Check if streaming options are available
            if (platforms && Object.keys(platforms.streamingOptions).length > 0) {
                const usPlatforms = platforms.streamingOptions.us || [];
        
                // Generate HTML for the available platforms
                const platformLinks = usPlatforms
                    .map(option => `<a href="${option.link}" target="_blank">${option.service.name} (${option.type})</a>`)
                    .join("<br>");
        
                // Update the streaming-info section with the platforms
                platformsList.innerHTML = platformLinks;
        
                // Make the streaming-info section visible
                if (streamingInfoSection) {
                    streamingInfoSection.classList.add("open");
                }
            } else {
                console.log("No streaming options available for this title.");
        
                // Update the streaming-info section with a "No options" message
                platformsList.textContent = "No streaming platforms available for this title.";
        
                // Make the streaming-info section visible
                if (streamingInfoSection) {
                    streamingInfoSection.classList.add("open");
                }
            }
        } catch (error) {
            console.error("Error fetching streaming platforms:", error);
        }
    }
    
    // Attach event Listener to "add to Favourite"
    addToFavouriteListener(movieData) {
        const favoriteButton = document.querySelector(".add-to-favorites");

        if (favoriteButton){
            favoriteButton.addEventListener("click", () => {
                // Construct movie object for favorites
                const movie = {
                    id: movieData.id,
                    title: this.type === "movie" ? movieData.title : movieData.name,
                    poster_path: movieData.poster_path,
                    vote_average: movieData.vote_average,
                    release_date: this.type === "movie" ? movieData.release_date : movieData.first_air_date,
                };
                addToFavorites(movie);      
            });
        } else {
            console.error("Element '.add-to-favorites' not found.");
        }       
    }
}

async function renderMovieDetails(template) {
    const element = document.querySelector(".movie-section")
    element.insertAdjacentHTML("afterBegin", template)
}