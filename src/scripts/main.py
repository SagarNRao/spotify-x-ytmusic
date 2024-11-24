import sys
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager
from credentials import userName, pwd

# selenium 4
from selenium.webdriver.chrome.service import Service as ChromiumService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

# Get the data from the command-line argument
data = sys.argv[1]

driver = webdriver.Chrome(service=ChromiumService(ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install()))

driver.get('https://accounts.spotify.com/en/login')

driver.find_element("xpath", '/html/body/div[1]/div/div/div/div/div[2]/div[1]/div[1]/input').send_keys(userName)
driver.find_element("xpath", '/html/body/div[1]/div/div/div/div/div[2]/div[1]/div[2]/div[2]/input').send_keys(pwd)
driver.find_element("xpath",'/html/body/div[1]/div/div/div/div/div[2]/div[2]/button').click()

time.sleep(5)

driver.find_element("xpath",'/html/body/div/div/div/div/div/button[2]').click()
driver.find_element("xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input')

# Use the data in your script
print(f"Received data: {data}")

time.sleep(50)