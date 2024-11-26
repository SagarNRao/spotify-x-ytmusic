from flask import Flask, request, jsonify
from flask_cors import CORS

import sys
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager
from credentials import userName, pwd
from webdriver_instance import WebDriverSingleton
from selenium.webdriver.common.keys import Keys

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


def search(data):
    if data != "":
        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input').send_keys(Keys.CONTROL, "a")

        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input').send_keys(Keys.DELETE)

        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input').send_keys(data)

        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[1]/div[2]/div/span/div/form/div[2]/input').send_keys(Keys.ENTER)

        time.sleep(2)

        driver.find_element(
            "xpath", '/html/body/div[4]/div/div[2]/div[4]/div/div[2]/div[2]/div/main/section/div[3]/div[2]/div/div/div/button'
        ).click()
        data = ""


app = Flask(__name__)
CORS(app)


@app.route("/hello")
def members():
    return "Hello, World!"


@app.route("/search", methods=["POST"])
def search_route():
    data = request.json.get("data")
    if data:
        search(data)
        return jsonify({"message": "success"})
    return jsonify({"message": "failed"})


app.add_url_rule('/search', 'search_route', search_route)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
