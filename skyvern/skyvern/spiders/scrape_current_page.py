import time
import csv
import os  # For file operations
from scrapy import Spider, Request
from scrapy.crawler import CrawlerProcess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import requests
from twisted.internet import reactor, defer

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Function to split HTML into chunks


def split_html_into_chunks(html_content, max_chunk_size=10000):
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

# Function to scroll to a specified image and take a screenshot of it


# Function to scroll the PDF and take a screenshot
def scroll_pdf_and_screenshot(driver, scroll_height, screenshot_path):
    try:
        # Use JavaScript to scroll within the PDF viewer
        driver.execute_script(f"window.scrollTo(0, {scroll_height});")
        time.sleep(2)  # Wait for the scroll to take effect

        # Take a screenshot of the currently visible area
        driver.save_screenshot(screenshot_path)
        print(
            f"Screenshot of PDF at scroll height {scroll_height} saved to {screenshot_path}")
    except Exception as e:
        print(f"Error: {e}")


class GoogleSearchSpider(Spider):
    name = "google_search"

    def __init__(self, html_content=None, *args, **kwargs):
        super(GoogleSearchSpider, self).__init__(*args, **kwargs)
        self.html_content = html_content
        self.html_chunks = split_html_into_chunks(self.html_content)
        self.chunk_index = 0
        self.search_bar_xpath = None  # Keep track of the search bar's XPath

    def start_requests(self):
        # Start by sending the first chunk of HTML
        if self.chunk_index < len(self.html_chunks):
            yield from self.send_chunk_to_gpt(self.html_chunks[self.chunk_index])

    def send_chunk_to_gpt(self, html_chunk):
        # GPT API call to find search bar XPath
        gpt_api_url = "https://api.openai.com/v1/chat/completions"
        API_KEY = "sk-BNdvCRikKICPEExsB2CPmalokbd3KsamRsr2IsUTNqT3BlbkFJr6M1SBUtQjokSAgG8RGjaqjbHdkX0twdsRxEuxNxEA"

        # Prompt with guidance that the search bar is inside a <textarea> with class 'gLFyf'
        prompt = f"Here is part {self.chunk_index + 1} of the HTML content:\n\n{html_chunk}\n\n" \
                 f"The search bar input field is bound by <textarea class='gLFyf'> in this HTML structure. " \
                 f"Please provide the raw XPath to the search bar (without explanations) in this part of the HTML structure."

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

        # Extract the raw XPath from the GPT response, removing extra text
        xpath_search_bar = gpt_response["choices"][0]["message"]["content"].strip(
        )

        # Ensure we only get the actual XPath by checking for any markdown or explanation
        if "```" in xpath_search_bar:
            xpath_search_bar = xpath_search_bar.split("```")[1].strip()

        print(
            f"XPath for chunk {self.chunk_index + 1} provided by GPT: {xpath_search_bar}")

        # Check if we found the search bar by validating the XPath format
        if xpath_search_bar.startswith("//"):
            print(f"Search bar found: {xpath_search_bar}")
            self.search_bar_xpath = xpath_search_bar  # Save the valid XPath
            google_search_url = "https://www.google.com"
            yield Request(url=google_search_url, callback=self.input_search_term, meta={'xpath': xpath_search_bar})
        else:
            # Move to the next chunk if the search bar isn't found
            self.chunk_index += 1
            if self.chunk_index < len(self.html_chunks):
                # Recursively call the next chunk
                yield from self.send_chunk_to_gpt(self.html_chunks[self.chunk_index])
            else:
                # Handle case when search bar is not found
                print("Search bar was not found in any of the HTML chunks.")
                self.handle_search_bar_not_found()

    def handle_search_bar_not_found(self):
        # Logic to handle when the search bar is not found after all chunks
        print("Handling case where search bar was not found. You can notify the user or take other actions.")
        # You can raise an exception, notify a user, or log additional details here.

    def input_search_term(self, response):
        # Get the search bar XPath from the GPT response
        xpath_search_bar = response.meta['xpath']

        # Set up Selenium WebDriver to open Google and input 'arxiv.com'
        chrome_options = Options()
        # Maximize window for visibility
        chrome_options.add_argument("--start-maximized")
        driver = webdriver.Chrome(options=chrome_options)

        # Open Google
        driver.get('https://www.google.com')
        time.sleep(2)  # Give the page some time to load

        # Find the search bar using the XPath provided by GPT
        search_bar = driver.find_element_by_xpath(xpath_search_bar)

        # Input the search term 'arxiv.com'
        search_bar.send_keys("arxiv.com")
        time.sleep(1)  # Small delay to see the input being typed

        # Submit the form (simulate hitting 'Enter')
        search_bar.submit()

        # Wait for the search results page to load
        time.sleep(3)

        # Find the first search result and click it
        # XPath to the first result's link
        first_result_xpath = "(//h3)[1]/ancestor::a"
        first_result = driver.find_element_by_xpath(first_result_xpath)
        first_result.click()

        # Wait for the arXiv page to load
        time.sleep(3)

        # Now on the arXiv website, locate the search bar for papers using the correct <input> element
        arxiv_search_bar_xpath = "//input[@class='input is-small'][@type='text'][@name='query']"

        try:
            # Use WebDriverWait to wait for the search bar to be present
            arxiv_search_bar = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.XPATH, arxiv_search_bar_xpath))
            )
            # Input the full paper title "Classical simulation of quantum computation, the Gottesman-Knill theorem, and slightly beyond"
            paper_title = "Classical simulation of quantum computation, the Gottesman-Knill theorem, and slightly beyond"
            arxiv_search_bar.send_keys(paper_title)

            # Submit the search form (simulate hitting 'Enter')
            # Unicode for the 'Enter' key to submit the form
            arxiv_search_bar.send_keys(u'\ue007')
            print(f"Successfully searched for '{paper_title}' on arXiv.")

            # Wait for the search results page to load
            time.sleep(3)

            # Find the first link with the text 'pdf' that links to the PDF version of the paper
            pdf_link_xpath = "(//a[contains(@href, '/pdf/') and text()='pdf'])[1]"
            pdf_link = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, pdf_link_xpath))
            )
            pdf_link.click()  # Click the link to open the PDF

            print("Successfully clicked the PDF link for the paper on arXiv.")

            # Wait a bit for the page to load fully
            time.sleep(5)

            # Scroll to a specific image and take a screenshot
            # Replace with the correct XPath of the image
            # image_xpath = "//img[@alt='example_image']"
            # Scroll by 1000 pixels and take a screenshot
            scroll_pdf_and_screenshot(driver, 1000, "pdf_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")

        # Wait to observe the result before closing
        time.sleep(10)  # Wait for 10 seconds so you can see the result

        # Close the browser manually later or after verification


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
