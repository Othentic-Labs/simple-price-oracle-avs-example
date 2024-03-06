import json
from dotenv import dotenv_values
import requests

config = dotenv_values(".env")

def get_ipfs_task(cid: str):
    res = requests.request('GET', '%s%s' % (config['IPFS_HOST'], cid))
    return json.loads(res.content)
