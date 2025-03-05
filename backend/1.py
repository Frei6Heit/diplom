import requests

# city = 'Москва'
url = f'http://wttr.in/Moskow/?m2&lang=ru'

response = requests.get(url)
print(f": {response.text}")