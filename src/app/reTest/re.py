import requests
from base64 import b64encode

client_id = "00bd6d28c0b846cbba723c270d3fef7d"
client_secret = "b680901196f24645a09d401d26dd96bd"

auth_header = b64encode(
    f"{client_id}:{client_secret}".encode('ascii')).decode('ascii')

url = 'https://accounts.spotify.com/api/token'
headers = {'Authorization': f'Basic {auth_header}', 'Content-Type': 'application/x-www-form-urlencoded'}
data = {'redirect_uri': redirect_uri,
        'code': code,
        'grant_type': 'authorization_code',
        'scope': scopes}
r = requests.post(url, data=data, headers=headers, verify=True)
token_info = r.json()

print(token_info)
