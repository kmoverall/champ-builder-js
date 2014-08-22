import requests
import json

r = requests.get('https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion?champData=all&api_key=d4e9f82e-4344-4719-a68f-1015c61a6bb4')
print json.dumps(r.json(), sort_keys=False, indent=4, separators=(',',':'));