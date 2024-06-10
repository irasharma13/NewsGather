const { chromium } = require("playwright"); 
const fs = require('fs'); 
const path = require('path'); 

//Scrape articles from Hacker News and save them in a CSV file.
async function saveHackerNewsArticles() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage(); 

    try {
        //Navigate to the Hacker News homepage
        await page.goto("https://news.ycombinator.com", { waitUntil: 'networkidle' });

        //Fetch the top 10 articles from the page
        const articles = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.athing')).slice(0, 10);
            return rows.map(row => {
                // For each article, find the link element and retrieve the title and URL
                const titleElement = row.querySelector('.title a');
                const title = titleElement ? titleElement.innerText : 'Missing title'; 
                const link = titleElement ? titleElement.href : 'Missing link'; 
                return { title, link };
            });
        });

        //Output to CSV file content 
        let csvContent = 'Title,Link\n'; 
        articles.forEach(article => {
            csvContent += `"${article.title.replace(/"/g, '""')}","${article.link}"\n`;
        });

        //Path of the CSV file will be saved
        const filePath = path.join(__dirname, 'top_10_news_articles.csv');
        fs.writeFileSync(filePath, csvContent);

        console.log('Top 10 articles have been successfully saved to output.csv'); 
    } catch (error) {
        console.error("Oops! Something went wrong during the scraping or file writing process:", error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

(async () => {
    await saveHackerNewsArticles();
})();
