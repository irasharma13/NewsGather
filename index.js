const { chromium } = require("playwright"); // Load Playwright module to control browser operations
const fs = require('fs'); // Load filesystem module to handle file operations
const path = require('path'); // Load path module to manage file paths

// Defines a function to scrape articles from Hacker News and save them in a CSV file.
async function saveHackerNewsArticles() {
    // Launches a headless browser session for automated browsing without a visible interface
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage(); // Opens a new browser page

    try {
        // Navigate to the Hacker News homepage and wait until all resources are loaded completely
        await page.goto("https://news.ycombinator.com", { waitUntil: 'networkidle' });

        // Fetch the top 10 articles from the page
        const articles = await page.evaluate(() => {
            // Select the first 10 articles based on their HTML structure and store them in an array
            const rows = Array.from(document.querySelectorAll('.athing')).slice(0, 10);
            return rows.map(row => {
                // For each article, find the link element and retrieve the title and URL
                const titleElement = row.querySelector('.title a');
                const title = titleElement ? titleElement.innerText : 'Missing title'; // Use a default text if no title is found
                const link = titleElement ? titleElement.href : 'Missing link'; // Use a default link if no URL is found
                return { title, link };
            });
        });

        // Prepare the CSV file content starting with column headers
        let csvContent = 'Title,Link\n'; // Define the headers of the CSV columns
        articles.forEach(article => {
            // Add each article's title and URL to the CSV string, ensuring to escape quotes in titles
            csvContent += `"${article.title.replace(/"/g, '""')}","${article.link}"\n`;
        });

        // Specify the file path where the CSV file will be saved
        const filePath = path.join(__dirname, 'top_10_news_articles.csv');
        fs.writeFileSync(filePath, csvContent); // Write the CSV content to a file

        console.log('Top 10 articles have been successfully saved to output.csv'); // Confirm the operation's success
    } catch (error) {
        // Log any errors that occur during the scraping or file writing process
        console.error("Oops! Something went wrong during the scraping or file writing process:", error);
    } finally {
        // Always close the browser session when done
        await browser.close();
        console.log('Browser closed.');
    }
}

// Execute the function to scrape Hacker News
(async () => {
    await saveHackerNewsArticles();
})();
