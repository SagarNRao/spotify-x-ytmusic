# webdriver_instance.py
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromiumService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

class WebDriverSingleton:
    _instance = None

    @staticmethod
    def get_instance():
        if WebDriverSingleton._instance is None:
            WebDriverSingleton._instance = WebDriverSingleton()
        return WebDriverSingleton._instance

    def __init__(self):
        if WebDriverSingleton._instance is not None:
            raise Exception("This class is a singleton!")
        else:
            self.driver = webdriver.Chrome(service=ChromiumService(
                ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install()))

    def get_driver(self):
        return self.driver