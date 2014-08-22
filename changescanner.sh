python changescanner.py > newdata.txt
date >> changelog.txt
diff olddata.txt newdata.txt >> changelog.txt
echo ============================================================ >> changelog.txt
cp newdata.txt olddata.txt
