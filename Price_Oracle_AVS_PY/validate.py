import sys
from oracle import get_symbol_price
from ipfs import get_ipfs_task

if len(sys.argv) != 2:
    print("Usage: python validate.py <cid>")
    sys.exit(1)

cid = sys.argv[1]
print('receive validation request for task "%s"' % cid)

data = get_ipfs_task(cid)
price = get_symbol_price("ETHUSDT")
upper_bound = price * 1.05
lower_bound = price * 0.95

status = 'not approved'
if price <= upper_bound and price >= lower_bound:
    status = 'approved'
    print('Approved :)')
    sys.exit(0)
print('Not Approved :(')
sys.exit(1)

