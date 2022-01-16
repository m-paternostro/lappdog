#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"

curltest="$dir/../../curltest.sh"

user1=u1_$(date "+%Y%m%d-%H%M%S")
user2=u2_$(date "+%Y%m%d-%H%M%S")

url="$1"
echo "Host: $url"

"$curltest" \
  'getImplementation' \
  "$url"

"$curltest" \
  'calculate' \
  "$url/calculator" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"number1":5, "number2":8, "operator":"multiply"}'

"$curltest" \
  'calculate' \
  "$url/calculator?number1=10&number2=2&operator=divide" \
  -X POST

"$curltest" \
  'calculate (invalid operator)' \
  "$url/calculator" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"number1":5, "number2":8, "operator":"notvalid"}'

"$curltest" \
  'calculate (invalid number1)' \
  "$url/calculator" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"number1":"hello", "number2":8, "operator":"multiply"}'

"$curltest" \
  'fibonacci (0)' \
  "$url/fibonacci?size=0" \
  -X POST

"$curltest" \
  'fibonacci (1)' \
  "$url/fibonacci?size=1" \
  -X POST

"$curltest" \
  'fibonacci (2)' \
  "$url/fibonacci?size=2" \
  -X POST

"$curltest" \
  'fibonacci (9)' \
  "$url/fibonacci?size=9" \
  -X POST

"$curltest" \
  'fibonacci (50)' \
  "$url/fibonacci?size=50" \
  -X POST

"$curltest" \
  'getLedgerSummary' \
  "$url/ledger"

"$curltest" \
  'getLedgerUsers' \
  "$url/ledger/users"

"$curltest" \
  'getLedgerTransactions' \
  "$url/ledger/transactions"

"$curltest" \
  'registerLedgerUser' \
  "$url/ledger/users" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"'"$user1"'", "balance":50}'

"$curltest" \
  'registerLedgerUser' \
  "$url/ledger/users" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"'"$user2"'", "balance":30}'

"$curltest" \
  'recordLedgerTransaction' \
  "$url/ledger/transactions" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"from":"'"$user1"'", "to":"'"$user2"'", "amount":5}'

"$curltest" \
  'getLedgerSummary' \
  "$url/ledger"

"$curltest" \
  'getLedgerUsers' \
  "$url/ledger/users"

"$curltest" \
  'getLedgerTransactions' \
  "$url/ledger/transactions"

"$curltest" \
  'prankIt (status code 210)' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"statusCode":210}'

"$curltest" \
  'prankIt (exception "This was a mistake")' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"exceptionMessage":"This was a mistake"}'

"$curltest" \
  'prankIt (exception "Another mistake", should ignore the statusCode)' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"exceptionMessage":"Another mistake", "statusCode": 230}'

"$curltest" \
  'prankIt (should fail because no exception or status code)' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"delay": 5}'

"$curltest" \
  'prankIt (2s delayed, status code 300)' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"statusCode":300, "delay": 2000}'

"$curltest" \
  'prankIt (1s delayed, exception "Whether we wanted it or not...")' \
  "$url/prankster" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"exceptionMessage":"Whether we wanted it or not...", "delay": 1000}'

echo
