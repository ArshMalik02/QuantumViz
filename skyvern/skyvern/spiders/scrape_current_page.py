import time
import csv
import os  # For file operations
from scrapy import Spider, Request
from scrapy.crawler import CrawlerProcess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import requests
from twisted.internet import reactor, defer


def split_html_into_chunks(html_content, max_chunk_size=10000):
    # Split the HTML into chunks, making sure each chunk is below the token limit
    chunks = []
    current_chunk = ""

    for line in html_content.splitlines():
        if len(current_chunk) + len(line) > max_chunk_size:
            chunks.append(current_chunk)
            current_chunk = line
        else:
            current_chunk += line + "\n"

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


class GoogleSearchSpider(Spider):
    name = "google_search"

    def __init__(self, html_content=None, *args, **kwargs):
        super(GoogleSearchSpider, self).__init__(*args, **kwargs)
        self.html_content = html_content
        self.html_chunks = split_html_into_chunks(
            self.html_content)  # Split HTML into chunks
        self.chunk_index = 0  # Start at the first chunk

    def start_requests(self):
        # Start by sending the first chunk of HTML
        if self.chunk_index < len(self.html_chunks):
            yield from self.send_chunk_to_gpt(self.html_chunks[self.chunk_index])

    def send_chunk_to_gpt(self, html_chunk):
        # GPT API call to find search bar XPath
        gpt_api_url = "https://api.openai.com/v1/chat/completions"
        API_KEY = "sk-BNdvCRikKICPEExsB2CPmalokbd3KsamRsr2IsUTNqT3BlbkFJr6M1SBUtQjokSAgG8RGjaqjbHdkX0twdsRxEuxNxEA"

        prompt = f"Here is part {self.chunk_index + 1} of the HTML content:\n\n{html_chunk}\n\nThe search bar input field is bound by <textarea class='gLFyf'> in this HTML structure. Please provide the XPath to the search bar in this part of the HTML structure if the search bar can be found in this chunk of HTML. If it is not found, wait for the next chunk of HTML to be provided."

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}',
        }

        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
        }

        response = requests.post(gpt_api_url, headers=headers, json=data)

        # Check for errors in the response
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            return

        gpt_response = response.json()

        # Check if 'choices' exists in the GPT response
        if 'choices' not in gpt_response:
            print(f"Unexpected response format: {gpt_response}")
            return

        # Extract the XPath from the GPT response
        xpath_search_bar = gpt_response["choices"][0]["message"]["content"].strip(
        )
        print(
            f"XPath for chunk {self.chunk_index + 1} provided by GPT: {xpath_search_bar}")

        # Check if we found the search bar
        if "search bar" in xpath_search_bar.lower():
            print(f"Search bar found: {xpath_search_bar}")
            google_search_url = "https://www.google.com"
            yield Request(url=google_search_url, callback=self.input_search_term, meta={'xpath': xpath_search_bar})
        else:
            # Move to the next chunk if the search bar isn't found
            self.chunk_index += 1
            if self.chunk_index < len(self.html_chunks):
                # Recursively call the next chunk
                yield from self.send_chunk_to_gpt(self.html_chunks[self.chunk_index])

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
