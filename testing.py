import requests

url_initial = "http://192.168.1.6:5000/initial"
url_final = "http://192.168.1.6:5000/final"

payload = {
    "query": "Analyze the precipitation and vegetation over Rajasthan from January 2020 to December 2020"
}

# POST to /initial
response_initial = requests.post(url_initial, json=payload)
print("Initial Response:")
print(response_initial.status_code)
print(response_initial.json())

# POST to /final
response_final = requests.post(url_final, json=payload)
print("\nFinal Response:")
print(response_final.status_code)
print(response_final.json())
