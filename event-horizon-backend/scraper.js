// npm install axios
const axios = require('axios');
const fs = require('fs');

// ZenRows API key (replace with your actual API key)
const apikey = 'a67ec4d0e02fc3d5921ce36976290657d266b4c2';

// BookMyShow Pune URL
const url = 'https://in.bookmyshow.com/explore/movies-pune';

// Send GET request to ZenRows API
axios({
  url: 'https://api.zenrows.com/v1/',
  method: 'GET',
  params: {
    'url': url,         // The URL you want to scrape
    'apikey': apikey,    // Your ZenRows API key
  },
})
  .then(response => {
    // The response contains the HTML content of the BookMyShow page
    const htmlData = response.data;

    // You can now parse the HTML to extract movie data
    // We will use regular expressions or a library like Cheerio to extract the required data
    
    // Example: Extract movie titles using a basic regex (you can customize this)
    const movieTitles = [];
    const movieRegex = /<h3.*?class=".*?">([^<]+)<\/h3>/g; // Modify regex to match titles
    let match;
    
    while ((match = movieRegex.exec(htmlData)) !== null) {
      movieTitles.push(match[1]); // Extract the title
    }

    console.log('Extracted Movie Titles:', movieTitles);

    // Optionally, you can save the data to a CSV or JSON file
    const movieData = movieTitles.map(title => ({ title }));

    // Convert movieData to CSV
    const csv = movieData.map(row => Object.values(row).join(',')).join('\n');
    
    // Save CSV to file
    fs.writeFileSync('movies_pune_data.csv', csv);
    
    console.log('Data saved to movies_pune_data.csv');
  })
  .catch(error => {
    console.error('Error occurred while scraping data:', error);
  });
