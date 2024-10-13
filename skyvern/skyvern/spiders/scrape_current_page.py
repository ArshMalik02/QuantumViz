import time
import csv
import os  # For file operations
from scrapy import Spider, Request
from scrapy.crawler import CrawlerProcess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import requests
from twisted.internet import reactor, defer


class GoogleSearchSpider(Spider):
    name = "google_search"

    def __init__(self, html_content=None, *args, **kwargs):
        super(GoogleSearchSpider, self).__init__(*args, **kwargs)
        self.html_content = html_content

    def start_requests(self):
        # GPT API call to find search bar XPath
        gpt_api_url = "https://api.openai.com/v1/completions"
        API_KEY = "sk-M5ioPhHO_bD0pw0YKmbHF840_l9RqGF0TSczkLNK8bT3BlbkFJ-fzq8Ch64ibRv5-wGD1TfG9794SXS9lnaXProgzp8A"

        prompt = (
            f"Given the following HTML content:\n\n{self.html_content}\n\n"
            f"Please provide the XPath to the search bar in this HTML structure."
        )

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}',
        }

        data = {
            "model": "gpt-3.5-turbo",
            "prompt": prompt,
            "max_tokens": 100,
        }

        print("asking GPT... ")
        response = requests.post(gpt_api_url, headers=headers, json=data)
        gpt_response = response.json()

        # Extract the XPath from the GPT response
        xpath_search_bar = gpt_response["choices"][0]["text"].strip()
        print(f"XPath provided by GPT: {xpath_search_bar}")

        # Use the provided XPath to input 'arxiv.com' into the search bar
        search_bar_xpath = xpath_search_bar
        google_search_url = "https://www.google.com"

        # Call input function to input field at url and xpath
        yield Request(url=google_search_url, callback=self.input_search_term, meta={'xpath': search_bar_xpath})

    def input_search_term(self, response):
        xpath_search_bar = response.meta['xpath']

        # Now input the 'arxiv.com' value in the search bar
        yield {
            "action": "input",
            "xpath": xpath_search_bar,
            "value": "arxiv.com"
        }


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


@defer.inlineCallbacks
def run_spiders(html_content, current_url):
    # Set up and run Scrapy to process the extracted data with custom settings
    process = CrawlerProcess({
        'LOG_ENABLED': True,  # Enable logs for better debugging
        # Set user agent to mimic browser
        'USER_AGENT': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    })

    # Run CurrentPageSpider first
    print("Running CurrentPageSpider...")
    yield process.crawl(CurrentPageSpider, html_content=html_content, url=current_url)

    # Then run GoogleSearchSpider
    print("Running GoogleSearchSpider...")
    yield process.crawl(GoogleSearchSpider, html_content=html_content)

    reactor.stop()


def main():
    # Delete the previous output.csv file if it exists
    csv_file_path = 'output.csv'
    if os.path.exists(csv_file_path):
        print(f"Deleting previous {csv_file_path} file...")
        os.remove(csv_file_path)

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
    driver.get('https://google.com')
    time.sleep(3)  # Wait for the page to load

    # Get the current URL and HTML content of the page
    current_url = driver.current_url
    print(f"Current URL: {current_url}")
    html_content = driver.page_source

    # Close the browser
    driver.quit()

    # Set up and run Scrapy to process the extracted data
    run_spiders(html_content, current_url)

    reactor.run()


if __name__ == "__main__":
    main()
