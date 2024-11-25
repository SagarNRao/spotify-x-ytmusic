import sys
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager
from credentials import userName, pwd
from webdriver_instance import WebDriverSingleton

# selenium 4
from selenium.webdriver.chrome.service import Service as ChromiumService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

# Get the data from the command-line argument

driver = WebDriverSingleton.get_instance().get_driver()

driver.get('https://accounts.spotify.com/en/login')

driver.find_element(
    "xpath", '/html/body/div[1]/div/div/div/div/div[2]/div[1]/div[1]/input').send_keys(userName)
driver.find_element(
    "xpath", '/html/body/div[1]/div/div/div/div/div[2]/div[1]/div[2]/div[2]/input').send_keys(pwd)
driver.find_element(
    "xpath", '/html/body/div[1]/div/div/div/div/div[2]/div[2]/button').click()

time.sleep(5)

driver.find_element(
    "xpath", '/html/body/div/div/div/div/div/button[2]').click()

time.sleep(5)


while (1):
    data = sys.argv[1]
    if data != "":
        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input').send_keys(data)
        data = ""

input("Enter to continue")

time.sleep(50)
