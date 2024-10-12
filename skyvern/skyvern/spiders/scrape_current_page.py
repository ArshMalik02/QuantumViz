import time
import csv
from scrapy import Spider, Request
from scrapy.crawler import CrawlerProcess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


class CurrentPageSpider(Spider):
    name = "scrape_current_page"

    def __init__(self, html_content=None, url=None, *args, **kwargs):
        super(CurrentPageSpider, self).__init__(*args, **kwargs)
        self.html_content = html_content
        self.url = url

        # Open CSV file and write the headers
        self.csv_file = open('output.csv', mode='w',
                             newline='', encoding='utf-8')
        self.csv_writer = csv.DictWriter(
            self.csv_file, fieldnames=['url', 'html'])
        self.csv_writer.writeheader()

    def start_requests(self):
        # Manually call parse, as we already have the HTML
        if self.html_content and self.url:
            yield Request(url=self.url, callback=self.parse_html, dont_filter=True, meta={'html': self.html_content})

    def parse_html(self, response):
        # Extract HTML content and URL from the response meta
        html_content = response.meta.get('html')
        url = response.url

        # Write to CSV
        self.csv_writer.writerow({'url': url, 'html': html_content})

        yield {
            "url": url,
            "html": html_content,
        }

    def close(self, reason):
        # Close the CSV file when the spider is done
        self.csv_file.close()


def main():
    # Specify the path to your downloaded chromedriver
    chromedriver_path = "/opt/homebrew/bin/chromedriver"

    # Set Chrome options
    chrome_options = Options()
    # Remove the headless option to see the Chrome window
    # chrome_options.add_argument("--headless")  # Commenting this line out to see the browser

    # Initialize Chrome WebDriver
    driver = webdriver.Chrome(
        executable_path=chromedriver_path, options=chrome_options)

    # Open the desired webpage
    driver.get('https://example.com')  # Change this to your desired URL
    time.sleep(3)  # Wait for the page to load

    # Get the current URL and HTML content of the page
    current_url = driver.current_url
    print(f"Current URL: {current_url}")
    html_content = driver.page_source

    # Close the browser
    driver.quit()

    # Set up and run Scrapy to process the extracted data
    process = CrawlerProcess()
    process.crawl(CurrentPageSpider,
                  html_content=html_content, url=current_url)
    process.start()


if __name__ == "__main__":
    main()
