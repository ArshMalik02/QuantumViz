# Step 1: use scrapy to scrape html of webpage
# Step 2: html of webpage is inputted into LLM as context
# Step 3: user inputs prompt into LLM
# Step 4: LLM generates a plan / set of actions to take to accomplish the task
# Step 5: Model 1: Navigation model (asks LLM to identify XPath selector for desired element) navigates to desired element
# Step 6: Model 2: Data Extraction model extracts element (circuit image) or inputs text field (search field)

from scrapy import Spider


class BooksToScrapeComSpider(Spider):
    name = "BooksToScrapeComSpider"
    start_urls = [
        "http://books.toscrape.com/catalogue/category/books/mystery_3/index.html"
    ]

    # def parse(self, response):
    #     next_page_links = response.css(".next a")
    #     yield from response.follow_all(next_page_links)
    #     book_links = response.css("article a")
    #     yield from response.follow_all(book_links, callback=self.parse_book)

    # def parse_book(self, response):
    #     yield {
    #         "name": response.css("h1::text").get(),
    #         "price": response.css(".price_color::text").re_first("£(.*)"),
    #         "url": response.url,
    #     }
    def parse(self, response):
        # Yield the HTML of the current page (no links followed)
        yield {
            "url": response.url,  # URL of the current page
            "html": response.text  # The entire HTML content of the page
        }
