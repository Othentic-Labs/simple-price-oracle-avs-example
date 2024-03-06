import json
import requests

BINANCE_URL_TEMPLATE = 'https://api.binance.com/api/v3/ticker/price?symbol=%s'

def get_symbol_price(symbol: str):
    res = requests.request('GET', BINANCE_URL_TEMPLATE % symbol)
    return float(json.loads(res.content)['price'])
